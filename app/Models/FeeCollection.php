<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FeeCollection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number',
        'student_id',
        'fee_type_id',
        'academic_year_id',
        'account_id',
        'accounting_transaction_id',
        'month',
        'year',
        'amount',
        'late_fee',
        'discount',
        'total_amount',
        'paid_amount',
        'payment_date',
        'payment_method',
        'transaction_id',
        'remarks',
        'status',
        'collected_by',
    ];

    protected function casts(): array
    {
        return [
            'month' => 'integer',
            'year' => 'integer',
            'amount' => 'decimal:2',
            'late_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function feeType()
    {
        return $this->belongsTo(FeeType::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function collector()
    {
        return $this->belongsTo(User::class, 'collected_by');
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function accountingTransaction()
    {
        return $this->belongsTo(Transaction::class, 'accounting_transaction_id');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
