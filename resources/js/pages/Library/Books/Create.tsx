import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';

export default function Create() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publication_year: '',
        category: '',
        quantity: '',
        available_quantity: '',
        price: '',
        shelf_location: '',
        description: '',
        status: 'available',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/books', formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Book" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Add Book
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new book to the library</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/books')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back to Books
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Book Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                error={errors.title}
                                required
                                placeholder="e.g., The Great Gatsby"
                            />

                            <Input
                                label="Author"
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                error={errors.author}
                                required
                                placeholder="e.g., F. Scott Fitzgerald"
                            />

                            <Input
                                label="ISBN"
                                value={formData.isbn}
                                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                                error={errors.isbn}
                                required
                                placeholder="e.g., 978-0-7432-7356-5"
                            />

                            <Input
                                label="Publisher"
                                value={formData.publisher}
                                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                error={errors.publisher}
                                placeholder="e.g., Scribner"
                            />

                            <Input
                                label="Publication Year"
                                type="number"
                                value={formData.publication_year}
                                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                                error={errors.publication_year}
                                placeholder="e.g., 2004"
                            />

                            <Input
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                error={errors.category}
                                required
                                placeholder="e.g., Fiction, Science, History"
                            />

                            <Input
                                label="Total Quantity"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                error={errors.quantity}
                                required
                                placeholder="e.g., 10"
                            />

                            <Input
                                label="Available Quantity"
                                type="number"
                                value={formData.available_quantity}
                                onChange={(e) => setFormData({ ...formData, available_quantity: e.target.value })}
                                error={errors.available_quantity}
                                required
                                placeholder="e.g., 10"
                            />

                            <Input
                                label="Price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                error={errors.price}
                                placeholder="e.g., 25.99"
                            />

                            <Input
                                label="Shelf Location"
                                value={formData.shelf_location}
                                onChange={(e) => setFormData({ ...formData, shelf_location: e.target.value })}
                                error={errors.shelf_location}
                                placeholder="e.g., A-23"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="available">Available</option>
                                    <option value="unavailable">Unavailable</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter book description..."
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                                icon={<Save className="w-5 h-5" />}
                                loading={isSubmitting}
                            >
                                Add Book
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/books')}
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
