<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use App\Models\FundTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BankReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $month = $request->month ?? now()->format('Y-m');
        $accountId = $request->account_id;

        $startDate = Carbon::parse($month . '-01')->startOfMonth();
        $endDate = Carbon::parse($month . '-01')->endOfMonth();

        // Get all accounts or specific account
        $accountsQuery = Account::where('status', 'active');
        if ($accountId) {
            $accountsQuery->where('id', $accountId);
        }
        $accounts = $accountsQuery->get();

        // Get all transactions for the month
        $transactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory', 'transferToAccount'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $transactionsQuery->where(function ($query) use ($accountId) {
                $query->where('account_id', $accountId)
                    ->orWhere('transfer_to_account_id', $accountId);
            });
        }

        $transactions = $transactionsQuery->orderBy('transaction_date', 'asc')->get();

        // Get fund transactions for the month
        $fundTransactionsQuery = FundTransaction::with(['fund', 'account'])
            ->whereBetween('transaction_date', [$startDate, $endDate]);

        if ($accountId) {
            $fundTransactionsQuery->where('account_id', $accountId);
        }

        $fundTransactions = $fundTransactionsQuery->orderBy('transaction_date', 'asc')->get();

        // Get income and expense categories
        $incomeCategories = IncomeCategory::where('status', 'active')->get();
        $expenseCategories = ExpenseCategory::where('status', 'active')->get();

        // Special categories identification (you may need to adjust these based on your category names)
        $studentFeeCategoryIds = $incomeCategories->filter(function ($category) {
            return stripos($category->name, 'Student') !== false ||
                   stripos($category->name, 'Fee') !== false;
        })->pluck('id')->toArray();

        $salaryCategoryIds = $expenseCategories->filter(function ($category) {
            return stripos($category->name, 'Salary') !== false ||
                   stripos($category->name, 'Wage') !== false;
        })->pluck('id')->toArray();

        $fixedAssetCategoryIds = $expenseCategories->filter(function ($category) {
            return stripos($category->name, 'Asset') !== false ||
                   stripos($category->name, 'Equipment') !== false;
        })->pluck('id')->toArray();

        // Group transactions by date
        $reportData = [];
        $runningBalance = 0;

        // Get opening balance (sum of all transactions before start date)
        if ($accountId) {
            $account = Account::find($accountId);
            $openingBalance = $account->opening_balance;

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

            $runningBalance = $openingBalance;
        }

        // Generate date-wise report
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');

            $dayTransactions = $transactions->filter(function ($trans) use ($dateString) {
                return $trans->transaction_date->format('Y-m-d') === $dateString;
            });

            $dayFundTransactions = $fundTransactions->filter(function ($trans) use ($dateString) {
                return $trans->transaction_date->format('Y-m-d') === $dateString;
            });

            // Initialize daily totals
            $dailyData = [
                'date' => $currentDate->format('Y-m-d'),
                'date_formatted' => $currentDate->format('d M, Y'),
                'credit' => [
                    'fund_in' => 0,
                    'student_fee' => 0,
                    'other_credit' => 0,
                    'total' => 0,
                ],
                'debit' => [
                    'fund_out' => 0,
                    'salary' => 0,
                    'fixed_asset' => 0,
                    'other_expense' => 0,
                    'total' => 0,
                ],
                'balance' => 0,
            ];

            foreach ($dayTransactions as $trans) {
                // Credit Section
                if ($trans->type === 'income') {
                    // Student Fee
                    if (in_array($trans->income_category_id, $studentFeeCategoryIds)) {
                        $dailyData['credit']['student_fee'] += $trans->amount;
                    } else {
                        // Other Credit
                        $dailyData['credit']['other_credit'] += $trans->amount;
                    }
                    $runningBalance += $trans->amount;
                } elseif ($trans->type === 'transfer' && $trans->transfer_to_account_id == $accountId) {
                    // Fund In (transfer to this account)
                    $dailyData['credit']['fund_in'] += $trans->amount;
                    $runningBalance += $trans->amount;
                }

                // Debit Section
                if ($trans->type === 'expense') {
                    // Salary
                    if (in_array($trans->expense_category_id, $salaryCategoryIds)) {
                        $dailyData['debit']['salary'] += $trans->amount;
                    }
                    // Fixed Asset
                    elseif (in_array($trans->expense_category_id, $fixedAssetCategoryIds)) {
                        $dailyData['debit']['fixed_asset'] += $trans->amount;
                    }
                    // Other Expense
                    else {
                        $dailyData['debit']['other_expense'] += $trans->amount;
                    }
                    $runningBalance -= $trans->amount;
                } elseif ($trans->type === 'transfer' && $trans->account_id == $accountId) {
                    // Fund Out (transfer from this account)
                    $dailyData['debit']['fund_out'] += $trans->amount;
                    $runningBalance -= $trans->amount;
                }
            }

            // Process Fund Transactions
            foreach ($dayFundTransactions as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    // Fund In
                    $dailyData['credit']['fund_in'] += $fundTrans->amount;
                    $runningBalance += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    // Fund Out
                    $dailyData['debit']['fund_out'] += $fundTrans->amount;
                    $runningBalance -= $fundTrans->amount;
                }
            }

            // Calculate totals
            $dailyData['credit']['total'] = $dailyData['credit']['fund_in'] +
                                            $dailyData['credit']['student_fee'] +
                                            $dailyData['credit']['other_credit'];

            $dailyData['debit']['total'] = $dailyData['debit']['fund_out'] +
                                          $dailyData['debit']['salary'] +
                                          $dailyData['debit']['fixed_asset'] +
                                          $dailyData['debit']['other_expense'];

            $dailyData['balance'] = $runningBalance;

            $reportData[] = $dailyData;

            $currentDate->addDay();
        }

        // Calculate monthly summary
        $monthlyTotals = [
            'credit' => [
                'fund_in' => array_sum(array_column(array_column($reportData, 'credit'), 'fund_in')),
                'student_fee' => array_sum(array_column(array_column($reportData, 'credit'), 'student_fee')),
                'other_credit' => array_sum(array_column(array_column($reportData, 'credit'), 'other_credit')),
                'total' => 0,
            ],
            'debit' => [
                'fund_out' => array_sum(array_column(array_column($reportData, 'debit'), 'fund_out')),
                'salary' => array_sum(array_column(array_column($reportData, 'debit'), 'salary')),
                'fixed_asset' => array_sum(array_column(array_column($reportData, 'debit'), 'fixed_asset')),
                'other_expense' => array_sum(array_column(array_column($reportData, 'debit'), 'other_expense')),
                'total' => 0,
            ],
        ];

        $monthlyTotals['credit']['total'] = $monthlyTotals['credit']['fund_in'] +
                                            $monthlyTotals['credit']['student_fee'] +
                                            $monthlyTotals['credit']['other_credit'];

        $monthlyTotals['debit']['total'] = $monthlyTotals['debit']['fund_out'] +
                                           $monthlyTotals['debit']['salary'] +
                                           $monthlyTotals['debit']['fixed_asset'] +
                                           $monthlyTotals['debit']['other_expense'];

        return Inertia::render('Accounting/Reports/BankReport', [
            'reportData' => $reportData,
            'monthlyTotals' => $monthlyTotals,
            'openingBalance' => $accountId ? $openingBalance : 0,
            'closingBalance' => $runningBalance,
            'filters' => [
                'month' => $month,
                'account_id' => $accountId,
            ],
            'accounts' => Account::where('status', 'active')->get(),
        ]);
    }
}
