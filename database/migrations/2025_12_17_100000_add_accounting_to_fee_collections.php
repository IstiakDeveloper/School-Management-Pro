<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('fee_collections', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('academic_year_id')->constrained()->onDelete('set null');
            $table->foreignId('accounting_transaction_id')->nullable()->after('account_id')->constrained('transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fee_collections', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropForeign(['accounting_transaction_id']);
            $table->dropColumn(['account_id', 'accounting_transaction_id']);
        });
    }
};
