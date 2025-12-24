import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface AttendanceRecord {
    id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'half_day';
    check_in_time: string | null;
    check_out_time: string | null;
    remarks: string | null;
}

interface Teacher {
    full_name: string;
    employee_id: string;
    designation: string;
}

interface Summary {
    present: number;
    absent: number;
    late: number;
    half_day: number;
    total_days: number;
}

interface Props {
    teacher: Teacher;
    month: number;
    year: number;
    attendanceRecords: AttendanceRecord[];
    summary: Summary;
    yearlySummary: Summary;
}

export default function MyAttendance({ teacher, month, year, attendanceRecords, summary, yearlySummary }: Props) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[month - 1];

    const attendancePercentage = summary.total_days > 0
        ? Math.round((summary.present / summary.total_days) * 100)
        : 0;
    const getStatusBadge = (status: string) => {
        const badges = {
            'present': 'bg-green-100 text-green-800',
            'absent': 'bg-red-100 text-red-800',
            'late': 'bg-yellow-100 text-yellow-800',
            'leave': 'bg-blue-100 text-blue-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'absent':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'late':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            default:
                return <Calendar className="h-5 w-5 text-blue-600" />;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    My Attendance Record
                </h2>
            }
        >
            <Head title="My Attendance" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Days</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_days}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-gray-400" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg overflow-hidden border border-green-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700">Present</p>
                                    <p className="text-2xl font-bold text-green-900">{summary.present}</p>
                                </div>
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-lg overflow-hidden border border-red-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-red-700">Absent</p>
                                    <p className="text-2xl font-bold text-red-900">{summary.absent}</p>
                                </div>
                                <XCircle className="h-10 w-10 text-red-600" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-lg overflow-hidden border border-yellow-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-yellow-700">Late</p>
                                    <p className="text-2xl font-bold text-yellow-900">{summary.late}</p>
                                </div>
                                <Clock className="h-10 w-10 text-yellow-600" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-blue-200 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700">Attendance %</p>
                                    <p className="text-2xl font-bold text-blue-900">{attendancePercentage}%</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Attendance Records */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Attendance History - {currentMonth} {year}
                            </h3>
                        </div>
                        <div className="p-6">
                            {attendanceRecords.length > 0 ? (
                                <div className="space-y-3">
                                    {attendanceRecords.map((record) => (
                                        <div
                                            key={record.id}
                                            className="p-4 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-r from-white to-blue-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {getStatusIcon(record.status)}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{record.date}</p>
                                                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                                                            {record.check_in_time && (
                                                                <span>In: {record.check_in_time}</span>
                                                            )}
                                                            {record.check_out_time && (
                                                                <span>Out: {record.check_out_time}</span>
                                                            )}
                                                        </div>
                                                        {record.remarks && (
                                                            <p className="text-xs text-gray-500 mt-1">{record.remarks}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}
                                                >
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No attendance records found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
