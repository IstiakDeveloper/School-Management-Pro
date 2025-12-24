import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Edit, Trash2, Eye, BookOpen, Search,
    Filter, Grid3x3, List, Package, CheckCircle,
    XCircle, AlertTriangle
} from 'lucide-react';
import { Book, PaginatedData, BookFilters } from '@/types/library';

interface IndexProps {
    books: PaginatedData<Book>;
    filters?: BookFilters;
}

export default function Index({ books, filters }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/books/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, id: null, name: '' });
    };

    const handleFilter = () => {
        router.get('/books', {
            search,
            category,
            status
        }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.get('/books');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'available':
                return <CheckCircle className="w-4 h-4" />;
            case 'unavailable':
                return <XCircle className="w-4 h-4" />;
            case 'damaged':
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const totalBooks = books.data.reduce((sum, book) => sum + book.total_copies, 0);
    const availableBooks = books.data.reduce((sum, book) => sum + book.available_copies, 0);
    const borrowedBooks = totalBooks - availableBooks;

    const categories = [...new Set(books.data.map(book => book.category))];

    return (
        <AuthenticatedLayout>
            <Head title="Library Books" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Library Books
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your library book collection</p>
                    </div>
                    <Link href="/books/create">
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Add Book
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Books</p>
                                <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-gray-900">{availableBooks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Borrowed</p>
                                <p className="text-2xl font-bold text-gray-900">{borrowedBooks}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, author, ISBN..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                            <option value="damaged">Damaged</option>
                        </select>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleFilter}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-1"
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

                {/* View Toggle */}
                <div className="flex justify-end">
                    <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 rounded-md transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 rounded-md transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {books.data.map((book, index) => (
                            <div
                                key={book.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <BookOpen className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
                                                <p className="text-sm text-gray-600">{book.author}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge
                                                variant={
                                                    book.status === 'available' ? 'success' :
                                                    book.status === 'damaged' ? 'warning' : 'default'
                                                }
                                                className="capitalize flex items-center gap-1"
                                            >
                                                {getStatusIcon(book.status)}
                                                {book.status}
                                            </Badge>
                                            <Badge variant="default">{book.category}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>ISBN:</span>
                                        <span className="font-medium">{book.isbn}</span>
                                    </div>
                                    {book.publisher && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Publisher:</span>
                                            <span className="font-medium">{book.publisher}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-600">
                                        <span>Total Quantity:</span>
                                        <span className="font-medium">{book.quantity}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Available:</span>
                                        <span className="font-medium text-green-600">{book.available_quantity}</span>
                                    </div>
                                    {book.shelf_location && (
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shelf:</span>
                                            <span className="font-medium">{book.shelf_location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                    <Link href={`/books/${book.id}`} className="flex-1">
                                        <Button variant="ghost" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/books/${book.id}/edit`} className="flex-1">
                                        <Button variant="ghost" size="sm" className="w-full" icon={<Edit className="w-4 h-4" />}>
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteClick(book.id, book.title)}
                                        icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {books.data.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{book.title}</div>
                                                    <div className="text-sm text-gray-600">{book.author}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{book.isbn}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default">{book.category}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>{book.quantity} total</div>
                                                <div className="text-green-600">{book.available_quantity} available</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={
                                                        book.status === 'available' ? 'success' :
                                                        book.status === 'damaged' ? 'warning' : 'default'
                                                    }
                                                    className="capitalize flex items-center gap-1 w-fit"
                                                >
                                                    {getStatusIcon(book.status)}
                                                    {book.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/books/${book.id}`}>
                                                        <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                    </Link>
                                                    <Link href={`/books/${book.id}/edit`}>
                                                        <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(book.id, book.title)}
                                                        icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {books.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Books Found</h4>
                            <p className="text-gray-600 mt-1">Add your first book to get started.</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {books.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {books.current_page} of {books.last_page} ({books.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/books', { ...filters, page: books.current_page - 1 })}
                                    disabled={books.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/books', { ...filters, page: books.current_page + 1 })}
                                    disabled={books.current_page === books.last_page}
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
                title="Delete Book"
                message="Are you sure you want to delete this book? This action cannot be undone."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
