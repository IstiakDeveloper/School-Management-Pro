import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, ArrowRightLeft, Calendar } from 'lucide-react';
import { Account, Transaction, AccountingStats } from '@/types/accounting';

interface ShowProps {
    account: Account & { transactions: Transaction[] };
    stats: {
        total_income: number;
        total_expense: number;
        transfers_in: number;
        transfers_out: number;
    };
}

export default function Show({ account, stats }: ShowProps) {
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
            <Head title={`Account: ${account.account_name}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            {account.account_name}
                        </h1>
                        <p className="text-gray-600 mt-1">Account Details and Transaction History</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/accounting/accounts/${account.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Account
                            </Button>
                        </Link>
                        <Link href="/accounting/accounts">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Account Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Number</p>
                            <p className="text-lg font-semibold text-gray-900">{account.account_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Account Type</p>
                            <Badge variant="info" className="capitalize">
                                {account.account_type.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600">৳{formatCurrency(account.current_balance)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <Badge variant={account.status === 'active' ? 'success' : 'default'}>
                                {account.status}
                            </Badge>
                        </div>
                    </div>

                    {(account.bank_name || account.branch) && (
                        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                            {account.bank_name && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Bank/Service Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.bank_name}</p>
                                </div>
                            )}
                            {account.branch && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Branch</p>
                                    <p className="text-lg font-semibold text-gray-900">{account.branch}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {account.description && (
                        <div className="mt-6 pt-6 border-t">
                            <p className="text-sm text-gray-600 mb-1">Description</p>
                            <p className="text-gray-900">{account.description}</p>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.total_income)}</p>
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
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.total_expense)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transfers In</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.transfers_in)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <ArrowRightLeft className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Transfers Out</p>
                                <p className="text-xl font-bold text-gray-900">৳{formatCurrency(stats.transfers_out)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions (Last 50)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction#</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {account.transactions && account.transactions.length > 0 ? (
                                    account.transactions.map((transaction) => (
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
                                            <td className="px-6 py-4 text-gray-600">
                                                {transaction.category_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-semibold ${
                                                    transaction.type === 'income' ? 'text-green-600' :
                                                    transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                                }`}>
                                                    {transaction.type === 'expense' ? '-' : '+'}৳{formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                                {transaction.description || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No transactions found for this account
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
