import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Search, Eye, Edit, Trash2, Wallet, Building2, TrendingUp, RefreshCw } from 'lucide-react';
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
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Accounts" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                            Accounts
                        </h1>
                        <p className="text-xs text-emerald-700/80 mt-0.5">Bank, cash & mobile banking</p>
                    </div>
                    <Link href="/accounting/accounts/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>
                            Create Account
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                            <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Balance</p>
                            <p className="text-sm font-semibold text-gray-900">৳{formatCurrency(stats.total_balance ?? 0)}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                            <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Accounts</p>
                            <p className="text-sm font-semibold text-gray-900">{stats.total_accounts ?? 0}</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-emerald-100 border-l-4 border-l-emerald-500 shadow-sm px-4 py-3 flex items-center gap-3">
                        <div className="p-1.5 rounded bg-emerald-100 text-emerald-700">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active</p>
                            <p className="text-sm font-semibold text-gray-900">{stats.active_accounts ?? 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="text-sm w-full max-w-[180px] px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="text-sm w-full max-w-[140px] px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">All Types</option>
                            <option value="bank">Bank</option>
                            <option value="cash">Cash</option>
                            <option value="mobile_banking">Mobile Banking</option>
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-sm w-full max-w-[120px] px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleFilter}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                        >
                            <Search className="w-3.5 h-3.5" /> Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reset
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-emerald-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-emerald-50/70 border-b border-emerald-100">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Number</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Bank/Details</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {accounts.data.map((account) => (
                                    <tr key={account.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{account.account_name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{account.account_number}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                                                {account.account_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {account.bank_name || '—'}
                                            {account.branch && ` (${account.branch})`}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                            ৳{formatCurrency(account.current_balance)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                    account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {account.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/accounting/accounts/${account.id}`}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                                    title="View"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                                <Link
                                                    href={`/accounting/accounts/${account.id}/edit`}
                                                    className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(account.id, account.account_name)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {accounts.data.length === 0 && (
                        <div className="text-center py-12">
                            <Wallet className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No accounts found</p>
                        </div>
                    )}
                </div>

                <IndexPagination
                    links={accounts.links}
                    from={accounts.from ?? undefined}
                    to={accounts.to ?? undefined}
                    total={accounts.total}
                    lastPage={accounts.last_page}
                />
            </div>
        </AuthenticatedLayout>
    );
}
