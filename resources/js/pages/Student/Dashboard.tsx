import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    User,
    Calendar,
    DollarSign,
    BookOpen,
    FileText,
    Bell,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Award
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Components/Card';
import Badge from '@/Components/Badge';

interface Student {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo_url: string | null;
    class_name: string;
    section_name: string;
    academic_year: string;
    phone: string;
    email: string;
    blood_group: string;
}

interface AttendanceSummary {
    today: {
        status: string;
        in_time: string | null;
        out_time: string | null;
    };
    monthly: {
        total: number;
        present: number;
        absent: number;
        late: number;
        percentage: number;
    };
    yearly: {
        total: number;
        present: number;
        percentage: number;
    };
}

interface FeeStatus {
    total_paid: number;
    total_due: number;
    overdue_count: number;
    recent_payments: Array<{
        id: number;
        receipt_number: string;
        fee_type: string;
        amount: number;
        payment_date: string;
    }>;
}

interface Exam {
    id: number;
    name: string;
    exam_date: string;
    total_marks: number;
    passing_marks: number;
}

interface Result {
    id: number;
    exam_name: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    gpa: number;
    grade: string;
    position: number;
    result_status: string;
}

interface Notice {
    id: number;
    title: string;
    type: string;
    priority: string;
    valid_from: string;
    valid_to: string;
    created_at: string;
}

interface Book {
    id: number;
    book: {
        title: string;
        author: string;
    };
    issue_date: string;
    due_date: string;
}

interface Props {
    student: Student;
    attendanceSummary: AttendanceSummary;
    feeStatus: FeeStatus;
    recentExams: Exam[];
    recentResults: Result[];
    recentNotices: Notice[];
    issuedBooks: Book[];
    unreadMessagesCount: number;
}

