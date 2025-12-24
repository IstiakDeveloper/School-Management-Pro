import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Search, Eye, Edit, Trash2, Wallet, TrendingUp, Building2 } from 'lucide-react';
import { Account, AccountFilters, AccountingStats, PaginatedData } from '@/types/accounting';

interface IndexProps {
    accounts: PaginatedData<Account>;
    filters?: AccountFilters;
    stats: AccountingStats;
}

export default function Index({ accounts, filters, stats }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [status, setStatus] = useState(filters?.status || '');

    const handleFilter = () => {
        router.get('/accounting/accounts', { search, type, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        setStatus('');
        router.get('/accounting/accounts');
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete account "${name}"?`)) {
            router.delete(`/accounting/accounts/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Accounts" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Accounts
                        </h1>
                        <p className="text-gray-600 mt-1">Manage bank, cash, and mobile banking accounts</p>
                    </div>
                    <Link href="/accounting/accounts/create">
                        <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Account
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Wallet className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Balance</p>
                                <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(stats.total_balance)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Accounts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_accounts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Accounts</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.active_accounts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search accounts..."
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Types</option>
                            <option value="bank">Bank</option>
                            <option value="cash">Cash</option>
                            <option value="mobile_banking">Mobile Banking</option>
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <div className="flex gap-2">
                            <Button onClick={handleFilter} className="flex-1" icon={<Search className="w-4 h-4" />}>Filter</Button>
                            <Button onClick={handleReset} variant="outline" className="flex-1">Reset</Button>
                        </div>
                    </div>
                </div>

                {/* Accounts Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Account Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Account Number</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bank/Details</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Current Balance</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {accounts.data.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{account.account_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{account.account_number}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info" className="capitalize">
                                                {account.account_type.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {account.bank_name || '-'}
                                            {account.branch && ` (${account.branch})`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-900">
                                                ৳{formatCurrency(account.current_balance)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={account.status === 'active' ? 'success' : 'default'}>
                                                {account.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/accounting/accounts/${account.id}`}>
                                                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                </Link>
                                                <Link href={`/accounting/accounts/${account.id}/edit`}>
                                                    <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(account.id, account.account_name)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {accounts.data.length === 0 && (
                            <div className="text-center py-12">
                                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No accounts found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
