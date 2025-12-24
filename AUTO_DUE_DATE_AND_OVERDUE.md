# Auto Due Date & Overdue Management

## Summary
Fee due dates are now automatically calculated based on fee frequency. Manual due date input has been removed from the frontend. A new Overdue Management system has been added for tracking and managing overdue fees.

## Auto Due Date Calculation Logic

### Backend Implementation (ClassController)

The `generateDueDate()` method automatically sets due dates based on fee frequency:

```php
private function generateDueDate(string $frequency, $academicYear): string
{
    $currentDate = now();
    
    switch ($frequency) {
        case 'monthly':
            // Last day of current month
            return $currentDate->endOfMonth()->format('Y-m-d');
            
        case 'quarterly':
            // Last day of current quarter
            $month = $currentDate->month;
            $quarterEndMonth = ceil($month / 3) * 3;
            return $currentDate->month($quarterEndMonth)->endOfMonth()->format('Y-m-d');
            
        case 'yearly':
            // December 31 of academic year or current year
            $year = $academicYear ? explode('-', $academicYear->year)[0] : $currentDate->year;
            return $year . '-12-31';
            
        case 'one_time':
            // 30 days from now
            return $currentDate->addDays(30)->format('Y-m-d');
            
        default:
            return $currentDate->endOfMonth()->format('Y-m-d');
    }
}
```

### Frequency Mapping

| Frequency | Due Date Logic | Example |
|-----------|---------------|---------|
| **Monthly** | Last day of current month | January → Jan 31 |
| **Quarterly** | Last day of current quarter | Jan-Mar → Mar 31 |
| **Yearly** | December 31 of academic year | 2024-2025 → 2024-12-31 |
| **One-time** | 30 days from creation | Today + 30 days |

## Frontend Changes

### Classes/Create.tsx
- **Removed**: Due date input field
- **Added**: Auto due date explanation notice
- **State**: `fee_structures` no longer includes `due_date`
- **Notice**: "Due date will be automatically set based on fee frequency (Monthly = Last day of each month, Yearly = December 31)"

### Classes/Edit.tsx
- **Removed**: Due date input field
- **Added**: Auto due date explanation notice
- **State**: `fee_structures` array excludes `due_date`

### Classes/Show.tsx
- **Displays**: Auto-generated due dates for each fee structure
- **Shows**: Fee frequency badge to indicate type

## Overdue Management System

### New Files Created

1. **OverdueController.php** (`app/Http/Controllers/Fee/OverdueController.php`)
   - `index()`: Lists all overdue fees with student details
   - `sendReminder()`: Sends reminder to individual student
   - `bulkReminder()`: Sends bulk reminders based on filters
   - `markPaid()`: Redirects to fee collection form

2. **Overdue/Index.tsx** (`resources/js/pages/Fees/Overdue/Index.tsx`)
   - Dashboard view for overdue fees
   - Search and filter capabilities
   - Bulk reminder functionality
   - Export to CSV
   - Severity badges (Low, Medium, High, Critical)

### Features

#### Stats Dashboard
- **Total Overdue**: Count of all overdue fees
- **Total Amount**: Sum of overdue amounts
- **Critical**: Fees overdue > 30 days
- **Moderate**: Fees overdue 7-30 days

#### Filters
- Search by student name, roll, or class
- Filter by days overdue (All, 7+, 30+, 60+ days)
- Export filtered results to CSV

#### Severity Levels
- **Low**: 1-7 days overdue (Blue badge)
- **Medium**: 8-30 days overdue (Yellow badge)
- **High**: 31-60 days overdue (Orange badge)
- **Critical**: 60+ days overdue (Red badge)

#### Actions
- **Send Reminder**: Email/SMS to individual student
- **Bulk Reminders**: Send to all filtered students
- **Collect Fee**: Quick link to fee collection form

### Routes Added

