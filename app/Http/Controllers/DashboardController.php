<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Redirect to role-specific dashboard if user is not admin
        if ($user->hasRole('Student')) {
            return redirect()->route('student.dashboard');
        } elseif ($user->hasRole('Teacher')) {
            return redirect()->route('teacher.dashboard');
        } elseif ($user->hasRole('Parent')) {
            return redirect()->route('parent.dashboard');
        }

        // Get user stats based on role
        $stats = $this->getUserStats($user);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'permissions' => $user->getPermissionNames(),
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Get dashboard statistics based on user role.
     */
    private function getUserStats(User $user): array
    {
        $stats = [];

        if ($user->isSuperAdmin() || $user->isPrincipal()) {
            $stats = [
                'total_students' => \App\Models\Student::where('status', 'active')->count(),
                'total_teachers' => \App\Models\Teacher::where('status', 'active')->count(),
                'total_staff' => \App\Models\Staff::where('status', 'active')->count(),
                'total_classes' => \App\Models\SchoolClass::where('status', 'active')->count(),
                'pending_fees' => \App\Models\FeeCollection::where('status', 'pending')->sum('amount'),
                'today_attendance' => \App\Models\StudentAttendance::where('date', today())->count(),
            ];
        } elseif ($user->isTeacher()) {
            $teacher = $user->teacher;
            $stats = [
                'my_subjects' => $teacher?->subjects()->count() ?? 0,
                'my_classes' => $teacher?->subjects()->distinct('class_id')->count('class_id') ?? 0,
                'today_attendance_marked' => \App\Models\StudentAttendance::where('marked_by', $user->id)
                    ->where('date', today())->exists(),
                'pending_marks' => 0, // Can be calculated based on assigned exams
            ];
        } elseif ($user->isStudent()) {
            $student = $user->student;
            $stats = [
                'class' => $student?->class?->name,
                'section' => $student?->section?->name,
                'attendance_percentage' => $this->calculateAttendancePercentage($student),
                'pending_fees' => \App\Models\FeeCollection::where('student_id', $student?->id)
                    ->where('status', 'pending')->sum('amount'),
            ];
        } elseif ($user->isAccountant()) {
            $stats = [
                'today_collections' => \App\Models\FeeCollection::where('payment_date', today())
                    ->where('status', 'paid')->sum('amount'),
                'pending_collections' => \App\Models\FeeCollection::where('status', 'pending')
                    ->sum('amount'),
                'overdue_collections' => \App\Models\FeeCollection::where('status', 'pending')
                    ->where('due_date', '<', today())->sum('amount'),
            ];
        } elseif ($user->isLibrarian()) {
            $stats = [
                'total_books' => \App\Models\Book::where('status', 'available')->count(),
                'issued_books' => \App\Models\BookIssue::where('status', 'issued')->count(),
                'overdue_books' => \App\Models\BookIssue::where('status', 'overdue')->count(),
                'returned_today' => \App\Models\BookIssue::where('return_date', today())->count(),
            ];
        }

        return $stats;
    }

    /**
     * Calculate attendance percentage for a student.
     */
    private function calculateAttendancePercentage($student): int
    {
        if (!$student) {
            return 0;
        }

        $summary = \App\Models\AttendanceSummary::where('student_id', $student->id)
            ->where('month', now()->format('Y-m'))
            ->first();

        if (!$summary || $summary->total_days == 0) {
            return 0;
        }

        return round(($summary->present_days / $summary->total_days) * 100);
    }
}
