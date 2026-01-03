import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, DollarSign, AlertCircle, Clock, CheckCircle, Printer, Download, Eye } from 'lucide-react';
import FeeCollectionModal from './FeeCollectionModal';

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getMonthName(month: number): string {
    return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
}

interface Student {
    id: number;
    admission_number: string;
    user: { name: string };
    school_class: { id: number; name: string };
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Collection {
    id: number;
    receipt_number: string;
    student: { user: { name: string }; admission_number: string; school_class: { name: string } };
    fee_type: { name: string };
    period: string;
    months_count: number;
    amount: number;
    paid_amount: number;
    discount: number;
    payment_date: string;
    payment_method: string;
    status: string;
    month: number;
    year: number;
}

interface Props {
    collections: { data: Collection[] };
    students: Student[];
    accounts: Account[];
    stats: { total_collected: number; pending_fees: number; overdue_fees: number };
}

export default function Index({ collections, students, accounts, stats }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter collections
    const filteredCollections = collections.data.filter((collection) => {
        const matchesStatus = filterStatus === 'all' || collection.status === filterStatus;
        const matchesSearch =
            !searchTerm ||
            collection.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Fee Collections" />

            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Fee Collections</h1>
                        <p className="text-gray-600 mt-1">Manage student fee payments</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Quick Collect
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Collected</p>
                                <p className="text-3xl font-bold mt-2">
                                    ৳{stats.total_collected.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-lg">
                                <DollarSign className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Pending Fees</p>
                                <p className="text-3xl font-bold mt-2">
                                    ৳{stats.pending_fees.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-lg">
                                <Clock className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Overdue Fees</p>
                                <p className="text-3xl font-bold mt-2">
                                    ৳{stats.overdue_fees.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-4 rounded-lg">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search by student, receipt, or admission number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="pending">Pending</option>
                        </select>
                        <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Collections Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Receipt #</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Class</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Fee Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Period</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Paid</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCollections.length > 0 ? (
                                    filteredCollections.map((collection) => (
                                        <tr key={collection.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm text-indigo-600 font-semibold">
                                                    {collection.receipt_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {collection.student.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {collection.student.admission_number}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {collection.student?.school_class?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{collection.fee_type?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <div>
                                                    <p className="font-medium">{collection.period}</p>
                                                    {collection.months_count > 1 && (
                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
                                                            {collection.months_count} Months
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                ৳{collection.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-green-600">
                                                    ৳{collection.paid_amount.toLocaleString('en-IN')}
                                                </span>
                                                {collection.discount > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        Discount: ৳{collection.discount.toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(collection.payment_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                        collection.status === 'paid'
                                                            ? 'bg-green-100 text-green-800'
                                                            : collection.status === 'partial'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {collection.status === 'paid' && (
                                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                                    )}
                                                    {collection.status === 'partial' && (
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                    )}
                                                    {collection.status === 'pending' && (
                                                        <AlertCircle className="w-3 h-3 inline mr-1" />
                                                    )}
                                                    {collection.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.visit(`/fee-collections/${collection.id}/receipt`)}
                                                        className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded transition"
                                                        title="View Receipt"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.visit(`/fee-collections/${collection.id}/receipt`);
                                                            setTimeout(() => window.print(), 500);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition"
                                                        title="Print Receipt"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                                                <p className="text-lg font-semibold">No collections found</p>
                                                <p className="text-sm">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <FeeCollectionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                students={students}
                accounts={accounts}
            />
        </AuthenticatedLayout>
    );
}