```php
Route::get('overdue-fees', [OverdueController::class, 'index'])
    ->name('overdue-fees.index');

Route::post('overdue-fees/reminder', [OverdueController::class, 'sendReminder'])
    ->name('overdue-fees.reminder');

Route::post('overdue-fees/bulk-reminder', [OverdueController::class, 'bulkReminder'])
    ->name('overdue-fees.bulk-reminder');

Route::post('overdue-fees/mark-paid', [OverdueController::class, 'markPaid'])
    ->name('overdue-fees.mark-paid');
```

## How It Works

### Creating a Class with Fees

1. User creates a class and adds fee structures
2. User selects fee type (which has frequency field)
3. User enters amount only (no due date input)
4. Backend automatically calculates due date based on frequency
5. Fee structure is saved with auto-generated due date

### Example Flow

```
1. Create Class "Grade 10-A"
2. Add Fee Structure:
   - Fee Type: "Monthly Tuition" (frequency: monthly)
   - Academic Year: 2024-2025
   - Amount: 5000
3. System auto-generates: due_date = "2024-12-31" (last day of Dec)
4. Fee structure saved
```

### Overdue Detection

The overdue system checks:
1. All active fee structures
2. Where `due_date < today`
3. Loads students in those classes
4. Checks if student has paid (FeeCollection record exists)
5. If unpaid, adds to overdue list

## Database Impact

### No Schema Changes Required
- Uses existing `fee_structures` table
- Uses existing `fee_collections` table
- No new migrations needed

### Validation Changes
- **Before**: `'fee_structures.*.due_date' => 'required|date'`
- **After**: Due date field removed from validation rules

## User Benefits

✅ **No Manual Date Entry**: Reduces human error
✅ **Consistent Due Dates**: All monthly fees due on month end
✅ **Auto Overdue Detection**: System tracks overdue automatically
✅ **Bulk Reminders**: Send reminders to multiple students at once
✅ **Severity Tracking**: Visual indicators for urgency
✅ **Export Reports**: Download overdue list as CSV

## Next Steps (Future Enhancements)

1. **Automated Monthly Fee Generation**: Cron job to create next month's fees
2. **Email/SMS Integration**: Actual email and SMS sending (currently placeholder)
3. **Payment Plans**: Support installments for large fees
4. **Late Fee Calculation**: Auto-add penalty for overdue fees
5. **Parent Portal**: Parents can view overdue fees online
6. **Notification System**: Auto-notify before due date

## Testing Checklist

- [ ] Create class with monthly fee → Due date = end of month
- [ ] Create class with yearly fee → Due date = Dec 31
- [ ] Edit class fee structures → Due dates recalculated
- [ ] Visit overdue page → See all unpaid fees past due date
- [ ] Filter overdue by 30+ days → Shows only critical
- [ ] Export CSV → Downloads with correct data
- [ ] Send reminder → Success message appears
- [ ] Click "Collect" → Redirects to fee collection form

## Access Control

- **Roles**: Super Admin, Principal, Accountant
- **Route Middleware**: `role:Super Admin,Principal,Accountant`

## File Summary

### Modified Files
1. `app/Http/Controllers/Academic/ClassController.php` - Added auto due date generation
2. `resources/js/pages/Academic/Classes/Create.tsx` - Removed due date input
3. `resources/js/pages/Academic/Classes/Edit.tsx` - Removed due date input
4. `routes/web.php` - Added overdue routes

### New Files
1. `app/Http/Controllers/Fee/OverdueController.php` - Overdue management controller
2. `resources/js/pages/Fees/Overdue/Index.tsx` - Overdue management page
3. `AUTO_DUE_DATE_AND_OVERDUE.md` - This documentation

## Conclusion

The fee system is now fully automated for due date calculation. Users no longer need to manually enter due dates, reducing errors and ensuring consistency. The new Overdue Management system provides a comprehensive view of all overdue fees with powerful filtering, reminder, and export capabilities.
