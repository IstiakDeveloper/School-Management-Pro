import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { Book } from '@/types/library';

interface CreateProps {
    books: Book[];
    students: Array<{
        id: number;
        admission_number: string;
        full_name: string;
        user?: { name: string; email: string };
    }>;
    teachers: Array<{
        id: number;
        employee_id: string;
        user?: { name: string; email: string };
    }>;
}

export default function Create({ books, students, teachers }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        book_id: '',
        borrower_type: 'student' as 'student' | 'teacher',
        borrower_id: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        remarks: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/book-issues', formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const borrowers = formData.borrower_type === 'student' ? students : teachers;

    return (
        <AuthenticatedLayout>
            <Head title="Issue Book" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Issue Book
                        </h1>
                        <p className="text-gray-600 mt-1">Issue a book to a student or teacher</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/book-issues')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back to Issues
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Book <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.book_id}
                                    onChange={(e) => setFormData({ ...formData, book_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Book</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} by {book.author} (Available: {book.available_copies})
                                        </option>
                                    ))}
                                </select>
                                {errors.book_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.book_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Borrower Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.borrower_type}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            borrower_type: e.target.value as 'student' | 'teacher',
                                            borrower_id: '' // Reset borrower when type changes
                                        });
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                                {errors.borrower_type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.borrower_type}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.borrower_type === 'student' ? 'Student' : 'Teacher'} <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.borrower_id}
                                    onChange={(e) => setFormData({ ...formData, borrower_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select {formData.borrower_type === 'student' ? 'Student' : 'Teacher'}</option>
                                    {formData.borrower_type === 'student'
                                        ? students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.user?.name || student.full_name} ({student.admission_number})
                                            </option>
                                        ))
                                        : teachers.map(teacher => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.user?.name} ({teacher.employee_id})
                                            </option>
                                        ))
                                    }
                                </select>
                                {errors.borrower_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.borrower_id}</p>
                                )}
                            </div>

                            <Input
                                label="Issue Date"
                                type="date"
                                value={formData.issue_date}
                                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                                error={errors.issue_date}
                                required
                            />

                            <Input
                                label="Due Date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                error={errors.due_date}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter any additional remarks..."
                            />
                            {errors.remarks && (
                                <p className="text-red-500 text-sm mt-1">{errors.remarks}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                            >
                                Issue Book
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/book-issues')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
