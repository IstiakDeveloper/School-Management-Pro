<?php

namespace App\Http\Controllers\Salary;

use App\Http\Controllers\Controller;
use App\Models\ProvidentFundTransaction;
use App\Models\PfWithdrawal;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProvidentFundController extends Controller
{
    /**
     * Display Provident Fund ledger with all teacher contributions.
     */
    public function index(Request $request)
    {
        // Get teacher-wise PF summary using subquery
        $pfSummary = DB::table('provident_fund_transactions')
            ->select('staff_id')
            ->selectRaw('COALESCE(SUM(employee_contribution), 0) as total_employee_pf')
            ->selectRaw('COALESCE(SUM(employer_contribution), 0) as total_employer_pf')
            ->selectRaw('COALESCE(SUM(total_contribution), 0) as total_pf')
            ->selectRaw('MAX(transaction_date) as last_contribution_date')
            ->selectRaw('COUNT(id) as contribution_count')
            ->groupBy('staff_id');

        // Get teacher-wise withdrawal summary
        $withdrawalSummary = DB::table('pf_withdrawals')
            ->select('staff_id')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_withdrawn')
            ->groupBy('staff_id');

        $teacherSummary = Teacher::where('status', 'active')
            ->with('user')
            ->leftJoinSub($pfSummary, 'pf', function ($join) {
                $join->on('teachers.id', '=', 'pf.staff_id');
            })
            ->leftJoinSub($withdrawalSummary, 'withdrawals', function ($join) {
                $join->on('teachers.id', '=', 'withdrawals.staff_id');
            })
            ->select('teachers.*')
            ->selectRaw('COALESCE(pf.total_employee_pf, 0) as total_employee_pf')
            ->selectRaw('COALESCE(pf.total_employer_pf, 0) as total_employer_pf')
            ->selectRaw('COALESCE(pf.total_pf, 0) - COALESCE(withdrawals.total_withdrawn, 0) as total_pf')
            ->selectRaw('COALESCE(withdrawals.total_withdrawn, 0) as total_withdrawn')
            ->selectRaw('pf.last_contribution_date')
            ->selectRaw('COALESCE(pf.contribution_count, 0) as contribution_count')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('teachers.first_name', 'like', "%{$search}%")
                        ->orWhere('teachers.last_name', 'like', "%{$search}%")
                        ->orWhere('teachers.employee_id', 'like', "%{$search}%");
                });
            })
            ->orderBy('teachers.first_name')
            ->paginate(15)
            ->withQueryString();

        // Get total PF summary including withdrawals
        $contributions = ProvidentFundTransaction::selectRaw('
            COALESCE(SUM(employee_contribution), 0) as total_employee_contribution,
            COALESCE(SUM(employer_contribution), 0) as total_employer_contribution,
            COALESCE(SUM(total_contribution), 0) as total_contributions,
            COUNT(DISTINCT staff_id) as total_teachers,
            COUNT(id) as total_transactions
        ')->first();

        $withdrawals = PfWithdrawal::selectRaw('
            COALESCE(SUM(total_amount), 0) as total_withdrawn
        ')->first();

        $summary = [
            'total_employee_contribution' => $contributions->total_employee_contribution,
            'total_employer_contribution' => $contributions->total_employer_contribution,
            'total_contributions' => $contributions->total_contributions,
            'total_withdrawn' => $withdrawals->total_withdrawn,
            'total_pf_balance' => $contributions->total_contributions - $withdrawals->total_withdrawn,
            'total_teachers' => $contributions->total_teachers,
            'total_transactions' => $contributions->total_transactions,
        ];

        return Inertia::render('Salaries/ProvidentFund/Index', [
            'teacherSummary' => $teacherSummary,
            'summary' => $summary,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display individual teacher PF history.
     */
    public function show(Teacher $teacher)
    {
        $teacher->load(['user']);

        // Get all transactions including contributions and withdrawals
        $transactions = ProvidentFundTransaction::with(['salaryPayment'])
            ->where('staff_id', $teacher->id)
            ->latest('transaction_date')
            ->get()
            ->map(function ($transaction) {
                $data = [
                    'id' => $transaction->id,
                    'type' => $transaction->type,
                    'employee_contribution' => (float) $transaction->employee_contribution,
                    'employer_contribution' => (float) $transaction->employer_contribution,
                    'total_contribution' => (float) $transaction->total_contribution,
                    'transaction_date' => $transaction->transaction_date,
                ];

                if ($transaction->salaryPayment) {
                    $data['salaryPayment'] = [
                        'month' => $transaction->salaryPayment->month,
                        'year' => $transaction->salaryPayment->year,
                        'payment_method' => $transaction->salaryPayment->payment_method,
                    ];
                }

                return $data;
            });

        // Get withdrawals
        $withdrawals = PfWithdrawal::with(['approvedBy'])
            ->where('staff_id', $teacher->id)
            ->latest('withdrawal_date')
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'employee_contribution' => (float) $withdrawal->employee_contribution,
                    'employer_contribution' => (float) $withdrawal->employer_contribution,
                    'total_amount' => (float) $withdrawal->total_amount,
                    'withdrawal_date' => $withdrawal->withdrawal_date,
                    'reason' => $withdrawal->reason,
                    'remarks' => $withdrawal->remarks,
                    'approved_by' => $withdrawal->approvedBy ? $withdrawal->approvedBy->name : null,
                ];
            });

        // Calculate summary
        $contributions = ProvidentFundTransaction::where('staff_id', $teacher->id)
            ->where('type', 'contribution')
            ->selectRaw('
                COALESCE(SUM(employee_contribution), 0) as total_employee_contribution,
                COALESCE(SUM(employer_contribution), 0) as total_employer_contribution,
                COALESCE(SUM(total_contribution), 0) as total_contribution
            ')
            ->first();

        $withdrawalSum = PfWithdrawal::where('staff_id', $teacher->id)
            ->selectRaw('
                COALESCE(SUM(employee_contribution), 0) as withdrawn_employee,
                COALESCE(SUM(employer_contribution), 0) as withdrawn_employer,
                COALESCE(SUM(total_amount), 0) as total_withdrawn
            ')
            ->first();

        $openingBalance = ProvidentFundTransaction::where('staff_id', $teacher->id)
            ->where('type', 'opening')
            ->selectRaw('
                COALESCE(SUM(employee_contribution), 0) as opening_employee,
                COALESCE(SUM(employer_contribution), 0) as opening_employer,
                COALESCE(SUM(total_contribution), 0) as total_opening
            ')
            ->first();

        $summary = [
            'total_employee_contribution' => (float) $contributions->total_employee_contribution + (float) $openingBalance->opening_employee,
            'total_employer_contribution' => (float) $contributions->total_employer_contribution + (float) $openingBalance->opening_employer,
            'total_withdrawn' => (float) $withdrawalSum->total_withdrawn,
            'current_balance' => (float) $contributions->total_contribution + (float) $openingBalance->total_opening - (float) $withdrawalSum->total_withdrawn,
            'total_transactions' => ProvidentFundTransaction::where('staff_id', $teacher->id)->count(),
        ];

        return Inertia::render('Salaries/ProvidentFund/Show', [
            'teacher' => [
                'id' => $teacher->id,
                'user' => $teacher->user,
                'employee_id' => $teacher->employee_id,
                'first_name' => $teacher->first_name,
                'last_name' => $teacher->last_name,
                'designation' => $teacher->designation,
                'salary' => (float) $teacher->salary,
            ],
            'transactions' => $transactions,
            'withdrawals' => $withdrawals,
            'summary' => $summary,
        ]);
    }

    /**
     * Store opening entry for Provident Fund.
     */
    public function storeOpeningEntry(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'employee_contribution' => 'required|numeric|min:0',
            'employer_contribution' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
        ]);

        $totalContribution = $validated['employee_contribution'] + $validated['employer_contribution'];

        ProvidentFundTransaction::create([
            'staff_id' => $teacher->id,
            'type' => 'opening',
            'employee_contribution' => $validated['employee_contribution'],
            'employer_contribution' => $validated['employer_contribution'],
            'total_contribution' => $totalContribution,
            'transaction_date' => $validated['transaction_date'],
        ]);

        return redirect()->back()->with('success', 'Opening entry added successfully.');
    }

    /**
     * Process PF withdrawal for a teacher.
     */
    public function withdraw(Request $request, Teacher $teacher)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
            'remarks' => 'nullable|string',
            'withdrawal_date' => 'required|date',
        ]);

        // Calculate current balance
        $contributions = ProvidentFundTransaction::where('staff_id', $teacher->id)
            ->whereIn('type', ['contribution', 'opening'])
            ->selectRaw('
                COALESCE(SUM(employee_contribution), 0) as total_employee,
                COALESCE(SUM(employer_contribution), 0) as total_employer,
                COALESCE(SUM(total_contribution), 0) as total
            ')
            ->first();

        $withdrawalSum = PfWithdrawal::where('staff_id', $teacher->id)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_withdrawn')
            ->first();

        $currentBalance = (float) $contributions->total - (float) $withdrawalSum->total_withdrawn;

        if ($currentBalance <= 0) {
            return redirect()->back()->withErrors(['error' => 'No balance available for withdrawal.']);
        }

        // Create withdrawal record
        PfWithdrawal::create([
            'staff_id' => $teacher->id,
            'employee_contribution' => $contributions->total_employee - (PfWithdrawal::where('staff_id', $teacher->id)->sum('employee_contribution') ?? 0),
            'employer_contribution' => $contributions->total_employer - (PfWithdrawal::where('staff_id', $teacher->id)->sum('employer_contribution') ?? 0),
            'total_amount' => $currentBalance,
            'withdrawal_date' => $validated['withdrawal_date'],
            'reason' => $validated['reason'],
            'remarks' => $validated['remarks'],
            'approved_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Provident Fund withdrawal processed successfully.');
    }
}
