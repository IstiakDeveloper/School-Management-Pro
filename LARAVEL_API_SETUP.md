# 🔗 Laravel API Setup - Complete Guide

## 📋 Overview

এই প্রজেক্ট Laravel API এর মাধ্যমে ZKTeco Device এর সাথে connect করে:

**Data Flow:**
```
Laravel DB → Laravel API → ZKTeco Script → ZKTeco Device
ZKTeco Device → ZKTeco Script → Laravel API → Laravel DB
```

---

## 🎯 Step 1: Create Laravel Controller

**File:** `app/Http/Controllers/Api/ZktecoController.php`

✅ **Already Created!** - Controller এ ৩টি method আছে:

### 1. `getTeachers()` - GET /api/zkteco/teachers
Database থেকে সব active teachers যাদের `employee_id` আছে তাদের list দেয়।

**Response Format:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "employee_id": "T0001",
      "first_name": "Teacher",
      "last_name": "One"
    }
  ]
}
```

### 2. `getStudents()` - GET /api/zkteco/students
Database থেকে সব active students যাদের `admission_number` আছে তাদের list দেয়।

**Response Format:**
```json
{
  "success": true,
  "count": 100,
  "data": [
    {
      "employee_id": "STD00011",
      "first_name": "Student",
      "last_name": "Eleven"
    }
  ]
}
```

### 3. `storeAttendance()` - POST /api/zkteco/attendance/store
ZKTeco device থেকে attendance data নিয়ে database এ save করে।

**Request Format:**
```json
{
  "type": "teacher",
  "data": [
    {
      "employee_id": "T0001",
      "date": "2025-12-20",
      "in_time": "08:30:00",
      "out_time": "16:45:00",
      "status": "present"
    }
  ]
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Attendance processed successfully",
  "summary": {
    "total": 50,
    "created": 30,
    "updated": 18,
    "failed": 2
  }
}
```

---

## 🛣️ Step 2: API Routes

**File:** `routes/api.php`

✅ **Already Configured!** - ৩টি route setup করা আছে:

```php
// ZKTeco Device API Routes
Route::prefix('zkteco')->group(function () {
    Route::get('/teachers', [ZktecoController::class, 'getTeachers']);
    Route::get('/students', [ZktecoController::class, 'getStudents']);
    Route::post('/attendance/store', [ZktecoController::class, 'storeAttendance']);
});
```

---

## 🧪 Step 3: Test APIs

### ✅ Start Laravel Server:
```bash
php artisan serve
```

### 🔹 Test Teachers API
**URL:**
```
http://127.0.0.1:8000/api/zkteco/teachers
```

**Browser এ open করুন অথবা:**
```bash
curl http://127.0.0.1:8000/api/zkteco/teachers
```

### 🔹 Test Students API
**URL:**
```
http://127.0.0.1:8000/api/zkteco/students
```

**Browser এ open করুন অথবা:**
```bash
curl http://127.0.0.1:8000/api/zkteco/students
```

### 🔹 Test Attendance Store (Using Postman or curl)
**URL:** `POST http://127.0.0.1:8000/api/zkteco/attendance/store`

**Headers:**
```
Content-Type: application/json
```

**Body (Teacher Attendance):**
```json
{
  "type": "teacher",
  "data": [
    {
      "employee_id": "T0001",
      "date": "2025-12-20",
      "in_time": "08:30:00",
      "out_time": "16:45:00",
      "status": "present"
    }
  ]
}
```

**Body (Student Attendance):**
```json
{
  "type": "student",
  "data": [
    {
      "employee_id": "STD00011",
      "date": "2025-12-20",
      "in_time": "08:45:00",
      "out_time": "15:30:00",
      "status": "present"
    }
  ]
}
```

---

## 🔄 Data Push/Pull Workflow

### 📤 PUSH: Laravel → ZKTeco Device

**Process:**
1. ZKTeco script calls: `GET /api/zkteco/teachers`
2. Laravel returns: List of active teachers with employee_id
3. ZKTeco script calls: `GET /api/zkteco/students`
4. Laravel returns: List of active students with admission_number
5. ZKTeco script pushes all data to device

**PHP Example (ZKTeco Script):**
```php
// In your ZKTeco PHP script
function callAPI($url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Get teachers from Laravel
$response = callAPI('http://127.0.0.1:8000/api/zkteco/teachers');
if ($response['success']) {
    $teachers = $response['data'];
    
    // Push to ZKTeco device
    foreach ($teachers as $teacher) {
        // Your ZKTeco push code here
        // $zk->setUser(...);
    }
}

// Get students from Laravel
$response = callAPI('http://127.0.0.1:8000/api/zkteco/students');
if ($response['success']) {
    $students = $response['data'];
    
    // Push to ZKTeco device
    foreach ($students as $student) {
        // Your ZKTeco push code here
        // $zk->setUser(...);
    }
}
```

---

### 📥 PULL: ZKTeco Device → Laravel

**Process:**
1. Pull attendance from ZKTeco device
2. Format data as JSON
3. Send to Laravel API using POST request
4. Laravel saves to database

**PHP Example (ZKTeco Script):**
```php
// After pulling attendance from device
$teacherAttendance = [
    [
        'employee_id' => 'T0001',
        'date' => '2025-12-20',
        'in_time' => '08:30:00',
        'out_time' => '16:45:00',
        'status' => 'present'
    ],
    // ... more records
];

// Send to Laravel API
$ch = curl_init('http://127.0.0.1:8000/api/zkteco/attendance/store');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'type' => 'teacher',
    'data' => $teacherAttendance
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    echo "✅ Teacher attendance saved!\n";
    echo "Created: {$result['summary']['created']}\n";
    echo "Updated: {$result['summary']['updated']}\n";
    echo "Failed: {$result['summary']['failed']}\n";
}

// Same for student attendance
$studentAttendance = [
    [
        'employee_id' => 'STD00011',
        'date' => '2025-12-20',
        'in_time' => '08:45:00',
        'out_time' => '15:30:00',
        'status' => 'present'
    ],
    // ... more records
];

$ch = curl_init('http://127.0.0.1:8000/api/zkteco/attendance/store');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'type' => 'student',
    'data' => $studentAttendance
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);
```

