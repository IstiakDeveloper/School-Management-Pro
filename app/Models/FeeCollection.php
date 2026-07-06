<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    public function scopeUnpaid(Builder $query): Builder
    {
        return $query->whereIn('status', ['pending', 'partial', 'overdue']);
    }

    /**
     * Hide unpaid rows when the same student/fee/month/year is already paid.
     */
    public function scopeWithoutPaidDuplicate(Builder $query): Builder
    {
        return $query->whereNotExists(function ($sub) {
            $sub->from('fee_collections as paid_fees')
                ->whereColumn('paid_fees.student_id', 'fee_collections.student_id')
                ->whereColumn('paid_fees.fee_type_id', 'fee_collections.fee_type_id')
                ->whereColumn('paid_fees.month', 'fee_collections.month')
                ->whereColumn('paid_fees.year', 'fee_collections.year')
                ->where('paid_fees.status', 'paid')
                ->whereNull('paid_fees.deleted_at');
        });
    }

    public function scopeOutstanding(Builder $query): Builder
    {
        return $query->unpaid()->withoutPaidDuplicate();
    }

    /**
     * Paid rows plus genuine unpaid rows (hides cancelled and paid duplicates).
     */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('status', 'paid')
                ->orWhere(fn (Builder $inner) => $inner->outstanding());
        });
    }

    public function scopeExcludeCancelled(Builder $query): Builder
    {
        return $query->where('status', '!=', 'cancelled');
    }

    public function getRemainingAttribute(): float
    {
        if (in_array($this->status, ['paid', 'cancelled'], true)) {
            return 0.0;
        }

        return max((float) $this->total_amount - (float) $this->paid_amount, 0);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['paid', 'cancelled'], true)) {
            return false;
        }

        if ($this->status === 'overdue') {
            return true;
        }

        return $this->payment_date?->isPast() ?? false;
    }

    public function getDueDateAttribute()
    {
        return $this->payment_date;
    }

    public static function activeExistsForPeriod(int $studentId, int $feeTypeId, int $month, int $year): bool
    {
        return static::query()
            ->where('student_id', $studentId)
            ->where('fee_type_id', $feeTypeId)
            ->where('month', $month)
            ->where('year', $year)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    public static function paidExistsForPeriod(int $studentId, int $feeTypeId, int $month, int $year): bool
    {
        return static::query()
            ->where('student_id', $studentId)
            ->where('fee_type_id', $feeTypeId)
            ->where('month', $month)
            ->where('year', $year)
            ->where('status', 'paid')
            ->exists();
    }

    public static function findUnpaidForPeriod(int $studentId, int $feeTypeId, int $month, int $year): ?self
    {
        return static::query()
            ->where('student_id', $studentId)
            ->where('fee_type_id', $feeTypeId)
            ->where('month', $month)
            ->where('year', $year)
            ->unpaid()
            ->orderBy('id')
            ->first();
    }

    public static function cancelUnpaidDuplicatesForPeriod(
        int $studentId,
        int $feeTypeId,
        int $month,
        int $year,
        ?int $exceptId = null
    ): int {
        return static::query()
            ->where('student_id', $studentId)
            ->where('fee_type_id', $feeTypeId)
            ->where('month', $month)
            ->where('year', $year)
            ->unpaid()
            ->when($exceptId, fn (Builder $q) => $q->where('id', '!=', $exceptId))
            ->update(['status' => 'cancelled']);
    }

    public static function cancelAllOrphanUnpaidDuplicates(): int
    {
        $orphanIds = static::query()
            ->unpaid()
            ->whereExists(function ($sub) {
                $sub->from('fee_collections as paid_fees')
                    ->whereColumn('paid_fees.student_id', 'fee_collections.student_id')
                    ->whereColumn('paid_fees.fee_type_id', 'fee_collections.fee_type_id')
                    ->whereColumn('paid_fees.month', 'fee_collections.month')
                    ->whereColumn('paid_fees.year', 'fee_collections.year')
                    ->where('paid_fees.status', 'paid')
                    ->whereNull('paid_fees.deleted_at');
            })
            ->pluck('id');

        if ($orphanIds->isEmpty()) {
            return 0;
        }

        return static::query()
            ->whereIn('id', $orphanIds)
            ->update(['status' => 'cancelled']);
    }
}
