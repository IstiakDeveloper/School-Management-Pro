<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained()->onDelete('cascade');
            $table->foreignId('section_id')->constrained()->onDelete('cascade');
            
            // Basic Info
            $table->string('admission_number')->unique();
            $table->string('roll_number')->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('first_name_bengali')->nullable();
            $table->string('last_name_bengali')->nullable();
            $table->date('date_of_birth');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])->nullable();
            $table->string('birth_certificate_no')->nullable();
            $table->string('religion')->nullable();
            $table->string('nationality')->default('Bangladeshi');
            
            // Contact Info
            $table->string('phone')->nullable();
            $table->string('email')->unique()->nullable();
            $table->text('present_address');
            $table->text('permanent_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            
            // Guardian/Parent Info (basic - detailed in separate table)
            $table->string('father_name');
            $table->string('father_phone')->nullable();
            $table->string('mother_name');
            $table->string('mother_phone')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->enum('guardian_relation', ['father', 'mother', 'uncle', 'aunt', 'grandfather', 'grandmother', 'other'])->default('father');
            
            // Academic Info
            $table->date('admission_date');
            $table->string('previous_school')->nullable();
            $table->string('previous_class')->nullable();
            $table->text('previous_exam_result')->nullable();
            $table->text('special_notes')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();
            
            // Documents
            $table->string('photo')->nullable();
            $table->string('birth_certificate')->nullable();
            $table->string('previous_marksheet')->nullable();
            $table->string('transfer_certificate')->nullable();
            
            // Status
            $table->enum('status', ['active', 'passed', 'transferred', 'dropped', 'suspended'])->default('active');
            $table->date('status_changed_at')->nullable();
            $table->text('status_reason')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('admission_number');
            $table->index('roll_number');
            $table->index(['class_id', 'section_id']);
            $table->index('status');
            $table->index('academic_year_id');
            $table->index(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
