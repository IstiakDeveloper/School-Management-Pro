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
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->search, function ($query, $search) {
                $query->whereHas('student.user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString();

        // Get all pending/overdue fees
        $pendingFees = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'feeType'
        ])
            ->whereIn('status', ['pending', 'overdue'])
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'student_name' => $fee->student->user->name ?? 'N/A',
                    'student_id' => $fee->student_id,
                    'class_name' => $fee->student->schoolClass->name ?? 'N/A',
                    'fee_type' => $fee->feeType->name,
                    'month' => $fee->month,
                    'year' => $fee->year,
                    'amount' => $fee->amount,
                    'late_fee' => $fee->late_fee,
                    'discount' => $fee->discount,
                    'total_amount' => $fee->total_amount,
                    'status' => $fee->status,
                    'month_name' => Carbon::create($fee->year, $fee->month, 1)->format('F Y'),
                ];
            });

        // Calculate statistics
        $stats = [
            'total_collected' => FeeCollection::where('status', 'paid')->sum('paid_amount'),
            'pending_fees' => FeeCollection::where('status', 'pending')->sum('total_amount'),
            'overdue_fees' => FeeCollection::where('status', 'overdue')->sum('total_amount'),
            'pending_count' => FeeCollection::where('status', 'pending')->count(),
            'overdue_count' => FeeCollection::where('status', 'overdue')->count(),
        ];

        return Inertia::render('Fees/Collections/Index', [
            'collections' => $collections,
            'pendingFees' => $pendingFees,
            'students' => Student::with(['user', 'schoolClass'])
                ->where('status', 'active')
                ->get(),
            'accounts' => Account::where('status', 'active')
                ->get(['id', 'account_name', 'current_balance']),
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Store fee collection (supports both new and old formats)
     */
    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        // Check if it's old format (fee_structures) or new format (fee_collection_ids)
        $isOldFormat = $request->has('fee_structures');

        if ($isOldFormat) {
            // Old format: Create new fee collections
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

            return $this->storeNewCollections($validated);
        } else {
            // New format: Pay existing pending/overdue fees
            $validated = $request->validate([
                'fee_collection_ids' => 'required|array|min:1',
                'fee_collection_ids.*' => 'required|exists:fee_collections,id',
                'account_id' => 'required|exists:accounts,id',
                'payment_method' => 'required|in:cash,bank_transfer,cheque,mobile_banking,online',
                'payment_date' => 'required|date',
                'discount' => 'nullable|numeric|min:0',
                'remarks' => 'nullable|string|max:500',
            ]);

            return $this->payExistingCollections($validated);
        }
    }

    /**
     * Create new fee collections (old format)
     */
    private function storeNewCollections(array $validated)
    {
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
                    'remarks' => $validated['remarks'] ?? null,
                    'collected_by' => auth()->id(),
                ]);

                $monthName = Carbon::create($year, $month, 1)->format('M Y');
                $feeDescriptions[] = $feeStructure->feeType->name . ' (' . $monthName . ')';
            }

            // Create accounting transaction
            if ($totalAmount > 0) {
                $description = "Fee collection from {$student->user->name} - " . implode(', ', $feeDescriptions);
                if (!empty($validated['remarks'])) {
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
     * Pay existing pending/overdue fees (new format)
     */
    private function payExistingCollections(array $validated)
    {
        DB::beginTransaction();
        try {
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
            $student = null;

            // Update each pending/overdue fee to paid
            foreach ($validated['fee_collection_ids'] as $feeId) {
                $fee = FeeCollection::with(['student.user', 'feeType'])
                    ->findOrFail($feeId);

                if ($fee->status === 'paid') {
                    throw new \Exception("Fee {$fee->feeType->name} has already been paid.");
                }

                if (!$student) {
                    $student = $fee->student;
                }

                // Calculate proportional discount
                $feeDiscount = count($validated['fee_collection_ids']) > 0
                    ? $discount / count($validated['fee_collection_ids'])
                    : 0;

                $paidAmount = $fee->amount + $fee->late_fee - $feeDiscount;
                $totalAmount += $paidAmount;

                // Update fee collection
                $fee->update([
                    'receipt_number' => $receiptNumber,
                    'account_id' => $validated['account_id'],
                    'discount' => $feeDiscount,
                    'total_amount' => $paidAmount,
                    'paid_amount' => $paidAmount,
                    'payment_date' => $validated['payment_date'],
                    'payment_method' => $validated['payment_method'],
                    'status' => 'paid',
                    'remarks' => $validated['remarks'] ?? null,
                    'collected_by' => auth()->id(),
                ]);

                $monthName = Carbon::create($fee->year, $fee->month, 1)->format('M Y');
                $feeDescriptions[] = $fee->feeType->name . ' (' . $monthName . ')';
            }

            // Create accounting transaction
            if ($totalAmount > 0 && $student) {
                $description = "Fee collection from {$student->user->name} - " . implode(', ', $feeDescriptions);
                if (!empty($validated['remarks'])) {
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
                "Collected " . count($validated['fee_collection_ids']) . " fees from {$student->user->name} (Receipt: {$receiptNumber})",
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
     * Get student pending/overdue fees (API endpoint)
     */
    public function getStudentDues(Request $request)
    {
        $studentId = $request->query('student_id');

        if (!$studentId) {
            return response()->json([]);
        }

        $dues = FeeCollection::with(['feeType'])
            ->where('student_id', $studentId)
            ->whereIn('status', ['pending', 'overdue'])
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'fee_type' => $fee->feeType->name,
                    'month' => $fee->month,
                    'year' => $fee->year,
                    'month_name' => Carbon::create($fee->year, $fee->month, 1)->format('F Y'),
                    'amount' => $fee->amount,
                    'late_fee' => $fee->late_fee,
                    'discount' => $fee->discount,
                    'total_amount' => $fee->total_amount,
                    'status' => $fee->status,
                ];
            });

        return response()->json($dues);
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
