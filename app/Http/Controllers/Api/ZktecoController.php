<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\DeviceSetting;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\Teacher;
use App\Models\TeacherAttendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ZktecoController extends Controller
{
    /**
     * Main sync endpoint for ZKTeco Agent
     * Handles the data format from the PHP agent script
     */
    public function syncAttendance(Request $request)
    {
        try {
            Log::info('ZKTeco Sync Request Received', $request->all());

            // Validate the main structure
            $validated = $request->validate([
                'device_id' => 'required',
                'device_name' => 'required|string',
                'device_ip' => 'required|string',
                'serial_number' => 'nullable|string',
                'attendance_data' => 'nullable|array',
                'user_data' => 'nullable|array',
                'absent_teachers' => 'nullable|array',
                'absent_students' => 'nullable|array',
                'sync_date' => 'nullable|date',
            ]);

            $successCount = 0;
            $errors = [];
            $attendanceData = $validated['attendance_data'] ?? [];
            $absentTeachers = $validated['absent_teachers'] ?? [];
            $absentStudents = $validated['absent_students'] ?? [];
            $syncDate = $validated['sync_date'] ?? now()->format('Y-m-d');

            $deviceSetting = DeviceSetting::current();

            // Process attendance data
            foreach ($attendanceData as $record) {
                try {
                    // ZKTeco agent format: id, timestamp, state, type
                    $employeeId = $record['id'] ?? $record['uid'] ?? null;
                    $timestamp = $record['timestamp'] ?? null;
                    $state = $record['state'] ?? 0;
                    $type = $record['type'] ?? 'fingerprint';

                    if (! $employeeId || ! $timestamp) {
                        continue;
                    }

                    // Convert to our format
                    $processedRecord = [
                        'employee_id' => (string) $employeeId,
                        'punch_time' => $timestamp,
                        'punch_state' => (int) $state,
                        'punch_type' => $type,
                        'device_sn' => $validated['serial_number'] ?? null,
                    ];

                    // Try to process as teacher first
                    $teacher = Teacher::where('employee_id', $employeeId)->first();
                    if ($teacher) {
                        $this->processTeacherAttendance($processedRecord);
                        $successCount++;

                        continue;
                    }

                    // Then try as student
                    $student = Student::where('admission_number', $employeeId)->first();
                    if ($student) {
                        $this->processStudentAttendance($processedRecord);
                        $successCount++;

                        continue;
                    }

                    // Not found
                    $errors[] = [
                        'employee_id' => $employeeId,
                        'error' => 'No teacher or student found with this ID',
                    ];

                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $employeeId ?? 'unknown',
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Sync Record Error: '.$e->getMessage(), $record);
                }
            }

            // Process absent teachers
            $absentMarked = 0;
            $absentErrors = [];

            foreach ($absentTeachers as $employeeId) {
                try {
                    // Weekend/holiday: do not mark absent at all (no record, no absent count)
                    if ($deviceSetting->isWeekend($syncDate) || $deviceSetting->isHoliday($syncDate)) {
                        continue;
                    }

                    $teacher = Teacher::where('employee_id', $employeeId)
                        ->where('status', 'active')
                        ->first();

                    if (! $teacher) {
                        continue;
                    }

                    // Check if already has attendance record for today
                    $existingAttendance = TeacherAttendance::where('teacher_id', $teacher->id)
                        ->whereDate('date', $syncDate)
                        ->exists();

                    if ($existingAttendance) {
                        continue; // Already has record
                    }

                    // Working day: mark as absent
                    TeacherAttendance::create([
                        'teacher_id' => $teacher->id,
                        'date' => $syncDate,
                        'status' => 'absent',
                        'in_time' => null,
                        'out_time' => null,
                        'employee_id' => $employeeId,
                        'device_sn' => $validated['serial_number'] ?? null,
                        'marked_by' => null,
                    ]);

                    $absentMarked++;

                } catch (\Exception $e) {
                    $absentErrors[] = [
                        'employee_id' => $employeeId,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Process absent students
            foreach ($absentStudents as $admissionNumber) {
                try {
                    // Weekend/holiday: do not mark absent at all (no record, no absent count)
                    if ($deviceSetting->isWeekend($syncDate) || $deviceSetting->isHoliday($syncDate)) {
                        continue;
                    }

                    $student = Student::where('admission_number', $admissionNumber)
                        ->where('status', 'active')
                        ->first();

                    if (! $student) {
                        continue;
                    }

                    // Get current academic year
                    $academicYear = AcademicYear::where('is_current', true)->first();
                    if (! $academicYear) {
                        continue;
                    }

                    // Check if already has attendance record for today
                    $existingAttendance = StudentAttendance::where('student_id', $student->id)
                        ->whereDate('date', $syncDate)
                        ->exists();

                    if ($existingAttendance) {
                        continue; // Already has record
                    }

                    // Working day: mark as absent
                    StudentAttendance::create([
                        'student_id' => $student->id,
                        'date' => $syncDate,
                        'status' => 'absent',
                        'in_time' => null,
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'academic_year_id' => $academicYear->id,
                        'employee_id' => $admissionNumber,
                        'device_sn' => $validated['serial_number'] ?? null,
                        'marked_by' => null,
                    ]);

                    $absentMarked++;

                } catch (\Exception $e) {
                    $absentErrors[] = [
                        'employee_id' => $admissionNumber,
                        'error' => $e->getMessage(),
                    ];
                }
            }

            // Update device settings last sync
            $deviceSetting = DeviceSetting::first();
            if ($deviceSetting) {
                $deviceSetting->update([
                    'device_name' => $validated['device_name'],
                    'device_ip' => $validated['device_ip'],
                    'last_sync_at' => now(),
                    'last_sync_status' => $successCount > 0 ? 'success' : 'failed',
                    'last_sync_records' => $successCount,
                    'last_sync_message' => count($errors) > 0
                        ? 'Processed with '.count($errors).' errors'
                        : 'Sync successful',
                ]);
            }

            return response()->json([
                'status' => true,
                'success' => true,
                'message' => "Processed {$successCount} attendance records, marked {$absentMarked} absent",
                'summary' => [
                    'processed' => $successCount,
                    'total' => count($attendanceData),
                    'absent_marked' => $absentMarked,
                    'errors' => count($errors) + count($absentErrors),
                ],
                'errors' => array_merge($errors, $absentErrors),
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco syncAttendance Error: '.$e->getMessage());

            return response()->json([
                'status' => false,
                'success' => false,
                'message' => 'Failed to sync attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all teachers with their employee IDs for ZKTeco device
     */
    public function getTeachers(Request $request)
    {
        try {
            $teachers = Teacher::select('id', 'employee_id', 'first_name', 'last_name', 'status')
                ->whereNotNull('employee_id')
                ->where('status', 'active')
                ->get()
                ->map(function ($teacher) {
                    return [
                        'id' => $teacher->id,
                        'employee_id' => $teacher->employee_id,
                        'name' => trim($teacher->first_name.' '.($teacher->last_name ?? '')),
                        'type' => 'teacher',
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $teachers->count(),
                'data' => $teachers,
            ]);
        } catch (\Exception $e) {
            Log::error('ZKTeco getTeachers Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch teachers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all students with their employee/admission IDs for ZKTeco device
     */
    public function getStudents(Request $request)
    {
        try {
            $academicYear = AcademicYear::where('is_current', true)->first();

            $students = Student::select('id', 'admission_number', 'first_name', 'last_name', 'class_id', 'section_id', 'status')
                ->whereNotNull('admission_number')
                ->where('status', 'active')
                ->when($academicYear, function ($query) use ($academicYear) {
                    return $query->where('academic_year_id', $academicYear->id);
                })
                ->get()
                ->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'employee_id' => $student->admission_number, // Using admission number as employee_id
                        'name' => trim($student->first_name.' '.($student->last_name ?? '')),
                        'class_id' => $student->class_id,
                        'section_id' => $student->section_id,
                        'type' => 'student',
                    ];
                });

            return response()->json([
                'success' => true,
                'count' => $students->count(),
                'data' => $students,
            ]);
        } catch (\Exception $e) {
            Log::error('ZKTeco getStudents Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store attendance data from ZKTeco device (Legacy - supports batch with type)
     */
    public function storeAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
                'attendance.*.type' => 'required|string|in:teacher,student',
            ]);

            $successCount = 0;
            $errors = [];

            foreach ($validated['attendance'] as $record) {
                try {
                    if ($record['type'] === 'teacher') {
                        $this->processTeacherAttendance($record);
                    } else {
                        $this->processStudentAttendance($record);
                    }
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Attendance Error: '.$e->getMessage(), $record);
                }
            }

            // Update device settings last sync
            $deviceSetting = DeviceSetting::first();
            if ($deviceSetting) {
                $deviceSetting->update([
                    'last_sync_at' => now(),
                    'last_sync_status' => $successCount > 0 ? 'success' : 'failed',
                    'last_sync_records' => $successCount,
                    'last_sync_message' => count($errors) > 0 ? json_encode($errors) : 'Sync successful',
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store teacher attendance from ZKTeco device
     */
    public function storeTeacherAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
            ]);

            $successCount = 0;
            $errors = [];

            foreach ($validated['attendance'] as $record) {
                try {
                    $this->processTeacherAttendance($record);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Teacher Attendance Error: '.$e->getMessage(), $record);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} teacher attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeTeacherAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store teacher attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store student attendance from ZKTeco device
     */
    public function storeStudentAttendance(Request $request)
    {
        try {
            $validated = $request->validate([
                'attendance' => 'required|array',
                'attendance.*.employee_id' => 'required|string',
                'attendance.*.punch_time' => 'required|date',
                'attendance.*.punch_state' => 'required|integer|in:0,1',
                'attendance.*.punch_type' => 'nullable|string',
                'attendance.*.device_sn' => 'nullable|string',
            ]);

            $successCount = 0;
            $errors = [];

            foreach ($validated['attendance'] as $record) {
                try {
                    $this->processStudentAttendance($record);
                    $successCount++;
                } catch (\Exception $e) {
                    $errors[] = [
                        'employee_id' => $record['employee_id'],
                        'error' => $e->getMessage(),
                    ];
                    Log::error('ZKTeco Student Attendance Error: '.$e->getMessage(), $record);
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Processed {$successCount} student attendance records",
                'processed' => $successCount,
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            Log::error('ZKTeco storeStudentAttendance Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to store student attendance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process individual teacher attendance record
     * First punch = Check In time, Last punch = Check Out time
     */
    private function processTeacherAttendance(array $record)
    {
        $teacher = Teacher::where('employee_id', $record['employee_id'])->first();

        if (! $teacher) {
            throw new \Exception("Teacher not found with employee_id: {$record['employee_id']}");
        }

        $punchTime = Carbon::parse($record['punch_time']);
        $date = $punchTime->toDateString();
        $deviceSettings = DeviceSetting::first();

        // Get or create attendance record for this date
        $attendance = TeacherAttendance::firstOrCreate(
            [
                'teacher_id' => $teacher->id,
                'date' => $date,
            ],
            [
                'status' => 'present',
                'employee_id' => $record['employee_id'],
                'marked_by' => 1, // System user
            ]
        );

        // Update punch data
        $attendance->punch_time = $punchTime;
        $attendance->punch_state = $record['punch_state'];
        $attendance->punch_type = $record['punch_type'] ?? 'fingerprint';
        $attendance->device_sn = $record['device_sn'] ?? null;

        // Logic: First punch = Check In, Last punch = Check Out
        if ($record['punch_state'] == 0 || ! $attendance->in_time) {
            // Check In: First punch or explicit check-in
            if (! $attendance->in_time || $punchTime->lt($attendance->in_time)) {
                $attendance->in_time = $punchTime;
            }
        }

        if ($record['punch_state'] == 1 || $attendance->in_time) {
            // Check Out: Last punch or explicit check-out
            if (! $attendance->out_time || $punchTime->gt($attendance->out_time)) {
                $attendance->out_time = $punchTime;
            }
        }

        // Dynamic status from device settings: teacher_in_time, teacher_out_time, teacher_late_time
        $attendance->status = 'present';
        if ($deviceSettings) {
            $lateThresholdMins = 15; // tolerance before considering early leave

            // Early leave: left before (teacher_out_time - tolerance)
            if ($attendance->out_time && $deviceSettings->teacher_out_time) {
                $expectedOutTime = Carbon::parse($date.' '.$deviceSettings->teacher_out_time);
                $actualOutTime = Carbon::parse($attendance->out_time);
                if ($deviceSettings->auto_mark_early_leave && $actualOutTime->lessThan($expectedOutTime->copy()->subMinutes($lateThresholdMins))) {
                    $attendance->status = 'early_leave';
                }
            }

            // Late: arrived after teacher_late_time (exact time from settings)
            if ($attendance->in_time && $deviceSettings->teacher_late_time) {
                $lateCutoff = Carbon::parse($date.' '.$deviceSettings->teacher_late_time);
                $actualInTime = Carbon::parse($attendance->in_time);
                if ($deviceSettings->auto_mark_late && $actualInTime->greaterThan($lateCutoff)) {
                    $attendance->status = 'late';
                }
            }
        }

        $attendance->save();

        Log::info("Teacher attendance updated: {$teacher->full_name} on {$date}");
    }

    /**
     * Process individual student attendance record
     * Students only need to be marked as present
     */
    private function processStudentAttendance(array $record)
    {
        $student = Student::where('admission_number', $record['employee_id'])->first();

        if (! $student) {
            throw new \Exception("Student not found with admission_number: {$record['employee_id']}");
        }

        $punchTime = Carbon::parse($record['punch_time']);
        $date = $punchTime->toDateString();
        $deviceSettings = DeviceSetting::first();
        $academicYear = AcademicYear::where('is_current', true)->first();

        if (! $academicYear) {
            throw new \Exception('No current academic year found');
        }

        // Get or create attendance record for this date
        $attendance = StudentAttendance::firstOrCreate(
            [
                'student_id' => $student->id,
                'date' => $date,
            ],
            [
                'class_id' => $student->class_id,
                'section_id' => $student->section_id,
                'academic_year_id' => $academicYear->id,
                'status' => 'present',
                'employee_id' => $record['employee_id'],
                'marked_by' => 1, // System user
            ]
        );

        // Update punch data
        $attendance->punch_time = $punchTime;
        $attendance->punch_state = $record['punch_state'];
        $attendance->punch_type = $record['punch_type'] ?? 'fingerprint';
        $attendance->device_sn = $record['device_sn'] ?? null;

        // For students, just mark them as present
        // Update in_time with first punch if not set
        if (! $attendance->in_time) {
            $attendance->in_time = $punchTime;

            // Check if late based on device settings
            if ($deviceSettings && $deviceSettings->student_in_time) {
                $expectedInTime = Carbon::parse($date.' '.$deviceSettings->student_in_time);
                $lateThreshold = $deviceSettings->student_late_threshold ?? 15;

                if ($punchTime->diffInMinutes($expectedInTime) > $lateThreshold) {
                    $attendance->status = 'late';
                }
            }
        }

        $attendance->save();

        Log::info("Student attendance updated: {$student->full_name} on {$date}");
    }
}
