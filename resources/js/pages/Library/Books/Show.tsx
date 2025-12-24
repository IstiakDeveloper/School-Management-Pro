import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Card from '@/Components/Card';
import { ArrowLeft, Edit, BookOpen, Package, Calendar, DollarSign, MapPin, User, Clock } from 'lucide-react';
import { Book } from '@/types/library';

interface ShowProps {
    book: Book;
}

export default function Show({ book }: ShowProps) {
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Book: ${book.title}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Book Details
                        </h1>
                        <p className="text-gray-600 mt-1">View book information and issue history</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/books/${book.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Book
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/books')}
                            icon={<ArrowLeft className="w-5 h-5" />}
                        >
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <BookOpen className="w-8 h-8 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
                                    <p className="text-lg text-gray-600 mt-1">{book.author}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge
                                            variant={
                                                book.status === 'available' ? 'success' :
                                                book.status === 'damaged' ? 'warning' : 'default'
                                            }
                                            className="capitalize"
                                        >
                                            {book.status}
                                        </Badge>
                                        <Badge variant="default">{book.category}</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Package className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Total Quantity</p>
                                        <p className="text-lg font-semibold text-gray-900">{book.total_copies}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <Package className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Available</p>
                                        <p className="text-lg font-semibold text-green-600">{book.available_copies}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">ISBN</p>
                                        <p className="font-medium text-gray-900">{book.isbn}</p>
                                    </div>
                                    {book.publisher && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Publisher</p>
                                            <p className="font-medium text-gray-900">{book.publisher}</p>
                                        </div>
                                    )}
                                    {book.publication_year && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Publication Year</p>
                                            <p className="font-medium text-gray-900">{book.publication_year}</p>
                                        </div>
                                    )}
                                    {book.price && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Price</p>
                                            <p className="font-medium text-gray-900">${book.price}</p>
                                        </div>
                                    )}
                                    {book.shelf_location && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Shelf Location</p>
                                            <p className="font-medium text-gray-900">{book.shelf_location}</p>
                                        </div>
                                    )}
                                </div>

                                {book.description && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Description</p>
                                        <p className="text-gray-900">{book.description}</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Borrowed</span>
                                    <span className="font-semibold text-gray-900">
                                        {book.total_copies - book.available_copies}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Available</span>
                                    <span className="font-semibold text-green-600">{book.available_copies}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Total Issues</span>
                                    <span className="font-semibold text-gray-900">
                                        {book.issues?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Added On</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(book.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(book.updated_at)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Issue History */}
                {book.issues && book.issues.length > 0 && (
                    <Card title="Issue History">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Borrower
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Issue Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Return Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {book.issues.map((issue) => (
                                        <tr key={issue.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {issue.borrower_type === 'student'
                                                        ? issue.student?.user?.name || issue.student?.full_name
                                                        : issue.teacher?.user?.name}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {issue.borrower_type === 'student'
                                                        ? issue.student?.admission_number
                                                        : issue.teacher?.employee_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default" className="capitalize">
                                                    {issue.borrower_type}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(issue.issue_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {new Date(issue.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {issue.return_date
                                                    ? new Date(issue.return_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={issue.status === 'issued' ? 'warning' : 'success'}
                                                    className="capitalize"
                                                >
                                                    {issue.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
