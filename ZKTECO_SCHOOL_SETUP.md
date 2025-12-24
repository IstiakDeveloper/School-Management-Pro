# ZKTeco Device Setup for School Management System

## Overview
This document explains the complete setup for integrating ZKTeco fingerprint devices with the School Management System for automatic attendance tracking.

## Device Configuration

### Device Details
- **Device IP**: `192.168.0.16`
- **Port**: `4370`
- **API Endpoint**: `http://127.0.0.1:8000/api/zkteco/sync`

### Configuration File
Location: `c:\ZKTeco-Agent Mbn\config.json`

```json
{
  "devices": [
    {
      "id": 1,
      "name": "School Device",
      "ip": "192.168.0.16",
      "port": 4370
    }
  ],
  "api_endpoint": "http://127.0.0.1:8000/api/zkteco/sync",
  "api_key": "school_management_zkteco_key_2024",
  "clear_after_sync": false,
  "enable_check_in_out": true,
  "debug": true
}
```

## Database Structure

### Teacher Attendance (`teacher_attendance` table)
- **First Punch**: Automatically set as `in_time` (Check In)
- **Last Punch**: Automatically set as `out_time` (Check Out)
- **Timing**: Checked against `DeviceSetting` table for late marking

#### Fields:
- `teacher_id` - Foreign key to teachers table
- `employee_id` - ZKTeco employee ID (matches Teacher.employee_id)
- `date` - Attendance date
- `status` - present/absent/late/leave/half_day
- `in_time` - First punch time (Check In)
- `out_time` - Last punch time (Check Out)
- `punch_time` - Raw punch timestamp
- `punch_state` - 0=Check In, 1=Check Out
- `punch_type` - fingerprint/face/card
- `device_sn` - Device serial number

### Student Attendance (`student_attendance` table)
- **Only Present Mark**: Students are only marked as present when they punch
- **No Check In/Out**: Only tracks that student was present

#### Fields:
- `student_id` - Foreign key to students table
- `employee_id` - ZKTeco employee ID (uses admission_number)
- `class_id`, `section_id`, `academic_year_id` - Student details
- `date` - Attendance date
- `status` - present/absent/late/leave/half_day
- `in_time` - First punch time
- `punch_time` - Raw punch timestamp
- `punch_state` - 0=Check In, 1=Check Out
- `punch_type` - fingerprint/face/card
- `device_sn` - Device serial number

### Device Settings (`device_settings` table)
Stores timing rules and configuration:

```php
// Teacher Rules
'teacher_in_time' => '08:30:00'
'teacher_out_time' => '16:30:00'
'teacher_late_threshold' => 15 // minutes

// Student Rules
'student_in_time' => '08:45:00'
'student_out_time' => '15:30:00'
'student_late_threshold' => 15 // minutes

// Weekend & Auto-mark settings
'weekend_days' => [5, 6] // Friday, Saturday
'auto_mark_absent' => true
'auto_mark_late' => true
```

## API Endpoints

### 1. Main Sync Endpoint (Used by ZKTeco Agent)
**POST** `/api/zkteco/sync`

**Request Format:**
```json
{
  "device_id": 1,
  "device_name": "School Device",
  "device_ip": "192.168.0.16",
  "serial_number": "AZKU123456",
  "attendance_data": [
    {
      "id": "T001",
      "timestamp": "2025-12-23 08:30:00",
      "state": 0,
      "type": "fingerprint"
    }
  ]
}
```

**Response:**
```json
{
  "status": true,
  "success": true,
  "message": "Processed 5 attendance records",
  "summary": {
    "processed": 5,
    "total": 6,
    "errors": 1
  },
  "errors": []
}
```

### 2. Get Teachers List
**GET** `/api/zkteco/teachers`

Returns all active teachers with employee IDs for device enrollment.

### 3. Get Students List
**GET** `/api/zkteco/students`

Returns all active students with admission numbers for device enrollment.

### 4. Store Teacher Attendance (Direct)
**POST** `/api/zkteco/attendance/teacher`

### 5. Store Student Attendance (Direct)
**POST** `/api/zkteco/attendance/student`

### 6. Device Status
**GET** `/api/zkteco/status`

Returns current device settings and last sync status.

## How It Works

### Teacher Attendance Flow
1. Teacher punches fingerprint at device
2. ZKTeco Agent fetches punch data every hour (via scheduled task)
3. Agent sends data to `/api/zkteco/sync` endpoint
4. System matches `employee_id` with Teacher record
5. **First punch of the day** → `in_time` (Check In)
6. **Last punch of the day** → `out_time` (Check Out)
7. Late checking: If `in_time` > (`teacher_in_time` + `teacher_late_threshold`), mark as "late"
8. Attendance record saved with status

