import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, List, Search, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-react';
import Button from '@/Components/Button';

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
    name: string;
    admission_number: string;
    roll_number?: string;
    class_name: string;
    section_name: string;
    attendance: Record<number, { status: string | null; in_time: string | null; out_time: string | null }>;
    present_count: number;
}

interface Props {
    students: Student[];
    year: number;
    month: number;
    daysInMonth: number;
    classes: SchoolClass[];
    sections: Section[];
    filters: {
        class_id?: string;
        section_id?: string;
        search?: string;
    };
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar({ students, year, month, daysInMonth, classes, sections, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id || '');
    const [selectedSection, setSelectedSection] = useState(filters.section_id || '');

    const handlePrint = () => {
        window.print();
    };

    const handlePrevMonth = () => {
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        router.get('/student-attendance/calendar', {
            year: newYear,
            month: newMonth,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const handleNextMonth = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        router.get('/student-attendance/calendar', {
            year: newYear,
            month: newMonth,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const handleApplyFilters = () => {
        router.get('/student-attendance/calendar', {
            year,
            month,
            class_id: selectedClass || undefined,
            section_id: selectedSection || undefined,
            search
        });
    };

    const filteredSections = selectedClass
        ? sections.filter(s => s.class_id.toString() === selectedClass)
        : sections;

    const getStatusBadge = (status: string | null) => {
        const badges = {
            present: { bg: 'bg-green-100', text: 'text-green-800', label: 'P' },
            absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'A' },
            late: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'L' },
            excused: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'E' },
            holiday: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'H' },
            weekend: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'W' },
        };

        if (!status) {
            return <span className="text-gray-400 font-medium">-</span>;
        }

        const badge = badges[status as keyof typeof badges] || badges.absent;
        return (
            <div className={`${badge.bg} ${badge.text} w-full h-full flex items-center justify-center font-semibold text-[10px] rounded`}>
                {badge.label}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Student Attendance Calendar">
                <style>{`
                    @media print {
                        @page {
                            size: landscape;
                            margin: 0.3cm;
                        }
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print\\:hidden {
                            display: none !important;
                        }
                        .space-y-6 {
                            gap: 0 !important;
                            margin: 0 !important;
                        }
                        h1, h2, h3, p {
                            display: none !important;
                        }
                        .bg-white {
                            box-shadow: none !important;
                            border: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .rounded-xl {
                            border-radius: 0 !important;
                        }
                        table {
                            width: 100% !important;
                            font-size: 7px !important;
                            margin: 0 !important;
                            page-break-inside: avoid !important;
                        }
                        thead th {
                            padding: 2px 1px !important;
                            font-size: 7px !important;
                            font-weight: 600 !important;
                        }
                        tbody td {
                            padding: 1px !important;
                            font-size: 6px !important;
                        }
                        tbody td div {
                            font-size: 6px !important;
                        }
                        tbody td div p {
                            display: block !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            line-height: 1.1 !important;
                        }
                        .sticky {
                            position: static !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                        }
                    }
                `}</style>
            </Head>

            {/* Screen View */}
            <div className="space-y-6 animate-fade-in print:hidden">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Student Attendance Calendar
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Monthly grid view of student attendance</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <Button onClick={handlePrint} variant="outline" icon={<Printer className="w-4 h-4" />}>
                            Print
                        </Button>
                        <Link href="/student-attendance">
                            <Button variant="outline" icon={<List className="w-4 h-4" />}>
                                List View
                            </Button>
                        </Link>
                        <Link href="/student-attendance">
                            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 print:hidden">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <select
                                value={selectedClass}
                                onChange={(e) => {
                                    setSelectedClass(e.target.value);
                                    setSelectedSection('');
                                }}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedClass}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">All Sections</option>
                                {filteredSections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        Section {section.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleApplyFilters}>Apply Filters</Button>
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 print:p-2">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-green-100 text-green-800 rounded flex items-center justify-center font-semibold text-xs">P</div>
                                <span className="text-xs text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-red-100 text-red-800 rounded flex items-center justify-center font-semibold text-xs">A</div>
                                <span className="text-xs text-gray-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded flex items-center justify-center font-semibold text-xs">L</div>
                                <span className="text-xs text-gray-600">Late</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded flex items-center justify-center font-semibold text-xs">E</div>
                                <span className="text-xs text-gray-600">Excused</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-purple-100 text-purple-800 rounded flex items-center justify-center font-semibold text-xs">H</div>
                                <span className="text-xs text-gray-600">Holiday</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-cyan-100 text-cyan-800 rounded flex items-center justify-center font-semibold text-xs">W</div>
                                <span className="text-xs text-gray-600">Weekend</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded flex items-center justify-center text-gray-400 font-semibold text-xs">-</div>
                                <span className="text-xs text-gray-600">No Record</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Month Navigation */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 border-b border-gray-200 print:py-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4 text-blue-600" />
                                <h3 className="text-base font-semibold text-gray-900">
                                    {months[month - 1]} {year}
                                </h3>
                            </div>
                            <div className="flex items-center space-x-2 print:hidden">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors border border-gray-300"
                                >
                                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1.5 hover:bg-white rounded-lg transition-colors border border-gray-300"
                                >
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-2 py-1 text-left text-[9px] font-semibold text-gray-600 uppercase border-b-2 border-r border-gray-200 bg-gray-50 sticky left-0 z-20" style={{ minWidth: '140px' }}>
                                        Student
                                    </th>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                        <th key={day} className="px-0.5 py-1 text-center text-[9px] font-semibold text-gray-600 border-b-2 border-gray-200" style={{ minWidth: '28px', width: '28px' }}>
                                            {day}
                                        </th>
                                    ))}
                                    <th className="px-2 py-1 text-center text-[9px] font-semibold text-gray-600 uppercase border-b-2 border-l border-gray-200 bg-gray-50" style={{ minWidth: '45px' }}>
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <tr key={student.id} className="hover:bg-blue-50/50 transition-colors print:hover:bg-transparent">
                                            <td className="px-2 py-1 border-b border-r border-gray-200 bg-white sticky left-0 z-10">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-gray-900 leading-tight">{student.name}</p>
                                                    <p className="text-[8px] text-gray-500 leading-tight">
                                                        Adm: {student.admission_number}
                                                        {student.roll_number && ` | Roll: ${student.roll_number}`}
                                                    </p>
                                                    <p className="text-[8px] text-gray-400 leading-tight">
                                                        Class {student.class_name} - {student.section_name}
                                                    </p>
                                                </div>
                                            </td>
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                                <td key={day} className="px-0.5 py-0.5 border-b border-gray-200" style={{ minWidth: '28px', width: '28px', height: '35px' }}>
                                                    {getStatusBadge(student.attendance[day]?.status)}
                                                </td>
                                            ))}
                                            <td className="px-2 py-1 text-center border-b border-l border-gray-200 bg-gray-50">
                                                <span className="text-[10px] font-bold text-green-600">{student.present_count}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={daysInMonth + 2} className="px-6 py-8 text-center text-sm text-gray-500">
                                            No students found for the selected filters
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-3 pb-2 border-b-2 border-black" style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '2px solid #000' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>School Management Pro</h1>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>STUDENT ATTENDANCE CALENDAR</h2>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>{months[month - 1]} {year}</p>
                </div>

                {/* Table */}
                <table className="w-full border-collapse" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th className="border-2 border-black px-3 py-2 text-left font-bold bg-gray-100" style={{ fontSize: '11px', minWidth: '180px' }}>
                                Student
                            </th>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                <th key={day} className="border-2 border-black px-2 py-2 text-center font-bold bg-gray-100" style={{ fontSize: '10px', minWidth: '35px' }}>
                                    {day}
                                </th>
                            ))}
                            <th className="border-2 border-black px-3 py-2 text-center font-bold bg-gray-100" style={{ fontSize: '11px', minWidth: '50px' }}>
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td className="border border-black px-3 py-2" style={{ fontSize: '10px' }}>
                                    <div>
                                        <p className="font-semibold leading-tight">{student.name}</p>
                                        <p className="text-gray-600 leading-tight" style={{ fontSize: '9px' }}>
                                            Adm: {student.admission_number}
                                            {student.roll_number && ` | Roll: ${student.roll_number}`}
                                        </p>
                                        <p className="text-gray-500 leading-tight" style={{ fontSize: '9px' }}>
                                            {student.class_name} - {student.section_name}
                                        </p>
                                    </div>
                                </td>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const status = student.attendance[day]?.status;
                                    const badges: Record<string, { bg: string; text: string; label: string }> = {
                                        present: { bg: '#dcfce7', text: '#166534', label: 'P' },
                                        absent: { bg: '#fee2e2', text: '#991b1b', label: 'A' },
                                        late: { bg: '#fef3c7', text: '#854d0e', label: 'L' },
                                        excused: { bg: '#dbeafe', text: '#1e40af', label: 'E' },
                                        holiday: { bg: '#e9d5ff', text: '#6b21a8', label: 'H' },
                                        weekend: { bg: '#cffafe', text: '#155e75', label: 'W' },
                                    };
                                    const badge = status ? badges[status] || badges.absent : null;

                                    return (
                                        <td key={day} className="border border-black px-0 py-0 text-center" style={{ minWidth: '35px', height: '40px' }}>
                                            {badge ? (
                                                <div style={{
                                                    backgroundColor: badge.bg,
                                                    color: badge.text,
                                                    fontSize: '9px',
                                                    fontWeight: 'bold',
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {badge.label}
                                                </div>
                                            ) : <span style={{ fontSize: '9px' }}>-</span>}
                                        </td>
                                    );
                                })}
                                <td className="border border-black px-3 py-2 text-center font-bold bg-gray-50" style={{ fontSize: '11px' }}>
                                    {student.present_count}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Legend */}
                <div className="mt-4 flex justify-center gap-5" style={{ fontSize: '10px' }}>
                    <span><strong style={{ color: '#166534' }}>P</strong>=Present</span>
                    <span><strong style={{ color: '#991b1b' }}>A</strong>=Absent</span>
                    <span><strong style={{ color: '#854d0e' }}>L</strong>=Late</span>
                    <span><strong style={{ color: '#1e40af' }}>E</strong>=Excused</span>
                    <span><strong style={{ color: '#6b21a8' }}>H</strong>=Holiday</span>
                    <span><strong style={{ color: '#155e75' }}>W</strong>=Weekend</span>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-gray-600" style={{ fontSize: '9px' }}>
                    <p>Printed on: {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm 8mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }

                    .print-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white;
                    }

                    table {
                        border-collapse: collapse !important;
                        width: 100%;
                        page-break-inside: auto;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    thead {
                        display: table-header-group;
                    }

                    th, td {
                        border: 1px solid #000 !important;
                    }

                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
