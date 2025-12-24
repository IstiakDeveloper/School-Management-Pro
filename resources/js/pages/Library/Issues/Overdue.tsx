import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, BookOpen, AlertTriangle, Eye } from 'lucide-react';
import { BookIssue, PaginatedData } from '@/types/library';

interface OverdueProps {
    issues: PaginatedData<BookIssue>;
}

export default function Overdue({ issues }: OverdueProps) {
    const calculateFine = (dueDate: string, finePerDay: number = 1) => {
        const days = Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
        return days * finePerDay;
    };

    const calculateDaysOverdue = (dueDate: string) => {
        return Math.floor((new Date().getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
    };

    const totalOverdue = issues.data.length;
    const totalFines = issues.data.reduce((sum, issue) => sum + calculateFine(issue.due_date), 0);

    return (
        <AuthenticatedLayout>
            <Head title="Overdue Books" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Overdue Books
                        </h1>
                        <p className="text-gray-600 mt-1">Books that are past their due date</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/book-issues')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back to Issues
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">{totalOverdue}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Estimated Total Fines</p>
                                <p className="text-2xl font-bold text-gray-900">${totalFines.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Fine</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {issues.data.map((issue) => {
                                    const daysOverdue = calculateDaysOverdue(issue.due_date);
                                    const estimatedFine = calculateFine(issue.due_date);

                                    return (
                                        <tr key={issue.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{issue.book?.title}</div>
                                                        <div className="text-sm text-gray-600">{issue.book?.author}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {issue.borrower_type === 'student'
                                                            ? issue.student?.user?.name || issue.student?.full_name
                                                            : issue.teacher?.user?.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="default" className="capitalize text-xs">
                                                            {issue.borrower_type}
                                                        </Badge>
                                                        <span className="text-xs text-gray-600">
                                                            {issue.borrower_type === 'student'
                                                                ? issue.student?.admission_number
                                                                : issue.teacher?.employee_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-red-600">
                                                    {new Date(issue.due_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
                                                    <AlertTriangle className="w-4 h-4 text-red-600" />
                                                    <span className="text-sm font-semibold text-red-600">
                                                        {daysOverdue} day{daysOverdue !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ${estimatedFine.toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    ($1/day)
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/book-issues/${issue.id}`}>
                                                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {issues.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Overdue Books</h4>
                            <p className="text-gray-600 mt-1">All books are returned on time!</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {issues.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {issues.current_page} of {issues.last_page} ({issues.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/book-issues/overdue', { page: issues.current_page - 1 })}
                                    disabled={issues.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/book-issues/overdue', { page: issues.current_page + 1 })}
                                    disabled={issues.current_page === issues.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
