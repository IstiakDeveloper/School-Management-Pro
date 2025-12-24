<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendance;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\AcademicYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StudentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('mark_attendance');

        // Default to today's date if no date provided
        $selectedDate = $request->date ?? now()->format('Y-m-d');

        $attendances = StudentAttendance::with(['student.user', 'schoolClass', 'section'])
            ->when($selectedDate, fn($q) => $q->where('date', $selectedDate))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('date')
            ->paginate(50);

        // Calculate stats for the selected date
        $statsQuery = StudentAttendance::where('date', $selectedDate);
        if ($request->class_id) {
            $statsQuery->where('class_id', $request->class_id);
        }
        if ($request->section_id) {
            $statsQuery->where('section_id', $request->section_id);
        }

        $stats = [
            'total' => $statsQuery->count(),
            'present' => (clone $statsQuery)->where('status', 'present')->count(),
            'absent' => (clone $statsQuery)->where('status', 'absent')->count(),
            'late' => (clone $statsQuery)->where('status', 'late')->count(),
            'excused' => (clone $statsQuery)->where('status', 'excused')->count(),
        ];

        return Inertia::render('Attendance/Students/Index', [
            'attendances' => $attendances,
            'filters' => [
                'date' => $selectedDate,
                'class_id' => $request->class_id,
                'section_id' => $request->section_id,
                'status' => $request->status,
            ],
            'stats' => $stats,
            'classes' => SchoolClass::where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('mark_attendance');

        return Inertia::render('Attendance/Students/Create', [
            'classes' => SchoolClass::with('sections')->where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
            'date' => $request->date ?? now()->format('Y-m-d'),
        ]);
    }

    public function getStudents(Request $request)
    {
        $this->authorize('mark_attendance');

        $students = Student::with(['user', 'schoolClass', 'section', 'attendance' => function($q) use ($request) {
            $q->where('date', $request->date ?? now()->format('Y-m-d'));
        }])
            ->where('class_id', $request->class_id)
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();

        return response()->json($students);
    }

    public function store(Request $request)
    {
        $this->authorize('mark_attendance');

        $validated = $request->validate([
            'date' => 'required|date',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.in_time' => 'nullable|date_format:H:i',
            'attendances.*.out_time' => 'nullable|date_format:H:i',
            'attendances.*.reason' => 'nullable|string',
        ]);

        // Get current academic year
        $academicYear = AcademicYear::where('is_current', true)->first();
        if (!$academicYear) {
            return back()->with('error', 'No active academic year found. Please set an academic year as current.');
        }

        DB::beginTransaction();
        try {
            foreach ($validated['attendances'] as $attendance) {
                StudentAttendance::updateOrCreate(
                    [
                        'student_id' => $attendance['student_id'],
                        'date' => $validated['date'],
                    ],
                    [
                        'academic_year_id' => $academicYear->id,
                        'class_id' => $validated['class_id'],
                        'section_id' => $validated['section_id'],
                        'status' => $attendance['status'],
                        'in_time' => $attendance['in_time'] ?? null,
                        'out_time' => $attendance['out_time'] ?? null,
                        'reason' => $attendance['reason'] ?? null,
                        'marked_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();

            logActivity('create', "Marked attendance for " . count($validated['attendances']) . " students", StudentAttendance::class);

            return redirect()->route('student-attendance.index')
                ->with('success', 'Attendance marked successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to mark attendance: ' . $e->getMessage());
        }
    }

    public function report(Request $request)
    {
        $this->authorize('view_attendance');

        $query = StudentAttendance::with(['student.user', 'schoolClass', 'section'])
            ->when($request->student_id, fn($q) => $q->where('student_id', $request->student_id))
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->when($request->from_date, fn($q) => $q->where('date', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->where('date', '<=', $request->to_date));

        $attendances = $query->latest('date')->paginate(50);

        $stats = [
            'total' => $query->count(),
            'present' => (clone $query)->where('status', 'present')->count(),
            'absent' => (clone $query)->where('status', 'absent')->count(),
            'late' => (clone $query)->where('status', 'late')->count(),
        ];

        return Inertia::render('Attendance/Students/Report', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => $request->only(['student_id', 'class_id', 'section_id', 'from_date', 'to_date']),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function destroy(StudentAttendance $studentAttendance)
    {
        $this->authorize('mark_attendance');

        $studentAttendance->delete();

        logActivity('delete', "Deleted student attendance", StudentAttendance::class, $studentAttendance->id);

        return back()->with('success', 'Attendance deleted successfully');
    }

    public function calendar(Request $request)
    {
        $this->authorize('view_attendance');

        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;
        $classId = $request->class_id;
        $sectionId = $request->section_id;

        // Get attendance data for the month
        $startDate = "{$year}-{$month}-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        // Get all students with their attendance for the month
        $query = Student::with(['user', 'schoolClass', 'section', 'attendance' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('date', [$startDate, $endDate]);
        }])
        ->where('status', 'active')
        ->when($request->search, function($q) use ($request) {
            $q->where(function($q) use ($request) {
                $q->where('admission_number', 'like', "%{$request->search}%")
                  ->orWhere('roll_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', function($q) use ($request) {
                      $q->where('name', 'like', "%{$request->search}%");
                  });
            });
        });

        if ($classId) {
            $query->where('class_id', $classId);
        }
        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }

        $students = $query->get()
            ->map(function($student) use ($startDate, $endDate) {
                $attendanceByDate = $student->attendance->keyBy(function($att) {
                    return $att->date->format('Y-m-d');
                });

                $daysInMonth = date('t', strtotime($startDate));
                $attendanceGrid = [];
                $presentCount = 0;

                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $date = date('Y-m-d', strtotime("{$startDate} +".($day-1)." days"));
                    $dayOfWeek = date('N', strtotime($date));
                    
                    if (isset($attendanceByDate[$date])) {
                        $status = $attendanceByDate[$date]->status;
                        $attendanceGrid[$day] = [
                            'status' => $status,
                            'in_time' => $attendanceByDate[$date]->in_time,
                            'out_time' => $attendanceByDate[$date]->out_time,
                        ];
                        if ($status === 'present') $presentCount++;
                    } else {
                        // Check if weekend (Friday/Saturday)
                        $attendanceGrid[$day] = [
                            'status' => ($dayOfWeek == 5 || $dayOfWeek == 6) ? 'weekend' : null,
                            'in_time' => null,
                            'out_time' => null,
                        ];
                    }
                }

                return [
                    'id' => $student->id,
                    'name' => $student->user->name,
                    'admission_number' => $student->admission_number,
                    'roll_number' => $student->roll_number,
                    'class_name' => $student->schoolClass->name,
                    'section_name' => $student->section->name,
                    'attendance' => $attendanceGrid,
                    'present_count' => $presentCount,
                ];
            });

        return Inertia::render('Attendance/Students/Calendar', [
            'students' => $students,
            'year' => $year,
            'month' => $month,
            'daysInMonth' => date('t', strtotime($startDate)),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'sections' => Section::where('status', 'active')->get(),
            'filters' => [
                'class_id' => $classId,
                'section_id' => $sectionId,
                'search' => $request->search,
            ]
        ]);
    }
}
