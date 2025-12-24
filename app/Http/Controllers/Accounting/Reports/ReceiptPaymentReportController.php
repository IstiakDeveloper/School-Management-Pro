<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\FundTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReceiptPaymentReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $accountId = $request->account_id;

        // Get opening balance (all transactions before start date)
        $openingBalance = 0;
        if ($accountId) {
            $account = Account::find($accountId);
            $openingBalance = $account->opening_balance;

            // Add all previous transactions
            $previousTransactions = Transaction::where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            })
            ->where('transaction_date', '<', $startDate)
            ->get();

            foreach ($previousTransactions as $trans) {
                if ($trans->account_id == $accountId) {
                    if ($trans->type === 'income') {
                        $openingBalance += $trans->amount;
                    } elseif ($trans->type === 'expense' || $trans->type === 'transfer') {
                        $openingBalance -= $trans->amount;
                    }
                }
                if ($trans->transfer_to_account_id == $accountId && $trans->type === 'transfer') {
                    $openingBalance += $trans->amount;
                }
            }

            // Add fund transactions to opening balance
            $previousFundTransactions = FundTransaction::where('account_id', $accountId)
                ->where('transaction_date', '<', $startDate)
                ->get();

            foreach ($previousFundTransactions as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    $openingBalance += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    $openingBalance -= $fundTrans->amount;
                }
            }
        }

        // Get transactions for the period
        $transactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $transactionsQuery->where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            });
        }

        $transactions = $transactionsQuery->orderBy('transaction_date', 'asc')->get();

        // Get fund transactions for the period
        $fundTransactionsQuery = FundTransaction::with(['fund', 'account'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $fundTransactionsQuery->where('account_id', $accountId);
        }

        $fundTransactions = $fundTransactionsQuery->orderBy('transaction_date', 'asc')->get();

        // Process Receipts (Credits/Income) - Grouped by category
        $receiptsGrouped = [];
        $totalReceipts = 0;

        // Income from transactions - Group by category
        foreach ($transactions as $trans) {
            if ($trans->type === 'income' && (!$accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Income';

                if (!isset($receiptsGrouped[$categoryName])) {
                    $receiptsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'amount' => 0,
                        'type' => 'income'
                    ];
                }
                $receiptsGrouped[$categoryName]['amount'] += $trans->amount;
                $totalReceipts += $trans->amount;
            }

            // Transfer In - Group by account
            if ($trans->type === 'transfer' && $trans->transfer_to_account_id == $accountId) {
                $key = 'Transfer In';
                if (!isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'amount' => 0,
                        'type' => 'transfer_in'
                    ];
                }
                $receiptsGrouped[$key]['amount'] += $trans->amount;
                $totalReceipts += $trans->amount;
            }
        }

        // Fund In - Group all fund transactions
        foreach ($fundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'in') {
                $key = 'Fund In - Fund received from: ' . ($fundTrans->fund ? $fundTrans->fund->name : 'Fund');

                if (!isset($receiptsGrouped[$key])) {
                    $receiptsGrouped[$key] = [
                        'description' => $key,
                        'amount' => 0,
                        'type' => 'fund_in'
                    ];
                }
                $receiptsGrouped[$key]['amount'] += $fundTrans->amount;
                $totalReceipts += $fundTrans->amount;
            }
        }

        // Convert grouped data to array
        $receipts = array_values($receiptsGrouped);

        // Process Payments (Debits/Expenses) - Grouped by category
        $paymentsGrouped = [];
        $totalPayments = 0;

        // Expenses from transactions - Group by category
        foreach ($transactions as $trans) {
            if ($trans->type === 'expense' && (!$accountId || $trans->account_id == $accountId)) {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Expense';

                if (!isset($paymentsGrouped[$categoryName])) {
                    $paymentsGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'amount' => 0,
                        'type' => 'expense'
                    ];
                }
                $paymentsGrouped[$categoryName]['amount'] += $trans->amount;
                $totalPayments += $trans->amount;
            }

            // Transfer Out - Group all transfers
            if ($trans->type === 'transfer' && $trans->account_id == $accountId) {
                $key = 'Transfer Out';
                if (!isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'amount' => 0,
                        'type' => 'transfer_out'
                    ];
                }
                $paymentsGrouped[$key]['amount'] += $trans->amount;
                $totalPayments += $trans->amount;
            }
        }

        // Fund Out - Group all fund transactions
        foreach ($fundTransactions as $fundTrans) {
            if ($fundTrans->transaction_type === 'out') {
                $key = 'Fund Out - Fund sent to: ' . ($fundTrans->fund ? $fundTrans->fund->name : 'Fund');

                if (!isset($paymentsGrouped[$key])) {
                    $paymentsGrouped[$key] = [
                        'description' => $key,
                        'amount' => 0,
                        'type' => 'fund_out'
                    ];
                }
                $paymentsGrouped[$key]['amount'] += $fundTrans->amount;
                $totalPayments += $fundTrans->amount;
            }
        }

        // Convert grouped data to array
        $payments = array_values($paymentsGrouped);

        // Calculate closing balance
        $closingBalance = $openingBalance + $totalReceipts - $totalPayments;

        return Inertia::render('Accounting/Reports/ReceiptPayment', [
            'receipts' => $receipts,
            'payments' => $payments,
            'openingBalance' => $openingBalance,
            'totalReceipts' => $totalReceipts,
            'totalPayments' => $totalPayments,
            'closingBalance' => $closingBalance,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'account_id' => $accountId,
            ],
            'accounts' => Account::where('status', 'active')->get(),
        ]);
    }
}
