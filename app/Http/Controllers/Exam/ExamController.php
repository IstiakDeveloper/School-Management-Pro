<?php

namespace App\Http\Controllers\Exam;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('manage_exams');

        $exams = Exam::with(['academicYear', 'classes'])
            ->when($request->academic_year_id, fn($q) => $q->where('academic_year_id', $request->academic_year_id))
            ->when($request->exam_type, fn($q) => $q->where('exam_type', $request->exam_type))
            ->latest()
            ->paginate(20);

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'filters' => $request->only(['academic_year_id', 'exam_type']),
            'academicYears' => AcademicYear::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('manage_exams');

        return Inertia::render('Exams/Create', [
            'academicYears' => AcademicYear::where('status', 'active')->get(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'exam_type' => 'required|in:first_term,mid_term,final,test,practical',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'result_publish_date' => 'nullable|date|after_or_equal:end_date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'description' => 'nullable|string',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        $exam = Exam::create($validated);

        if (!empty($validated['classes'])) {
            $exam->classes()->sync($validated['classes']);
        }

        logActivity('create', "Created exam: {$exam->name}", Exam::class, $exam->id);

        return redirect()->route('exams.index')
            ->with('success', 'Exam created successfully');
    }

    public function show(Exam $exam)
    {
        $this->authorize('manage_exams');

        $exam->load(['academicYear', 'classes', 'schedules.subject', 'schedules.schoolClass']);

        return Inertia::render('Exams/Show', [
            'exam' => $exam,
        ]);
    }

    public function edit(Exam $exam)
    {
        $this->authorize('manage_exams');

        $exam->load('classes');

        return Inertia::render('Exams/Edit', [
            'exam' => $exam,
            'academicYears' => AcademicYear::all(),
            'classes' => SchoolClass::where('status', 'active')->get(),
        ]);
    }

    public function update(Request $request, Exam $exam)
    {
        $this->authorize('manage_exams');

        $validated = $request->validate([
            'academic_year_id' => 'required|exists:academic_years,id',
            'name' => 'required|string|max:255',
            'exam_type' => 'required|in:first_term,mid_term,final,test,practical',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'result_publish_date' => 'nullable|date|after_or_equal:end_date',
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
            'description' => 'nullable|string',
            'classes' => 'array',
            'classes.*' => 'exists:classes,id',
        ]);

        $exam->update($validated);
        $exam->classes()->sync($validated['classes'] ?? []);

        logActivity('update', "Updated exam: {$exam->name}", Exam::class, $exam->id);

        return redirect()->route('exams.index')
            ->with('success', 'Exam updated successfully');
    }

    public function destroy(Exam $exam)
    {
        $this->authorize('manage_exams');

        if ($exam->marks()->count() > 0) {
            return back()->with('error', 'Cannot delete exam with recorded marks');
        }

        $examName = $exam->name;
        $exam->delete();

        logActivity('delete', "Deleted exam: {$examName}", Exam::class, $exam->id);

        return redirect()->route('exams.index')
            ->with('success', 'Exam deleted successfully');
    }
}
