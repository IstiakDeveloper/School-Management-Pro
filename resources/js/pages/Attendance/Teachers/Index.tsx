import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Plus, Calendar, Users, Trash2, Clock, UserCheck, UserX, RefreshCw, Download } from 'lucide-react';

interface Teacher {
    id: number;
    employee_id: string;
    user?: {
        name: string;
        email: string;
    } | null;
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
    teacher: Teacher | null;
    created_at: string;
}

interface DeviceSettingInfo {
    device_name: string;
    device_ip: string;
    last_sync_at: string | null;
}

interface TeacherNotMarked {
    id: number;
    name: string;
    employee_id: string | null;
    designation: string | null;
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
    teachersNotMarked?: TeacherNotMarked[];
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
        early_leave?: number;
    };
    deviceSetting?: DeviceSettingInfo | null;
}

export default function Index({ attendances, teachersNotMarked = [], filters, stats, deviceSetting }: IndexProps) {
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
        const badges: Record<string, string> = {
            present: 'bg-green-100 text-green-800 border-green-200',
            absent: 'bg-red-100 text-red-800 border-red-200',
            late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            early_leave: 'bg-amber-100 text-amber-800 border-amber-200',
            half_day: 'bg-blue-100 text-blue-800 border-blue-200',
            holiday: 'bg-purple-100 text-purple-800 border-purple-200',
            leave: 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <UserCheck className="h-4 w-4" />;
            case 'absent':
                return <UserX className="h-4 w-4" />;
            case 'late':
            case 'early_leave':
                return <Clock className="h-4 w-4" />;
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
                        <h1 className="text-xl font-semibold text-gray-900">Teacher Attendance</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">View and manage daily attendance records</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {deviceSetting && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded border border-emerald-100">
                                <span className="font-medium text-gray-600">Device:</span>
                                <span>{deviceSetting.device_name || 'N/A'}</span>
                                {deviceSetting.device_ip && <span className="text-gray-400">({deviceSetting.device_ip})</span>}
                                {deviceSetting.last_sync_at && (
                                    <span className="text-gray-400">· Last sync: {new Date(deviceSetting.last_sync_at).toLocaleString()}</span>
                                )}
                            </div>
                        )}
                        <Link href="/teacher-attendance/calendar">
                            <Button variant="outline" size="sm" icon={<Calendar className="w-4 h-4" />}>
                                Calendar
                            </Button>
                        </Link>
                        <Link href={`/teacher-attendance/create?date=${selectedDate}`}>
                            <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                Mark Attendance
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats - compact */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, color: 'text-gray-700 bg-gray-100' },
                        { label: 'Present', value: stats.present, icon: UserCheck, color: 'text-green-700 bg-green-50' },
                        { label: 'Absent', value: stats.absent, icon: UserX, color: 'text-red-700 bg-red-50' },
                        { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-700 bg-amber-50' },
                        { label: 'Early leave', value: stats.early_leave ?? 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
                        { label: 'Leave', value: stats.leave, icon: Calendar, color: 'text-orange-700 bg-orange-50' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-lg border border-emerald-100 px-4 py-3 flex items-center gap-3">
                            <div className={`p-1.5 rounded ${color}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className="text-sm font-semibold text-gray-900">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Date & Filter - minimal */}
                <div className="bg-white rounded-lg border border-emerald-100 p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="text-sm w-full max-w-[160px] px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="text-sm w-full max-w-[140px] px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            >
                                <option value="">All</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="early_leave">Early leave</option>
                                <option value="half_day">Half Day</option>
                                <option value="leave">Leave</option>
                                <option value="holiday">Holiday</option>
                            </select>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDateChange(selectedDate)}
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 inline-flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 ml-auto self-center">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            {attendances.data.length > 0
                                ? `${attendances.data.length} record${attendances.data.length !== 1 ? 's' : ''}`
                                : 'No records'
                            }
                        </span>
                        <Link href="/teacher-attendance/report" className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> Report
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">In</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Out</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {attendances.data.length > 0 ? (
                                    attendances.data.map((attendance) => {
                                        const teacher = attendance.teacher;
                                        const displayName = teacher?.user?.name ?? (teacher?.employee_id ? `Employee ${teacher.employee_id}` : 'Deleted teacher');
                                        const initial = (teacher?.user?.name?.charAt(0) ?? teacher?.employee_id?.charAt(0) ?? '?').toUpperCase();
                                        return (
                                        <tr key={attendance.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 h-9 w-9 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <span className="text-gray-600 text-xs font-medium">
                                                            {initial}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-900 font-medium">
                                                            {displayName}
                                                        </p>
                                                        {teacher?.user?.email && (
                                                            <p className="text-xs text-gray-500">
                                                                {teacher.user.email}
                                                            </p>
                                                        )}
                                                        {teacher?.designation && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {teacher.designation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {teacher?.employee_id ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(attendance.status)}`}>
                                                    {getStatusIcon(attendance.status)}
                                                    <span className="capitalize">{attendance.status.replace('_', ' ')}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                                                {formatTime(attendance.in_time)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
                                                {formatTime(attendance.out_time)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {calculateWorkingHours(attendance.in_time, attendance.out_time)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                                                {attendance.reason || attendance.remarks || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(attendance.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete attendance"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center">
                                            <p className="text-sm text-gray-500 mb-3">No records for this date.</p>
                                            <Link href={`/teacher-attendance/create?date=${selectedDate}`}>
                                                <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                                                    Mark attendance
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Teachers not marked for this date (e.g. Jannatul Ferdous - no device punch or no employee_id) */}
                {teachersNotMarked.length > 0 && (
                    <div className="bg-amber-50/80 rounded-lg border border-amber-200 overflow-hidden">
                        <div className="px-4 py-3 border-b border-amber-200 flex items-center justify-between">
                            <span className="text-sm font-medium text-amber-800">
                                Not marked for this date ({teachersNotMarked.length} teacher{teachersNotMarked.length !== 1 ? 's' : ''})
                            </span>
                            <Link
                                href={`/teacher-attendance/create?date=${selectedDate}`}
                                className="text-xs font-medium text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                            >
                                <Plus className="w-3.5 h-3.5" /> Mark attendance
                            </Link>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-amber-800/90 mb-3">
                                These teachers have no attendance record today. They may not have punched on the device, or their Employee ID may not be set in the system. Mark manually if needed.
                            </p>
                            <ul className="flex flex-wrap gap-2">
                                {teachersNotMarked.map((t) => (
                                    <li
                                        key={t.id}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-amber-200 text-sm text-gray-700"
                                    >
                                        <Users className="w-4 h-4 text-amber-600" />
                                        <span className="font-medium">{t.name}</span>
                                        {t.employee_id && (
                                            <span className="text-xs text-gray-500 font-mono">({t.employee_id})</span>
                                        )}
                                        {!t.employee_id && (
                                            <span className="text-xs text-amber-600" title="Set Employee ID in Teacher profile for device sync">No device ID</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {attendances.last_page > 1 && (
                    <div className="bg-white rounded-lg border border-emerald-100 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            {attendances.from}–{attendances.to} of {attendances.total}
                        </span>
                        <div className="flex gap-1">
                            {attendances.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveState
                                        preserveScroll
                                        className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                                            link.active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 text-xs text-gray-400 border border-emerald-100 rounded cursor-not-allowed"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