### Student Attendance Flow
1. Student punches fingerprint at device
2. ZKTeco Agent fetches punch data
3. Agent sends data to `/api/zkteco/sync` endpoint
4. System matches `admission_number` with Student record
5. Student marked as **present** (no check-in/out distinction)
6. Late checking: If punch time > (`student_in_time` + `student_late_threshold`), mark as "late"
7. Attendance record saved

## Running the Agent

### Manual Run
```bash
cd "c:\ZKTeco-Agent Mbn"
php zkteco_agent.php
```

### Scheduled Task (Windows)
The agent is configured to run automatically every hour via Windows Task Scheduler.

**PowerShell Script**: `AutoRunZK.ps1`
**Batch File**: `run_zkteco.bat`
**VBS Runner**: `run_hidden.vbs` (runs silently in background)

### Logs Location
All sync logs are stored in: `c:\ZKTeco-Agent Mbn\logs\`

Format: `zkteco_agent_YYYY-MM-DD.log`

## Setup Checklist

- [x] ✅ Updated config.json with device IP (192.168.0.16)
- [x] ✅ Updated API endpoint to local School Management project
- [x] ✅ Created/updated attendance migrations with ZKTeco fields
- [x] ✅ Updated TeacherAttendance and StudentAttendance models
- [x] ✅ Created ZktecoController with all endpoints
- [x] ✅ Added /api/zkteco/sync route
- [x] ✅ Ran all migrations

## Next Steps

### 1. Start Laravel Development Server
```bash
cd "c:\Code\School-Management-Pro"
php artisan serve
```

This will start the server at `http://127.0.0.1:8000`

### 2. Verify Configuration
The API endpoint is already configured in config.json:
```json
"api_endpoint": "http://127.0.0.1:8000/api/zkteco/sync"
```

### 3. Enroll Users in Device
- Teachers: Use their `employee_id` as the enrollment ID
- Students: Use their `admission_number` as the enrollment ID

### 4. Test the Setup
```bash
cd "c:\ZKTeco-Agent Mbn"
php zkteco_agent.php
```

Check logs to verify:
- Device connection: `Connected to device`
- Data retrieval: `Retrieved X attendance records`
- API sync: `API request successful`

### 5. Verify in Database
Check attendance records:
```sql
-- Teacher attendance
SELECT * FROM teacher_attendance ORDER BY date DESC, in_time DESC;

-- Student attendance  
SELECT * FROM student_attendance ORDER BY date DESC, in_time DESC;

-- Device sync status
SELECT * FROM device_settings;
```

## Troubleshooting

### Device Not Connecting
- Verify IP address: `192.168.0.16`
- Check network connectivity: `ping 192.168.0.16`
- Ensure device is powered on
- Check firewall settings

### API Sync Failing
- Verify Laravel server is running
- Check API endpoint in config.json
- Review logs: `logs/zkteco_agent_YYYY-MM-DD.log`
- Test endpoint manually:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/zkteco/sync \
    -H "Content-Type: application/json" \
    -d '{"device_id":1,"device_name":"Test","device_ip":"192.168.0.16","attendance_data":[]}'
  ```

### No Attendance Records Created
- Verify employee_id matches in both Teacher table and device
- Check if user is enrolled in device
- Review Laravel logs: `storage/logs/laravel.log`
- Enable debug mode in config.json

### Late Marking Not Working
- Check DeviceSetting table has proper times configured
- Verify timezone settings match
- Review punch_time vs in_time in attendance records

## Support & Maintenance

### Regular Tasks
1. Check logs weekly for errors
2. Verify sync is running (check last_sync_at in device_settings)
3. Monitor disk space for logs (auto-cleanup recommended)
4. Backup attendance data regularly

### Log Cleanup
```bash
# Delete logs older than 30 days
cd "c:\ZKTeco-Agent Mbn\logs"
forfiles /p . /m *.log /d -30 /c "cmd /c del @path"
```

## Models Reference

### Teacher Model
- `employee_id` field is used for ZKTeco matching
- Must be unique and not null for device integration

### Student Model
- `admission_number` field is used for ZKTeco matching
- Must be unique and not null for device integration

### TeacherAttendance Model
```php
// Fillable fields include ZKTeco data
'employee_id', 'punch_time', 'punch_state', 'punch_type', 'device_sn'

// Casts
'punch_time' => 'datetime',
'punch_state' => 'integer'
```

### StudentAttendance Model
```php
// Fillable fields include ZKTeco data
'employee_id', 'punch_time', 'punch_state', 'punch_type', 'device_sn'

// Casts
'punch_time' => 'datetime',
'punch_state' => 'integer'
```

---

**Last Updated**: December 23, 2025
**Version**: 1.0
