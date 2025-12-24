<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Account extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'account_name',
        'account_number',
        'account_type',
        'bank_name',
        'branch',
        'opening_balance',
        'current_balance',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'opening_balance' => 'decimal:2',
            'current_balance' => 'decimal:2',
        ];
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function transfersIn()
    {
        return $this->hasMany(Transaction::class, 'transfer_to_account_id');
    }

    public function getTotalIncomeAttribute()
    {
        return $this->transactions()->where('type', 'income')->sum('amount');
    }

    public function getTotalExpenseAttribute()
    {
        return $this->transactions()->where('type', 'expense')->sum('amount');
    }
}
