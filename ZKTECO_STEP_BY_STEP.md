# ZKTeco Device Setup - Step by Step Guide

## 📋 Setup Process (Fresh Start)

### Prerequisites
1. Laravel server must be running:
   ```bash
   cd "c:\Code\School-Management-Pro"
   php artisan serve
   ```
   Server will run at: `http://127.0.0.1:8000`

2. Device must be powered on and connected to network (IP: 192.168.0.16)

---

## Step 1: Clear Device (Fresh Start)

Remove all existing users and attendance from device.

```bash
cd "c:\ZKTeco-Agent Mbn"
php device_clear.php
```

**What it does:**
- Connects to ZKTeco device
- Shows current user count and attendance records
- Asks for confirmation (type `yes`)
- Clears all attendance records
- Clears all enrolled users
- Verifies device is empty

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     ZKTeco Device Data Clear Script                   ║
╚════════════════════════════════════════════════════════╝

Device: School Device
IP: 192.168.0.16:4370

⚠️  WARNING: This will delete ALL users and attendance records!
Are you sure you want to continue? (yes/no): yes

Connecting to device...
✓ Connected successfully

Current device data:
  - Users: XX
  - Attendance records: XX

Clearing attendance records...
✓ Attendance records cleared
Clearing all users...
✓ All users cleared

After clearing:
  - Users: 0
  - Attendance records: 0

✓ Device successfully cleared!
```

---

## Step 2: Push Teachers to Device

Enroll all teachers in the device using their employee IDs.

```bash
cd "c:\ZKTeco-Agent Mbn"
php push_teachers.php
```

**What it does:**
- Fetches teachers list from Laravel API (`/api/zkteco/teachers`)
- Shows all teachers with their Employee IDs
- Asks for confirmation (type `yes`)
- Connects to device and disables it temporarily
- Enrolls each teacher with their employee_id (e.g., T0001, T0002...)
- Re-enables device
- Shows success/failure count

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     Push Teachers to ZKTeco Device                     ║
╚════════════════════════════════════════════════════════╝

Device: School Device
IP: 192.168.0.16:4370
API: http://127.0.0.1:8000/api/zkteco/teachers

Fetching teachers from API...
✓ Retrieved 11 teachers

Teachers to be enrolled:
------------------------------------------------------------
ID         Employee ID     Name                          
------------------------------------------------------------
1          T0001          Mithun Miya                   
2          T0002          Teacher 2                     
3          T0003          Teacher 3                     
...
------------------------------------------------------------

Push these teachers to device? (yes/no): yes

Connecting to device...
✓ Connected successfully

Disabling device temporarily...
Enrolling teachers...
  ✓ T0001 - Mithun Miya
  ✓ T0002 - Teacher 2
  ...

Enabling device...

============================================================
Summary:
  Total: 11
  Success: 11
  Failed: 0
============================================================

✓ Completed!

Teachers are now enrolled in the device.
They can now use their fingerprints for attendance.
```

---

## Step 3: Push Students to Device

Enroll all students in the device using their admission numbers.

```bash
cd "c:\ZKTeco-Agent Mbn"
php push_students.php
```

**What it does:**
- Fetches students list from Laravel API (`/api/zkteco/students`)
- Shows students with their Admission Numbers
- Asks for confirmation (type `yes`)
- Connects to device and disables it temporarily
- Enrolls each student with their admission_number (e.g., STD00011, STD00012...)
- Shows progress every 10 students
- Re-enables device
- Shows success/failure count

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     Push Students to ZKTeco Device                     ║
╚════════════════════════════════════════════════════════╝

Device: School Device
IP: 192.168.0.16:4370
API: http://127.0.0.1:8000/api/zkteco/students

Fetching students from API...
✓ Retrieved 100 students

Students to be enrolled (showing first 10):
------------------------------------------------------------
ID         Admission No    Name                          
------------------------------------------------------------
1          STD00011       Student 11                    
2          STD00012       Student 12                    
...
... and 90 more students
------------------------------------------------------------

Total: 100 students

Push these students to device? (yes/no): yes

Connecting to device...
✓ Connected successfully

Disabling device temporarily...
Enrolling students...
This may take a while for large numbers...

  ✓ Enrolled 10/100 students...
  ✓ Enrolled 20/100 students...
  ...
  ✓ Enrolled 100/100 students...

Enabling device...

============================================================
Summary:
  Total: 100
  Success: 100
  Failed: 0
============================================================

✓ Completed!

