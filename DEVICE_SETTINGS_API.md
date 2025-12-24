# Device Settings - Local Computer Integration

## Overview
Device Settings পেজে ZKTeco device configuration এবং attendance rules manage করা যায়। এটা local computer থেকে API এর মাধ্যমে communicate করবে।

## Setup করেছি

### ✅ Backend (Laravel)
- **Route**: `/settings/device-settings`
- **Controller**: `DeviceSettingController`
- **Model**: `DeviceSetting`, `Holiday`

### ✅ Frontend (React + Inertia)
- **Component**: `resources/js/Pages/Settings/DeviceSettings.tsx`
- **Custom Components**: শুধু `Card` এবং `Button` ব্যবহার করা হয়েছে
- **No shadcn**: সব shadcn components remove করা হয়েছে

## Features

### 1. Device Configuration
- Device Name, IP, Port configure করা যায়
- Connection test করা যায় live

### 2. Teacher Rules
- **In Time**: 08:00 (কখন আসতে হবে)
- **Out Time**: 16:00 (কখন যেতে হবে)
- **Late Time**: 08:30 (এর পরে late হবে)

### 3. Student Rules (Simplified)
- **In Time**: 08:30 (কখন আসতে হবে)
- **Late Time**: 09:00 (এর পরে late হবে)
- **Note**: Students এর জন্য OUT TIME নাই - শুধু present mark হবে

### 4. Weekend Days
- যেকোনো দিন weekend হিসেবে select করা যায়
- Multiple days select করা যায়
- Default: Friday (5), Saturday (6)

### 5. Holidays
- Holiday add/edit/delete করা যায়
- Types: Public, School, Optional
- Active/Inactive toggle করা যায়

### 6. Automation Settings
- ✅ **Auto Mark Present**: On time এলে auto present
- ✅ **Auto Mark Late**: Late time এর পরে auto late
- ✅ **Auto Mark Absent**: No attendance থাকলে absent
- ✅ **Auto Mark Early Leave**: আগে চলে গেলে

### 7. SMS Notifications
- Present এ SMS
- Absent এ SMS
- Late এ SMS
- Early Leave এ SMS

### 8. Auto Sync
- Device থেকে auto sync করা যাবে
- Interval set করা যায় (5-1440 minutes)

## API Endpoints

### Get Settings
```
GET /settings/device-settings
```

### Update Settings
```
PUT /settings/device-settings
Content-Type: application/json

{
  "device_name": "ZKTeco Device",
  "device_ip": "192.168.0.21",
  "device_port": "4370",
  "teacher_in_time": "08:00",
  "teacher_out_time": "16:00",
  "teacher_late_time": "08:30",
  "student_in_time": "08:30",
  "student_late_time": "09:00",
  "weekend_days": ["5", "6"],
  "auto_mark_present": true,
  "auto_mark_absent": true,
  "auto_mark_late": true,
  "auto_mark_early_leave": true,
  "sms_on_present": false,
  "sms_on_absent": true,
  "sms_on_late": true,
  "sms_on_early_leave": false,
  "auto_sync_enabled": false,
  "sync_interval_minutes": 30
}
```

### Test Connection
```
POST /settings/device-settings/test-connection
Content-Type: application/json

{
  "device_ip": "192.168.0.21",
  "device_port": "4370"
}
```

### Holiday Management
```
POST /holidays              - Add holiday
PUT /holidays/{id}          - Update holiday
DELETE /holidays/{id}       - Delete holiday
```

## Local Computer থেকে যেভাবে Use করবে

### 1. Python Script Example
```python
import requests

# Laravel API base URL
BASE_URL = "http://localhost:8000"  # Or your Laravel URL

# Get current settings
response = requests.get(f"{BASE_URL}/settings/device-settings")
settings = response.json()

print(f"Device: {settings['device_name']}")
print(f"IP: {settings['device_ip']}")
print(f"Teacher In Time: {settings['teacher_in_time']}")
print(f"Student In Time: {settings['student_in_time']}")
print(f"Weekends: {settings['weekend_days']}")

# Update settings
update_data = {
    "device_name": "My ZKTeco",
    "device_ip": "192.168.0.21",
    "device_port": "4370",
    "teacher_in_time": "08:00",
    "teacher_out_time": "16:00",
    "teacher_late_time": "08:30",
    "student_in_time": "08:30",
    "student_late_time": "09:00",
    "weekend_days": ["5", "6"],
    "auto_mark_present": True,
    "auto_mark_absent": True,
    "auto_mark_late": True,
}

response = requests.put(
    f"{BASE_URL}/settings/device-settings",
    json=update_data,
    headers={"Content-Type": "application/json"}
)

if response.ok:
    print("✅ Settings updated!")
else:
    print("❌ Error:", response.text)
```

### 2. JavaScript Example
```javascript
const BASE_URL = "http://localhost:8000";

// Get settings
async function getSettings() {
  const response = await fetch(`${BASE_URL}/settings/device-settings`);
  const settings = await response.json();
  return settings;
}

// Update settings
async function updateSettings(data) {
  const response = await fetch(`${BASE_URL}/settings/device-settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Test connection
async function testConnection(ip, port) {
  const response = await fetch(`${BASE_URL}/settings/device-settings/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_ip: ip, device_port: port })
  });
  return response.json();
}
```

## Important Notes

1. **Student Out Time নাই**: Students শুধু present mark করবে, out time track করা হবে না
2. **Weekend Days**: String array হিসেবে store হয় - ["0", "1", "5", "6"]
3. **Auto Mark**: Backend automatically status calculate করবে settings অনুযায়ী
4. **Holidays**: Weekend + Holiday দুটোই check করা হয়
5. **Validation**: Backend এ proper validation আছে সব fields এর জন্য

## Changes করা হয়েছে

✅ Save functionality fixed - route names corrected
✅ Student out_time removed - শুধু in_time এবং late_time আছে
✅ API ready - local computer থেকে connect করা যাবে
✅ Custom components only - No shadcn components
✅ Validation updated - backend এ proper validation
✅ Model updated - new field names support করে
