import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Plus, Calendar, Users, Search, Filter, Trash2, Clock, UserCheck, UserX, RefreshCw, Download, ChevronRight } from 'lucide-react';

interface Teacher {
    id: number;
    employee_id: string;
    user?: {
        name: string;
        email: string;
    };
    designation?: string;
    department?: string;
}

interface Attendance {
    id: number;
    date: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    remarks: string | null;
    reason: string | null;
    teacher: Teacher;
    created_at: string;
}

interface IndexProps {
    attendances: {
        data: Attendance[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        date: string;
        status?: string;
    };
    stats: {
        total: number;
        present: number;
        absent: number;
        late: number;
        leave: number;
    };
}

export default function Index({ attendances, filters, stats }: IndexProps) {
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        router.get('/teacher-attendance',
            { date, status: selectedStatus || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        router.get('/teacher-attendance',
            { date: selectedDate, status: status || undefined },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this attendance record?')) {
            router.delete(`/teacher-attendance/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            present: 'bg-green-100 text-green-800 border-green-200',
            absent: 'bg-red-100 text-red-800 border-red-200',
            late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            half_day: 'bg-blue-100 text-blue-800 border-blue-200',
            holiday: 'bg-purple-100 text-purple-800 border-purple-200',
            leave: 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <UserCheck className="h-4 w-4" />;
            case 'absent':
                return <UserX className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return '---';
        try {
            const date = new Date(time);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            // If time is already formatted, return as is
            return time;
        }
    };

    const calculateWorkingHours = (inTime: string | null, outTime: string | null) => {
        if (!inTime || !outTime) return '---';
        try {
            const start = new Date(inTime);
            const end = new Date(outTime);
            const diff = end.getTime() - start.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}h ${minutes}m`;
        } catch {
            return '---';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Teacher Attendance" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Teacher Attendance Management
                        </h1>
                        <p className="text-gray-600 mt-1">Track and monitor teacher attendance in real-time</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/teacher-attendance/calendar">
                            <Button variant="outline" icon={<Calendar className="w-5 h-5" />}>
                                Calendar View
                            </Button>
                        </Link>
                        <Link href={`/teacher-attendance/create?date=${selectedDate}`}>
                            <Button icon={<Plus className="w-5 h-5" />}>
                                Mark Attendance
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Teachers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Present</p>
                                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <UserX className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Absent</p>
                                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Late</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">On Leave</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.leave}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date & Filter Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <Filter className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Select Date & Filter</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Choose a date to view attendance records</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="inline h-4 w-4 mr-1 text-blue-600" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {new Date(selectedDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Filter className="inline h-4 w-4 mr-1 text-blue-600" />
                                    Filter by Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                    <option value="">All Status</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="half_day">Half Day</option>
                                    <option value="leave">Leave</option>
                                    <option value="holiday">Holiday</option>
                                </select>
                            </div>

                            {/* Quick Actions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quick Actions
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                        <Calendar className="h-4 w-4 mr-1" />
                                        Today
                                    </button>
                                    <button
                                        onClick={() => handleDateChange(selectedDate)}
                                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1" />
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {attendances.data.length > 0
                                        ? `Showing ${attendances.data.length} teacher${attendances.data.length !== 1 ? 's' : ''}`
                                        : 'No records found'
                                    }
                                </p>
                            </div>
                            <Link href="/teacher-attendance/report">
                                <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                                    View Report
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Teacher Information
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Employee ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Check In Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Check Out Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Working Hours
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Remarks
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {attendances.data.length > 0 ? (
                                    attendances.data.map((attendance) => (
                                        <tr key={attendance.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-11 w-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                                                        <span className="text-white font-semibold text-sm">
                                                            {attendance.teacher.user?.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {attendance.teacher.user?.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {attendance.teacher.user?.email}
                                                        </p>
                                                        {attendance.teacher.designation && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {attendance.teacher.designation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                                                    {attendance.teacher.employee_id || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadge(attendance.status)}`}>
                                                    {getStatusIcon(attendance.status)}
                                                    <span className="ml-1.5 capitalize">
                                                        {attendance.status.replace('_', ' ')}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-green-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatTime(attendance.in_time)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 text-red-600 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatTime(attendance.out_time)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                    {calculateWorkingHours(attendance.in_time, attendance.out_time)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {attendance.reason || attendance.remarks || '---'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(attendance.id)}
                                                    className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete attendance"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-100 rounded-full mb-4">
                                                    <Calendar className="h-12 w-12 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    No Attendance Records Found
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-6 max-w-md">
                                                    There are no attendance records for {new Date(selectedDate).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}. Click below to mark attendance.
                                                </p>
                                                <Link href={`/teacher-attendance/create?date=${selectedDate}`}>
                                                    <Button icon={<Plus className="w-5 h-5" />}>
                                                        Mark Attendance for this Date
                                                        <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {attendances.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-semibold text-gray-900">{attendances.from}</span> to{' '}
                                <span className="font-semibold text-gray-900">{attendances.to}</span> of{' '}
                                <span className="font-semibold text-gray-900">{attendances.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                {attendances.links.map((link, index) => (
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveState
                                            preserveScroll
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                link.active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
