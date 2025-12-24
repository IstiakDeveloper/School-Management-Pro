# 🔧 Device Settings & Auto Attendance System - Complete Guide

## 📋 Overview

একটা সম্পূর্ণ Device Settings System তৈরি করা হয়েছে যেখানে:

✅ Device Configuration (IP, Port, Model)  
✅ Last Sync Tracking  
✅ Teacher/Student Attendance Time Rules  
✅ Auto Present/Absent/Late Marking  
✅ Holiday Management  
✅ Weekend Settings  
✅ SMS Notifications  
✅ Auto Sync Settings  

---

## 🗄️ Database Tables

### 1. `device_settings` Table

```sql
device_settings:
- id
- device_name (ZKTeco F10)
- device_ip (192.168.0.21)
- device_port (4370)
- device_model
- device_status

Last Sync:
- last_sync_at
- last_sync_status (success/failed)
- last_sync_message
- last_sync_records

Teacher Rules:
- teacher_in_time (08:30:00)
- teacher_out_time (16:30:00)
- teacher_late_threshold (15 minutes)
- teacher_early_leave_threshold (30 minutes)

Student Rules:
- student_in_time (08:45:00)
- student_out_time (15:30:00)
- student_late_threshold (15 minutes)
- student_early_leave_threshold (30 minutes)

Weekend:
- weekend_days (JSON: [5, 6] = Friday, Saturday)

Auto Mark Settings:
- auto_mark_absent (boolean)
- auto_mark_absent_after (10:00:00)
- auto_mark_late (boolean)
- auto_mark_early_leave (boolean)

Notifications:
- send_sms_on_absent
- send_sms_on_late

Auto Sync:
- auto_sync_enabled
- auto_sync_interval (minutes)
- daily_sync_time
```

### 2. `holidays` Table

```sql
holidays:
- id
- name (Victory Day, Eid-ul-Fitr)
- date (2025-12-16)
- type (public/optional/school)
- description
- is_active
```

---

## 📊 Models

### DeviceSetting Model

**Key Methods:**

```php
// Get current settings (Singleton)
$settings = DeviceSetting::current();

// Check if date is weekend
$settings->isWeekend('2025-12-20');

// Check if date is holiday
$settings->isHoliday('2025-12-20');

// Check if date is working day
$settings->isWorkingDay('2025-12-20');

// Calculate status based on in_time
$status = $settings->calculateStatus('08:45:00', 'teacher');
// Returns: 'present' or 'late'

// Check early leave
$isEarly = $settings->isEarlyLeave('15:00:00', 'student');

// Update last sync
$settings->updateLastSync('success', 'Synced 50 records', 50);

// Get formatted last sync time
$time = $settings->getLastSyncFormatted();
// Returns: "5 minutes ago"
```

### Holiday Model

**Key Methods:**

```php
// Get all active holidays
$holidays = Holiday::active()->get();

// Get upcoming holidays (next 30 days)
$upcoming = Holiday::upcoming()->get();

// Get holidays in date range
$holidays = Holiday::dateRange('2025-01-01', '2025-12-31')->get();

// Get holidays by type
$publicHolidays = Holiday::byType('public')->get();

// Check if specific date is holiday
$isHoliday = Holiday::isHoliday('2025-12-16');

// Get holiday for date
$holiday = Holiday::getHoliday('2025-12-16');
```

---

## 🎮 Controllers

### DeviceSettingController

**Routes:**

```php
// Web Routes (Super Admin & Principal only)
GET  /device-settings                    → View settings page
POST /device-settings                    → Update settings
POST /device-settings/test-connection    → Test device connection

// Holiday Routes
POST   /holidays                         → Add new holiday
PUT    /holidays/{id}                    → Update holiday
DELETE /holidays/{id}                    → Delete holiday

// API Routes
GET  /api/zkteco/status                  → Get device status & last sync
GET  /api/zkteco/holidays                → Get all holidays
POST /api/zkteco/check-working-day       → Check if date is working day
```

**Methods:**

- `index()` - Display settings page with Inertia
- `update()` - Update device settings
- `testConnection()` - Test device connectivity
- `getStatus()` - Get device status API
- `storeHoliday()` - Create new holiday
- `updateHoliday()` - Update existing holiday
- `destroyHoliday()` - Delete holiday
- `getHolidays()` - Get holidays API
- `checkWorkingDay()` - Check if date is working day

---

## 🤖 Auto Attendance Logic

### When Attendance is Stored (ZktecoController):

```php
1. Check if date is working day
   - Skip if weekend
   - Skip if holiday
   
2. Calculate status based on in_time
   - If within time → 'present'
   - If late within threshold → 'late' (if auto_mark_late enabled)
   - If late beyond threshold → 'late'
   
3. Check for early leave
   - Compare out_time with expected time
   - Mark reason as 'Early leave detected'
   
4. Update last sync time
   - Store sync timestamp
   - Store success/failure status
   - Store number of records synced
```

### Example Flow:

**Teacher Attendance:**
```
Expected In: 08:30:00
Late Threshold: 15 minutes

Case 1: Punch at 08:25:00 → Status: present
Case 2: Punch at 08:40:00 → Status: late (within 15 min)
Case 3: Punch at 08:50:00 → Status: late
```

**Student Attendance:**
```
Expected In: 08:45:00
Expected Out: 15:30:00
Early Leave Threshold: 30 minutes

Case 1: Out at 15:35:00 → Normal
Case 2: Out at 14:30:00 → Early leave (more than 30 min early)
```

---

## 📡 API Usage Examples

### 1. Get Device Status

