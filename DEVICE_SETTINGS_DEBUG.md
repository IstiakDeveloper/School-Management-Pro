# Device Settings - Troubleshooting Guide

## Logging করেছি যেসব জায়গায়

### Backend (Laravel)
**File**: `app/Http/Controllers/DeviceSettingController.php`

```php
// Logs চেক করুন:
tail -f storage/logs/laravel.log
```

**যে যে জিনিস log হবে**:
1. ✅ Request শুরু হলে: "Device Settings Update Started"
2. ✅ Request এ কি data আছে
3. ✅ Validation pass হলে: "Validation Passed"
4. ✅ Data normalize হওয়ার পর
5. ✅ Current settings ID
6. ✅ Update result (true/false)
7. ❌ Validation error হলে
8. ❌ Any exception হলে

### Frontend (React)
**File**: `resources/js/Pages/Settings/DeviceSettings.tsx`

**Browser Console এ দেখবেন**:
```javascript
// F12 -> Console tab
```

**যে যে জিনিস log হবে**:
1. 🔍 Component load হলে props দেখাবে
2. 📤 Form submit হলে data দেখাবে
3. ✅ Success response
4. ❌ Validation errors
5. 🏁 Request finish

## Debug করার ধাপ

### Step 1: Browser Console Check করুন
1. Page এ যান: `/device-settings`
2. F12 press করুন
3. Console tab এ যান
4. দেখুন "🔍 Component Props:" log আছে কিনা
5. দেখুন settings data properly load হয়েছে কিনা

### Step 2: Form Submit করুন
1. কোনো একটা field change করুন
2. Save button click করুন
3. Console এ দেখুন:
   - "=== Form Submit Started ===" দেখাচ্ছে কিনা
   - "Form Data:" তে কি কি আছে
   - "📤 Sending request to /device-settings" দেখাচ্ছে কিনা

### Step 3: Backend Log Check করুন
```bash
cd c:/Code/School-Management-Pro
tail -f storage/logs/laravel.log
```

অথবা:
```bash
# Last 100 lines দেখুন
tail -n 100 storage/logs/laravel.log
```

**দেখবেন**:
- "=== Device Settings Update Started ===" আছে কিনা
- Request Data তে সব fields আছে কিনা
- "✅ Validation Passed" দেখাচ্ছে কিনা
- "❌" কোনো error আছে কিনা

### Step 4: Database Check করুন
```bash
php artisan tinker
```

তারপর:
```php
$settings = \App\Models\DeviceSetting::first();
$settings->teacher_in_time; // Check time
$settings->device_name; // Check name
$settings->updated_at; // Check last update time
```

## Common Issues and Solutions

### Issue 1: Request যাচ্ছে না
**Symptoms**: Console এ "📤 Sending request" দেখা যাচ্ছে না

**Solution**:
- Form submit event prevent হচ্ছে কিনা check করুন
- Network tab (F12) এ request দেখা যাচ্ছে কিনা
- CSRF token আছে কিনা check করুন

### Issue 2: Validation Fail হচ্ছে
**Symptoms**: "❌ Validation Failed" log আছে

**Solution**:
- Console এ exact error দেখুন
- Time format check করুন (H:i or H:i:s)
- Device port string/integer কিনা
- Required fields empty কিনা

### Issue 3: Update হচ্ছে কিন্তু Save হচ্ছে না
**Symptoms**: "Update Result: false" log

**Solution**:
```bash
# Check fillable fields
php artisan tinker
\App\Models\DeviceSetting::first()->getFillable();

# Check if field exists in database
\Schema::hasColumn('device_settings', 'teacher_late_time');
```

### Issue 4: Flash Message দেখা যাচ্ছে না
**Symptoms**: Success হলেও message show হয় না

**Solution**:
- Page এ usePage() hook আছে কিনা check করুন
- props.flash variable accessible কিনা
- Browser console এ flash data আছে কিনা

## Log Output Examples

### Successful Update:
```
[2025-12-20 06:30:00] local.INFO: === Device Settings Update Started ===
[2025-12-20 06:30:00] local.INFO: Request Data: {"device_name":"ZKTeco Device","device_ip":"192.168.0.21",...}
[2025-12-20 06:30:00] local.INFO: ✅ Validation Passed
[2025-12-20 06:30:00] local.INFO: Validated Data: {...}
[2025-12-20 06:30:00] local.INFO: Data after normalization: {...}
[2025-12-20 06:30:00] local.INFO: Current Settings ID: {"id":1}
[2025-12-20 06:30:00] local.INFO: Update Result: {"success":true}
[2025-12-20 06:30:00] local.INFO: ✅ Settings updated successfully
```

### Validation Error:
```
[2025-12-20 06:30:00] local.INFO: === Device Settings Update Started ===
[2025-12-20 06:30:00] local.INFO: Request Data: {...}
[2025-12-20 06:30:00] local.ERROR: ❌ Validation Failed: {"errors":{"teacher_in_time":["The teacher in time field must match the format H:i."]}}
```

### Exception:
```
[2025-12-20 06:30:00] local.INFO: === Device Settings Update Started ===
[2025-12-20 06:30:00] local.ERROR: ❌ Exception occurred: {"message":"Column not found...","file":"...","line":123,"trace":"..."}
```

## Testing Commands

### Test Validation:
```bash
curl -X PUT http://localhost:8000/device-settings \
  -H "Content-Type: application/json" \
  -d '{"device_name":"Test","device_ip":"192.168.0.21",...}'
```

### Clear Logs:
```bash
# Clear log file
echo "" > storage/logs/laravel.log
```

### Check Route:
```bash
php artisan route:list | grep device-settings
```

Output should show:
```
PUT  device-settings  device-settings.update  DeviceSettingController@update
```

## Next Steps যদি Problem থাকে

1. **Console logs screenshot নিন**
2. **Laravel logs copy করুন** (last 50 lines)
3. **Network tab এ request/response দেখান**
4. **Database এর current data দেখান**

এটা দিয়ে exactly কোথায় আটকে যাচ্ছে বুঝতে পারবেন!
