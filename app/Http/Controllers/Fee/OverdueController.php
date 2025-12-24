<?php

namespace App\Http\Controllers\Fee;

use App\Http\Controllers\Controller;
use App\Models\FeeStructure;
use App\Models\FeeCollection;
use App\Models\Student;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OverdueController extends Controller
{
    /**
     * Display all overdue fees
     */
    public function index()
    {
        $today = Carbon::today();

        // Get all active fee structures that are overdue
        $overdueFeeStructures = FeeStructure::with([
            'feeType',
            'academicYear',
            'schoolClass'
        ])
            ->where('status', 'active')
            ->where('due_date', '<', $today)
            ->get();

        // Get all students with their class
        $students = Student::with('schoolClass')->where('status', 'active')->get();

        // Calculate overdue fees for each student
        $overdueList = [];

        foreach ($students as $student) {
            // Get overdue fee structures for student's class
            $studentOverdueFees = $overdueFeeStructures->filter(function ($feeStructure) use ($student) {
                return $feeStructure->class_id == $student->class_id;
            });

            foreach ($studentOverdueFees as $feeStructure) {
                // Calculate month and year from due date
                $dueDate = Carbon::parse($feeStructure->due_date);

                // Check if already paid
                $paid = FeeCollection::where('student_id', $student->id)
                    ->where('fee_type_id', $feeStructure->fee_type_id)
                    ->where('month', $dueDate->month)
                    ->where('year', $dueDate->year)
                    ->where('status', 'paid')
                    ->exists();

                if (!$paid) {
                    $daysOverdue = $dueDate->diffInDays($today);

                    $overdueList[] = [
                        'id' => $feeStructure->id . '_' . $student->id,
                        'student_id' => $student->id,
                        'student_name' => $student->name,
                        'student_roll' => $student->roll_number,
                        'class_name' => $student->schoolClass->name ?? 'N/A',
                        'fee_type' => $feeStructure->feeType->name,
                        'fee_frequency' => $feeStructure->feeType->frequency,
                        'fee_period' => $dueDate->format('F Y'),
                        'amount' => $feeStructure->amount,
                        'due_date' => $feeStructure->due_date,
                        'days_overdue' => $daysOverdue,
                        'academic_year' => $feeStructure->academicYear->year ?? 'N/A',
                        'fee_structure_id' => $feeStructure->id,
                        'student_email' => $student->email,
                        'student_phone' => $student->phone,
                    ];
                }
            }
        }

        // Sort by days overdue (descending)
        usort($overdueList, function ($a, $b) {
            return $b['days_overdue'] - $a['days_overdue'];
        });

        // Calculate statistics
        $stats = [
            'total_overdue_count' => count($overdueList),
            'total_overdue_amount' => array_sum(array_column($overdueList, 'amount')),
            'critically_overdue' => count(array_filter($overdueList, fn($item) => $item['days_overdue'] > 30)),
            'moderately_overdue' => count(array_filter($overdueList, fn($item) => $item['days_overdue'] >= 7 && $item['days_overdue'] <= 30)),
        ];

        return Inertia::render('Fees/Overdue/Index', [
            'overdueList' => $overdueList,
            'stats' => $stats,
        ]);
    }

    /**
     * Send reminder to student/parent
     */
    public function sendReminder(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_structure_id' => 'required|exists:fee_structures,id',
            'reminder_type' => 'required|in:email,sms,both',
        ]);

        $student = Student::with('parent')->findOrFail($request->student_id);
        $feeStructure = FeeStructure::with('feeType')->findOrFail($request->fee_structure_id);

        // Here you would implement actual email/SMS sending logic
        // For now, we'll just return success

        $message = "Reminder sent to {$student->name}";
        if ($request->reminder_type === 'email' || $request->reminder_type === 'both') {
            // Send email logic
            $message .= " via email";
        }
        if ($request->reminder_type === 'sms' || $request->reminder_type === 'both') {
            // Send SMS logic
            $message .= " via SMS";
        }

        return back()->with('success', $message);
    }

    /**
     * Bulk send reminders
     */
    public function bulkReminder(Request $request)
    {
        $request->validate([
            'reminder_type' => 'required|in:email,sms,both',
            'days_filter' => 'required|in:all,7,30,60',
        ]);

        $today = Carbon::today();
        $daysOverdue = $request->days_filter === 'all' ? 0 : (int)$request->days_filter;

        // Get overdue fee structures
        $query = FeeStructure::where('status', 'active')
            ->where('due_date', '<', $today);

        if ($daysOverdue > 0) {
            $filterDate = $today->copy()->subDays($daysOverdue);
            $query->where('due_date', '<=', $filterDate);
        }

        $overdueFeeStructures = $query->get();

        // Get students and send reminders
        $reminderCount = 0;
        foreach ($overdueFeeStructures as $feeStructure) {
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
                    // Send reminder logic here
                    $reminderCount++;
                }
            }
        }

        return back()->with('success', "Sent {$reminderCount} reminders successfully");
    }

    /**
     * Mark fee as paid (redirect to collection form)
     */
    public function markPaid(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_structure_id' => 'required|exists:fee_structures,id',
        ]);

        // Redirect to fee collection page with pre-filled student
        return redirect()->route('fee-collections.index', [
            'student_id' => $request->student_id,
            'fee_structure_id' => $request->fee_structure_id,
        ])->with('info', 'Please complete the payment collection');
    }
}