```bash
GET /api/zkteco/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "device_name": "ZKTeco F10",
    "device_ip": "192.168.0.21",
    "device_port": 4370,
    "device_status": true,
    "last_sync_at": "2025-12-20 10:30:00",
    "last_sync_status": "success",
    "last_sync_message": "Synced 50 records",
    "last_sync_records": 50,
    "last_sync_formatted": "5 minutes ago"
  }
}
```

### 2. Store Attendance (Auto Status Calculation)

```bash
POST /api/zkteco/attendance/store
```

**Request:**
```json
{
  "type": "teacher",
  "data": [
    {
      "employee_id": "T001",
      "date": "2025-12-20",
      "in_time": "08:45:00",
      "out_time": "16:30:00"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance processed successfully",
  "summary": {
    "total": 1,
    "created": 1,
    "updated": 0,
    "failed": 0,
    "skipped": 0
  }
}
```

**Note:** Status automatically calculated as 'late' (15 minutes late)

### 3. Check Working Day

```bash
POST /api/zkteco/check-working-day
Body: { "date": "2025-12-20" }
```

**Response:**
```json
{
  "success": true,
  "date": "2025-12-20",
  "is_weekend": true,
  "is_holiday": false,
  "is_working_day": false,
  "holiday": null
}
```

### 4. Get All Holidays

```bash
GET /api/zkteco/holidays
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1,
      "name": "Victory Day",
      "date": "2025-12-16",
      "type": "public",
      "description": "Bangladesh Victory Day",
      "is_active": true
    }
  ]
}
```

---

## 🎯 Features

### ✅ Smart Attendance Marking

- **Auto Present/Late:** Based on in_time and threshold
- **Auto Early Leave:** Based on out_time  
- **Weekend Skip:** No attendance on weekends
- **Holiday Skip:** No attendance on holidays
- **Customizable Rules:** Different rules for teachers & students

### ✅ Last Sync Tracking

- **Last Sync Time:** When was last sync
- **Sync Status:** Success or Failed
- **Sync Message:** Error/Success message
- **Records Count:** How many records synced

### ✅ Holiday Management

- **Multiple Types:** Public, Optional, School holidays
- **Active/Inactive:** Enable/disable holidays
- **Date-based:** Check by specific date
- **Upcoming View:** See next 30/60/90 days holidays

### ✅ Weekend Settings

- **Flexible Days:** Set any day(s) as weekend
- **JSON Array:** Store multiple days
- **Day Numbers:** 0=Sunday, 1=Monday, ... 6=Saturday
- **Default:** Friday (5), Saturday (6)

### ✅ SMS Notifications (Coming Soon)

- Send SMS on absent
- Send SMS on late arrival
- Configurable per type

### ✅ Auto Sync (Coming Soon)

- Schedule automatic syncing
- Set sync interval (minutes)
- Daily sync at specific time

---

## 🔧 Configuration Examples

### Basic Setup:

```php
$settings = DeviceSetting::current();

// Device Info
$settings->device_name = 'ZKTeco F10';
$settings->device_ip = '192.168.0.21';
$settings->device_port = 4370;

// Teacher Times
$settings->teacher_in_time = '08:30:00';
$settings->teacher_out_time = '16:30:00';
$settings->teacher_late_threshold = 15; // minutes

// Student Times
$settings->student_in_time = '08:45:00';
$settings->student_out_time = '15:30:00';
$settings->student_late_threshold = 15; // minutes

// Weekend (Friday, Saturday)
$settings->weekend_days = [5, 6];

// Auto Settings
$settings->auto_mark_late = true;
$settings->auto_mark_absent = true;
$settings->auto_mark_absent_after = '10:00:00';

$settings->save();
```

### Add Holidays:

```php
// Single Holiday
Holiday::create([
    'name' => 'Victory Day',
    'date' => '2025-12-16',
    'type' => 'public',
    'description' => 'Bangladesh Victory Day',
    'is_active' => true,
]);

// Bulk Holidays
$holidays = [
    ['name' => 'New Year', 'date' => '2025-01-01', 'type' => 'public'],
    ['name' => 'Eid-ul-Fitr', 'date' => '2025-04-10', 'type' => 'public'],
    ['name' => 'Eid-ul-Adha', 'date' => '2025-06-17', 'type' => 'public'],
];

foreach ($holidays as $holiday) {
    Holiday::create($holiday);
}
```

---

## 📝 Files Created

```
✅ Migrations:
   - 2025_12_20_055219_create_device_settings_table.php
   - 2025_12_20_055228_create_holidays_table.php

✅ Models:
   - app/Models/DeviceSetting.php
   - app/Models/Holiday.php

✅ Controllers:
   - app/Http/Controllers/DeviceSettingController.php
   - app/Http/Controllers/Api/ZktecoController.php (Updated)

✅ Routes:
   - routes/web.php (Updated)
   - routes/api.php (Updated)
```

---

## 🎉 Summary

### What's Working:

✅ Device configuration management  
✅ Last sync time tracking  
✅ Auto status calculation (present/late)  
✅ Early leave detection  
✅ Weekend checking  
✅ Holiday management  
✅ Working day validation  
✅ API endpoints for all features  
✅ Web interface routes ready  

### Next Steps:

1. 📱 Create React/Inertia frontend page for device settings
2. 📊 Create dashboard widget showing last sync
3. 🔔 Implement SMS notifications
4. ⏰ Implement auto-sync scheduler
5. 📈 Create attendance reports with auto-calculated status

---

**Created:** December 20, 2025  
**Status:** 🟢 Backend Complete, Frontend Pending  
**Version:** 1.0
