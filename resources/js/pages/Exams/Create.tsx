import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { AcademicYear, SchoolClass } from '@/types/exam';

interface CreateProps {
    academicYears: AcademicYear[];
    classes: SchoolClass[];
}

export default function Create({ academicYears, classes }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        academic_year_id: '',
        name: '',
        exam_type: '',
        start_date: '',
        end_date: '',
        result_publish_date: '',
        status: 'upcoming',
        description: '',
        classes: [] as number[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/exams', formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleClassToggle = (classId: number) => {
        setFormData(prev => ({
            ...prev,
            classes: prev.classes.includes(classId)
                ? prev.classes.filter(id => id !== classId)
                : [...prev.classes, classId]
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Exam" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Create Exam
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new exam to the system</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/exams')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back to Exams
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Academic Year <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.academic_year_id}
                                    onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map(year => (
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                    ))}
                                </select>
                                {errors.academic_year_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.academic_year_id}</p>
                                )}
                            </div>

                            <Input
                                label="Exam Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="e.g., First Terminal Examination 2024"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.exam_type}
                                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Exam Type</option>
                                    <option value="first_term">First Term</option>
                                    <option value="mid_term">Mid Term</option>
                                    <option value="final">Final</option>
                                    <option value="test">Test</option>
                                    <option value="practical">Practical</option>
                                </select>
                                {errors.exam_type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.exam_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                )}
                            </div>

                            <Input
                                label="Start Date"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                error={errors.start_date}
                                required
                            />

                            <Input
                                label="End Date"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                error={errors.end_date}
                                required
                            />

                            <Input
                                label="Result Publish Date"
                                type="date"
                                value={formData.result_publish_date}
                                onChange={(e) => setFormData({ ...formData, result_publish_date: e.target.value })}
                                error={errors.result_publish_date}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter exam description or special instructions..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Applicable Classes
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {classes.map(cls => (
                                    <label
                                        key={cls.id}
                                        className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.classes.includes(cls.id)}
                                            onChange={() => handleClassToggle(cls.id)}
                                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{cls.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.classes && (
                                <p className="text-red-500 text-sm mt-1">{errors.classes}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                            >
                                Create Exam
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/exams')}
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
