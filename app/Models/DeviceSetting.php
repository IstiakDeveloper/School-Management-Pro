<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DeviceSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_name',
        'device_ip',
        'device_port',
        'last_sync_at',
        'last_sync_status',
        'total_synced',
        'teacher_in_time',
        'teacher_out_time',
        'teacher_late_time',
        'student_in_time',
        'student_out_time',
        'student_late_time',
        'weekend_days',
        'auto_mark_present',
        'auto_mark_absent',
        'auto_mark_late',
        'auto_mark_early_leave',
        'sms_on_present',
        'sms_on_absent',
        'sms_on_late',
        'sms_on_early_leave',
        'auto_sync_enabled',
        'sync_interval_minutes',
    ];

    protected function casts(): array
    {
        return [
            'last_sync_at' => 'datetime',
            'total_synced' => 'integer',
            'weekend_days' => 'array',
            'auto_mark_present' => 'boolean',
            'auto_mark_absent' => 'boolean',
            'auto_mark_late' => 'boolean',
            'auto_mark_early_leave' => 'boolean',
            'sms_on_present' => 'boolean',
            'sms_on_absent' => 'boolean',
            'sms_on_late' => 'boolean',
            'sms_on_early_leave' => 'boolean',
            'auto_sync_enabled' => 'boolean',
            'sync_interval_minutes' => 'integer',
        ];
    }

    /**
     * Get the singleton instance (only one setting record should exist)
     */
    public static function current()
    {
        $setting = static::first();

        if (!$setting) {
            $setting = static::create([
                'device_name' => 'ZKTeco F10',
                'device_ip' => '192.168.0.21',
                'device_port' => 4370,
                'weekend_days' => [5, 6], // Friday, Saturday
            ]);
        }

        return $setting;
    }

    /**
     * Check if a given date is a weekend
     */
    public function isWeekend($date)
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        return in_array($dayOfWeek, $this->weekend_days ?? []);
    }

    /**
     * Check if a given date is a holiday
     */
    public function isHoliday($date)
    {
        return Holiday::where('date', $date)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if a given date is a working day
     */
    public function isWorkingDay($date)
    {
        return !$this->isWeekend($date) && !$this->isHoliday($date);
    }

    /**
     * Calculate attendance status based on in_time
     */
    public function calculateStatus($inTime, $type = 'teacher')
    {
        $expectedTime = $type === 'teacher' ? $this->teacher_in_time : $this->student_in_time;
        $lateTime = $type === 'teacher' ? $this->teacher_late_time : $this->student_late_time;

        $expected = Carbon::parse($expectedTime);
        $late = Carbon::parse($lateTime);
        $actual = Carbon::parse($inTime);

        // Check if arrived after late time
        if ($actual->greaterThanOrEqualTo($late)) {
            return $this->auto_mark_late ? 'late' : 'present';
        }

        // On time
        return 'present';
    }

    /**
     * Check if should mark as early leave
     */
    public function isEarlyLeave($outTime, $type = 'teacher')
    {
        if (!$this->auto_mark_early_leave) {
            return false;
        }

        // Students don't have out time requirement
        if ($type === 'student') {
            return false;
        }

        $expectedTime = $this->teacher_out_time;
        $expected = Carbon::parse($expectedTime);
        $actual = Carbon::parse($outTime);

        $diffInMinutes = $expected->diffInMinutes($actual, false);

        return $diffInMinutes > $earlyThreshold;
    }

    /**
     * Update last sync information
     */
    public function updateLastSync($status, $message = null, $records = 0)
    {
        $this->update([
            'last_sync_at' => now(),
            'last_sync_status' => $status,
            'last_sync_message' => $message,
            'last_sync_records' => $records,
        ]);
    }

    /**
     * Get formatted last sync time
     */
    public function getLastSyncFormatted()
    {
        if (!$this->last_sync_at) {
            return 'Never';
        }

        return $this->last_sync_at->diffForHumans();
    }
}
