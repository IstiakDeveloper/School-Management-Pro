<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\User;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_students');

        $students = Student::with(['user', 'academicYear', 'schoolClass', 'section'])
            ->when($request->search, function($q) use ($request) {
                $q->where('admission_number', 'like', "%{$request->search}%")
                    ->orWhere('roll_number', 'like', "%{$request->search}%")
                    ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$request->search}%"));
            })
            ->when($request->class_id, fn($q) => $q->where('class_id', $request->class_id))
            ->when($request->section_id, fn($q) => $q->where('section_id', $request->section_id))
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest('admission_date')
            ->paginate(20);

        return Inertia::render('Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'class_id', 'section_id', 'academic_year_id', 'status']),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('create_students');

        return Inertia::render('Students/Create', [
            'academicYears' => AcademicYear::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_students');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'admission_number' => 'required|string|unique:students',
            'roll_number' => 'required|string',
            'admission_date' => 'required|date',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'status' => 'required|in:active,inactive,graduated,transferred,dropped',
        ]);

        // Validate photo separately if uploaded
        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        }

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
                'status' => 'active',
            ]);

            $user->assignRole('Student');

            // Handle photo upload
            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('students/photos', 'public');
            }

            // Create student
            $student = Student::create([
                'user_id' => $user->id,
                'academic_year_id' => $validated['academic_year_id'],
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
                'admission_number' => $validated['admission_number'],
                'roll_number' => $validated['roll_number'],
                'admission_date' => $validated['admission_date'],
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'],
                'religion' => $validated['religion'],
                'nationality' => $validated['nationality'],
                'present_address' => $validated['present_address'],
                'permanent_address' => $validated['permanent_address'],
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            DB::commit();

            logActivity('create', "Created student: {$user->name}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student created successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('error', 'Failed to create student: ' . $e->getMessage());
        }
    }

    public function show(Student $student)
    {
        $this->authorize('view_students');

        $student->load([
            'user',
            'academicYear',
            'schoolClass',
            'section',
            'parents.user',
            'documents',
            'attendance' => fn($q) => $q->latest()->limit(30),
            'feeCollections',
        ]);

        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    public function edit(Student $student)
    {
        $this->authorize('edit_students');

        $student->load(['user', 'schoolClass', 'section']);

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'academicYears' => AcademicYear::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
            'sections' => Section::where('class_id', $student->class_id)->get(),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $this->authorize('edit_students');

        \Log::info('=== STUDENT UPDATE START ===');
        \Log::info('Student ID: ' . $student->id);
        \Log::info('Request Data:', $request->all());
        \Log::info('Has Photo File: ' . ($request->hasFile('photo') ? 'YES' : 'NO'));

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'class_id' => 'required|exists:classes,id',
            'section_id' => 'required|exists:sections,id',
            'admission_number' => 'required|string|unique:students,admission_number,' . $student->id,
            'roll_number' => 'required|string',
            'admission_date' => 'required|date',
            'name' => 'required|string|max:255',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'first_name_bengali' => 'nullable|string|max:100',
            'last_name_bengali' => 'nullable|string|max:100',
            'email' => 'required|email|unique:users,email,' . $student->user_id,
            'phone' => 'nullable|string|max:20',
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'blood_group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'birth_certificate_no' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:100',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'father_name' => 'nullable|string|max:100',
            'father_phone' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:100',
            'mother_phone' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_phone' => 'nullable|string|max:20',
            'guardian_relation' => 'nullable|in:father,mother,uncle,aunt,grandfather,grandmother,other',
            'previous_school' => 'nullable|string|max:255',
            'previous_class' => 'nullable|string|max:50',
            'previous_exam_result' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'allergies' => 'nullable|string',
            'special_notes' => 'nullable|string',
            'status' => 'required|in:active,inactive,graduated,transferred,dropped',
        ]);

        // Validate photo separately if uploaded
        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        }

        DB::beginTransaction();
        try {
            // Update user
            $student->user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            \Log::info('User updated successfully');

            // Handle photo upload
            $photoPath = $student->photo; // Keep existing photo
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($student->photo && \Storage::disk('public')->exists($student->photo)) {
                    \Storage::disk('public')->delete($student->photo);
                }
                $photoPath = $request->file('photo')->store('students/photos', 'public');
                \Log::info('Photo uploaded: ' . $photoPath);
            }

            // Update student
            $updated = $student->update([
                'academic_year_id' => $validated['academic_year_id'],
                'class_id' => $validated['class_id'],
                'section_id' => $validated['section_id'],
                'admission_number' => $validated['admission_number'],
                'roll_number' => $validated['roll_number'],
                'admission_date' => $validated['admission_date'],
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'first_name_bengali' => $validated['first_name_bengali'] ?? null,
                'last_name_bengali' => $validated['last_name_bengali'] ?? null,
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'blood_group' => $validated['blood_group'] ?? null,
                'birth_certificate_no' => $validated['birth_certificate_no'] ?? null,
                'religion' => $validated['religion'] ?? null,
                'nationality' => $validated['nationality'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'],
                'present_address' => $validated['present_address'] ?? null,
                'permanent_address' => $validated['permanent_address'] ?? null,
                'city' => $validated['city'] ?? null,
                'state' => $validated['state'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'father_name' => $validated['father_name'] ?? null,
                'father_phone' => $validated['father_phone'] ?? null,
                'mother_name' => $validated['mother_name'] ?? null,
                'mother_phone' => $validated['mother_phone'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_phone' => $validated['guardian_phone'] ?? null,
                'guardian_relation' => $validated['guardian_relation'] ?? null,
                'previous_school' => $validated['previous_school'] ?? null,
                'previous_class' => $validated['previous_class'] ?? null,
                'previous_exam_result' => $validated['previous_exam_result'] ?? null,
                'medical_conditions' => $validated['medical_conditions'] ?? null,
                'allergies' => $validated['allergies'] ?? null,
                'special_notes' => $validated['special_notes'] ?? null,
                'photo' => $photoPath,
                'status' => $validated['status'],
            ]);

            \Log::info('Student update result: ' . ($updated ? 'SUCCESS' : 'FAILED'));
            \Log::info('Updated student data:', $student->fresh()->toArray());

            DB::commit();

            \Log::info('=== STUDENT UPDATE COMPLETED ===');

            logActivity('update', "Updated student: {$student->user->name}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student updated successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('=== STUDENT UPDATE FAILED ===');
            \Log::error('Error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->withInput()->with('error', 'Failed to update student: ' . $e->getMessage());
        }
    }

    public function destroy(Student $student)
    {
        $this->authorize('delete_students');

        DB::beginTransaction();
        try {
            $studentName = $student->user->name;
            $userId = $student->user_id;

            $student->delete();
            User::find($userId)?->delete();

            DB::commit();

            logActivity('delete', "Deleted student: {$studentName}", Student::class, $student->id);

            return redirect()->route('students.index')
                ->with('success', 'Student deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to delete student: ' . $e->getMessage());
        }
    }

    public function getSections($classId)
    {
        $sections = Section::where('class_id', $classId)
            ->where('status', 'active')
            ->get();

        return response()->json($sections);
    }
}