Students are now enrolled in the device.
They can now use their fingerprints for attendance.
```

---

## Step 4: Take Attendance

**Now manually punch fingerprints on the device:**

### For Testing:
1. **Teachers**: Have teachers punch their fingerprints
   - First punch = Check In time
   - Last punch = Check Out time
   
2. **Students**: Have students punch their fingerprints
   - Any punch = Present mark

### Allow some time for punches to be recorded on the device.

---

## Step 5: Fetch Attendance from Device

Retrieve attendance records from device and sync to Laravel.

```bash
cd "c:\ZKTeco-Agent Mbn"
php fetch_attendance.php
```

**What it does:**
- Connects to ZKTeco device
- Shows device information
- Fetches all attendance records
- Shows sample records
- Disconnects from device
- Sends attendance data to Laravel API (`/api/zkteco/sync`)
- Shows sync summary
- Optionally clears device attendance (if `clear_after_sync: true`)

**Expected Output:**
```
╔════════════════════════════════════════════════════════╗
║     Fetch Attendance from ZKTeco Device                ║
╚════════════════════════════════════════════════════════╝

Device: School Device
IP: 192.168.0.16:4370
API: http://127.0.0.1:8000/api/zkteco/sync

Connecting to device...
✓ Connected successfully

Device Info:
  Name: F10
  Serial: AZKU123456

Fetching attendance records...
✓ Retrieved 25 attendance records

Sample attendance records:
--------------------------------------------------------------------------------
Employee ID     Timestamp            State      Type      
--------------------------------------------------------------------------------
T0001          2025-12-23 08:25:00  0          fingerprint
T0001          2025-12-23 16:30:00  1          fingerprint
STD00011       2025-12-23 08:40:00  0          fingerprint
...
--------------------------------------------------------------------------------

✓ Device disconnected

Syncing to Laravel API...
✓ API sync successful!

Summary:
  Total: 25
  Processed: 25
  Errors: 0

============================================================
Attendance sync completed!
```

---

## Step 6: Verify in Database

Check that attendance was saved correctly:

```bash
cd "c:\Code\School-Management-Pro"
php artisan tinker
```

Then run:

```php
// Check teacher attendance
TeacherAttendance::whereDate('date', today())->get(['teacher_id', 'date', 'in_time', 'out_time', 'status']);

// Check student attendance
StudentAttendance::whereDate('date', today())->get(['student_id', 'date', 'in_time', 'status']);

// Check device settings
DeviceSetting::first(['last_sync_at', 'last_sync_status', 'last_sync_records']);
```

**Expected Results:**
- Teachers will have `in_time` (first punch) and `out_time` (last punch)
- Students will have `in_time` and `status: 'present'`
- Late detection based on DeviceSettings times

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `device_clear.php` | Clear all device data |
| `push_teachers.php` | Enroll teachers in device |
| `push_students.php` | Enroll students in device |
| `fetch_attendance.php` | Fetch and sync attendance |

---

## 🔄 Daily Usage

After initial setup, use this for daily attendance:

```bash
cd "c:\ZKTeco-Agent Mbn"
php fetch_attendance.php
```

Or use the automated agent:

```bash
php zkteco_agent.php
```

---

## ⚙️ Configuration

### Config File: `config.json`
```json
{
  "devices": [{
    "id": 1,
    "name": "School Device",
    "ip": "192.168.0.16",
    "port": 4370
  }],
  "api_endpoint": "http://127.0.0.1:8000/api/zkteco/sync",
  "api_key": "school_management_zkteco_key_2024",
  "clear_after_sync": false,
  "enable_check_in_out": true,
  "debug": true
}
```

### Important Settings:
- `clear_after_sync: false` - Keep attendance on device (recommended for testing)
- `clear_after_sync: true` - Auto-clear after sync (for production)
- `debug: true` - Show detailed logs

---

## 🐛 Troubleshooting

### Device Not Connecting
```bash
ping 192.168.0.16
```
- Check device is powered on
- Verify IP address
- Check network connection

### API Sync Failing
- Ensure Laravel server is running: `php artisan serve`
- Check API endpoint in config.json
- Review Laravel logs: `storage/logs/laravel.log`

### No Attendance Records
- Verify users are enrolled in device
- Check users have punched fingerprints
- Run `fetch_attendance.php` to retrieve data

---

## ✅ Success Checklist

- [ ] Device cleared successfully (Step 1)
- [ ] Teachers enrolled (Step 2)
- [ ] Students enrolled (Step 3)
- [ ] Fingerprints recorded on device (Step 4)
- [ ] Attendance fetched and synced (Step 5)
- [ ] Data verified in database (Step 6)

---

**Ready to start? Run Step 1!** 🚀

```bash
cd "c:\ZKTeco-Agent Mbn"
php device_clear.php
```
