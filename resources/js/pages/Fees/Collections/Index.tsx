import React, { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, DollarSign, AlertCircle, Clock, CheckCircle, Printer, Eye, ChevronLeft, ChevronRight, Search, X, CalendarDays, RotateCcw, SlidersHorizontal } from 'lucide-react';
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
    roll_number: string;
    user: { name: string };
    school_class: { id: number; name: string };
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
    school_class?: { name: string };
}

interface FeeType {
    id: number;
    name: string;
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

interface PaginatedData<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props {
    collections: PaginatedData<Collection>;
    uniqueStudentCount?: number;
    students: Student[];
    accounts: Account[];
    classes: SchoolClass[];
    sections: Section[];
    feeTypes: FeeType[];
    stats: { total_collected: number; pending_fees: number; overdue_fees: number };
    filters: {
        status?: string;
        search?: string;
        class_id?: number;
        section_id?: number;
        fee_type_id?: number;
        date_from?: string;
        date_to?: string;
        month?: number;
        year?: number;
    };
}

export default function Index({ collections, uniqueStudentCount, students, accounts, classes, sections, feeTypes = [], stats, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [filterClass, setFilterClass] = useState<string>(filters.class_id?.toString() || 'all');
    const [filterSection, setFilterSection] = useState<string>(filters.section_id?.toString() || 'all');
    const [filterFeeType, setFilterFeeType] = useState<string>(filters.fee_type_id?.toString() || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Sync local state with URL params when filters prop changes
    useEffect(() => {
        setFilterStatus(filters.status || 'all');
        setFilterClass(filters.class_id?.toString() || 'all');
        setFilterSection(filters.section_id?.toString() || 'all');
        setFilterFeeType(filters.fee_type_id?.toString() || 'all');
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
        setSearchTerm(filters.search || '');
    }, [filters]);

    const isFirstRender = useRef(true);

    // Mark after first render so debounce doesn't fire on mount
    useEffect(() => {
        isFirstRender.current = false;
    }, []);

    // Debounced search
    useEffect(() => {
        if (isFirstRender.current) return;
        if (searchTerm === (filters.search || '')) return;
        const timer = setTimeout(() => applyFilters(), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Status pill click applies immediately
    const handleStatusClick = (status: string) => {
        setFilterStatus(status);
        const params: Record<string, any> = {};
        if (status !== 'all') params.status = status;
        if (filterClass !== 'all') params.class_id = filterClass;
        if (filterSection !== 'all') params.section_id = filterSection;
        if (filterFeeType !== 'all') params.fee_type_id = filterFeeType;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (searchTerm) params.search = searchTerm;
        router.get(typeof route !== 'undefined' ? route('fee-collections.index') : '/fee-collections', params, {
            preserveState: true, preserveScroll: true,
            only: ['collections', 'uniqueStudentCount', 'filters', 'stats'],
        });
    };

    // Filter sections based on selected class
    const filteredSections = filterClass === 'all'
        ? sections
        : sections.filter(section => section.class_id === parseInt(filterClass));

    const applyFilters = () => {
        const params: Record<string, any> = {};

        if (filterStatus !== 'all') params.status = filterStatus;
        if (filterClass !== 'all') params.class_id = filterClass;
        if (filterSection !== 'all') params.section_id = filterSection;
        if (filterFeeType !== 'all') params.fee_type_id = filterFeeType;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (searchTerm) params.search = searchTerm;

        const routeName = typeof route !== 'undefined' ? route('fee-collections.index') : '/fee-collections';

        router.get(routeName, params, {
            preserveState: true,
            preserveScroll: true,
            only: ['collections', 'uniqueStudentCount', 'filters', 'stats']
        });
    };

    const resetFilters = () => {
        setFilterStatus('all');
        setFilterClass('all');
        setFilterSection('all');
        setFilterFeeType('all');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');
        const routeName = typeof route !== 'undefined' ? route('fee-collections.index') : '/fee-collections';
        router.get(routeName, {}, { preserveState: true, only: ['collections', 'uniqueStudentCount', 'filters', 'stats'] });
    };

    const setPresetMonth = (preset: 'this_month' | 'last_month') => {
        const now = new Date();
        let start: Date;
        let end: Date;
        if (preset === 'this_month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        }
        setDateFrom(start.toISOString().slice(0, 10));
        setDateTo(end.toISOString().slice(0, 10));
    };

    const handleClassChange = (classId: string) => {
        setFilterClass(classId);
        if (classId === 'all') setFilterSection('all');
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Collections" />

            <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Fee Collections</h1>
                        <p className="text-sm text-gray-600 mt-0.5">Manage student fee payments</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Collect Fee
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs font-medium">Total Collected</p>
                                <p className="text-2xl font-bold mt-1">
                                    ৳{stats.total_collected.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-xs font-medium">Pending Fees</p>
                                <p className="text-2xl font-bold mt-1">
                                    ৳{stats.pending_fees.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-xs font-medium">Overdue Fees</p>
                                <p className="text-2xl font-bold mt-1">
                                    ৳{stats.overdue_fees.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
                    {/* Status Pills */}
                    <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-gray-100 flex-wrap">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1 shrink-0" />
                        {[
                            { value: 'all',     label: 'All',     color: 'gray' },
                            { value: 'paid',    label: 'Paid',    color: 'green' },
                            { value: 'pending', label: 'Pending', color: 'yellow' },
                            { value: 'overdue', label: 'Overdue', color: 'red' },
                            { value: 'partial', label: 'Partial', color: 'blue' },
                        ].map(({ value, label, color }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleStatusClick(value)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold transition border ${
                                    filterStatus === value
                                        ? color === 'gray'   ? 'bg-gray-700   text-white border-gray-700'
                                        : color === 'green'  ? 'bg-green-600  text-white border-green-600'
                                        : color === 'yellow' ? 'bg-yellow-500 text-white border-yellow-500'
                                        : color === 'red'    ? 'bg-red-600    text-white border-red-600'
                                        :                      'bg-blue-600   text-white border-blue-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Fields */}
                    <div className="p-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {/* Search */}
                            <div className="col-span-2 sm:col-span-1 lg:col-span-2 relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Student name, receipt no..."
                                    value={searchTerm}
                                    onChange={(e) => { isFirstRender.current = false; setSearchTerm(e.target.value); }}
                                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
                                />
                                {searchTerm && (
                                    <button onClick={() => { isFirstRender.current = false; setSearchTerm(''); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Fee Type */}
                            <div>
                                <select
                                    value={filterFeeType}
                                    onChange={(e) => setFilterFeeType(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
                                >
                                    <option value="all">All Fee Types</option>
                                    {feeTypes.map((ft) => (
                                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Class */}
                            <div>
                                <select
                                    value={filterClass}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition"
                                >
                                    <option value="all">All Classes</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section */}
                            <div>
                                <select
                                    value={filterSection}
                                    onChange={(e) => setFilterSection(e.target.value)}
                                    disabled={filterClass === 'all'}
                                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="all">All Sections</option>
                                    {filteredSections.map((section) => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Row */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="text-sm bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-gray-700 w-32"
                                />
                                <span className="text-gray-400 text-xs">—</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="text-sm bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-gray-700 w-32"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setPresetMonth('this_month')}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
                            >
                                This Month
                            </button>
                            <button
                                type="button"
                                onClick={() => setPresetMonth('last_month')}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition"
                            >
                                Last Month
                            </button>

                            <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </button>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <Search className="w-3.5 h-3.5" />
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collections Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Receipt</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fee Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Period</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Paid</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {collections.data.length > 0 ? (
                                    collections.data.map((collection) => (
                                        <tr key={collection.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-xs text-indigo-600 font-semibold">
                                                    {collection.receipt_number}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {collection.student.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {collection.student.admission_number}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {collection.student?.school_class?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">{collection.fee_type?.name || 'N/A'}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{collection.period}</p>
                                                    {collection.months_count > 1 && (
                                                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded">
                                                            {collection.months_count} Months
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                                ৳{collection.amount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm font-semibold text-green-600">
                                                    ৳{collection.paid_amount.toLocaleString('en-IN')}
                                                </span>
                                                {collection.discount > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        -৳{collection.discount.toLocaleString('en-IN')}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600">
                                                {formatDate(collection.payment_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    collection.status === 'paid'    ? 'bg-green-100  text-green-800' :
                                                    collection.status === 'partial' ? 'bg-blue-100   text-blue-800' :
                                                    collection.status === 'overdue' ? 'bg-red-100    text-red-800' :
                                                                                      'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {collection.status === 'paid'    && <CheckCircle className="w-3 h-3" />}
                                                    {collection.status === 'partial' && <Clock className="w-3 h-3" />}
                                                    {collection.status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {collection.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                                                    {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => router.visit(`/fee-collections/${collection.id}/receipt`)}
                                                        className="text-indigo-600 hover:text-indigo-800 p-1.5 hover:bg-indigo-50 rounded transition"
                                                        title="View Receipt"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            router.visit(`/fee-collections/${collection.id}/receipt`);
                                                            setTimeout(() => window.print(), 500);
                                                        }}
                                                        className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-100 rounded transition"
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
                                        <td colSpan={10} className="px-4 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                                                <p className="text-sm font-medium">No collections found</p>
                                                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {collections.last_page > 1 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-700">
                                    Showing <span className="font-semibold">{collections.from}</span> to{' '}
                                    <span className="font-semibold">{collections.to}</span> of{' '}
                                    <span className="font-semibold">{collections.total}</span> receipts
                                    {uniqueStudentCount != null && uniqueStudentCount !== collections.total && (
                                        <span className="text-gray-500"> ({uniqueStudentCount} unique students)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handlePageChange(collections.prev_page_url)}
                                        disabled={!collections.prev_page_url}
                                        className={`px-2 py-1 text-xs rounded border ${
                                            collections.prev_page_url
                                                ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } transition flex items-center gap-1`}
                                    >
                                        <ChevronLeft className="w-3 h-3" />
                                        Prev
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {collections.links.slice(1, -1).map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handlePageChange(link.url)}
                                                disabled={!link.url}
                                                className={`px-2 py-1 text-xs rounded border ${
                                                    link.active
                                                        ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
                                                        : link.url
                                                        ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                                } transition`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(collections.next_page_url)}
                                        disabled={!collections.next_page_url}
                                        className={`px-2 py-1 text-xs rounded border ${
                                            collections.next_page_url
                                                ? 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                        } transition flex items-center gap-1`}
                                    >
                                        Next
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
