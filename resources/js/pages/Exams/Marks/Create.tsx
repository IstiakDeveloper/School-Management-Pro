import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import { Save, ArrowLeft, Download, User } from 'lucide-react';
import { Exam, SchoolClass, Subject, Student } from '@/types/exam';

interface CreateProps {
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

interface StudentMark {
    student_id: number;
    theory_marks: string;
    practical_marks: string;
    total_marks: string;
    grade: string;
    remarks: string;
}

export default function Create({ exams, classes, subjects }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [students, setStudents] = useState<Student[]>([]);
    const [formData, setFormData] = useState({
        exam_id: '',
        class_id: '',
        subject_id: '',
        marks: [] as StudentMark[],
    });

    const fetchStudents = async () => {
        if (!formData.exam_id || !formData.class_id || !formData.subject_id) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/marks/students?exam_id=${formData.exam_id}&class_id=${formData.class_id}&subject_id=${formData.subject_id}`);
            const data = await response.json();
            setStudents(data);

            setFormData(prev => ({
                ...prev,
                marks: data.map((student: Student) => {
                    const existingMark = student.marks && student.marks[0];
                    return {
                        student_id: student.id,
                        theory_marks: existingMark?.theory_marks?.toString() || '',
                        practical_marks: existingMark?.practical_marks?.toString() || '',
                        total_marks: existingMark?.total_marks?.toString() || '',
                        grade: existingMark?.grade || '',
                        remarks: existingMark?.remarks || '',
                    };
                })
            }));
        } catch (error) {
            console.error('Failed to fetch students', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [formData.exam_id, formData.class_id, formData.subject_id]);

    const handleMarkChange = (index: number, field: keyof StudentMark, value: string) => {
        const newMarks = [...formData.marks];
        newMarks[index] = { ...newMarks[index], [field]: value };

        if (field === 'theory_marks' || field === 'practical_marks') {
            const theory = parseFloat(newMarks[index].theory_marks) || 0;
            const practical = parseFloat(newMarks[index].practical_marks) || 0;
            newMarks[index].total_marks = (theory + practical).toString();
        }

        setFormData({ ...formData, marks: newMarks });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Filter out students with no marks entered
        const filledMarks = formData.marks.filter(mark =>
            mark.total_marks && parseFloat(mark.total_marks) > 0
        );

        if (filledMarks.length === 0) {
            setErrors({ marks: 'Please enter marks for at least one student' });
            setIsSubmitting(false);
            return;
        }

        router.post('/marks', { ...formData, marks: filledMarks }, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Enter Marks" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Enter Marks
                        </h1>
                        <p className="text-gray-600 mt-1">Enter marks for students</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/marks')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selection Criteria */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.exam_id}
                                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value, marks: [] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Exam</option>
                                    {exams.map(exam => (
                                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                                    ))}
                                </select>
                                {errors.exam_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.exam_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value, marks: [] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.class_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value, marks: [] })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                                {errors.subject_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Student Marks Table */}
                        {isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Loading students...</p>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roll No</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Theory Marks</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Practical Marks</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map((student, index) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <User className="w-4 h-4 text-indigo-600" />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {student.full_name || student.user?.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{student.roll_number}</td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={formData.marks[index]?.theory_marks || ''}
                                                        onChange={(e) => handleMarkChange(index, 'theory_marks', e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        min="0"
                                                        step="0.5"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={formData.marks[index]?.practical_marks || ''}
                                                        onChange={(e) => handleMarkChange(index, 'practical_marks', e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        min="0"
                                                        step="0.5"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-gray-900">
                                                        {formData.marks[index]?.total_marks || '0'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={formData.marks[index]?.grade || ''}
                                                        onChange={(e) => handleMarkChange(index, 'grade', e.target.value)}
                                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        maxLength={3}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={formData.marks[index]?.remarks || ''}
                                                        onChange={(e) => handleMarkChange(index, 'remarks', e.target.value)}
                                                        className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                                                        placeholder="Optional"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : formData.exam_id && formData.class_id && formData.subject_id ? (
                            <div className="text-center py-12 border border-gray-200 rounded-lg">
                                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No students found for the selected criteria.</p>
                            </div>
                        ) : null}

                        {errors.marks && (
                            <p className="text-red-500 text-sm mt-1">{errors.marks}</p>
                        )}

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                                disabled={students.length === 0}
                            >
                                Save Marks
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/marks')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
