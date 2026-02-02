import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useReactToPrint } from 'react-to-print';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import PrintProvidentFundIndex from './PrintProvidentFundIndex';
import { Search, Wallet, TrendingUp, Users, Calendar, DollarSign, Eye, Printer } from 'lucide-react';

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
    allTeachers: { id: number; name: string; employee_id: string }[];
    filters: {
        search?: string;
        teacher_id?: number;
        from_date?: string;
        to_date?: string;
    };
}

export default function Index({ teacherSummary, summary, allTeachers, filters }: ProvidentFundIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [teacherId, setTeacherId] = useState(filters.teacher_id || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Provident_Fund_Ledger_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}`,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('provident-fund.index'), {
            search,
            teacher_id: teacherId,
            from_date: fromDate,
            to_date: toDate
        }, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTeacherId('');
        setFromDate('');
        setToDate('');
        router.get(route('provident-fund.index'), {}, { preserveState: true });
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Provident Fund Ledger" />

            {/* Hidden Print Component */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <PrintProvidentFundIndex ref={printRef} teachers={teacherSummary.data} summary={summary} />
            </div>

            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 rounded-lg">
                                    <Wallet className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        Provident Fund Ledger
                                    </h1>
                                    <p className="text-gray-600 mt-1">View teacher PF contributions and balances</p>
                                </div>
                            </div>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Employee Contribution</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{parseFloat(summary.total_employee_contribution.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Employer Contribution</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{parseFloat(summary.total_employer_contribution.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Total Withdrawn</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                ৳{parseFloat(summary.total_withdrawn.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                ৳{parseFloat(summary.total_pf_balance.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {/* Search */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Name or Employee ID..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10 w-full"
                                        />
                                    </div>
                                </div>

                                {/* Teacher Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                    <select
                                        value={teacherId}
                                        onChange={(e) => setTeacherId(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Teachers</option>
                                        {allTeachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} ({teacher.employee_id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* From Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                    <Input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* To Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                    <Input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Teacher PF Table */}
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
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
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{teacher.user.name}</p>
                                                    <p className="text-sm text-gray-600">{teacher.employee_id}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ৳{parseFloat(teacher.total_employee_pf.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ৳{parseFloat(teacher.total_employer_pf.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ৳{parseFloat((teacher.total_withdrawn || 0).toString()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-900">
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
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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
                                                    ? 'bg-blue-600 text-white'
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
