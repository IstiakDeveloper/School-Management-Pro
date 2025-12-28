<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
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

        // Create Admin User
        $adminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@school.com',
            'password' => Hash::make('password'),
            'phone' => '01711111111',
            'status' => 'active',
        ]);
        $adminUser->roles()->attach($superAdmin->id);

        $this->command->info('Admin user and permissions seeded successfully!');
    }
}
