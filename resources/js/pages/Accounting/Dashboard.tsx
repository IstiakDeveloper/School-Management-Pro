import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Wallet, TrendingUp, TrendingDown, DollarSign,
    PieChart, Activity, Building2
} from 'lucide-react';
import { AccountingStats, Transaction, CategoryBreakdown, AccountSummary } from '@/types/accounting';
import { PaginatedData } from '@/types';

interface DashboardProps {
    stats: AccountingStats;
    recentTransactions: Transaction[];
    expenseByCategory: CategoryBreakdown[];
    incomeByCategory: CategoryBreakdown[];
    accounts: AccountSummary[];
}

export default function Dashboard({ stats, recentTransactions, expenseByCategory, incomeByCategory, accounts }: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 2,
        }).format(amount).replace('BDT', '৳');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Accounting Dashboard" />

            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Accounting Dashboard
                    </h1>
                    <p className="text-gray-600 mt-1">Overview of financial status and transactions</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Balance</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(stats.total_balance)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Wallet className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {formatCurrency(stats.total_income)}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Expense</p>
                                <p className="text-2xl font-bold text-red-600 mt-1">
                                    {formatCurrency(stats.total_expense)}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-xl">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Fixed Assets</p>
                                <p className="text-2xl font-bold text-blue-600 mt-1">
                                    {formatCurrency(stats.total_assets)}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <p className="text-sm font-medium">This Month Income</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(stats.monthly_income || 0)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5" />
                            <p className="text-sm font-medium">This Month Expense</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(stats.monthly_expense || 0)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <PieChart className="w-5 h-5" />
                            <p className="text-sm font-medium">Net Balance</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency((stats.monthly_income || 0) - (stats.monthly_expense || 0))}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Transactions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                        <div className="space-y-3">
                            {recentTransactions.length > 0 ? recentTransactions.slice(0, 8).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{transaction.transaction_number}</p>
                                        <p className="text-sm text-gray-600">{transaction.account?.account_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${
                                            transaction.type === 'income' ? 'text-green-600' :
                                            transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                                        }`}>
                                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-8">No recent transactions</p>
                            )}
                        </div>
                    </div>

                    {/* Accounts Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Summary</h3>
                        <div className="space-y-3">
                            {accounts.length > 0 ? accounts.map((account) => (
                                <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{account.name}</p>
                                        <p className="text-sm text-gray-600 capitalize">{account.type.replace('_', ' ')}</p>
                                    </div>
                                    <p className="font-bold text-gray-900">{formatCurrency(account.balance)}</p>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-8">No accounts found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category (This Month)</h3>
                        <div className="space-y-3">
                            {incomeByCategory.length > 0 ? incomeByCategory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-700">{item.category}</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(item.total)}</span>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4">No income data</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category (This Month)</h3>
                        <div className="space-y-3">
                            {expenseByCategory.length > 0 ? expenseByCategory.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-gray-700">{item.category}</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(item.total)}</span>
                                </div>
                            )) : (
                                <p className="text-center text-gray-500 py-4">No expense data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
