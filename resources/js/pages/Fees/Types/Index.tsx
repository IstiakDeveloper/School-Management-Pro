import React, { useState, FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Edit, Trash2, Search, Tag } from 'lucide-react';

interface FeeType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
    status: 'active' | 'inactive';
}

interface Props {
    feeTypes: FeeType[];
}

export default function Index({ feeTypes }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const createForm = useForm({
        name: '',
        code: '',
        description: '',
        frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'one_time',
        status: 'active' as 'active' | 'inactive',
    });

    const editForm = useForm({
        name: '',
        code: '',
        description: '',
        frequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'one_time',
        status: 'active' as 'active' | 'inactive',
    });

    const filteredFeeTypes = feeTypes.filter(
        (feeType) =>
            feeType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feeType.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/fee-types', {
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedFeeType) return;

        editForm.put(`/fee-types/${selectedFeeType.id}`, {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedFeeType(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this fee type?')) {
            router.delete(`/fee-types/${id}`);
        }
    };

    const openEditModal = (feeType: FeeType) => {
        setSelectedFeeType(feeType);
        editForm.setData({
            name: feeType.name,
            code: feeType.code,
            description: feeType.description || '',
            frequency: feeType.frequency,
            status: feeType.status,
        });
        setShowEditModal(true);
    };

    const getFrequencyBadge = (frequency: string) => {
        const colors = {
            monthly: 'bg-blue-100 text-blue-800',
            quarterly: 'bg-purple-100 text-purple-800',
            yearly: 'bg-green-100 text-green-800',
            one_time: 'bg-gray-100 text-gray-800',
        };
        return colors[frequency as keyof typeof colors] || colors.monthly;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Types" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fee Types</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage different types of fees collected by the institution
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Fee Type
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* Fee Types Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Frequency
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFeeTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium text-gray-900">
                                                No fee types found
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Get started by creating a new fee type
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredFeeTypes.map((feeType) => (
                                        <tr key={feeType.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {feeType.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {feeType.code}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${getFrequencyBadge(
                                                        feeType.frequency
                                                    )}`}
                                                >
                                                    {feeType.frequency.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {feeType.description || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${
                                                        feeType.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {feeType.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(feeType)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(feeType.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Create Fee Type</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {createForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.code}
                                        onChange={(e) => createForm.setData('code', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {createForm.errors.code && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {createForm.errors.code}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency *
                                    </label>
                                    <select
                                        value={createForm.data.frequency}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'frequency',
                                                e.target.value as any
                                            )
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="one_time">One Time</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={createForm.data.description}
                                        onChange={(e) =>
                                            createForm.setData('description', e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={createForm.data.status}
                                        onChange={(e) =>
                                            createForm.setData('status', e.target.value as any)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            createForm.reset();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {createForm.processing ? 'Creating...' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedFeeType && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <h3 className="text-lg font-semibold mb-4">Edit Fee Type</h3>
                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {editForm.errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.code}
                                        onChange={(e) => editForm.setData('code', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                    {editForm.errors.code && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {editForm.errors.code}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Frequency *
                                    </label>
                                    <select
                                        value={editForm.data.frequency}
                                        onChange={(e) =>
                                            editForm.setData('frequency', e.target.value as any)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="one_time">One Time</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={editForm.data.description}
                                        onChange={(e) =>
                                            editForm.setData('description', e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status *
                                    </label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) =>
                                            editForm.setData('status', e.target.value as any)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedFeeType(null);
                                            editForm.reset();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {editForm.processing ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
