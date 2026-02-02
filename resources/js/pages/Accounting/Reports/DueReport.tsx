import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer, FileText, Users, Building2, GraduationCap } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_id: string;
    roll_number: string;
}

interface FeeTypeWiseData {
    fee_type: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    student_count: number;
}

interface ClassWiseData {
    class_name: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    student_count: number;
}

interface FeeDetail {
    id?: number;
    receipt_number?: string;
    fee_type: string;
    month: number | null;
    year: number | null;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    late_fee?: number;
    discount?: number;
    status: string;
    payment_date: string;
}

interface StudentDueData {
    student_id: number;
    student_id_number: string;
    student_name: string;
    roll_number: string;
    class_name?: string;
    section: string;
    father_name?: string;
    phone?: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    fees: FeeDetail[];
}

interface ClassDueData {
    class_name: string;
    students: StudentDueData[];
    total_due: number;
    total_paid: number;
    total_remaining: number;
}

interface OrganizationReportData {
    feeTypeWise: FeeTypeWiseData[];
    classWise: ClassWiseData[];
}

interface Summary {
    totalDue: number;
    totalPaid: number;
    totalRemaining: number;
    totalRecords: number;
}

interface AcademicYear {
    id: number;
    name: string;
}

interface DueReportProps {
    reportData: OrganizationReportData | ClassDueData[] | StudentDueData[];
    summary: Summary;
    filters: {
        start_date: string;
        end_date: string;
        report_type: string;
        class_id: number | null;
        student_id: number | null;
    };
    classes: SchoolClass[];
    students: Student[];
    academicYear: AcademicYear | null;
}

