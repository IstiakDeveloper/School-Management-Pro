<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DueReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date)->startOfDay() : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : now()->endOfMonth();
        $reportType = $request->report_type ?? 'organization';
        $classId = $request->class_id ? (int) $request->class_id : null;
        $studentId = $request->student_id ? (int) $request->student_id : null;

        $currentAcademicYear = AcademicYear::where('is_current', true)->first();

        $classes = SchoolClass::active()->ordered()->get(['id', 'name']);

        $students = [];
        if ($classId) {
            $students = Student::where('class_id', $classId)
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'student_id', 'roll_number']);
        }

        $baseQuery = $this->buildPeriodFeeQuery($currentAcademicYear, $startDate, $endDate);

        $reportData = [];
        $summary = [
            'totalDue' => 0,
            'totalDiscount' => 0,
            'totalPaid' => 0,
            'totalRemaining' => 0,
            'totalRecords' => 0,
            'uniqueStudents' => 0,
        ];

        switch ($reportType) {
            case 'organization':
                $reportData = $this->getOrganizationDueReport($baseQuery->clone(), $summary);
                break;
            case 'class':
                $reportData = $this->getClassWiseDueReport($baseQuery->clone(), $classId, $summary);
                break;
            case 'student':
                $reportData = $this->getStudentWiseDueReport($baseQuery->clone(), $classId, $studentId, $summary);
                break;
        }

        $schoolName = Setting::where('key', 'school_name')->value('value') ?: 'School Management Pro';
        $schoolAddress = Setting::where('key', 'school_address')->value('value') ?: '';

        return Inertia::render('Accounting/Reports/DueReport', [
            'reportData' => $reportData,
            'summary' => $summary,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'report_type' => $reportType,
                'class_id' => $classId,
                'student_id' => $studentId,
            ],
            'classes' => $classes,
            'students' => $students,
            'academicYear' => $currentAcademicYear,
            'schoolName' => $schoolName,
            'schoolAddress' => $schoolAddress,
        ]);
    }

    /**
     * Fees relevant to the selected period for active students only.
     */
    private function buildPeriodFeeQuery(?AcademicYear $currentAcademicYear, Carbon $startDate, Carbon $endDate): Builder
    {
        $query = FeeCollection::with(['student.schoolClass', 'student.section', 'student.user', 'feeType'])
            ->whereHas('student', function (Builder $q) {
                $q->where('status', 'active');
            })
            ->where(function (Builder $q) use ($startDate, $endDate) {
                $q->where(function (Builder $outstanding) use ($startDate, $endDate) {
                    $outstanding->whereIn('status', ['pending', 'partial', 'overdue'])
                        ->whereDate('payment_date', '>=', $startDate)
                        ->whereDate('payment_date', '<=', $endDate);
                })->orWhere(function (Builder $collected) use ($startDate, $endDate) {
                    $collected->where('status', 'paid')
                        ->whereDate('payment_date', '>=', $startDate)
                        ->whereDate('payment_date', '<=', $endDate);
                });
            });

        if ($currentAcademicYear) {
            $query->where('academic_year_id', $currentAcademicYear->id);
        }

        return $query;
    }

    private function applyStudentFilters(Builder $query, ?int $classId, ?int $studentId): Builder
    {
        if ($classId) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        return $query;
    }

    private function feeAmounts(FeeCollection $record): array
    {
        $total = (float) $record->amount + (float) $record->late_fee;
        $discount = (float) $record->discount;
        $paid = (float) $record->paid_amount;
        $due = max($total - $discount - $paid, 0);

        return compact('total', 'discount', 'paid', 'due');
    }

    private function studentDisplayName(Student $student): string
    {
        if (! empty($student->full_name)) {
            return $student->full_name;
        }

        $name = trim(($student->first_name ?? '').' '.($student->last_name ?? ''));

        return $name !== '' ? $name : ($student->user->name ?? 'Unknown');
    }

    private function accumulateSummary(array &$summary, float $total, float $discount, float $paid, float $due, ?int $studentId = null): void
    {
        $summary['totalDue'] += $total;
        $summary['totalDiscount'] += $discount;
        $summary['totalPaid'] += $paid;
        $summary['totalRemaining'] += $due;
        $summary['totalRecords']++;

        if ($studentId !== null && $due > 0) {
            if (! isset($summary['_studentIds'])) {
                $summary['_studentIds'] = [];
            }
            $summary['_studentIds'][$studentId] = true;
        }
    }

    private function finalizeSummary(array &$summary): void
    {
        $summary['uniqueStudents'] = isset($summary['_studentIds']) ? count($summary['_studentIds']) : 0;
        unset($summary['_studentIds']);
    }

    private function trackUniqueStudent(array &$group, int $studentId): void
    {
        if (! isset($group['_student_ids'])) {
            $group['_student_ids'] = [];
        }

        $group['_student_ids'][$studentId] = true;
        $group['student_count'] = count($group['_student_ids']);
    }

    private function stripInternalKeys(array $group): array
    {
        unset($group['_student_ids']);

        return $group;
    }

    private function getOrganizationDueReport(Builder $query, array &$summary): array
    {
        $records = $query->get();

        $feeTypeWise = [];
        $classWise = [];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);
            $studentId = (int) $record->student_id;

            $feeTypeName = $record->feeType->name ?? 'Unknown';
            if (! isset($feeTypeWise[$feeTypeName])) {
                $feeTypeWise[$feeTypeName] = [
                    'fee_type' => $feeTypeName,
                    'total_amount' => 0,
                    'discount_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'student_count' => 0,
                ];
            }
            $feeTypeWise[$feeTypeName]['total_amount'] += $total;
            $feeTypeWise[$feeTypeName]['discount_amount'] += $discount;
            $feeTypeWise[$feeTypeName]['paid_amount'] += $paid;
            $feeTypeWise[$feeTypeName]['due_amount'] += $due;
            if ($due > 0) {
                $this->trackUniqueStudent($feeTypeWise[$feeTypeName], $studentId);
            }

            $classKey = (int) ($record->student->class_id ?? 0);
            if (! isset($classWise[$classKey])) {
                $classWise[$classKey] = [
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'total_amount' => 0,
                    'discount_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'student_count' => 0,
                ];
            }
            $classWise[$classKey]['total_amount'] += $total;
            $classWise[$classKey]['discount_amount'] += $discount;
            $classWise[$classKey]['paid_amount'] += $paid;
            $classWise[$classKey]['due_amount'] += $due;
            if ($due > 0) {
                $this->trackUniqueStudent($classWise[$classKey], $studentId);
            }

            $this->accumulateSummary($summary, $total, $discount, $paid, $due, $studentId);
        }

        $this->finalizeSummary($summary);

        return [
            'feeTypeWise' => array_values(array_map(fn ($group) => $this->stripInternalKeys($group), $feeTypeWise)),
            'classWise' => array_values(array_map(fn ($group) => $this->stripInternalKeys($group), $classWise)),
        ];
    }

    private function getClassWiseDueReport(Builder $query, ?int $classId, array &$summary): array
    {
        $this->applyStudentFilters($query, $classId, null);

        $records = $query->get();
        $classData = [];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);

            $classKey = (int) ($record->student->class_id ?? 0);
            $studentId = (int) $record->student_id;

            if (! isset($classData[$classKey])) {
                $classData[$classKey] = [
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'students' => [],
                    'total_gross' => 0,
                    'total_discount' => 0,
                    'total_paid' => 0,
                    'total_remaining' => 0,
                ];
            }

            if (! isset($classData[$classKey]['students'][$studentId])) {
                $classData[$classKey]['students'][$studentId] = [
                    'student_id' => $studentId,
                    'student_id_number' => $record->student->student_id ?? '-',
                    'student_name' => $this->studentDisplayName($record->student),
                    'roll_number' => $record->student->roll_number ?? '-',
                    'section' => $record->student->section->name ?? '-',
                    'total_amount' => 0,
                    'discount_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'fees' => [],
                ];
            }

            $classData[$classKey]['students'][$studentId]['total_amount'] += $total;
            $classData[$classKey]['students'][$studentId]['discount_amount'] += $discount;
            $classData[$classKey]['students'][$studentId]['paid_amount'] += $paid;
            $classData[$classKey]['students'][$studentId]['due_amount'] += $due;

            if ($due > 0) {
                $classData[$classKey]['students'][$studentId]['fees'][] = [
                    'fee_type' => $record->feeType->name ?? 'Unknown',
                    'month' => $record->month,
                    'year' => $record->year,
                    'total_amount' => $total,
                    'discount_amount' => $discount,
                    'paid_amount' => $paid,
                    'due_amount' => $due,
                    'status' => $record->status,
                    'payment_date' => $record->payment_date->format('Y-m-d'),
                ];
            }

            $classData[$classKey]['total_gross'] += $total;
            $classData[$classKey]['total_discount'] += $discount;
            $classData[$classKey]['total_paid'] += $paid;
            $classData[$classKey]['total_remaining'] += $due;

            $this->accumulateSummary($summary, $total, $discount, $paid, $due, $studentId);
        }

        $this->finalizeSummary($summary);

        $result = [];
        foreach ($classData as $class) {
            $dueStudents = array_values(array_filter(
                $class['students'],
                fn (array $student) => $student['due_amount'] > 0
            ));

            usort($dueStudents, function (array $a, array $b) {
                $rollA = is_numeric($a['roll_number']) ? (int) $a['roll_number'] : PHP_INT_MAX;
                $rollB = is_numeric($b['roll_number']) ? (int) $b['roll_number'] : PHP_INT_MAX;

                if ($rollA === $rollB) {
                    return strcmp($a['student_name'], $b['student_name']);
                }

                return $rollA <=> $rollB;
            });

            if ($dueStudents === []) {
                continue;
            }

            $class['students'] = $dueStudents;
            $class['student_count'] = count($dueStudents);
            $class['total_gross'] = array_sum(array_column($dueStudents, 'total_amount'));
            $class['total_discount'] = array_sum(array_column($dueStudents, 'discount_amount'));
            $class['total_paid'] = array_sum(array_column($dueStudents, 'paid_amount'));
            $class['total_remaining'] = array_sum(array_column($dueStudents, 'due_amount'));
            $result[] = $class;
        }

        usort($result, fn (array $a, array $b) => strcmp($a['class_name'], $b['class_name']));

        return $result;
    }

    private function getStudentWiseDueReport(Builder $query, ?int $classId, ?int $studentId, array &$summary): array
    {
        $this->applyStudentFilters($query, $classId, $studentId);

        $records = $query->orderBy('payment_date', 'desc')->get();
        $studentData = [];

        foreach ($records as $record) {
            if (! $record->student) {
                continue;
            }

            ['total' => $total, 'discount' => $discount, 'paid' => $paid, 'due' => $due] = $this->feeAmounts($record);
            $sid = (int) $record->student_id;

            if (! isset($studentData[$sid])) {
                $studentData[$sid] = [
                    'student_id' => $sid,
                    'student_id_number' => $record->student->student_id ?? '-',
                    'student_name' => $this->studentDisplayName($record->student),
                    'roll_number' => $record->student->roll_number ?? '-',
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'section' => $record->student->section->name ?? '-',
                    'father_name' => $record->student->father_name ?? '-',
                    'phone' => $record->student->phone ?? $record->student->father_phone ?? '-',
                    'total_amount' => 0,
                    'discount_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'fees' => [],
                ];
            }

            $studentData[$sid]['total_amount'] += $total;
            $studentData[$sid]['discount_amount'] += $discount;
            $studentData[$sid]['paid_amount'] += $paid;
            $studentData[$sid]['due_amount'] += $due;

            if ($due > 0) {
                $studentData[$sid]['fees'][] = [
                    'id' => $record->id,
                    'receipt_number' => $record->receipt_number,
                    'fee_type' => $record->feeType->name ?? 'Unknown',
                    'month' => $record->month,
                    'year' => $record->year,
                    'total_amount' => $total,
                    'discount_amount' => $discount,
                    'paid_amount' => $paid,
                    'due_amount' => $due,
                    'late_fee' => $record->late_fee,
                    'discount' => $record->discount,
                    'status' => $record->status,
                    'payment_date' => $record->payment_date->format('Y-m-d'),
                ];
            }

            $this->accumulateSummary($summary, $total, $discount, $paid, $due, $sid);
        }

        $this->finalizeSummary($summary);

        $result = array_values(array_filter(
            $studentData,
            fn (array $student) => $student['due_amount'] > 0
        ));

        usort($result, function (array $a, array $b) {
            $classCmp = strcmp($a['class_name'], $b['class_name']);
            if ($classCmp !== 0) {
                return $classCmp;
            }

            $rollA = is_numeric($a['roll_number']) ? (int) $a['roll_number'] : PHP_INT_MAX;
            $rollB = is_numeric($b['roll_number']) ? (int) $b['roll_number'] : PHP_INT_MAX;

            if ($rollA === $rollB) {
                return strcmp($a['student_name'], $b['student_name']);
            }

            return $rollA <=> $rollB;
        });

        return $result;
    }
}
