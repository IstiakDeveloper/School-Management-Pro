import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import {
    Plus, Calendar, Users, Trash2, Clock, UserCheck, UserX,
    RefreshCw, Download
} from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    admission_number: string;
    roll_number?: string;
    user?: { name: string; email: string } | null;
}

interface Attendance {
    id: number;
    date: string;
    status: string;
    in_time: string | null;
    out_time: string | null;
    reason: string | null;
    student: Student;
    school_class: SchoolClass;
    section: Section;
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
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: { date: string; class_id?: string; section_id?: string; status?: string };
    stats: { total: number; present: number; absent: number; late: number; excused: number };
    classes: SchoolClass[];
    sections: Section[];
}

export default function Index({ attendances, filters, stats, classes, sections }: IndexProps) {
    const [selectedDate, setSelectedDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const applyFilters = (updates: Partial<{ date: string; class_id: string; section_id: string; status: string }> = {}) => {
        const date = updates.date ?? selectedDate;
        const classId = updates.class_id ?? selectedClass;
        const sectionId = updates.section_id ?? selectedSection;
        const status = updates.status ?? selectedStatus;
        router.get('/student-attendance', {
            date,
            class_id: classId || undefined,
            section_id: sectionId || undefined,
            status: status || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        applyFilters({ date });
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setSelectedSection('');
        applyFilters({ class_id: classId, section_id: '' });
    };

    const handleSectionChange = (sectionId: string) => {
        setSelectedSection(sectionId);
        applyFilters({ section_id: sectionId });
    };

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
        applyFilters({ status });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this attendance record?')) {
            router.delete(`/student-attendance/${id}`, { preserveScroll: true });
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            present: 'bg-green-100 text-green-800 border-green-200',
            absent: 'bg-red-100 text-red-800 border-red-200',
            late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            excused: 'bg-blue-100 text-blue-800 border-blue-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <UserCheck className="h-3.5 w-3.5" />;
            case 'absent': return <UserX className="h-3.5 w-3.5" />;
            default: return <Clock className="h-3.5 w-3.5" />;
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return '—';
        try {
            return new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return time;
        }
    };

    const calcHours = (inTime: string | null, outTime: string | null) => {
        if (!inTime || !outTime) return '—';
        try {
            const d = new Date(outTime).getTime() - new Date(inTime).getTime();
            const h = Math.floor(d / (1000 * 60 * 60));
            const m = Math.floor((d % (1000 * 60 * 60)) / (1000 * 60));
            return `${h}h ${m}m`;
        } catch {
            return '—';
        }
    };

    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id.toString() === selectedClass)
        : sections;

    const data = attendances.data;

    return (
        <AuthenticatedLayout>
            <Head title="Student Attendance" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Student Attendance</h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">View and mark student attendance</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/student-attendance/calendar">
                            <Button variant="outline" size="sm" icon={<Calendar className="w-4 h-4" />}>Calendar</Button>
                        </Link>
                        <Link href={`/student-attendance/create?date=${selectedDate}${selectedClass ? `&class_id=${selectedClass}` : ''}${selectedSection ? `&section_id=${selectedSection}` : ''}`}>
                            <Button size="sm" icon={<Plus className="w-4 h-4" />}>Mark Attendance</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                        { label: 'Total', value: stats.total, icon: Users, color: 'text-gray-700 bg-gray-100' },
                        { label: 'Present', value: stats.present, icon: UserCheck, color: 'text-green-700 bg-green-50' },
                        { label: 'Absent', value: stats.absent, icon: UserX, color: 'text-red-700 bg-red-50' },
                        { label: 'Late', value: stats.late, icon: Clock, color: 'text-amber-700 bg-amber-50' },
                        { label: 'Excused', value: stats.excused, icon: Calendar, color: 'text-purple-700 bg-purple-50' },
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

                <div className="bg-white rounded-lg border border-emerald-100 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                            <select
                                value={selectedClass}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-32 focus:ring-1 focus:ring-gray-400"
                            >
                                <option value="">All</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Section</label>
                            <select
                                value={selectedSection}
                                onChange={(e) => handleSectionChange(e.target.value)}
                                disabled={!selectedClass}
                                className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-28 focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100"
                            >
                                <option value="">All</option>
                                {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-28 focus:ring-1 focus:ring-gray-400"
                            >
                                <option value="">All</option>
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                                <option value="late">Late</option>
                                <option value="excused">Excused</option>
                            </select>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleDateChange(new Date().toISOString().split('T')[0])}
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => applyFilters()}
                                className="text-xs px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" /> Refresh
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 ml-auto self-center">
                            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-emerald-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                            {data.length > 0 ? `${data.length} record${data.length !== 1 ? 's' : ''}` : 'No records'}
                        </span>
                        <Link href="/student-attendance/report" className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" /> Report
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">In</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Out</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((att) => {
                                    const name = att.student?.user?.name ?? att.student?.admission_number ?? '—';
                                    const initial = (att.student?.user?.name?.charAt(0) ?? att.student?.admission_number?.charAt(0) ?? '?').toUpperCase();
                                    return (
                                        <tr key={att.id} className="hover:bg-gray-50/80">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{name}</p>
                                                        <p className="text-xs text-gray-500">Adm: {att.student?.admission_number ?? '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {att.school_class?.name} / {att.section?.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(att.status)}`}>
                                                    {getStatusIcon(att.status)}
                                                    <span className="capitalize">{att.status}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{formatTime(att.in_time)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-700">{formatTime(att.out_time)}</td>
                                            <td className="px-4 py-3"><span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{calcHours(att.in_time, att.out_time)}</span></td>
                                            <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">{att.reason || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(att.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center">
                                            <p className="text-sm text-gray-500 mb-3">No records for this date.</p>
                                            <Link href={`/student-attendance/create?date=${selectedDate}${selectedClass ? `&class_id=${selectedClass}` : ''}${selectedSection ? `&section_id=${selectedSection}` : ''}`}>
                                                <Button size="sm" icon={<Plus className="w-4 h-4" />}>Mark attendance</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={attendances.links}
                        from={attendances.from}
                        to={attendances.to}
                        total={attendances.total}
                        lastPage={attendances.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