export default function Dashboard({
    student,
    attendanceSummary,
    feeStatus,
    recentExams,
    recentResults,
    recentNotices,
    issuedBooks,
    unreadMessagesCount,
}: Props) {
    const getAttendanceStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present': return 'text-green-600 bg-green-50 border-green-200';
            case 'absent': return 'text-red-600 bg-red-50 border-red-200';
            case 'late': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getResultStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pass': return 'text-green-600';
            case 'fail': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-blue-100 text-blue-800',
        };
        return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Student Dashboard
                    </h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700 text-sm">
                        {student.academic_year}
                    </span>
                </div>
            }
        >
            <Head title="Student Dashboard" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mb-6 border-l-4 border-l-blue-500">
                        <div className="p-6 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                        {student.photo_url ? (
                                            <img
                                                src={student.photo_url}
                                                alt={student.full_name}
                                                className="h-16 w-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-8 w-8 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Welcome back, {student.full_name}!
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Class {student.class_name} - Section {student.section_name} | Roll: {student.roll_number}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Admission No: {student.admission_number}
                                        </p>
                                    </div>
                                </div>
                                {unreadMessagesCount > 0 && (
                                    <Link href="/student/messages">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white cursor-pointer">
                                            {unreadMessagesCount} New Messages
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Today's Attendance */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900 text-sm font-medium">Today's Attendance</h3>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6">
                                <div className={`text-2xl font-bold ${getAttendanceStatusColor(attendanceSummary.today.status)}`}>
                                    {attendanceSummary.today.status}
                                </div>
                                {attendanceSummary.today.in_time && (
                                    <p className="text-xs text-muted-foreground">
                                        In: {attendanceSummary.today.in_time}
                                        {attendanceSummary.today.out_time && ` | Out: ${attendanceSummary.today.out_time}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Monthly Attendance */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900 text-sm font-medium">Monthly Attendance</h3>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6">
                                <div className="text-2xl font-bold">{attendanceSummary.monthly.percentage}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {attendanceSummary.monthly.present} / {attendanceSummary.monthly.total} days
                                </p>
                            </div>
                        </div>

                        {/* Fee Status */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900 text-sm font-medium">Fee Status</h3>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6">
                                <div className={`text-2xl font-bold ${feeStatus.total_due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ৳{feeStatus.total_due.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {feeStatus.total_due > 0 ? 'Due Amount' : 'All Paid'}
                                    {feeStatus.overdue_count > 0 && ` | ${feeStatus.overdue_count} Overdue`}
                                </p>
                            </div>
                        </div>

                        {/* Library Books */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900 text-sm font-medium">Library Books</h3>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6">
                                <div className="text-2xl font-bold">{issuedBooks.length}</div>
                                <p className="text-xs text-muted-foreground">Books Issued</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Recent Results */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Award className="mr-2 h-5 w-5" />
                                    Recent Results
                                </CardTitle>
                                <CardDescription>Your latest exam results</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentResults.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium">{result.exam_name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {result.obtained_marks} / {result.total_marks} ({result.percentage}%)
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={getPriorityBadge(result.result_status)}>
                                                        {result.grade} - {result.gpa}
                                                    </Badge>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Position: {result.position}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/results"
                                            className="block text-center text-sm text-blue-600 hover:underline"
                                        >
                                            View All Results →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No results published yet
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Notices */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="mr-2 h-5 w-5" />
                                    Recent Notices
                                </CardTitle>
                                <CardDescription>Important announcements</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentNotices.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentNotices.map((notice) => (
                                            <div
                                                key={notice.id}
                                                className="flex items-start space-x-3 rounded-lg border p-3"
                                            >
                                                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium text-sm">{notice.title}</p>
                                                        <Badge className={getPriorityBadge(notice.priority)}>
                                                            {notice.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(notice.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/notices"
                                            className="block text-center text-sm text-blue-600 hover:underline"
                                        >
                                            View All Notices →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No notices available
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Fee Payments */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    Recent Payments
                                </CardTitle>
                                <CardDescription>Your fee payment history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {feeStatus.recent_payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {feeStatus.recent_payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{payment.fee_type}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Receipt: {payment.receipt_number}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">
                                                        ৳{payment.amount.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {payment.payment_date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/fees"
                                            className="block text-center text-sm text-blue-600 hover:underline"
                                        >
                                            View All Fees →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No payment history
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Issued Books */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Library Books
                                </CardTitle>
                                <CardDescription>Currently issued books</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {issuedBooks.length > 0 ? (
                                    <div className="space-y-3">
                                        {issuedBooks.map((book) => (
                                            <div
                                                key={book.id}
                                                className="flex items-start space-x-3 rounded-lg border p-3"
                                            >
                                                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{book.book.title}</p>
                                                    <p className="text-xs text-gray-600">{book.book.author}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Due: {book.due_date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link
                                            href="/student/library"
                                            className="block text-center text-sm text-blue-600 hover:underline"
                                        >
                                            View Library →
                                        </Link>
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-gray-500 py-4">
                                        No books issued
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <Link
                                    href="/student/attendance"
                                    className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-gray-50 transition"
                                >
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                    <span className="text-sm font-medium">View Attendance</span>
                                </Link>
                                <Link
                                    href="/student/results"
                                    className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-gray-50 transition"
                                >
                                    <Award className="h-8 w-8 text-green-600" />
                                    <span className="text-sm font-medium">My Results</span>
                                </Link>
                                <Link
                                    href="/student/fees"
                                    className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-gray-50 transition"
                                >
                                    <DollarSign className="h-8 w-8 text-yellow-600" />
                                    <span className="text-sm font-medium">Fee Status</span>
                                </Link>
                                <Link
                                    href="/student/messages"
                                    className="flex flex-col items-center space-y-2 rounded-lg border p-4 hover:bg-gray-50 transition"
                                >
                                    <Bell className="h-8 w-8 text-purple-600" />
                                    <span className="text-sm font-medium">Messages</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
