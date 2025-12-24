<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'academic_year_id',
        'class_id',
        'section_id',
        'admission_number',
        'roll_number',
        'first_name',
        'last_name',
        'first_name_bengali',
        'last_name_bengali',
        'date_of_birth',
        'gender',
        'blood_group',
        'birth_certificate_no',
        'religion',
        'nationality',
        'phone',
        'email',
        'present_address',
        'permanent_address',
        'city',
        'state',
        'postal_code',
        'father_name',
        'father_phone',
        'mother_name',
        'mother_phone',
        'guardian_name',
        'guardian_phone',
        'guardian_relation',
        'admission_date',
        'previous_school',
        'previous_class',
        'previous_exam_result',
        'special_notes',
        'medical_conditions',
        'allergies',
        'photo',
        'birth_certificate',
        'previous_marksheet',
        'transfer_certificate',
        'status',
        'status_changed_at',
        'status_reason',
    ];

    protected $appends = [
        'full_name',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'admission_date' => 'date',
            'status_changed_at' => 'date',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }

    public function parents()
    {
        return $this->hasMany(StudentParent::class);
    }

    public function documents()
    {
        return $this->hasMany(StudentDocument::class);
    }

    public function promotions()
    {
        return $this->hasMany(StudentPromotion::class);
    }

    public function attendance()
    {
        return $this->hasMany(StudentAttendance::class);
    }

    public function attendanceSummary()
    {
        return $this->hasMany(AttendanceSummary::class);
    }

    public function marks()
    {
        return $this->hasMany(Mark::class);
    }

    public function results()
    {
        return $this->hasMany(Result::class);
    }

    public function feeCollections()
    {
        return $this->hasMany(FeeCollection::class);
    }

    public function feeWaivers()
    {
        return $this->hasMany(FeeWaiver::class);
    }

    public function bookIssues()
    {
        return $this->morphMany(BookIssue::class, 'issueable');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    public function scopeBySection($query, $sectionId)
    {
        return $query->where('section_id', $sectionId);
    }

    public function scopeByAcademicYear($query, $yearId)
    {
        return $query->where('academic_year_id', $yearId);
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth->age;
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? asset('storage/' . $this->photo) : null;
    }
}
