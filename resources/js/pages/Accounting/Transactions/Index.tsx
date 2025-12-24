import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Search, Eye, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Transaction, Account, TransactionFilters, PaginatedData } from '@/types/accounting';

interface IndexProps {
    transactions: PaginatedData<Transaction>;
    filters?: TransactionFilters;
    accounts: Account[];
    stats: {
        total_income: number;
        total_expense: number;
        net: number;
    };
}

export default function Index({ transactions, filters, accounts, stats }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = () => {
        router.get('/accounting/transactions',
            { search, type, account_id: accountId, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        setAccountId('');
        setDateFrom('');
        setDateTo('');
        router.get('/accounting/transactions');
    };

    const handleDelete = (id: number, number: string) => {
        if (confirm(`Delete transaction "${number}"?`)) {
            router.delete(`/accounting/transactions/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Transactions
                        </h1>
                        <p className="text-gray-600 mt-1">Manage income, expense and transfer transactions</p>
                    </div>
                    <Link href="/accounting/transactions/create">
                        <Button className="bg-gradient-to-r from-green-600 to-blue-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            New Transaction
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-2xl font-bold text-green-600">৳{formatCurrency(stats.total_income)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Expense</p>
                                <p className="text-2xl font-bold text-red-600">৳{formatCurrency(stats.total_expense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Net Amount</p>
                                <p className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ৳{formatCurrency(Math.abs(stats.net))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <input
                            type="text"
                            placeholder="Search transaction..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                            <option value="transfer">Transfer</option>
                        </select>
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Accounts</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>{account.account_name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="From Date"
                        />
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="To Date"
                        />
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <Button onClick={handleFilter} icon={<Search className="w-5 h-5" />}>
                            Filter
                        </Button>
                        <Button variant="ghost" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.data.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{transaction.transaction_number}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(transaction.transaction_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={
                                                    transaction.type === 'income' ? 'success' :
                                                    transaction.type === 'expense' ? 'error' : 'info'
                                                }
                                                className="capitalize"
                                            >
                                                {transaction.type}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{transaction.account?.account_name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {transaction.income_category?.name || transaction.expense_category?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-semibold ${
                                                transaction.type === 'income' ? 'text-green-600' :
                                                transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                            }`}>
                                                {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/accounting/transactions/${transaction.id}`}>
                                                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(transaction.id, transaction.transaction_number)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {transactions.data.length === 0 && (
                            <div className="text-center py-12">
                                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No transactions found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
