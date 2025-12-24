# Fee System - Accounting Integration

## Summary

Fee collection system is now fully integrated with the Accounting system. All fee collections automatically create accounting income transactions and update account balances.

## Changes Made

### 1. Database Migration
- **File**: `database/migrations/028_create_fee_collections_table.php`
  - Added `account_id` column to link fee collection to specific account
  - Added `accounting_transaction_id` column to track the accounting transaction

- **New Migration**: `database/migrations/2025_12_17_100000_add_accounting_to_fee_collections.php`
  - Adds the new columns to existing fee_collections table

### 2. FeeCollection Model
- **File**: `app/Models/FeeCollection.php`
  - Added `account_id` and `accounting_transaction_id` to fillable fields
  - Added `account()` relationship
  - Added `accountingTransaction()` relationship

### 3. FeeCollectionController
- **File**: `app/Http/Controllers/Fee/FeeCollectionController.php`
  - Added `Account`, `Transaction`, `IncomeCategory` imports
  - Uses `CreatesAccountingTransactions` trait
  - **create()**: Now passes `accounts` to view
  - **store()**: 
    - Validates `account_id` (required)
    - Automatically generates receipt number
    - Creates accounting income transaction using trait method
    - Updates account balance automatically
    - Links fee collection to accounting transaction
    - Wrapped in DB transaction for safety
  - **destroy()**: 
    - Automatically reverses accounting transaction
    - Restores account balance
    - Wrapped in DB transaction

### 4. New Trait: CreatesAccountingTransactions
- **File**: `app/Traits/CreatesAccountingTransactions.php`
  - **createFeeIncomeTransaction()**: Creates income transaction for fee collections
    - Auto-creates "Fee Income" category if not exists
    - Generates unique transaction number
    - Creates Transaction record
    - Updates account balance (credit)
  - **createExpenseTransaction()**: Creates expense transaction for salary, expenses
    - Auto-creates "Salary & Wages" category if not provided
    - Generates unique transaction number
    - Creates Transaction record
    - Updates account balance (debit)
  - **reverseAccountingTransaction()**: Reverses any transaction
    - Finds transaction
    - Reverses account balance correctly based on type
    - Deletes transaction record

## How It Works

### Fee Collection Flow:
1. User collects fee from student
2. Selects which Account to credit (Cash, Bank, etc.)
3. System automatically:
   - Creates FeeCollection record
   - Creates Income Transaction in accounting
   - Credits the selected Account balance
   - Links both records together

### Fee Deletion Flow:
1. User deletes fee collection
2. System automatically:
   - Finds linked accounting transaction
   - Reverses account balance
   - Deletes accounting transaction
   - Deletes fee collection record

## Usage in Other Controllers

Any controller can now use the trait for automatic accounting:

```php
use App\Traits\CreatesAccountingTransactions;

class SalaryController extends Controller
{
    use CreatesAccountingTransactions;
    
    public function paySalary(Request $request)
    {
        // Pay salary and create accounting transaction
        $transaction = $this->createExpenseTransaction(
            accountId: $request->account_id,
            amount: $salaryAmount,
            date: $paymentDate,
            paymentMethod: 'bank_transfer',
            referenceNumber: $salarySlipNumber,
            description: "Salary payment for {$employee->name}"
        );
    }
}
```

## Migration Command

To apply the new columns to fee_collections table:

```bash
php artisan migrate
```

## Benefits

✅ **Automatic Double-Entry**: Every fee collection creates accounting transaction
✅ **Real-time Balance**: Account balances update instantly
✅ **Audit Trail**: Complete transaction history
✅ **Easy Reversal**: Delete fee = automatic reversal of accounting
✅ **Reusable Trait**: Same logic can be used for Salary, Expenses, etc.
✅ **Safe Transactions**: All wrapped in DB transactions
✅ **Category Management**: Auto-creates income/expense categories

## Next Steps

1. Run migration to add columns
2. Update Fee Collection UI to include Account selection dropdown
3. Apply same pattern to:
   - Salary payments (Expense)
   - Other expenses (Expense)
   - Library fines (Income)
   - Other income sources (Income)
