import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { ArrowLeft, Save, Calendar, Users, Clock } from 'lucide-react';

interface Teacher {
    id: number;
    employee_id: string;
    user?: {
        name: string;
        email: string;
    };
    attendances?: Array<{
        status: string;
        check_in_time: string | null;
        check_out_time: string | null;
    }>;
}

interface CreateProps {
    teachers: Teacher[];
    date: string;
}

export default function Create({ teachers, date }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        date: date,
        attendances: teachers.map((teacher) => ({
            teacher_id: teacher.id,
            status: teacher.attendances && teacher.attendances.length > 0
                ? teacher.attendances[0].status
                : 'present',
            check_in_time: teacher.attendances && teacher.attendances.length > 0
                ? teacher.attendances[0].check_in_time || ''
                : '',
            check_out_time: teacher.attendances && teacher.attendances.length > 0
                ? teacher.attendances[0].check_out_time || ''
                : '',
            remarks: '',
        })),
    });

    const updateAttendance = (teacherId: number, field: string, value: string) => {
        setData(
            'attendances',
            data.attendances.map((att) =>
                att.teacher_id === teacherId ? { ...att, [field]: value } : att
            )
        );
    };

    const markAll = (status: string) => {
        setData(
            'attendances',
            data.attendances.map((att) => ({ ...att, status }))
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/teacher-attendance');
    };

    const getStatusColor = (status: string) => {
        const colors = {
            present: 'bg-green-500 hover:bg-green-600',
            absent: 'bg-red-500 hover:bg-red-600',
            late: 'bg-yellow-500 hover:bg-yellow-600',
            half_day: 'bg-blue-500 hover:bg-blue-600',
            holiday: 'bg-purple-500 hover:bg-purple-600',
            leave: 'bg-orange-500 hover:bg-orange-600',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mark Teacher Attendance" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/teacher-attendance"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Attendance
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Mark Teacher Attendance</h1>
                                <p className="text-gray-600 mt-1">Record daily attendance for teachers</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date Selection */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date</h2>
                            <div className="max-w-md">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                            </div>
                        </div>

                        {/* Teachers List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Teachers ({teachers.length})
                                </h2>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => markAll('present')}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        Mark All Present
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => markAll('absent')}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                        Mark All Absent
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => markAll('holiday')}
                                        className="bg-purple-500 hover:bg-purple-600 text-white"
                                    >
                                        Mark Holiday
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {teachers.map((teacher, index) => (
                                    <div
                                        key={teacher.id}
                                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {teacher.user?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">{teacher.employee_id}</p>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {['present', 'absent', 'late', 'half_day', 'leave', 'holiday'].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => updateAttendance(teacher.id, 'status', status)}
                                                    className={`px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all ${
                                                        data.attendances[index]?.status === status
                                                            ? getStatusColor(status)
                                                            : 'bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                                >
                                                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="time"
                                                    placeholder="Check In"
                                                    value={data.attendances[index]?.check_in_time || ''}
                                                    onChange={(e) =>
                                                        updateAttendance(teacher.id, 'check_in_time', e.target.value)
                                                    }
                                                    className="w-32 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="time"
                                                    placeholder="Check Out"
                                                    value={data.attendances[index]?.check_out_time || ''}
                                                    onChange={(e) =>
                                                        updateAttendance(teacher.id, 'check_out_time', e.target.value)
                                                    }
                                                    className="w-32 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Remarks (optional)"
                                                value={data.attendances[index]?.remarks || ''}
                                                onChange={(e) =>
                                                    updateAttendance(teacher.id, 'remarks', e.target.value)
                                                }
                                                className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-4">
                            <Link href="/teacher-attendance">
                                <Button variant="ghost">Cancel</Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                icon={<Save className="w-5 h-5" />}
                            >
                                {processing ? 'Saving...' : 'Save Attendance'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
