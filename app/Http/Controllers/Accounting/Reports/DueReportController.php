<?php

namespace App\Http\Controllers\Accounting\Reports;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\FeeCollection;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DueReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_accounting');

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : now()->endOfMonth();
        $reportType = $request->report_type ?? 'organization';
        $classId = $request->class_id;
        $studentId = $request->student_id;

        // Get current academic year
        $currentAcademicYear = AcademicYear::where('is_current', true)->first();

        // Get all classes for filter
        $classes = SchoolClass::active()->ordered()->get(['id', 'name']);

        // Get students for filter (if class is selected)
        $students = [];
        if ($classId) {
            $students = Student::where('class_id', $classId)
                ->where('status', 'active')
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'student_id', 'roll_number']);
        }

        // Base query for due fees (pending and partial status)
        $baseQuery = FeeCollection::with(['student.schoolClass', 'student.section', 'feeType'])
            ->whereIn('status', ['pending', 'partial'])
            ->whereBetween('payment_date', [$startDate, $endDate]);

        if ($currentAcademicYear) {
            $baseQuery->where('academic_year_id', $currentAcademicYear->id);
        }

        // Generate report based on type
        $reportData = [];
        $summary = [
            'totalDue' => 0,
            'totalPaid' => 0,
            'totalRemaining' => 0,
            'totalRecords' => 0,
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

    private function getOrganizationDueReport($query, &$summary)
    {
        // Get all due fees grouped by fee type
        $dueRecords = $query->get();

        $feeTypeWise = [];
        $classWise = [];

        foreach ($dueRecords as $record) {
            $dueAmount = $record->total_amount - $record->paid_amount;

            // Fee Type wise summary
            $feeTypeName = $record->feeType->name ?? 'Unknown';
            if (! isset($feeTypeWise[$feeTypeName])) {
                $feeTypeWise[$feeTypeName] = [
                    'fee_type' => $feeTypeName,
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'student_count' => 0,
                ];
            }
            $feeTypeWise[$feeTypeName]['total_amount'] += $record->total_amount;
            $feeTypeWise[$feeTypeName]['paid_amount'] += $record->paid_amount;
            $feeTypeWise[$feeTypeName]['due_amount'] += $dueAmount;
            $feeTypeWise[$feeTypeName]['student_count']++;

            // Class wise summary
            $className = $record->student->schoolClass->name ?? 'Unknown';
            if (! isset($classWise[$className])) {
                $classWise[$className] = [
                    'class_name' => $className,
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'student_count' => 0,
                ];
            }
            $classWise[$className]['total_amount'] += $record->total_amount;
            $classWise[$className]['paid_amount'] += $record->paid_amount;
            $classWise[$className]['due_amount'] += $dueAmount;
            $classWise[$className]['student_count']++;

            // Update summary
            $summary['totalDue'] += $record->total_amount;
            $summary['totalPaid'] += $record->paid_amount;
            $summary['totalRemaining'] += $dueAmount;
            $summary['totalRecords']++;
        }

        return [
            'feeTypeWise' => array_values($feeTypeWise),
            'classWise' => array_values($classWise),
        ];
    }

    private function getClassWiseDueReport($query, $classId, &$summary)
    {
        if ($classId) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        $dueRecords = $query->get();

        // Group by class and then by student
        $classData = [];

        foreach ($dueRecords as $record) {
            $dueAmount = $record->total_amount - $record->paid_amount;
            $className = $record->student->schoolClass->name ?? 'Unknown';
            $studentId = $record->student_id;
            $studentName = $record->student->full_name ?? 'Unknown';
            $rollNumber = $record->student->roll_number ?? '-';
            $studentIdNumber = $record->student->student_id ?? '-';

            if (! isset($classData[$className])) {
                $classData[$className] = [
                    'class_name' => $className,
                    'students' => [],
                    'total_due' => 0,
                    'total_paid' => 0,
                    'total_remaining' => 0,
                ];
            }

            if (! isset($classData[$className]['students'][$studentId])) {
                $classData[$className]['students'][$studentId] = [
                    'student_id' => $studentId,
                    'student_id_number' => $studentIdNumber,
                    'student_name' => $studentName,
                    'roll_number' => $rollNumber,
                    'section' => $record->student->section->name ?? '-',
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'fees' => [],
                ];
            }

            $classData[$className]['students'][$studentId]['total_amount'] += $record->total_amount;
            $classData[$className]['students'][$studentId]['paid_amount'] += $record->paid_amount;
            $classData[$className]['students'][$studentId]['due_amount'] += $dueAmount;
            $classData[$className]['students'][$studentId]['fees'][] = [
                'fee_type' => $record->feeType->name ?? 'Unknown',
                'month' => $record->month,
                'year' => $record->year,
                'total_amount' => $record->total_amount,
                'paid_amount' => $record->paid_amount,
                'due_amount' => $dueAmount,
                'status' => $record->status,
                'payment_date' => $record->payment_date->format('Y-m-d'),
            ];

            $classData[$className]['total_due'] += $record->total_amount;
            $classData[$className]['total_paid'] += $record->paid_amount;
            $classData[$className]['total_remaining'] += $dueAmount;

            $summary['totalDue'] += $record->total_amount;
            $summary['totalPaid'] += $record->paid_amount;
            $summary['totalRemaining'] += $dueAmount;
            $summary['totalRecords']++;
        }

        // Convert students from associative to indexed array
        foreach ($classData as &$class) {
            $class['students'] = array_values($class['students']);
        }

        return array_values($classData);
    }

    private function getStudentWiseDueReport($query, $classId, $studentId, &$summary)
    {
        if ($classId) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        $dueRecords = $query->orderBy('payment_date', 'desc')->get();

        $studentData = [];

        foreach ($dueRecords as $record) {
            $dueAmount = $record->total_amount - $record->paid_amount;
            $sid = $record->student_id;

            if (! isset($studentData[$sid])) {
                $studentData[$sid] = [
                    'student_id' => $sid,
                    'student_id_number' => $record->student->student_id ?? '-',
                    'student_name' => $record->student->full_name ?? 'Unknown',
                    'roll_number' => $record->student->roll_number ?? '-',
                    'class_name' => $record->student->schoolClass->name ?? 'Unknown',
                    'section' => $record->student->section->name ?? '-',
                    'father_name' => $record->student->father_name ?? '-',
                    'phone' => $record->student->phone ?? $record->student->father_phone ?? '-',
                    'total_amount' => 0,
                    'paid_amount' => 0,
                    'due_amount' => 0,
                    'fees' => [],
                ];
            }

            $studentData[$sid]['total_amount'] += $record->total_amount;
            $studentData[$sid]['paid_amount'] += $record->paid_amount;
            $studentData[$sid]['due_amount'] += $dueAmount;
            $studentData[$sid]['fees'][] = [
                'id' => $record->id,
                'receipt_number' => $record->receipt_number,
                'fee_type' => $record->feeType->name ?? 'Unknown',
                'month' => $record->month,
                'year' => $record->year,
                'total_amount' => $record->total_amount,
                'paid_amount' => $record->paid_amount,
                'due_amount' => $dueAmount,
                'late_fee' => $record->late_fee,
                'discount' => $record->discount,
                'status' => $record->status,
                'payment_date' => $record->payment_date->format('Y-m-d'),
            ];

            $summary['totalDue'] += $record->total_amount;
            $summary['totalPaid'] += $record->paid_amount;
            $summary['totalRemaining'] += $dueAmount;
            $summary['totalRecords']++;
        }

        return array_values($studentData);
    }
}
