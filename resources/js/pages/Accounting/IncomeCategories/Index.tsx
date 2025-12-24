import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import Input from '@/Components/Input';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    code: string;
    description?: string;
    status: 'active' | 'inactive';
    transactions_count: number;
}

interface IndexProps {
    categories: Category[];
}

export default function Index({ categories }: IndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status: 'active',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleCreate = () => {
        router.post('/accounting/income-categories', formData, {
            onError: (errors) => setErrors(errors as Record<string, string>),
            onSuccess: () => {
                setIsCreating(false);
                setFormData({ name: '', code: '', description: '', status: 'active' });
                setErrors({});
            },
        });
    };

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setFormData({
            name: category.name,
            code: category.code,
            description: category.description || '',
            status: category.status,
        });
        setErrors({});
    };

    const handleUpdate = (id: number) => {
        router.put(`/accounting/income-categories/${id}`, formData, {
            onError: (errors) => setErrors(errors as Record<string, string>),
            onSuccess: () => {
                setEditingId(null);
                setFormData({ name: '', code: '', description: '', status: 'active' });
                setErrors({});
            },
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete income category "${name}"?`)) {
            router.delete(`/accounting/income-categories/${id}`);
        }
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({ name: '', code: '', description: '', status: 'active' });
        setErrors({});
    };

    return (
        <AuthenticatedLayout>
            <Head title="Income Categories" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Income Categories
                        </h1>
                        <p className="text-gray-600 mt-1">Manage income categories for transactions</p>
                    </div>
                    {!isCreating && !editingId && (
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                            icon={<Plus className="w-5 h-5" />}
                        >
                            Add Category
                        </Button>
                    )}
                </div>

                {/* Create/Edit Form */}
                {(isCreating || editingId) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {isCreating ? 'Create New Category' : 'Edit Category'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Category Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="e.g., Student Fees"
                            />
                            <Input
                                label="Category Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                error={errors.code}
                                required
                                placeholder="e.g., INC-001"
                            />
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                error={errors.description}
                                placeholder="Optional description"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <Button
                                onClick={() => isCreating ? handleCreate() : handleUpdate(editingId!)}
                                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
                            >
                                {isCreating ? 'Create' : 'Update'}
                            </Button>
                            <Button variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Categories</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {categories.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {categories.reduce((sum, c) => sum + c.transactions_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Transactions</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{category.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-gray-100 rounded text-sm">{category.code}</code>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {category.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="info">{category.transactions_count}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={category.status === 'active' ? 'success' : 'default'}>
                                                {category.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                    icon={<Edit className="w-4 h-4" />}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                    disabled={category.transactions_count > 0}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {categories.length === 0 && (
                            <div className="text-center py-12">
                                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No income categories found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