export default function DueReport({
    reportData,
    summary,
    filters,
    classes,
    students,
    academicYear,
}: DueReportProps) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [reportType, setReportType] = useState(filters?.report_type || 'organization');
    const [selectedClass, setSelectedClass] = useState<string>(filters?.class_id?.toString() || '');
    const [selectedStudent, setSelectedStudent] = useState<string>(filters?.student_id?.toString() || '');

    useEffect(() => {
        if (selectedClass && reportType !== 'organization') {
            // Load students for selected class
            router.get('/accounting/reports/due-report',
                {
                    start_date: startDate,
                    end_date: endDate,
                    report_type: reportType,
                    class_id: selectedClass,
                    student_id: selectedStudent,
                },
                { preserveState: true, only: ['students'] }
            );
        }
    }, [selectedClass]);

    const handleFilter = () => {
        router.get('/accounting/reports/due-report',
            {
                start_date: startDate,
                end_date: endDate,
                report_type: reportType,
                class_id: selectedClass || undefined,
                student_id: selectedStudent || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setReportType('organization');
        setSelectedClass('');
        setSelectedStudent('');
        router.get('/accounting/reports/due-report');
    };

    const handleReportTypeChange = (type: string) => {
        setReportType(type);
        setSelectedClass('');
        setSelectedStudent('');
        // Fetch data with new report type
        router.get('/accounting/reports/due-report',
            {
                start_date: startDate,
                end_date: endDate,
                report_type: type,
            },
            { preserveState: false }
        );
    };

    const formatCurrency = (amount: number) => {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
    };

    const getMonthName = (month: number | null) => {
        if (!month) return '-';
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[month - 1] || '-';
    };

    const handlePrint = () => {
        window.print();
    };

    const dateRange = `${new Date(filters.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(filters.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    const getReportTitle = () => {
        switch (reportType) {
            case 'organization':
                return 'Organization Due Report';
            case 'class':
                return 'Class Wise Due Report';
            case 'student':
                return 'Student Wise Due Report';
            default:
                return 'Due Report';
        }
    };

    const renderOrganizationReport = () => {
        const data = reportData as OrganizationReportData;
        const feeTypeWise = data?.feeTypeWise || [];
        const classWise = data?.classWise || [];
        return (
            <>
                {/* Fee Type Wise Summary */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Fee Type Wise Summary
                    </h3>
                    <table className="w-full border-collapse border border-gray-400" style={{ fontSize: '11px' }}>
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="border border-gray-400 p-2 text-left">Fee Type</th>
                                <th className="border border-gray-400 p-2 text-center">Students</th>
                                <th className="border border-gray-400 p-2 text-right">Total Amount</th>
                                <th className="border border-gray-400 p-2 text-right">Paid Amount</th>
                                <th className="border border-gray-400 p-2 text-right">Due Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeTypeWise.length > 0 ? (
                                feeTypeWise.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-400 p-2">{item.fee_type}</td>
                                        <td className="border border-gray-400 p-2 text-center">{item.student_count}</td>
                                        <td className="border border-gray-400 p-2 text-right">{formatCurrency(item.total_amount)}</td>
                                        <td className="border border-gray-400 p-2 text-right text-green-600">{formatCurrency(item.paid_amount)}</td>
                                        <td className="border border-gray-400 p-2 text-right text-red-600 font-semibold">{formatCurrency(item.due_amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="border border-gray-400 p-4 text-center text-gray-500">
                                        No due records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Class Wise Summary */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        Class Wise Summary
                    </h3>
                    <table className="w-full border-collapse border border-gray-400" style={{ fontSize: '11px' }}>
                        <thead>
                            <tr className="bg-green-100">
                                <th className="border border-gray-400 p-2 text-left">Class</th>
                                <th className="border border-gray-400 p-2 text-center">Students</th>
                                <th className="border border-gray-400 p-2 text-right">Total Amount</th>
                                <th className="border border-gray-400 p-2 text-right">Paid Amount</th>
                                <th className="border border-gray-400 p-2 text-right">Due Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classWise.length > 0 ? (
                                classWise.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-400 p-2">{item.class_name}</td>
                                        <td className="border border-gray-400 p-2 text-center">{item.student_count}</td>
                                        <td className="border border-gray-400 p-2 text-right">{formatCurrency(item.total_amount)}</td>
                                        <td className="border border-gray-400 p-2 text-right text-green-600">{formatCurrency(item.paid_amount)}</td>
                                        <td className="border border-gray-400 p-2 text-right text-red-600 font-semibold">{formatCurrency(item.due_amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="border border-gray-400 p-4 text-center text-gray-500">
                                        No due records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </>
        );
    };

    const renderClassWiseReport = () => {
        if (!Array.isArray(reportData)) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No due records found for the selected criteria
                </div>
            );
        }
        const data = reportData as ClassDueData[];
        return (
            <div className="space-y-6">
                {data.length > 0 ? (
                    data.map((classData, classIndex) => (
                        <div key={classIndex} className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 flex justify-between items-center">
                                <h3 className="font-semibold text-lg">{classData.class_name}</h3>
                                <div className="flex gap-4 text-sm">
                                    <span>Total: ৳{formatCurrency(classData.total_due)}</span>
                                    <span>Paid: ৳{formatCurrency(classData.total_paid)}</span>
                                    <span className="font-bold">Due: ৳{formatCurrency(classData.total_remaining)}</span>
                                </div>
                            </div>
                            <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Roll</th>
                                        <th className="border border-gray-300 p-2 text-left">Student ID</th>
                                        <th className="border border-gray-300 p-2 text-left">Student Name</th>
                                        <th className="border border-gray-300 p-2 text-center">Section</th>
                                        <th className="border border-gray-300 p-2 text-right">Total</th>
                                        <th className="border border-gray-300 p-2 text-right">Paid</th>
                                        <th className="border border-gray-300 p-2 text-right">Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(classData.students || []).map((student, studentIndex) => (
                                        <tr key={studentIndex} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{student.roll_number}</td>
                                            <td className="border border-gray-300 p-2">{student.student_id_number}</td>
                                            <td className="border border-gray-300 p-2 font-medium">{student.student_name}</td>
                                            <td className="border border-gray-300 p-2 text-center">{student.section}</td>
                                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(student.total_amount)}</td>
                                            <td className="border border-gray-300 p-2 text-right text-green-600">{formatCurrency(student.paid_amount)}</td>
                                            <td className="border border-gray-300 p-2 text-right text-red-600 font-semibold">{formatCurrency(student.due_amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No due records found for the selected criteria
                    </div>
                )}
            </div>
        );
    };

    const renderStudentWiseReport = () => {
        if (!Array.isArray(reportData)) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No due records found for the selected criteria
                </div>
            );
        }
        const data = reportData as StudentDueData[];
        return (
            <div className="space-y-4">
                {data.length > 0 ? (
                    data.map((student, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                                        <div className="flex gap-4 text-sm mt-1 text-blue-100">
                                            <span>ID: {student.student_id_number}</span>
                                            <span>Roll: {student.roll_number}</span>
                                            <span>Class: {student.class_name}</span>
                                            <span>Section: {student.section}</span>
                                        </div>
                                        {student.father_name && (
                                            <div className="text-sm text-blue-100 mt-1">
                                                Father: {student.father_name} | Phone: {student.phone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">৳{formatCurrency(student.due_amount)}</div>
                                        <div className="text-sm text-blue-100">Total Due</div>
                                    </div>
                                </div>
                            </div>
                            <table className="w-full border-collapse" style={{ fontSize: '10px' }}>
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Fee Type</th>
                                        <th className="border border-gray-300 p-2 text-center">Month/Year</th>
                                        <th className="border border-gray-300 p-2 text-center">Date</th>
                                        <th className="border border-gray-300 p-2 text-right">Total</th>
                                        <th className="border border-gray-300 p-2 text-right">Paid</th>
                                        <th className="border border-gray-300 p-2 text-right">Due</th>
                                        <th className="border border-gray-300 p-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(student.fees || []).map((fee, feeIndex) => (
                                        <tr key={feeIndex} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{fee.fee_type}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                {fee.month && fee.year ? `${getMonthName(fee.month)} ${fee.year}` : '-'}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-center">{formatDate(fee.payment_date)}</td>
                                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(fee.total_amount)}</td>
                                            <td className="border border-gray-300 p-2 text-right text-green-600">{formatCurrency(fee.paid_amount)}</td>
                                            <td className="border border-gray-300 p-2 text-right text-red-600 font-semibold">{formatCurrency(fee.due_amount)}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    fee.status === 'pending' ? 'bg-red-100 text-red-700' :
                                                    fee.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-semibold">
                                        <td colSpan={3} className="border border-gray-300 p-2 text-right">Total:</td>
                                        <td className="border border-gray-300 p-2 text-right">{formatCurrency(student.total_amount)}</td>
                                        <td className="border border-gray-300 p-2 text-right text-green-600">{formatCurrency(student.paid_amount)}</td>
                                        <td className="border border-gray-300 p-2 text-right text-red-600">{formatCurrency(student.due_amount)}</td>
                                        <td className="border border-gray-300 p-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No due records found for the selected criteria
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Due Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                Due Report
                            </h1>
                            <p className="text-gray-600 mt-1">View pending and partial fee payments</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrint}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    {/* Report Type Buttons */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => handleReportTypeChange('organization')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                reportType === 'organization'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Organization
                        </button>
                        <button
                            onClick={() => handleReportTypeChange('class')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                reportType === 'class'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Class Wise
                        </button>
                        <button
                            onClick={() => handleReportTypeChange('student')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                                reportType === 'student'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Student Wise
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        {reportType !== 'organization' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Class
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => {
                                        setSelectedClass(e.target.value);
                                        setSelectedStudent('');
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {reportType === 'student' && selectedClass && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Student
                                </label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                >
                                    <option value="">All Students</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.first_name} {student.last_name} ({student.roll_number})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex items-end gap-2 md:col-span-2">
                            <Button onClick={handleFilter} className="bg-blue-600 text-white hover:bg-blue-700">
                                Apply Filter
                            </Button>
                            <Button onClick={handleReset} className="bg-gray-500 text-white hover:bg-gray-600">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-gray-600 text-sm mb-1">Total Records</p>
                        <p className="text-2xl font-bold text-blue-600">{summary.totalRecords}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-600 text-sm mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-700">৳ {formatCurrency(summary.totalDue)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-gray-600 text-sm mb-1">Total Paid</p>
                        <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(summary.totalPaid)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-gray-600 text-sm mb-1">Total Due</p>
                        <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(summary.totalRemaining)}</p>
                    </div>
                </div>

                {/* Report Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    {/* Header Info */}
                    <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
                        <h2 className="text-xl font-bold mb-1 text-gray-800">{getReportTitle().toUpperCase()}</h2>
                        <p className="text-sm font-semibold text-gray-600">For the period: {dateRange}</p>
                        {academicYear && (
                            <p className="text-sm text-gray-500">Academic Year: {academicYear.name}</p>
                        )}
                    </div>

                    {/* Render based on report type */}
                    {reportType === 'organization' && renderOrganizationReport()}
                    {reportType === 'class' && renderClassWiseReport()}
                    {reportType === 'student' && renderStudentWiseReport()}
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-base font-bold mb-1">School Management Pro</h1>
                    <h2 className="text-sm font-bold mb-1">{getReportTitle().toUpperCase()}</h2>
                    <p style={{ fontSize: '9px' }} className="font-semibold">For the period: {dateRange}</p>
                    {academicYear && (
                        <p style={{ fontSize: '8px' }} className="text-gray-600">Academic Year: {academicYear.name}</p>
                    )}
                </div>

                {/* Summary for print */}
                <div className="grid grid-cols-4 gap-2 mb-4" style={{ fontSize: '8px' }}>
                    <div className="border border-black p-2 text-center">
                        <p className="font-semibold">Total Records</p>
                        <p className="font-bold">{summary.totalRecords}</p>
                    </div>
                    <div className="border border-black p-2 text-center">
                        <p className="font-semibold">Total Amount</p>
                        <p className="font-bold">৳ {formatCurrency(summary.totalDue)}</p>
                    </div>
                    <div className="border border-black p-2 text-center">
                        <p className="font-semibold">Total Paid</p>
                        <p className="font-bold">৳ {formatCurrency(summary.totalPaid)}</p>
                    </div>
                    <div className="border border-black p-2 text-center">
                        <p className="font-semibold">Total Due</p>
                        <p className="font-bold">৳ {formatCurrency(summary.totalRemaining)}</p>
                    </div>
                </div>

                {/* Print Content based on report type */}
                {reportType === 'organization' && !Array.isArray(reportData) && (
                    <>
                        <h3 style={{ fontSize: '9px' }} className="font-bold mb-2">Fee Type Wise Summary</h3>
                        <table className="w-full border-collapse border border-black mb-4" style={{ fontSize: '7px' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 text-left">Fee Type</th>
                                    <th className="border border-black p-1 text-center">Students</th>
                                    <th className="border border-black p-1 text-right">Total</th>
                                    <th className="border border-black p-1 text-right">Paid</th>
                                    <th className="border border-black p-1 text-right">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {((reportData as OrganizationReportData)?.feeTypeWise || []).map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-1">{item.fee_type}</td>
                                        <td className="border border-black p-1 text-center">{item.student_count}</td>
                                        <td className="border border-black p-1 text-right">{formatCurrency(item.total_amount)}</td>
                                        <td className="border border-black p-1 text-right">{formatCurrency(item.paid_amount)}</td>
                                        <td className="border border-black p-1 text-right font-bold">{formatCurrency(item.due_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h3 style={{ fontSize: '9px' }} className="font-bold mb-2">Class Wise Summary</h3>
                        <table className="w-full border-collapse border border-black" style={{ fontSize: '7px' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 text-left">Class</th>
                                    <th className="border border-black p-1 text-center">Students</th>
                                    <th className="border border-black p-1 text-right">Total</th>
                                    <th className="border border-black p-1 text-right">Paid</th>
                                    <th className="border border-black p-1 text-right">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {((reportData as OrganizationReportData)?.classWise || []).map((item, index) => (
                                    <tr key={index}>
                                        <td className="border border-black p-1">{item.class_name}</td>
                                        <td className="border border-black p-1 text-center">{item.student_count}</td>
                                        <td className="border border-black p-1 text-right">{formatCurrency(item.total_amount)}</td>
                                        <td className="border border-black p-1 text-right">{formatCurrency(item.paid_amount)}</td>
                                        <td className="border border-black p-1 text-right font-bold">{formatCurrency(item.due_amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {reportType === 'class' && Array.isArray(reportData) && (
                    <>
                        {(reportData as ClassDueData[]).map((classData, classIndex) => (
                            <div key={classIndex} className="mb-4">
                                <h3 style={{ fontSize: '9px' }} className="font-bold mb-1 bg-gray-200 p-1">
                                    {classData.class_name} - Due: ৳{formatCurrency(classData.total_remaining)}
                                </h3>
                                <table className="w-full border-collapse border border-black" style={{ fontSize: '6px' }}>
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-black p-0.5 text-left">Roll</th>
                                            <th className="border border-black p-0.5 text-left">ID</th>
                                            <th className="border border-black p-0.5 text-left">Name</th>
                                            <th className="border border-black p-0.5 text-center">Section</th>
                                            <th className="border border-black p-0.5 text-right">Total</th>
                                            <th className="border border-black p-0.5 text-right">Paid</th>
                                            <th className="border border-black p-0.5 text-right">Due</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(classData.students || []).map((student, studentIndex) => (
                                            <tr key={studentIndex}>
                                                <td className="border border-black p-0.5">{student.roll_number}</td>
                                                <td className="border border-black p-0.5">{student.student_id_number}</td>
                                                <td className="border border-black p-0.5">{student.student_name}</td>
                                                <td className="border border-black p-0.5 text-center">{student.section}</td>
                                                <td className="border border-black p-0.5 text-right">{formatCurrency(student.total_amount)}</td>
                                                <td className="border border-black p-0.5 text-right">{formatCurrency(student.paid_amount)}</td>
                                                <td className="border border-black p-0.5 text-right font-bold">{formatCurrency(student.due_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </>
                )}

                {reportType === 'student' && Array.isArray(reportData) && (
                    <>
                        {(reportData as StudentDueData[]).map((student, index) => (
                            <div key={index} className="mb-4">
                                <div style={{ fontSize: '8px' }} className="bg-gray-200 p-1 mb-1">
                                    <strong>{student.student_name}</strong> | ID: {student.student_id_number} | Roll: {student.roll_number} | Class: {student.class_name} | Due: ৳{formatCurrency(student.due_amount)}
                                </div>
                                <table className="w-full border-collapse border border-black" style={{ fontSize: '6px' }}>
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-black p-0.5 text-left">Fee Type</th>
                                            <th className="border border-black p-0.5 text-center">Month/Year</th>
                                            <th className="border border-black p-0.5 text-center">Date</th>
                                            <th className="border border-black p-0.5 text-right">Total</th>
                                            <th className="border border-black p-0.5 text-right">Paid</th>
                                            <th className="border border-black p-0.5 text-right">Due</th>
                                            <th className="border border-black p-0.5 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(student.fees || []).map((fee, feeIndex) => (
                                            <tr key={feeIndex}>
                                                <td className="border border-black p-0.5">{fee.fee_type}</td>
                                                <td className="border border-black p-0.5 text-center">
                                                    {fee.month && fee.year ? `${getMonthName(fee.month)} ${fee.year}` : '-'}
                                                </td>
                                                <td className="border border-black p-0.5 text-center">{formatDate(fee.payment_date)}</td>
                                                <td className="border border-black p-0.5 text-right">{formatCurrency(fee.total_amount)}</td>
                                                <td className="border border-black p-0.5 text-right">{formatCurrency(fee.paid_amount)}</td>
                                                <td className="border border-black p-0.5 text-right font-bold">{formatCurrency(fee.due_amount)}</td>
                                                <td className="border border-black p-0.5 text-center">{fee.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </>
                )}

                {/* Signature Section */}
                <div className="mt-8">
                    <div className="grid grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Prepared By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Checked By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{ fontSize: '7px' }}>Approved By</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-gray-600" style={{ fontSize: '6px' }}>
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
                        size: A4 portrait;
                        margin: 8mm;
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

                    th, td {
                        border: 1px solid #000 !important;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }

                    .bg-gray-100,
                    .bg-gray-200 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
