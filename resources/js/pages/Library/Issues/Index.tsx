import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Eye, Trash2, BookOpen, Filter, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { BookIssue, PaginatedData, BookIssueFilters } from '@/types/library';

interface IndexProps {
    issues: PaginatedData<BookIssue>;
    filters?: BookIssueFilters;
}

export default function Index({ issues, filters }: IndexProps) {
    const [status, setStatus] = useState(filters?.status || '');
    const [borrowerType, setBorrowerType] = useState(filters?.borrower_type || '');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/book-issues/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, id: null });
    };

    const handleFilter = () => {
        router.get('/book-issues', {
            status,
            borrower_type: borrowerType
        }, { preserveState: true });
    };

    const handleReset = () => {
        setStatus('');
        setBorrowerType('');
        router.get('/book-issues');
    };

    const issuedCount = issues.data.filter(i => i.status === 'issued').length;
    const returnedCount = issues.data.filter(i => i.status === 'returned').length;
    const overdueCount = issues.data.filter(i => {
        if (i.status === 'issued') {
            return new Date(i.due_date) < new Date();
        }
        return false;
    }).length;

    return (
        <AuthenticatedLayout>
            <Head title="Book Issues" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Book Issues
                        </h1>
                        <p className="text-gray-600 mt-1">Manage book borrowing and returns</p>
                    </div>
                    <Link href="/book-issues/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Issue Book
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Issued</p>
                                <p className="text-2xl font-bold text-gray-900">{issuedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Returned</p>
                                <p className="text-2xl font-bold text-gray-900">{returnedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="issued">Issued</option>
                            <option value="returned">Returned</option>
                        </select>

                        <select
                            value={borrowerType}
                            onChange={(e) => setBorrowerType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Borrowers</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                        </select>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleFilter}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-1"
                                icon={<Filter className="w-4 h-4" />}
                            >
                                Apply
                            </Button>
                            <Button onClick={handleReset} variant="ghost">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Issues Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrower</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {issues.data.map((issue) => {
                                    const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();
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
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(issue.issue_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                                                    {new Date(issue.due_date).toLocaleDateString()}
                                                </div>
                                                {isOverdue && (
                                                    <div className="text-xs text-red-600">Overdue!</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {issue.return_date
                                                    ? new Date(issue.return_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        isOverdue ? 'danger' :
                                                        issue.status === 'issued' ? 'warning' : 'success'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {isOverdue ? 'Overdue' : issue.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/book-issues/${issue.id}`}>
                                                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(issue.id)}
                                                        icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                    />
                                                </div>
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
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Issues Found</h4>
                            <p className="text-gray-600 mt-1">Issue your first book to get started.</p>
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
                                    onClick={() => router.get('/book-issues', { ...filters, page: issues.current_page - 1 })}
                                    disabled={issues.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/book-issues', { ...filters, page: issues.current_page + 1 })}
                                    disabled={issues.current_page === issues.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Issue"
                message="Are you sure you want to delete this issue record? This action cannot be undone."
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
