<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class IncomeExpenditureReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $accountId = $request->account_id;

        // Get transactions for the period
        $transactionsQuery = Transaction::with(['account', 'incomeCategory', 'expenseCategory'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->whereIn('type', ['income', 'expense']); // Only income and expense, not transfers

        if ($accountId) {
            $transactionsQuery->where('account_id', $accountId);
        }

        $transactions = $transactionsQuery->orderBy('transaction_date', 'asc')->get();

        // Process Income - Grouped by category
        $incomeGrouped = [];
        $totalIncome = 0;

        foreach ($transactions as $trans) {
            if ($trans->type === 'income') {
                $categoryName = $trans->incomeCategory ? $trans->incomeCategory->name : 'Other Income';

                if (!isset($incomeGrouped[$categoryName])) {
                    $incomeGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'amount' => 0,
                    ];
                }
                $incomeGrouped[$categoryName]['amount'] += $trans->amount;
                $totalIncome += $trans->amount;
            }
        }

        // Convert grouped data to array
        $incomes = array_values($incomeGrouped);

        // Process Expenditure - Grouped by category
        $expenditureGrouped = [];
        $totalExpenditure = 0;

        foreach ($transactions as $trans) {
            if ($trans->type === 'expense') {
                $categoryName = $trans->expenseCategory ? $trans->expenseCategory->name : 'Other Expense';

                if (!isset($expenditureGrouped[$categoryName])) {
                    $expenditureGrouped[$categoryName] = [
                        'description' => $categoryName,
                        'amount' => 0,
                    ];
                }
                $expenditureGrouped[$categoryName]['amount'] += $trans->amount;
                $totalExpenditure += $trans->amount;
            }
        }

        // Convert grouped data to array
        $expenditures = array_values($expenditureGrouped);

        // Calculate surplus or deficit
        $surplusDeficit = $totalIncome - $totalExpenditure;

        return Inertia::render('Accounting/Reports/IncomeExpenditure', [
            'incomes' => $incomes,
            'expenditures' => $expenditures,
            'totalIncome' => $totalIncome,
            'totalExpenditure' => $totalExpenditure,
            'surplusDeficit' => $surplusDeficit,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'account_id' => $accountId,
            ],
            'accounts' => Account::where('status', 'active')->get(),
        ]);
    }
}
