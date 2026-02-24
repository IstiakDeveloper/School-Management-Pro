<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\DeviceSetting;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TeacherAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('mark_attendance');

        // Default to today's date if no date provided
        $selectedDate = $request->date ?? now()->format('Y-m-d');

        $attendances = TeacherAttendance::with(['teacher' => function ($q) {
            $q->withTrashed()->with('user');
        }])
            ->when($selectedDate, fn ($q) => $q->where('date', $selectedDate))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest('date')
            ->paginate(50);

        $deviceSetting = DeviceSetting::first();

        // Teachers who have no attendance record for this date (so they appear on page and can be marked)
        $teacherIdsWithRecord = TeacherAttendance::where('date', $selectedDate)->pluck('teacher_id')->toArray();
        $teachersNotMarked = Teacher::with('user')
            ->where('status', 'active')
            ->whereNotIn('id', $teacherIdsWithRecord)
            ->orderBy('id')
            ->get(['id', 'user_id', 'employee_id', 'designation'])
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'name' => $t->user?->name ?? ('Employee '.($t->employee_id ?: $t->id)),
                    'employee_id' => $t->employee_id,
                    'designation' => $t->designation,
                ];
            });

        // Dynamic status from device settings (in_time, out_time, late_time)
        if ($deviceSetting) {
            $attendances->getCollection()->transform(function ($att) use ($deviceSetting) {
                if (in_array($att->status, ['present', 'late', 'early_leave']) && $att->in_time) {
                    $att->status = $deviceSetting->computeTeacherStatus(
                        $att->in_time,
                        $att->out_time,
                        $att->date
                    );
                }

                return $att;
            });
        }

        // Stats: use computed status when device setting exists
        $statsQuery = TeacherAttendance::where('date', $selectedDate);
        if ($deviceSetting) {
            $allForDate = TeacherAttendance::where('date', $selectedDate)->get();
            $present = $late = $earlyLeave = 0;
            foreach ($allForDate as $att) {
                $s = in_array($att->status, ['present', 'late', 'early_leave']) && $att->in_time
                    ? $deviceSetting->computeTeacherStatus($att->in_time, $att->out_time, $att->date)
                    : $att->status;
                if ($s === 'present') {
                    $present++;
                } elseif ($s === 'late') {
                    $late++;
                } elseif ($s === 'early_leave') {
                    $earlyLeave++;
                }
            }
            $stats = [
                'total' => $allForDate->count(),
                'present' => $present,
                'absent' => (clone $statsQuery)->where('status', 'absent')->count(),
                'late' => $late,
                'leave' => (clone $statsQuery)->where('status', 'leave')->count(),
                'early_leave' => $earlyLeave,
            ];
        } else {
            $stats = [
                'total' => $statsQuery->count(),
                'present' => (clone $statsQuery)->where('status', 'present')->count(),
                'absent' => (clone $statsQuery)->where('status', 'absent')->count(),
                'late' => (clone $statsQuery)->where('status', 'late')->count(),
                'leave' => (clone $statsQuery)->where('status', 'leave')->count(),
                'early_leave' => (clone $statsQuery)->where('status', 'early_leave')->count(),
            ];
        }

        return Inertia::render('Attendance/Teachers/Index', [
            'attendances' => $attendances,
            'teachersNotMarked' => $teachersNotMarked,
            'filters' => [
                'date' => $selectedDate,
                'status' => $request->status,
            ],
            'stats' => $stats,
            'deviceSetting' => $deviceSetting ? [
                'device_name' => $deviceSetting->device_name,
                'device_ip' => $deviceSetting->device_ip,
                'last_sync_at' => $deviceSetting->last_sync_at?->toIso8601String(),
            ] : null,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('mark_attendance');

        $teachers = Teacher::with(['user', 'attendance' => function ($q) use ($request) {
            $q->where('date', $request->date ?? now()->format('Y-m-d'));
        }])->where('status', 'active')->get();

        return Inertia::render('Attendance/Teachers/Create', [
            'teachers' => $teachers,
            'date' => $request->date ?? now()->format('Y-m-d'),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('mark_attendance');

        $validated = $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.teacher_id' => 'required|exists:teachers,id',
            'attendances.*.status' => 'required|in:present,absent,late,half_day,holiday,leave',
            'attendances.*.in_time' => 'nullable|date_format:H:i',
            'attendances.*.out_time' => 'nullable|date_format:H:i',
            'attendances.*.reason' => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['attendances'] as $attendance) {
                TeacherAttendance::updateOrCreate(
                    [
                        'teacher_id' => $attendance['teacher_id'],
                        'date' => $validated['date'],
                    ],
                    [
                        'status' => $attendance['status'],
                        'in_time' => $attendance['in_time'] ?? null,
                        'out_time' => $attendance['out_time'] ?? null,
                        'reason' => $attendance['reason'] ?? null,
                        'marked_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();

            logActivity('create', 'Marked attendance for '.count($validated['attendances']).' teachers', TeacherAttendance::class);

            return redirect()->route('teacher-attendance.index')
                ->with('success', 'Attendance marked successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withInput()->with('error', 'Failed to mark attendance: '.$e->getMessage());
        }
    }

    public function report(Request $request)
    {
        $this->authorize('view_attendance');

        $query = TeacherAttendance::with(['teacher' => function ($q) {
            $q->withTrashed()->with('user');
        }])
            ->when($request->teacher_id, fn ($q) => $q->where('teacher_id', $request->teacher_id))
            ->when($request->from_date, fn ($q) => $q->where('date', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->where('date', '<=', $request->to_date));

        $attendances = $query->latest('date')->paginate(50);

        $stats = [
            'total' => $query->count(),
            'present' => (clone $query)->where('status', 'present')->count(),
            'absent' => (clone $query)->where('status', 'absent')->count(),
            'late' => (clone $query)->where('status', 'late')->count(),
            'leave' => (clone $query)->where('status', 'leave')->count(),
        ];

        return Inertia::render('Attendance/Teachers/Report', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => $request->only(['teacher_id', 'from_date', 'to_date']),
            'teachers' => Teacher::with('user')->where('status', 'active')->get(),
        ]);
    }

    public function destroy(TeacherAttendance $teacherAttendance)
    {
        $this->authorize('mark_attendance');

        $teacherAttendance->delete();

        logActivity('delete', 'Deleted teacher attendance', TeacherAttendance::class, $teacherAttendance->id);

        return back()->with('success', 'Attendance deleted successfully');
    }

    public function calendar(Request $request)
    {
        $this->authorize('view_attendance');

        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        // Get attendance data for the month
        $startDate = "{$year}-{$month}-01";
        $endDate = date('Y-m-t', strtotime($startDate));

        // Get all teachers with their attendance for the month
        $teachers = Teacher::with(['user', 'attendance' => function ($q) use ($startDate, $endDate) {
            $q->whereBetween('date', [$startDate, $endDate]);
        }])
            ->where('status', 'active')
            ->when($request->search, function ($q) use ($request) {
                $q->whereHas('user', function ($q) use ($request) {
                    $q->where('name', 'like', "%{$request->search}%");
                })->orWhere('employee_id', 'like', "%{$request->search}%");
            })
            ->when($request->department, function ($q) use ($request) {
                $q->where('department', $request->department);
            })
            ->get()
            ->map(function ($teacher) use ($startDate) {
                $attendanceByDate = $teacher->attendance->keyBy(function ($att) {
                    return $att->date->format('Y-m-d');
                });

                $daysInMonth = date('t', strtotime($startDate));
                $attendanceGrid = [];
                $presentCount = 0;

                for ($day = 1; $day <= $daysInMonth; $day++) {
                    $date = date('Y-m-d', strtotime("{$startDate} +".($day - 1).' days'));
                    $dayOfWeek = date('N', strtotime($date));

                    if (isset($attendanceByDate[$date])) {
                        $status = $attendanceByDate[$date]->status;
                        $attendanceGrid[$day] = [
                            'status' => $status,
                            'in_time' => $attendanceByDate[$date]->in_time,
                            'out_time' => $attendanceByDate[$date]->out_time,
                        ];
                        if ($status === 'present') {
                            $presentCount++;
                        }
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
                    'id' => $teacher->id,
                    'name' => $teacher->user->name,
                    'employee_id' => $teacher->employee_id,
                    'designation' => $teacher->designation,
                    'department' => $teacher->department,
                    'attendance' => $attendanceGrid,
                    'present_count' => $presentCount,
                ];
            });

        return Inertia::render('Attendance/Teachers/Calendar', [
            'teachers' => $teachers,
            'year' => $year,
            'month' => $month,
            'daysInMonth' => date('t', strtotime($startDate)),
            'filters' => [
                'search' => $request->search,
                'department' => $request->department,
            ],
        ]);
    }
}
