<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\FeeCollection;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\Student;
use App\Traits\CreatesAccountingTransactions;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FeeCollectionController extends Controller
{
    use CreatesAccountingTransactions;

    /**
     * Display fee collections list
     */
    public function index(Request $request)
    {
        $this->authorize('manage_fees');

        // Date range: support date_from/date_to or month+year (monthly filter)
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;
        if ($request->filled('month') && $request->filled('year')) {
            $dateFrom = Carbon::create($request->year, $request->month, 1)->format('Y-m-d');
            $dateTo = Carbon::create($request->year, $request->month, 1)->endOfMonth()->format('Y-m-d');
        }

        // Get collections with relationships
        $collectionsQuery = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'student.section',
            'feeType',
            'account',
            'collector',
        ])
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->fee_type_id, function ($query, $feeTypeId) {
                $query->where('fee_type_id', $feeTypeId);
            })
            ->when($dateFrom, function ($query) use ($dateFrom) {
                $query->whereDate('payment_date', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query) use ($dateTo) {
                $query->whereDate('payment_date', '<=', $dateTo);
            })
            ->when($request->class_id, function ($query, $classId) {
                $query->whereHas('student', function ($q) use ($classId) {
                    $q->where('class_id', $classId);
                });
            })
            ->when($request->section_id, function ($query, $sectionId) {
                $query->whereHas('student', function ($q) use ($sectionId) {
                    $q->where('section_id', $sectionId);
                });
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('student.user', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                        ->orWhereHas('student', function ($sq) use ($search) {
                            $sq->where('admission_number', 'like', "%{$search}%");
                        })
                        ->orWhere('receipt_number', 'like', "%{$search}%");
                });
            })
            ->whereHas('student') // Exclude fee records for soft-deleted students
            ->latest('created_at')
            ->get();

        // Group by receipt number
        $groupedCollections = $collectionsQuery->groupBy('receipt_number')->map(function ($group) {
            $first = $group->first();
            $monthsCount = $group->count();

            // Get month range
            $months = $group->pluck('month')->sort()->values();
            $years = $group->pluck('year')->sort()->values();

            if ($monthsCount === 1) {
                $period = Carbon::create($first->year, $first->month, 1)->format('F Y');
            } else {
                $firstMonth = Carbon::create($years->first(), $months->first(), 1)->format('M Y');
                $lastMonth = Carbon::create($years->last(), $months->last(), 1)->format('M Y');
                $period = "{$firstMonth} - {$lastMonth} ({$monthsCount} months)";
            }

            return [
                'id' => $first->id,
                'receipt_number' => $first->receipt_number,
                'student' => [
                    'user' => ['name' => $first->student->user->name ?? 'N/A'],
                    'admission_number' => $first->student->admission_number ?? 'N/A',
                    'school_class' => ['name' => $first->student->schoolClass->name ?? 'N/A'],
                ],
                'fee_type' => ['name' => $group->pluck('feeType.name')->unique()->join(', ')],
                'period' => $period,
                'months_count' => $monthsCount,
                'amount' => $group->sum('amount'),
                'paid_amount' => $group->sum('paid_amount'),
                'discount' => $group->sum('discount'),
                'payment_date' => $first->payment_date,
                'payment_method' => $first->payment_method,
                'status' => $first->status,
                'month' => $first->month,
                'year' => $first->year,
            ];
        })->values();

        // Unique students in this result (one student can have multiple receipts)
        $uniqueStudentCount = $collectionsQuery->pluck('student_id')->unique()->count();

        // Paginate manually
        $page = $request->get('page', 1);
        $perPage = 20;
        $total = $groupedCollections->count();
        $collections = new \Illuminate\Pagination\LengthAwarePaginator(
            $groupedCollections->slice(($page - 1) * $perPage, $perPage)->values(),
            $total,
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        // Get all pending/overdue fees
        $pendingFees = FeeCollection::with([
            'student.user',
            'student.schoolClass',
            'feeType',
        ])
            ->whereHas('student') // Exclude fee records for soft-deleted students
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
                    'fee_type' => $fee->feeType->name ?? 'N/A',
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

        // Calculate statistics (apply same filters for consistency)
        $statsQueryPaid = FeeCollection::where('status', 'paid')
            ->whereHas('student') // Exclude soft-deleted students
            ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id))
            ->when($dateFrom, fn ($q) => $q->whereDate('payment_date', '>=', $dateFrom))
            ->when($dateTo, fn ($q) => $q->whereDate('payment_date', '<=', $dateTo));
        $statsQueryPending = FeeCollection::whereIn('status', ['pending', 'overdue'])
            ->whereHas('student') // Exclude soft-deleted students
            ->when($request->fee_type_id, fn ($q, $id) => $q->where('fee_type_id', $id));

        $stats = [
            'total_collected' => (clone $statsQueryPaid)->sum('paid_amount'),
            'pending_fees' => (clone $statsQueryPending)->where('status', 'pending')->sum('total_amount'),
            'overdue_fees' => (clone $statsQueryPending)->where('status', 'overdue')->sum('total_amount'),
            'pending_count' => (clone $statsQueryPending)->where('status', 'pending')->count(),
            'overdue_count' => (clone $statsQueryPending)->where('status', 'overdue')->count(),
        ];

        return Inertia::render('Fees/Collections/Index', [
            'collections' => $collections,
            'uniqueStudentCount' => $uniqueStudentCount,
            'pendingFees' => $pendingFees,
            'students' => Student::with(['user', 'schoolClass'])
                ->where('status', 'active')
                ->get(),
            'accounts' => Account::where('status', 'active')
                ->get(['id', 'account_name', 'current_balance']),
            'classes' => \App\Models\SchoolClass::where('status', 'active')
                ->orderBy('order')
                ->get(['id', 'name']),
            'sections' => \App\Models\Section::with('schoolClass:id,name')
                ->where('status', 'active')
                ->get(['id', 'name', 'class_id']),
            'feeTypes' => FeeType::active()->orderBy('name')->get(['id', 'name']),
            'stats' => $stats,
            'filters' => $request->only([
                'status', 'search', 'class_id', 'section_id',
                'fee_type_id', 'date_from', 'date_to', 'month', 'year',
            ]),
        ]);
    }

    /**
     * Display student fees page (new professional interface)
     */
    public function studentFeesPage()
    {
        $this->authorize('manage_fees');

        return Inertia::render('Fees/Collections/StudentFees', [
            'students' => Student::with(['user', 'schoolClass'])
                ->where('status', 'active')
                ->get(),
            'accounts' => Account::where('status', 'active')
                ->get(['id', 'account_name', 'current_balance']),
        ]);
    }

    /**
     * Store fee collection (supports both new and old formats)
     */
    public function store(Request $request)
    {
        $this->authorize('manage_fees');

        // Check if it's paying pending fees or creating new fees
        $hasPendingFees = $request->has('fee_collection_ids') && count($request->fee_collection_ids) > 0;
        $hasNewFees = $request->has('fee_structures') && count($request->fee_structures) > 0;

        if (! $hasPendingFees && ! $hasNewFees) {
            return redirect()->back()
                ->with('error', 'Please select at least one fee to collect');
        }

        // Validate common fields
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_collection_ids' => 'nullable|array',
            'fee_collection_ids.*' => 'nullable|exists:fee_collections,id',
            'fee_structures' => 'nullable|array',
            'fee_structures.*.fee_structure_id' => 'nullable|exists:fee_structures,id',
            'fee_structures.*.month' => 'nullable|integer|min:1|max:12',
            'fee_structures.*.year' => 'nullable|integer|min:2020|max:2100',
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

            // Generate ONE unique receipt number for this entire payment
            $todayPrefix = 'RCP-'.date('Ymd');
            $receiptNumber = null;

            // Simple increment without sequence table
            $maxExisting = DB::table('fee_collections')
                ->where('receipt_number', 'LIKE', $todayPrefix.'-%')
                ->lockForUpdate()
                ->max(DB::raw('CAST(SUBSTRING(receipt_number, 15) AS UNSIGNED)'));

            $nextNumber = ($maxExisting ?? 0) + 1;
            $receiptNumber = $todayPrefix.'-'.str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            $totalAmount = 0;
            $feeDescriptions = [];
            $feeCount = 0;

            // Process pending/overdue fees first
            if ($hasPendingFees) {
                $pendingFeeCount = count($validated['fee_collection_ids']);
                $pendingDiscount = $discount * ($pendingFeeCount / ($pendingFeeCount + ($hasNewFees ? count($validated['fee_structures']) : 0)));

                foreach ($validated['fee_collection_ids'] as $feeId) {
                    $fee = FeeCollection::with(['student.user', 'feeType'])
                        ->findOrFail($feeId);

                    if ($fee->status === 'paid') {
                        throw new \Exception("Fee {$fee->feeType->name} has already been paid.");
                    }

                    // Calculate proportional discount for this fee
                    $feeDiscount = $pendingFeeCount > 0 ? $pendingDiscount / $pendingFeeCount : 0;
                    $paidAmount = $fee->amount + $fee->late_fee - $feeDiscount;
                    $totalAmount += $paidAmount;
                    $feeCount++;

                    // Update fee collection - SAME receipt number for all
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
                    $feeDescriptions[] = $fee->feeType->name.' ('.$monthName.')';
                }
            }

            // Process new fees
            if ($hasNewFees) {
                $newFeeCount = count($validated['fee_structures']);
                $newDiscount = $discount * ($newFeeCount / (($hasPendingFees ? count($validated['fee_collection_ids']) : 0) + $newFeeCount));

                foreach ($validated['fee_structures'] as $feeData) {
                    $feeStructure = FeeStructure::with(['feeType', 'academicYear'])
                        ->findOrFail($feeData['fee_structure_id']);

                    $month = intval($feeData['month']);
                    $year = intval($feeData['year']);

                    // Calculate proportional discount
                    $feeAmount = floatval($feeStructure->amount);
                    $feeDiscount = $newFeeCount > 0 ? $newDiscount / $newFeeCount : 0;
                    $paidAmount = $feeAmount - $feeDiscount;
                    $totalAmount += $paidAmount;
                    $feeCount++;

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

                    // Create fee collection record - SAME receipt number for all
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
                    $feeDescriptions[] = $feeStructure->feeType->name.' ('.$monthName.')';
                }
            }

            // Create accounting transactions - ONE FOR EACH FEE TYPE
            if ($totalAmount > 0) {
                // Group fees by type to create separate transactions
                $feesByType = [];
                $allProcessedFees = [];

                // Collect all processed fees
                if ($hasPendingFees) {
                    foreach ($validated['fee_collection_ids'] as $feeId) {
                        $fee = FeeCollection::with(['feeType'])->find($feeId);
                        if ($fee) {
                            $allProcessedFees[] = [
                                'fee_type_id' => $fee->fee_type_id,
                                'fee_type_name' => $fee->feeType->name,
                                'amount' => $fee->paid_amount,
                                'month' => $fee->month,
                                'year' => $fee->year,
                            ];
                        }
                    }
                }

                if ($hasNewFees) {
                    // Retrieve newly created fees by receipt number
                    $newFees = FeeCollection::with(['feeType'])
                        ->where('receipt_number', $receiptNumber)
                        ->whereIn('status', ['paid'])
                        ->get();

                    foreach ($newFees as $fee) {
                        // Skip if already added from pending fees
                        $alreadyAdded = false;
                        foreach ($allProcessedFees as $processed) {
                            if ($processed['fee_type_id'] === $fee->fee_type_id &&
                                $processed['month'] === $fee->month &&
                                $processed['year'] === $fee->year) {
                                $alreadyAdded = true;
                                break;
                            }
                        }

                        if (! $alreadyAdded) {
                            $allProcessedFees[] = [
                                'fee_type_id' => $fee->fee_type_id,
                                'fee_type_name' => $fee->feeType->name,
                                'amount' => $fee->paid_amount,
                                'month' => $fee->month,
                                'year' => $fee->year,
                            ];
                        }
                    }
                }

                // Group by fee type
                foreach ($allProcessedFees as $feeData) {
                    $feeTypeKey = $feeData['fee_type_id'];
                    if (! isset($feesByType[$feeTypeKey])) {
                        $feesByType[$feeTypeKey] = [
                            'fee_type_id' => $feeData['fee_type_id'],
                            'fee_type_name' => $feeData['fee_type_name'],
                            'amount' => 0,
                            'descriptions' => [],
                        ];
                    }
                    $feesByType[$feeTypeKey]['amount'] += $feeData['amount'];
                    $monthName = Carbon::create($feeData['year'], $feeData['month'], 1)->format('M Y');
                    $feesByType[$feeTypeKey]['descriptions'][] = $monthName;
                }

                // Create separate transaction for each fee type
                foreach ($feesByType as $feeTypeData) {
                    $description = "{$feeTypeData['fee_type_name']} from {$student->user->name} - ".implode(', ', $feeTypeData['descriptions']);
                    if (! empty($validated['remarks'])) {
                        $description .= " | {$validated['remarks']}";
                    }

                    $this->createFeeIncomeTransactionByType(
                        accountId: $validated['account_id'],
                        feeTypeId: $feeTypeData['fee_type_id'],
                        feeTypeName: $feeTypeData['fee_type_name'],
                        amount: $feeTypeData['amount'],
                        date: $validated['payment_date'],
                        paymentMethod: $validated['payment_method'],
                        referenceNumber: $receiptNumber,
                        description: $description
                    );
                }

                // Update account balance ONCE with total amount
                Account::find($validated['account_id'])->increment('current_balance', $totalAmount);
            }

            DB::commit();

            logActivity(
                'create',
                "Collected {$feeCount} fees from {$student->user->name} (Receipt: {$receiptNumber})",
                FeeCollection::class
            );

            return redirect()->back()
                ->with('success', "Fees collected successfully! Receipt: {$receiptNumber} ({$feeCount} months)");

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to collect fees: '.$e->getMessage());
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
            'collector',
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
                ->with('error', 'Failed to delete fee collection: '.$e->getMessage());
        }
    }

    /**
     * Get fee structures by class (API endpoint)
     */
    public function getFeesByClass(Request $request)
    {
        $classId = $request->query('class_id');

        if (! $classId) {
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

        if (! $studentId) {
            return response()->json(['dues' => [], 'next_month' => date('n'), 'next_year' => date('Y')]);
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

        // Find next unpaid month
        $lastPaid = FeeCollection::where('student_id', $studentId)
            ->where('status', 'paid')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->first();

        $nextMonth = date('n');
        $nextYear = date('Y');

        if ($lastPaid) {
            $nextMonth = $lastPaid->month + 1;
            $nextYear = $lastPaid->year;

            if ($nextMonth > 12) {
                $nextMonth = 1;
                $nextYear++;
            }
        }

        return response()->json([
            'dues' => $dues,
            'next_month' => $nextMonth,
            'next_year' => $nextYear,
        ]);
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

                if (! $paid) {
                    $totalOverdue += floatval($feeStructure->amount);
                }
            }
        }

        return $totalOverdue;
    }
}
