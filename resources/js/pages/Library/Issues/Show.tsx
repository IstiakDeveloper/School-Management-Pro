import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import Input from '@/Components/Input';
import { ArrowLeft, BookOpen, User, Calendar, DollarSign } from 'lucide-react';
import { BookIssue } from '@/types/library';

interface ShowProps {
    issue: BookIssue;
}

export default function Show({ issue }: ShowProps) {
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [returnData, setReturnData] = useState({
        return_date: new Date().toISOString().split('T')[0],
        fine_amount: '',
        condition: 'good' as 'good' | 'damaged' | 'lost',
        return_remarks: '',
    });

    const handleReturn = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/book-issues/${issue.id}/return`, returnData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowReturnForm(false);
            },
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isOverdue = issue.status === 'issued' && new Date(issue.due_date) < new Date();
    const daysOverdue = isOverdue
        ? Math.floor((new Date().getTime() - new Date(issue.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Issue Details" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Issue Details
                        </h1>
                        <p className="text-gray-600 mt-1">View book issue information</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/book-issues')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back to Issues
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Book Info */}
                        <Card title="Book Information">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900">{issue.book?.title}</h3>
                                    <p className="text-gray-600 mt-1">{issue.book?.author}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">ISBN</p>
                                            <p className="font-medium text-gray-900">{issue.book?.isbn}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Category</p>
                                            <p className="font-medium text-gray-900">{issue.book?.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Borrower Info */}
                        <Card title="Borrower Information">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <User className="w-8 h-8 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="default" className="capitalize">
                                            {issue.borrower_type}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {issue.borrower_type === 'student'
                                            ? issue.student?.user?.name || issue.student?.full_name
                                            : issue.teacher?.user?.name}
                                    </h3>
                                    <div className="mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                {issue.borrower_type === 'student' ? 'Admission No.' : 'Employee ID'}
                                            </p>
                                            <p className="font-medium text-gray-900">
                                                {issue.borrower_type === 'student'
                                                    ? issue.student?.admission_number
                                                    : issue.teacher?.employee_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-900">
                                                {issue.borrower_type === 'student'
                                                    ? issue.student?.user?.email
                                                    : issue.teacher?.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Return Form */}
                        {issue.status === 'issued' && !showReturnForm && (
                            <Card>
                                <Button
                                    onClick={() => setShowReturnForm(true)}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full"
                                >
                                    Return Book
                                </Button>
                            </Card>
                        )}

                        {showReturnForm && (
                            <Card title="Return Book">
                                <form onSubmit={handleReturn} className="space-y-4">
                                    <Input
                                        label="Return Date"
                                        type="date"
                                        value={returnData.return_date}
                                        onChange={(e) => setReturnData({ ...returnData, return_date: e.target.value })}
                                        error={errors.return_date}
                                        required
                                    />

                                    <Input
                                        label="Fine Amount"
                                        type="number"
                                        step="0.01"
                                        value={returnData.fine_amount}
                                        onChange={(e) => setReturnData({ ...returnData, fine_amount: e.target.value })}
                                        error={errors.fine_amount}
                                        placeholder="0.00"
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Book Condition
                                        </label>
                                        <select
                                            value={returnData.condition}
                                            onChange={(e) => setReturnData({ ...returnData, condition: e.target.value as 'good' | 'damaged' | 'lost' })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="good">Good</option>
                                            <option value="damaged">Damaged</option>
                                            <option value="lost">Lost</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Return Remarks
                                        </label>
                                        <textarea
                                            value={returnData.return_remarks}
                                            onChange={(e) => setReturnData({ ...returnData, return_remarks: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Any remarks about the return..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                                            loading={isSubmitting}
                                        >
                                            Confirm Return
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowReturnForm(false)}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Status</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <Badge
                                        variant={
                                            isOverdue ? 'danger' :
                                            issue.status === 'issued' ? 'warning' : 'success'
                                        }
                                        className="capitalize"
                                    >
                                        {isOverdue ? 'Overdue' : issue.status}
                                    </Badge>
                                </div>
                                {isOverdue && (
                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm font-medium text-red-900">
                                            {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Issue Date</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(issue.issue_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Due Date</p>
                                    <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                        {formatDate(issue.due_date)}
                                    </p>
                                </div>
                                {issue.return_date && (
                                    <div>
                                        <p className="text-sm text-gray-600">Return Date</p>
                                        <p className="text-sm font-medium text-gray-900">{formatDate(issue.return_date)}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {issue.status === 'returned' && (
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Details</h3>
                                <div className="space-y-3">
                                    {issue.fine_amount && issue.fine_amount > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600">Fine Amount</p>
                                            <p className="text-lg font-semibold text-gray-900">${issue.fine_amount}</p>
                                        </div>
                                    )}
                                    {issue.condition && (
                                        <div>
                                            <p className="text-sm text-gray-600">Condition</p>
                                            <Badge
                                                variant={
                                                    issue.condition === 'good' ? 'success' :
                                                    issue.condition === 'damaged' ? 'warning' : 'danger'
                                                }
                                                className="capitalize"
                                            >
                                                {issue.condition}
                                            </Badge>
                                        </div>
                                    )}
                                    {issue.return_remarks && (
                                        <div>
                                            <p className="text-sm text-gray-600">Remarks</p>
                                            <p className="text-sm text-gray-900">{issue.return_remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {issue.remarks && (
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Remarks</h3>
                                <p className="text-sm text-gray-600">{issue.remarks}</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
