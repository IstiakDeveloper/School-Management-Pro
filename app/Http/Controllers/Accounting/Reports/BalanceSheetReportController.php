<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Fund;
use App\Models\FundTransaction;
use App\Models\FixedAsset;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BalanceSheetReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $asOnDate = $request->as_on_date ? Carbon::parse($request->as_on_date) : now();

        // Calculate Total Fund (Available)
        $totalFundAvailable = 0;
        $funds = Fund::where('status', 'active')->get();

        foreach ($funds as $fund) {
            // Get fund balance up to the selected date
            $fundTransactions = FundTransaction::where('fund_id', $fund->id)
                ->where('transaction_date', '<=', $asOnDate)
                ->get();

            $fundBalance = 0;
            foreach ($fundTransactions as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    $fundBalance += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    $fundBalance -= $fundTrans->amount;
                }
            }

            $totalFundAvailable += $fundBalance;
        }

        // Calculate Surplus/Deficit from Income & Expenditure up to the selected date
        $transactions = Transaction::where('transaction_date', '<=', $asOnDate)
            ->whereIn('type', ['income', 'expense'])
            ->get();

        $totalIncome = 0;
        $totalExpenditure = 0;

        foreach ($transactions as $trans) {
            if ($trans->type === 'income') {
                $totalIncome += $trans->amount;
            } elseif ($trans->type === 'expense') {
                $totalExpenditure += $trans->amount;
            }
        }

        $surplusDeficit = $totalIncome - $totalExpenditure;

        // Calculate Bank Balance (all accounts)
        $bankBalance = 0;
        $accounts = Account::where('status', 'active')->get();

        foreach ($accounts as $account) {
            $accountBalance = $account->opening_balance;

            // Add all transactions up to the selected date
            $accountTransactions = Transaction::where(function ($query) use ($account) {
                $query->where('account_id', $account->id)
                    ->orWhere('transfer_to_account_id', $account->id);
            })
            ->where('transaction_date', '<=', $asOnDate)
            ->get();

            foreach ($accountTransactions as $trans) {
                if ($trans->account_id == $account->id) {
                    if ($trans->type === 'income') {
                        $accountBalance += $trans->amount;
                    } elseif ($trans->type === 'expense' || $trans->type === 'transfer') {
                        $accountBalance -= $trans->amount;
                    }
                }
                if ($trans->transfer_to_account_id == $account->id && $trans->type === 'transfer') {
                    $accountBalance += $trans->amount;
                }
            }

            // Add fund transactions for this account
            $accountFundTransactions = FundTransaction::where('account_id', $account->id)
                ->where('transaction_date', '<=', $asOnDate)
                ->get();

            foreach ($accountFundTransactions as $fundTrans) {
                if ($fundTrans->transaction_type === 'in') {
                    $accountBalance += $fundTrans->amount;
                } elseif ($fundTrans->transaction_type === 'out') {
                    $accountBalance -= $fundTrans->amount;
                }
            }

            $bankBalance += $accountBalance;
        }

        // Calculate Fixed Assets (total value of all fixed assets)
        $fixedAssetsTotal = FixedAsset::where('purchase_date', '<=', $asOnDate)
            ->sum('purchase_price');

        // Calculate totals
        $liabilitiesTotal = $totalFundAvailable + $surplusDeficit;
        $assetsTotal = $bankBalance + $fixedAssetsTotal;

        return Inertia::render('Accounting/Reports/BalanceSheet', [
            'totalFundAvailable' => $totalFundAvailable,
            'surplusDeficit' => $surplusDeficit,
            'liabilitiesTotal' => $liabilitiesTotal,
            'bankBalance' => $bankBalance,
            'fixedAssetsTotal' => $fixedAssetsTotal,
            'assetsTotal' => $assetsTotal,
            'filters' => [
                'as_on_date' => $asOnDate->format('Y-m-d'),
            ],
        ]);
    }
}
