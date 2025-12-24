<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_id',
        'transaction_number',
        'type',
        'income_category_id',
        'expense_category_id',
        'transfer_to_account_id',
        'amount',
        'transaction_date',
        'payment_method',
        'reference_number',
        'description',
        'attachment',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function incomeCategory()
    {
        return $this->belongsTo(IncomeCategory::class);
    }

    public function expenseCategory()
    {
        return $this->belongsTo(ExpenseCategory::class);
    }

    public function transferToAccount()
    {
        return $this->belongsTo(Account::class, 'transfer_to_account_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
