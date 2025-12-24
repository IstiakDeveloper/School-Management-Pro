import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import { Search, Wallet, TrendingUp, Users, Calendar, DollarSign, Eye } from 'lucide-react';

function route(name: string, params?: any): string {
    if (name === 'provident-fund.index') return '/provident-fund';
    if (name === 'provident-fund.show' && params) return `/provident-fund/${params}`;
    return '/provident-fund';
}

interface Teacher {
    id: number;
    user: { name: string };
    employee_id: string;
    first_name: string;
    last_name: string;
    total_employee_pf: number;
    total_employer_pf: number;
    total_pf: number;
    total_withdrawn: number;
    last_contribution_date: string | null;
    contribution_count: number;
}

interface Summary {
    total_employee_contribution: number;
    total_employer_contribution: number;
    total_contributions: number;
    total_withdrawn: number;
    total_pf_balance: number;
    total_teachers: number;
    total_transactions: number;
}

interface ProvidentFundIndexProps {
    teacherSummary: {
        data: Teacher[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    summary: Summary;
    filters: {
        search?: string;
    };
}

export default function Index({ teacherSummary, summary, filters }: ProvidentFundIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('provident-fund.index'), { search }, { preserveState: true });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Provident Fund Ledger" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        Provident Fund Ledger
                                    </h1>
                                    <p className="text-gray-600 mt-1">View teacher PF contributions and balances</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-8 h-8 opacity-80" />
                                <Badge variant="primary" size="sm" className="bg-white/20">Employee</Badge>
                            </div>
                            <p className="text-sm opacity-90">Employee Contribution</p>
                            <p className="text-3xl font-bold mt-2">
                                ৳{parseFloat(summary.total_employee_contribution.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-8 h-8 opacity-80" />
                                <Badge variant="primary" size="sm" className="bg-white/20">Employer</Badge>
                            </div>
                            <p className="text-sm opacity-90">Employer Contribution</p>
                            <p className="text-3xl font-bold mt-2">
                                ৳{parseFloat(summary.total_employer_contribution.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-8 h-8 opacity-80" />
                                <Badge variant="primary" size="sm" className="bg-white/20">Total</Badge>
                            </div>
                            <p className="text-sm opacity-90">Total Contributions</p>
                            <p className="text-3xl font-bold mt-2">
                                ৳{parseFloat(summary.total_contributions.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <DollarSign className="w-8 h-8 opacity-80" />
                                <Badge variant="danger" size="sm" className="bg-white/20">Withdrawn</Badge>
                            </div>
                            <p className="text-sm opacity-90">Total Withdrawn</p>
                            <p className="text-3xl font-bold mt-2">
                                ৳{parseFloat(summary.total_withdrawn.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <Wallet className="w-8 h-8 opacity-80" />
                                <Badge variant="success" size="sm" className="bg-white/20">Current</Badge>
                            </div>
                            <p className="text-sm opacity-90">Current Balance</p>
                            <p className="text-3xl font-bold mt-2">
                                ৳{parseFloat(summary.total_pf_balance.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-8 h-8 opacity-80" />
                            </div>
                            <p className="text-sm opacity-90">Total Teachers</p>
                            <p className="text-3xl font-bold mt-2">{summary.total_teachers}</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar className="w-8 h-8 opacity-80" />
                            </div>
                            <p className="text-sm opacity-90">Total Transactions</p>
                            <p className="text-3xl font-bold mt-2">{summary.total_transactions}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search by teacher name or employee ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                            >
                                Search
                            </button>
                        </form>
                    </div>

                    {/* Teacher PF Table */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-sm font-semibold text-gray-900">Teacher</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Employee PF</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Employer PF</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Withdrawn</span>
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-900">Current Balance</span>
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-900">Contributions</span>
                                        </th>
                                        <th className="px-6 py-4 text-left">
                                            <span className="text-sm font-semibold text-gray-900">Last Date</span>
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            <span className="text-sm font-semibold text-gray-900">Action</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {teacherSummary.data.length > 0 ? teacherSummary.data.map((teacher, index) => (
                                        <tr
                                            key={teacher.id}
                                            className="hover:bg-green-50/50 transition-colors duration-150"
                                            style={{ animationDelay: `${index * 30}ms` }}
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{teacher.user.name}</p>
                                                    <p className="text-sm text-gray-600">{teacher.employee_id}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-blue-600">
                                                ৳{parseFloat(teacher.total_employee_pf.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-purple-600">
                                                ৳{parseFloat(teacher.total_employer_pf.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-red-600">
                                                ৳{parseFloat((teacher.total_withdrawn || 0).toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">
                                                ৳{parseFloat(teacher.total_pf.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Badge variant="info" size="sm">{teacher.contribution_count || 0} times</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(teacher.last_contribution_date)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route('provident-fund.show', teacher.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-300"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                                No PF records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {teacherSummary.last_page > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing {((teacherSummary.current_page - 1) * teacherSummary.per_page) + 1} to{' '}
                                    {Math.min(teacherSummary.current_page * teacherSummary.per_page, teacherSummary.total)} of{' '}
                                    {teacherSummary.total} results
                                </p>
                                <div className="flex gap-2">
                                    {teacherSummary.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
