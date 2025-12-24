<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\Student;
use App\Models\Account;
use App\Models\AcademicYear;
use App\Traits\CreatesAccountingTransactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class FeeCollectionController extends Controller
{
    use CreatesAccountingTransactions;

    /**
     * Display fee collections list
     */
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        // Get collections with relationships
        $collections = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'feeType',
            'account',
            'collector'
        ])
            ->latest('payment_date')
            ->paginate(20);

        // Calculate statistics
        $stats = [
            'total_collected' => FeeCollection::where('status', 'paid')->sum('paid_amount'),
            'pending_fees' => FeeCollection::where('status', 'pending')->sum('total_amount'),
            'overdue_fees' => $this->calculateOverdueFees(),
        ];

        return Inertia::render('Fees/Collections/Index', [
            'collections' => $collections,
            'students' => Student::with(['user', 'schoolClass'])
                ->where('status', 'active')
                ->get(),
            'accounts' => Account::where('status', 'active')
                ->get(['id', 'account_name', 'current_balance']),
            'stats' => $stats,
        ]);
    }

    /**
     * Store fee collection
     */
    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_structures' => 'required|array|min:1',
            'fee_structures.*.fee_structure_id' => 'required|exists:fee_structures,id',
            'fee_structures.*.month' => 'required|integer|min:1|max:12',
            'fee_structures.*.year' => 'required|integer|min:2020|max:2100',
            'account_id' => 'required|exists:accounts,id',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,mobile_banking,online',
            'payment_date' => 'required|date',
            'discount' => 'nullable|numeric|min:0',
            'remarks' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();
        try {
            $student = Student::with('user')->findOrFail($validated['student_id']);
            $discount = floatval($validated['discount'] ?? 0);

            // Generate unique receipt number
            $receiptNumber = 'RCP-' . date('Ymd') . '-' . str_pad(
                FeeCollection::whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $totalAmount = 0;
            $feeDescriptions = [];

            // Create collection for each selected fee structure with month/year
            foreach ($validated['fee_structures'] as $feeData) {
                $feeStructure = FeeStructure::with(['feeType', 'academicYear'])
                    ->findOrFail($feeData['fee_structure_id']);

                $month = intval($feeData['month']);
                $year = intval($feeData['year']);

                // Calculate proportional discount
                $feeAmount = floatval($feeStructure->amount);
                $feeDiscount = count($validated['fee_structures']) > 0
                    ? $discount / count($validated['fee_structures'])
                    : 0;
                $paidAmount = $feeAmount - $feeDiscount;
                $totalAmount += $paidAmount;

                // Check if already paid for this month/year
                $existingPayment = FeeCollection::where('student_id', $validated['student_id'])
                    ->where('fee_type_id', $feeStructure->fee_type_id)
                    ->where('month', $month)
                    ->where('year', $year)
                    ->where('status', 'paid')
                    ->exists();

                if ($existingPayment) {
                    $monthName = Carbon::create($year, $month, 1)->format('F Y');
                    throw new \Exception("Fee '{$feeStructure->feeType->name}' for {$monthName} has already been paid.");
                }

                // Create fee collection record
                FeeCollection::create([
                    'receipt_number' => $receiptNumber,
                    'student_id' => $validated['student_id'],
                    'fee_type_id' => $feeStructure->fee_type_id,
                    'academic_year_id' => $feeStructure->academic_year_id,
                    'account_id' => $validated['account_id'],
                    'month' => $month,
                    'year' => $year,
                    'amount' => $feeAmount,
                    'late_fee' => 0,
                    'discount' => $feeDiscount,
                    'total_amount' => $paidAmount,
                    'paid_amount' => $paidAmount,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'status' => 'paid',
                    'remarks' => $validated['remarks'],
                    'collected_by' => auth()->id(),
                ]);

                $monthName = Carbon::create($year, $month, 1)->format('M Y');
                $feeDescriptions[] = $feeStructure->feeType->name . ' (' . $monthName . ')';
            }

            // Create accounting transaction
            if ($totalAmount > 0) {
                $description = "Fee collection from {$student->user->name} - " . implode(', ', $feeDescriptions);
                if ($validated['remarks']) {
                    $description .= " | {$validated['remarks']}";
                }

                $this->createFeeIncomeTransaction(
                    accountId: $validated['account_id'],
                    amount: $totalAmount,
                    date: $validated['payment_date'],
                    paymentMethod: $validated['payment_method'],
                    referenceNumber: $receiptNumber,
                    description: $description
                );
            }

            DB::commit();

            logActivity(
                'create',
                "Collected " . count($validated['fee_structures']) . " fees from {$student->user->name} (Receipt: {$receiptNumber})",
                FeeCollection::class
            );

            return redirect()->route('fee-collections.index')
                ->with('success', "Fees collected successfully! Receipt: {$receiptNumber}");

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to collect fees: ' . $e->getMessage());
        }
    }

    /**
     * Display fee collection receipt
     */
    public function receipt(FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        $feeCollection->load([
            'student.user',
            'student.schoolClass',
            'feeType',
            'academicYear',
            'collector'
        ]);

        // Get all collections with same receipt number
        $relatedCollections = FeeCollection::with(['feeType'])
            ->where('receipt_number', $feeCollection->receipt_number)
            ->get();

        return Inertia::render('Fees/Collections/Receipt', [
            'collection' => $feeCollection,
            'relatedCollections' => $relatedCollections,
            'totalAmount' => $relatedCollections->sum('total_amount'),
        ]);
    }

    /**
     * Delete fee collection
     */
    public function destroy(FeeCollection $feeCollection)
    {
        $this->authorize('manage_fees');

        DB::beginTransaction();
        try {
            $receiptNumber = $feeCollection->receipt_number;

            // Delete all collections with same receipt number
            $collections = FeeCollection::where('receipt_number', $receiptNumber)->get();

            foreach ($collections as $collection) {
                // Reverse accounting transaction if exists
                if ($collection->accounting_transaction_id) {
                    $this->reverseAccountingTransaction($collection->accounting_transaction_id);
                }
                $collection->delete();
            }

            DB::commit();

            logActivity(
                'delete',
                "Deleted fee collection(s) with receipt: {$receiptNumber}",
                FeeCollection::class
            );

            return redirect()->route('fee-collections.index')
                ->with('success', 'Fee collection deleted and accounting reversed successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Failed to delete fee collection: ' . $e->getMessage());
        }
    }

    /**
     * Get fee structures by class (API endpoint)
     */
    public function getFeesByClass(Request $request)
    {
        $classId = $request->query('class_id');

        if (!$classId) {
            return response()->json([]);
        }

        $feeStructures = FeeStructure::with(['feeType', 'academicYear'])
            ->where('class_id', $classId)
            ->whereHas('academicYear', function ($q) {
                $q->where('status', 'active');
            })
            ->get()
            ->map(function ($structure) {
                return [
                    'id' => $structure->id,
                    'fee_type' => [
                        'id' => $structure->feeType->id,
                        'name' => $structure->feeType->name,
                        'frequency' => $structure->feeType->frequency,
                    ],
                    'academic_year' => [
                        'id' => $structure->academicYear->id,
                        'year' => $structure->academicYear->year,
                    ],
                    'amount' => $structure->amount,
                    'due_date' => $structure->due_date,
                    'status' => $structure->status,
                ];
            });

        return response()->json($feeStructures);
    }

    /**
     * Calculate total overdue fees
     */
    private function calculateOverdueFees(): float
    {
        $today = Carbon::today();
        $totalOverdue = 0;

        // Get all active fee structures that are overdue
        $overdueFeeStructures = FeeStructure::where('due_date', '<', $today)
            ->whereHas('academicYear', function ($q) {
                $q->where('status', 'active');
            })
            ->get();

        foreach ($overdueFeeStructures as $feeStructure) {
            // Get students in this class
            $students = Student::where('class_id', $feeStructure->class_id)
                ->where('status', 'active')
                ->get();

            foreach ($students as $student) {
                // Calculate month and year from due date
                $dueDate = Carbon::parse($feeStructure->due_date);

                // Check if not paid
                $paid = FeeCollection::where('student_id', $student->id)
                    ->where('fee_type_id', $feeStructure->fee_type_id)
                    ->where('month', $dueDate->month)
                    ->where('year', $dueDate->year)
                    ->where('status', 'paid')
                    ->exists();

                if (!$paid) {
                    $totalOverdue += floatval($feeStructure->amount);
                }
            }
        }

        return $totalOverdue;
    }
}