---

## 📊 JSON Format Examples

### Teacher Attendance JSON:
```json
[
  {
    "employee_id": "T0001",
    "date": "2025-12-20",
    "in_time": "08:30:15",
    "out_time": "16:45:30",
    "status": "present"
  },
  {
    "employee_id": "T0002",
    "date": "2025-12-20",
    "in_time": "08:45:00",
    "out_time": "16:30:00",
    "status": "late"
  }
]
```

### Student Attendance JSON:
```json
[
  {
    "employee_id": "STD00011",
    "date": "2025-12-20",
    "in_time": "08:45:00",
    "out_time": "15:30:00",
    "status": "present"
  },
  {
    "employee_id": "STD00012",
    "date": "2025-12-20",
    "in_time": "09:15:00",
    "out_time": "15:25:00",
    "status": "late"
  }
]
```

---

## ⚙️ Configuration

**Your ZKTeco config.json:**
```json
{
  "device": {
    "ip": "192.168.0.21",
    "port": 4370,
    "name": "School F10 Device"
  },
  "laravel_api": {
    "base_url": "http://127.0.0.1:8000/api/zkteco",
    "endpoints": {
      "teachers": "/teachers",
      "students": "/students",
      "push_attendance": "/attendance/store"
    }
  },
  "timezone": "Asia/Dhaka"
}
```

---

## 📋 Database Requirements

### Teachers Table:
- ✅ `employee_id` field must be filled
- ✅ `status` must be 'active'
- ✅ Example: T0001, EMP001, 101

### Students Table:
- ✅ `admission_number` field must be filled
- ✅ `status` must be 'active'
- ✅ Example: STD00011, 2024001, S001

### Attendance Tables:
**teacher_attendance:**
- teacher_id (Foreign Key)
- date
- status (present/absent/late/half_day/leave)
- in_time
- out_time
- reason
- marked_by

**student_attendance:**
- student_id (Foreign Key)
- class_id
- section_id
- academic_year_id
- date
- status (present/absent/late/half_day/leave)
- in_time
- out_time
- reason
- sms_sent
- marked_by

---

## ✅ Complete Setup Checklist

- [x] ✅ Create `ZktecoController.php` in Laravel
- [x] ✅ Add routes in `routes/api.php`
- [ ] Start Laravel server: `php artisan serve`
- [ ] Test APIs in browser
- [ ] Verify teachers have `employee_id` filled
- [ ] Verify students have `admission_number` filled
- [ ] Push data to ZKTeco device
- [ ] Enroll fingerprints on device
- [ ] Test attendance punching
- [ ] Pull attendance and send to Laravel

---

## 🆘 Troubleshooting

### ❌ API returns empty array
**Solution:**
```sql
-- Check teachers
SELECT employee_id, first_name, last_name, status 
FROM teachers 
WHERE status = 'active' AND employee_id IS NOT NULL;

-- Check students
SELECT admission_number, first_name, last_name, status 
FROM students 
WHERE status = 'active' AND admission_number IS NOT NULL;
```

### ❌ API returns 404
**Solution:**
- Make sure Laravel server is running: `php artisan serve`
- Check routes are correct in `routes/api.php`
- Clear cache: `php artisan route:clear`

### ❌ Attendance not saving
**Solution:**
- Check `employee_id` exists in database
- Check date format is correct: `YYYY-MM-DD`
- Check status is valid: `present`, `absent`, `late`, `half_day`, `leave`
- Check Laravel logs: `storage/logs/laravel.log`

### ❌ Connection error from ZKTeco script
**Solution:**
- Ping Laravel: `ping 127.0.0.1`
- Check Laravel is running
- Check URL in config.json is correct
- Try in browser first to confirm API works

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/zkteco/teachers` | Get all active teachers |
| GET | `/api/zkteco/students` | Get all active students |
| POST | `/api/zkteco/attendance/store` | Store attendance data |

---

## 🔥 Quick Test Commands

```bash
# Start Laravel
php artisan serve

# Test in browser
http://127.0.0.1:8000/api/zkteco/teachers
http://127.0.0.1:8000/api/zkteco/students

# Test with curl
curl http://127.0.0.1:8000/api/zkteco/teachers
curl http://127.0.0.1:8000/api/zkteco/students

# Test POST (teacher attendance)
curl -X POST http://127.0.0.1:8000/api/zkteco/attendance/store \
  -H "Content-Type: application/json" \
  -d '{"type":"teacher","data":[{"employee_id":"T0001","date":"2025-12-20","in_time":"08:30:00","out_time":"16:45:00","status":"present"}]}'

# Test POST (student attendance)
curl -X POST http://127.0.0.1:8000/api/zkteco/attendance/store \
  -H "Content-Type: application/json" \
  -d '{"type":"student","data":[{"employee_id":"STD00011","date":"2025-12-20","in_time":"08:45:00","out_time":"15:30:00","status":"present"}]}'
```

---

## 🎉 Setup Complete!

✅ Laravel API Controller → Ready  
✅ API Routes → Configured  
✅ Database Models → Ready  
✅ Error Handling → Implemented  

**এখন আপনার ZKTeco script থেকে এই API গুলো call করতে পারবেন!**

---

**Created:** December 20, 2025  
**Updated:** Now  
**Status:** 🟢 Production Ready
