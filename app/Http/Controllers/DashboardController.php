<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Exam;
use App\Models\FeeCollection;
use App\Models\Notice;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Staff;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use App\Models\User;
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

        // Extra dashboard data for admin/principal
        $today = now()->toDateString();
        $todayStudentPresent = StudentAttendance::where('date', $today)->where('status', 'present')->count();
        $todayStudentTotal = StudentAttendance::where('date', $today)->count();
        $todayTeacherPresent = TeacherAttendance::where('date', $today)->whereIn('status', ['present', 'late', 'early_leave'])->count();
        $todayTeacherAbsent = TeacherAttendance::where('date', $today)->where('status', 'absent')->count();
        $todayTeacherTotal = TeacherAttendance::where('date', $today)->count();

        $upcomingExams = Exam::where('start_date', '>=', $today)
            ->orderBy('start_date')
            ->limit(5)
            ->get(['id', 'name', 'exam_type', 'start_date', 'end_date'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'name' => $e->name,
                    'exam_type' => $e->exam_type,
                    'start_date' => $e->start_date ? \Carbon\Carbon::parse($e->start_date)->toDateString() : null,
                    'end_date' => $e->end_date ? \Carbon\Carbon::parse($e->end_date)->toDateString() : null,
                ];
            });

        $recentNotices = Notice::where('is_published', true)
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'published_at'])
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'published_at' => $n->published_at ? \Carbon\Carbon::parse($n->published_at)->format('Y-m-d H:i') : null,
                ];
            });

        $upcomingEvents = Event::upcoming()
            ->orderBy('start_date')
            ->limit(5)
            ->get(['id', 'title', 'start_date', 'end_date', 'type'])
            ->map(function ($e) {
                return [
                    'id' => $e->id,
                    'title' => $e->title,
                    'start_date' => $e->start_date ? \Carbon\Carbon::parse($e->start_date)->toDateString() : null,
                    'end_date' => $e->end_date ? \Carbon\Carbon::parse($e->end_date)->toDateString() : null,
                    'type' => $e->type,
                ];
            });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'todayAttendance' => [
                'student_present' => $todayStudentPresent,
                'student_total' => $todayStudentTotal,
                'teacher_present' => $todayTeacherPresent,
                'teacher_absent' => $todayTeacherAbsent,
                'teacher_total' => $todayTeacherTotal,
            ],
            'upcomingExams' => $upcomingExams,
            'recentNotices' => $recentNotices,
            'upcomingEvents' => $upcomingEvents,
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
                'total_students' => Student::where('status', 'active')->count(),
                'total_teachers' => Teacher::where('status', 'active')->count(),
                'total_staff' => Staff::where('status', 'active')->count(),
                'total_classes' => SchoolClass::where('status', 'active')->count(),
                'pending_fees' => FeeCollection::where('status', 'pending')->sum('amount'),
                'today_attendance' => StudentAttendance::where('date', today())->where('status', 'present')->count(),
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
        if (! $student) {
            return 0;
        }

        $summary = \App\Models\AttendanceSummary::where('student_id', $student->id)
            ->where('month', now()->format('Y-m'))
            ->first();

        if (! $summary || $summary->total_days == 0) {
            return 0;
        }

        return round(($summary->present_days / $summary->total_days) * 100);
    }
}
