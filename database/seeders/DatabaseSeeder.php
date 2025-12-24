<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\Teacher;
use App\Models\Staff;
use App\Models\FeeType;
use App\Models\FeeStructure;
use App\Models\GradeSetting;
use App\Models\Setting;
use App\Models\ExamHall;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Permissions
        $permissions = [
            // User Management
            'view_users', 'create_users', 'edit_users', 'delete_users',
            // Student Management
            'view_students', 'create_students', 'edit_students', 'delete_students',
            'promote_students', 'view_student_documents',
            // Teacher Management
            'view_teachers', 'create_teachers', 'edit_teachers', 'delete_teachers',
            // Staff Management
            'view_staff', 'create_staff', 'edit_staff', 'delete_staff',
            // Class Management
            'view_classes', 'create_classes', 'edit_classes', 'delete_classes',
            // Attendance Management
            'view_attendance', 'mark_attendance', 'edit_attendance',
            // Exam Management
            'view_exams', 'create_exams', 'edit_exams', 'delete_exams',
            'view_marks', 'enter_marks', 'edit_marks',
            'view_results', 'publish_results',
            // Fee Management
            'view_fees', 'collect_fees', 'create_fee_types', 'manage_fee_waivers',
            // Library Management
            'view_books', 'create_books', 'issue_books', 'return_books',
            // Communication
            'view_notices', 'create_notices', 'send_messages',
            // Reports
            'view_reports', 'export_reports',
            // Settings
            'manage_settings', 'view_activity_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::create([
                'name' => $permission,
                'slug' => str_replace('_', '-', $permission),
                'module' => explode('_', $permission)[1] ?? 'general',
            ]);
        }

        // Create Roles
        $superAdmin = Role::create(['name' => 'Super Admin', 'slug' => 'super-admin']);
        $principal = Role::create(['name' => 'Principal', 'slug' => 'principal']);
        $teacher = Role::create(['name' => 'Teacher', 'slug' => 'teacher']);
        $accountant = Role::create(['name' => 'Accountant', 'slug' => 'accountant']);
        $librarian = Role::create(['name' => 'Librarian', 'slug' => 'librarian']);
        $studentRole = Role::create(['name' => 'Student', 'slug' => 'student']);
        $parentRole = Role::create(['name' => 'Parent', 'slug' => 'parent']);

        // Assign all permissions to Super Admin
        $superAdmin->permissions()->attach(Permission::all());

        // Assign permissions to Principal (almost all except user management)
        $principalPermissions = Permission::whereNotIn('name', ['delete_users', 'manage_settings'])
            ->pluck('id');
        $principal->permissions()->attach($principalPermissions);

        // Assign permissions to Teacher
        $teacherPermissions = Permission::whereIn('name', [
            'view_students', 'view_classes', 'view_attendance', 'mark_attendance',
            'view_exams', 'view_marks', 'enter_marks', 'edit_marks',
            'view_notices', 'create_notices', 'send_messages',
        ])->pluck('id');
        $teacher->permissions()->attach($teacherPermissions);

        // Assign permissions to Accountant
        $accountantPermissions = Permission::whereIn('name', [
            'view_students', 'view_fees', 'collect_fees', 'create_fee_types',
            'manage_fee_waivers', 'view_reports', 'export_reports',
        ])->pluck('id');
        $accountant->permissions()->attach($accountantPermissions);

        // Assign permissions to Librarian
        $librarianPermissions = Permission::whereIn('name', [
            'view_books', 'create_books', 'issue_books', 'return_books',
        ])->pluck('id');
        $librarian->permissions()->attach($librarianPermissions);

        // Create Users
        $adminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@school.com',
            'password' => Hash::make('password'),
            'phone' => '01711111111',
            'status' => 'active',
        ]);
        $adminUser->roles()->attach($superAdmin->id);

        $principalUser = User::create([
            'name' => 'Principal',
            'email' => 'principal@school.com',
            'password' => Hash::make('password'),
            'phone' => '01722222222',
            'status' => 'active',
        ]);
        $principalUser->roles()->attach($principal->id);

        // Create Academic Year
        $currentYear = AcademicYear::create([
            'name' => '2024-2025',
            'title' => 'Academic Year 2024-2025',
            'start_date' => '2024-01-01',
            'end_date' => '2024-12-31',
            'is_current' => true,
            'status' => 'active',
        ]);

        // Create Classes
        $classes = [];
        for ($i = 1; $i <= 10; $i++) {
            $classes[$i] = SchoolClass::create([
                'name' => "Class $i",
                'numeric_value' => $i,
                'order' => $i,
                'status' => 'active',
            ]);
        }

        // Create Sections for each class
        $sections = [];
        $roomCounter = 101;
        foreach ($classes as $class) {
            foreach (['A', 'B'] as $sectionName) {
                $sections[] = Section::create([
                    'class_id' => $class->id,
                    'name' => $sectionName,
                    'capacity' => 40,
                    'room_number' => $roomCounter++,
                    'status' => 'active',
                ]);
            }
        }

        // Create Subjects
        $subjects = [
            'Bengali', 'English', 'Mathematics', 'Science', 'Social Science',
            'Religion', 'ICT', 'Physical Education', 'Drawing', 'Music'
        ];

        $subjectModels = [];
        foreach ($subjects as $subjectName) {
            $subject = Subject::create([
                'name' => $subjectName,
                'code' => strtoupper(substr(str_replace(' ', '', $subjectName), 0, 4)) . rand(100, 999),
                'type' => in_array($subjectName, ['Science', 'ICT']) ? 'both' : 'theory',
                'total_marks' => 100,
                'pass_marks' => 33,
                'status' => 'active',
            ]);
            $subjectModels[] = $subject;
        }

        // Assign subjects to classes
        foreach ($classes as $class) {
            foreach ($subjectModels as $subject) {
                $class->subjects()->attach($subject->id);
            }
        }

        // Create Teachers
        for ($i = 1; $i <= 10; $i++) {
            $teacherUser = User::create([
                'name' => "Teacher $i",
                'email' => "teacher$i@school.com",
                'password' => Hash::make('password'),
                'phone' => '0173' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'status' => 'active',
            ]);
            $teacherUser->roles()->attach($teacher->id);

            Teacher::create([
                'user_id' => $teacherUser->id,
                'employee_id' => 'T' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'first_name' => "Teacher",
                'last_name' => "$i",
                'date_of_birth' => now()->subYears(rand(25, 50)),
                'gender' => $i % 2 == 0 ? 'male' : 'female',
                'blood_group' => ['A+', 'B+', 'O+', 'AB+'][rand(0, 3)],
                'phone' => '0173' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'present_address' => 'Dhaka, Bangladesh',
                'qualification' => 'B.Ed',
                'experience_years' => rand(1, 15),
                'joining_date' => now()->subYears(rand(1, 10)),
                'salary' => rand(25000, 50000),
                'employment_type' => 'permanent',
                'status' => 'active',
            ]);
        }

        // Create Staff
        $staffTypes = [
            ['name' => 'Accountant', 'role' => $accountant->id],
            ['name' => 'Librarian', 'role' => $librarian->id],
            ['name' => 'Office Assistant', 'role' => null],
            ['name' => 'Peon', 'role' => null],
        ];

        foreach ($staffTypes as $index => $staffType) {
            $staffUser = User::create([
                'name' => $staffType['name'] . ' ' . ($index + 1),
                'email' => strtolower(str_replace(' ', '', $staffType['name'])) . ($index + 1) . '@school.com',
                'password' => Hash::make('password'),
                'phone' => '0174' . str_pad($index + 1, 7, '0', STR_PAD_LEFT),
                'status' => 'active',
            ]);

            if ($staffType['role']) {
                $staffUser->roles()->attach($staffType['role']);
            }

            Staff::create([
                'user_id' => $staffUser->id,
                'employee_id' => 'S' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'first_name' => $staffType['name'],
                'last_name' => ($index + 1),
                'date_of_birth' => now()->subYears(rand(25, 50)),
                'gender' => $index % 2 == 0 ? 'male' : 'female',
                'phone' => '0174' . str_pad($index + 1, 7, '0', STR_PAD_LEFT),
                'address' => 'Dhaka, Bangladesh',
                'designation' => $staffType['name'],
                'joining_date' => now()->subYears(rand(1, 5)),
                'salary' => rand(15000, 35000),
                'status' => 'active',
            ]);
        }

        // Create Students with Parents
        foreach ($classes as $classIndex => $class) {
            for ($i = 1; $i <= 10; $i++) {
                $studentNum = ($classIndex * 10 + $i);

                // Create Student User
                $studentUser = User::create([
                    'name' => "Student " . $studentNum,
                    'email' => "student" . $studentNum . "@school.com",
                    'password' => Hash::make('password'),
                    'phone' => '0177' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'status' => 'active',
                ]);
                $studentUser->roles()->attach($studentRole->id);

                // Create Student
                $student = Student::create([
                    'user_id' => $studentUser->id,
                    'academic_year_id' => $currentYear->id,
                    'class_id' => $class->id,
                    'section_id' => Section::where('class_id', $class->id)->skip($i % 2)->first()->id,
                    'admission_number' => 'STD' . str_pad($studentNum, 5, '0', STR_PAD_LEFT),
                    'roll_number' => $i,
                    'first_name' => "Student",
                    'last_name' => "$studentNum",
                    'date_of_birth' => now()->subYears(5 + $classIndex)->subMonths(rand(1, 11)),
                    'gender' => $i % 2 == 0 ? 'male' : 'female',
                    'blood_group' => ['A+', 'B+', 'O+', 'AB+'][rand(0, 3)],
                    'religion' => ['Islam', 'Hindu', 'Buddhist', 'Christian'][rand(0, 3)],
                    'present_address' => 'Dhaka, Bangladesh',
                    'father_name' => "Father " . $studentNum,
                    'father_phone' => '0175' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'mother_name' => "Mother " . $studentNum,
                    'mother_phone' => '0176' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'admission_date' => now()->subMonths(rand(1, 12)),
                    'status' => 'active',
                ]);

                // Create Parent User
                $parentUser = User::create([
                    'name' => "Parent " . $studentNum,
                    'email' => "parent" . $studentNum . "@school.com",
                    'password' => Hash::make('password'),
                    'phone' => '0175' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'status' => 'active',
                ]);
                $parentUser->roles()->attach($parentRole->id);

                // Create Father record
                StudentParent::create([
                    'student_id' => $student->id,
                    'user_id' => $parentUser->id,
                    'relation' => 'father',
                    'name' => "Father " . $studentNum,
                    'phone' => '0175' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'occupation' => 'Business',
                    'home_address' => 'Dhaka, Bangladesh',
                    'is_primary_contact' => true,
                    'status' => 'active',
                ]);

                // Create Mother record
                StudentParent::create([
                    'student_id' => $student->id,
                    'user_id' => null,
                    'relation' => 'mother',
                    'name' => "Mother " . $studentNum,
                    'phone' => '0176' . str_pad($studentNum, 7, '0', STR_PAD_LEFT),
                    'occupation' => 'Housewife',
                    'home_address' => 'Dhaka, Bangladesh',
                    'status' => 'active',
                ]);
            }
        }

        // Create Fee Types
        $feeTypes = [
            ['name' => 'Tuition Fee', 'code' => 'TUITION', 'description' => 'Monthly tuition fee', 'frequency' => 'monthly'],
            ['name' => 'Admission Fee', 'code' => 'ADMISSION', 'description' => 'One time admission fee', 'frequency' => 'one_time'],
            ['name' => 'Exam Fee', 'code' => 'EXAM', 'description' => 'Examination fee', 'frequency' => 'quarterly'],
            ['name' => 'Library Fee', 'code' => 'LIBRARY', 'description' => 'Library annual fee', 'frequency' => 'yearly'],
            ['name' => 'Sports Fee', 'code' => 'SPORTS', 'description' => 'Sports and cultural activities fee', 'frequency' => 'yearly'],
        ];

        foreach ($feeTypes as $feeType) {
            FeeType::create($feeType);
        }

        // Create Fee Structures for each class
        $tuitionFeeType = FeeType::where('name', 'Tuition Fee')->first();
        foreach ($classes as $classIndex => $class) {
            FeeStructure::create([
                'academic_year_id' => $currentYear->id,
                'class_id' => $class->id,
                'fee_type_id' => $tuitionFeeType->id,
                'amount' => 500 + ($classIndex * 100),
                'due_date' => now()->addMonth(),
                'late_fee' => 50,
                'late_fee_days' => 7,
            ]);
        }

        // Create Grade Settings
        $grades = [
            ['grade_name' => 'A+', 'min_marks' => 80, 'max_marks' => 100, 'grade_point' => 5.0, 'remarks' => 'Outstanding', 'order' => 1],
            ['grade_name' => 'A', 'min_marks' => 70, 'max_marks' => 79, 'grade_point' => 4.0, 'remarks' => 'Excellent', 'order' => 2],
            ['grade_name' => 'A-', 'min_marks' => 60, 'max_marks' => 69, 'grade_point' => 3.5, 'remarks' => 'Very Good', 'order' => 3],
            ['grade_name' => 'B', 'min_marks' => 50, 'max_marks' => 59, 'grade_point' => 3.0, 'remarks' => 'Good', 'order' => 4],
            ['grade_name' => 'C', 'min_marks' => 40, 'max_marks' => 49, 'grade_point' => 2.0, 'remarks' => 'Average', 'order' => 5],
            ['grade_name' => 'D', 'min_marks' => 33, 'max_marks' => 39, 'grade_point' => 1.0, 'remarks' => 'Pass', 'order' => 6],
            ['grade_name' => 'F', 'min_marks' => 0, 'max_marks' => 32, 'grade_point' => 0.0, 'remarks' => 'Fail', 'order' => 7],
        ];

        foreach ($grades as $grade) {
            GradeSetting::create($grade);
        }

        // Create Exam Halls
        $examHalls = [
            ['name' => 'Hall A', 'code' => 'HALL-A', 'building' => 'Main Building', 'floor' => '1st Floor', 'capacity' => 100, 'rows' => 10, 'columns' => 10],
            ['name' => 'Hall B', 'code' => 'HALL-B', 'building' => 'Main Building', 'floor' => '2nd Floor', 'capacity' => 80, 'rows' => 8, 'columns' => 10],
            ['name' => 'Hall C', 'code' => 'HALL-C', 'building' => 'New Building', 'floor' => '3rd Floor', 'capacity' => 60, 'rows' => 6, 'columns' => 10],
        ];

        foreach ($examHalls as $hall) {
            ExamHall::create($hall);
        }

        // Create School Settings
        Setting::create([
            'key' => 'school_name',
            'value' => 'Demo High School',
            'type' => 'text',
        ]);

        Setting::create([
            'key' => 'school_address',
            'value' => 'Dhaka, Bangladesh',
            'type' => 'text',
        ]);

        Setting::create([
            'key' => 'school_phone',
            'value' => '01711111111',
            'type' => 'text',
        ]);

        Setting::create([
            'key' => 'school_email',
            'value' => 'info@demoschool.com',
            'type' => 'text',
        ]);

        Setting::create([
            'key' => 'school_logo',
            'value' => null,
            'type' => 'file',
        ]);

        Setting::create([
            'key' => 'attendance_time',
            'value' => '09:00',
            'type' => 'time',
        ]);

        Setting::create([
            'key' => 'late_attendance_time',
            'value' => '09:30',
            'type' => 'time',
        ]);

        $this->command->info('Database seeded successfully!');
    }
}
