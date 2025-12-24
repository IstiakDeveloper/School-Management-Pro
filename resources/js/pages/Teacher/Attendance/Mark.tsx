import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Clock, Calendar, ArrowLeft, Search } from 'lucide-react';

interface Student {
    id: number;
    full_name: string;
    roll_number: string;
    photo: string | null;
    attendance_status: string;
    remarks: string | null;
}

interface Section {
    id: number;
    name: string;
    class_name: string;
}

interface Props {
    section: Section;
    date: string;
    students: Student[];
}

export default function Mark({ section, date, students }: Props) {
    const [selectedDate, setSelectedDate] = useState(date);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        router.get('/teacher/attendance/mark', {
            section_id: section.id,
            date: newDate
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            present: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'Present'
            },
            absent: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                label: 'Absent'
            },
            late: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: Clock,
                label: 'Late'
            },
            half_day: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: Calendar,
                label: 'Half Day'
            },
        };

        const variant = variants[status] || variants.present;
        const Icon = variant.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border ${variant.color}`}>
                <Icon className="mr-1 h-4 w-4" />
                {variant.label}
            </span>
        );
    };

    // Filter students based on search term
    const filteredStudents = students.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const summary = {
        present: students.filter(s => s.attendance_status === 'present').length,
        absent: students.filter(s => s.attendance_status === 'absent').length,
        late: students.filter(s => s.attendance_status === 'late').length,
        half_day: students.filter(s => s.attendance_status === 'half_day').length,
    };

    return (
        <AuthenticatedLayout>
            <Head title="View Attendance" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Records</h2>
                                    <p className="text-sm text-gray-600">
                                        Class {section.class_name} - Section {section.name}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-white border border-green-200 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Present</p>
                            <p className="text-3xl font-bold text-green-600">{summary.present}</p>
                        </div>
                        <div className="p-4 bg-white border border-red-200 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Absent</p>
                            <p className="text-3xl font-bold text-red-600">{summary.absent}</p>
                        </div>
                        <div className="p-4 bg-white border border-yellow-200 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Late</p>
                            <p className="text-3xl font-bold text-yellow-600">{summary.late}</p>
                        </div>
                        <div className="p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                            <p className="text-sm text-gray-600 mb-1">Half Day</p>
                            <p className="text-3xl font-bold text-blue-600">{summary.half_day}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search by name or roll number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            />
                        </div>
                    </div>

                    {/* Attendance List */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Student Attendance ({filteredStudents.length} of {students.length})
                            </h3>
                        </div>

                        <div className="p-6 space-y-4">
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No students found matching your search.
                                </div>
                            ) : (
                                filteredStudents.map((student) => (
                                    <div key={student.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                {student.photo ? (
                                                    <img
                                                        src={`/storage/${student.photo}`}
                                                        alt={student.full_name}
                                                        className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                                        {student.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{student.full_name}</h4>
                                                        <p className="text-sm text-gray-600">Roll: {student.roll_number}</p>
                                                    </div>
                                                    <div>
                                                        {getStatusBadge(student.attendance_status || 'absent')}
                                                    </div>
                                                </div>
                                                {student.remarks && (
                                                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                        <p className="text-xs font-medium text-gray-700 mb-1">Remarks:</p>
                                                        <p className="text-sm text-gray-600">{student.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
