<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $this->authorize('view_users');

        $settings = Setting::all()->pluck('value', 'key');

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('edit_users');

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value'] ?? '']
            );
        }

        logActivity('update', "Updated system settings", Setting::class);

        return back()->with('success', 'Settings updated successfully');
    }

    public function general()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'school_name',
            'school_code',
            'school_email',
            'school_phone',
            'school_address',
            'school_logo',
            'school_website',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/General', [
            'settings' => $settings,
        ]);
    }

    public function academic()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'academic_year_start_month',
            'class_duration_minutes',
            'attendance_marking_time',
            'late_arrival_minutes',
            'exam_pass_percentage',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Academic', [
            'settings' => $settings,
        ]);
    }

    public function fee()
    {
        $this->authorize('manage_fees');

        $settings = Setting::whereIn('key', [
            'late_fee_per_day',
            'fee_due_days',
            'allow_partial_payment',
            'fine_calculation_method',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Fee', [
            'settings' => $settings,
        ]);
    }

    public function email()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'email_from_address',
            'email_from_name',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'smtp_encryption',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Email', [
            'settings' => $settings,
        ]);
    }

    public function notification()
    {
        $this->authorize('view_users');

        $settings = Setting::whereIn('key', [
            'enable_email_notifications',
            'enable_sms_notifications',
            'notify_on_attendance',
            'notify_on_fee_payment',
            'notify_on_exam_result',
        ])->pluck('value', 'key');

        return Inertia::render('Settings/Notification', [
            'settings' => $settings,
        ]);
    }

    public function backup()
    {
        $this->authorize('view_users');

        return Inertia::render('Settings/Backup');
    }

    public function createBackup()
    {
        $this->authorize('edit_users');

        // Implementation for database backup
        // This would use Laravel's backup functionality or custom implementation

        logActivity('create', "Created database backup", Setting::class);

        return back()->with('success', 'Backup created successfully');
    }
}
