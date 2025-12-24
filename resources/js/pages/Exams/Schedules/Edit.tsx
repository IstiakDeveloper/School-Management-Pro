import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { ExamSchedule, Exam, SchoolClass, Subject } from '@/types/exam';

interface EditProps {
    schedule: ExamSchedule;
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

export default function Edit({ schedule, exams, classes, subjects }: EditProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        exam_id: schedule.exam_id.toString(),
        class_id: schedule.class_id.toString(),
        subject_id: schedule.subject_id.toString(),
        date: schedule.exam_date || '',
        start_time: schedule.start_time ? schedule.start_time.substring(0, 5) : '',
        end_time: schedule.end_time ? schedule.end_time.substring(0, 5) : '',
        room_number: schedule.room_number || '',
        instructions: schedule.instructions || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.put(`/exam-schedules/${schedule.id}`, formData, {
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
            <Head title="Edit Exam Schedule" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Edit Exam Schedule
                        </h1>
                        <p className="text-gray-600 mt-1">Update exam schedule information</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/exam-schedules')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exam <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.exam_id}
                                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
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

                            <Input
                                label="Date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                error={errors.date}
                                required
                            />

                            <Input
                                label="Start Time"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                error={errors.start_time}
                                required
                            />

                            <Input
                                label="End Time"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                error={errors.end_time}
                                required
                            />

                            <Input
                                label="Room Number"
                                value={formData.room_number}
                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                error={errors.room_number}
                                placeholder="e.g., Room 101"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instructions
                            </label>
                            <textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Enter special instructions for this exam..."
                            />
                            {errors.instructions && (
                                <p className="text-red-500 text-sm mt-1">{errors.instructions}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                            >
                                Update Schedule
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/exam-schedules')}
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
