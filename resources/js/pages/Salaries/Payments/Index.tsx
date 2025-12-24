import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import { Plus, Search, DollarSign, User as UserIcon, Calendar, Wallet, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';

function route(name: string, params?: any): string {
    if (name === 'salary-payments.store') return '/salary-payments';
    if (name === 'salary-payments.index') return '/salary-payments';
    if (name === 'salary-payments.show' && params) return `/salary-payments/${params}`;
    if (name === 'salary-payments.destroy' && params) return `/salary-payments/${params}`;
    return '/salary-payments';
}

interface Teacher {
    id: number;
    name: string;
    employee_id: string;
    salary: number;
    designation: string;
}

interface Account {
    id: number;
    account_name: string;
    account_number: string;
}

interface Payment {
    id: number;
    staff: {
        user: { name: string };
        employee_id: string;
    };
    month: number;
    year: number;
    base_salary: number;
    provident_fund_deduction: number;
    employer_pf_contribution: number;
    net_salary: number;
    total_amount: number;
    payment_date: string;
    account: { account_name: string };
    payment_method: string;
}

interface SalaryPaymentsIndexProps {
    payments: {
        data: Payment[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    teachers: Teacher[];
    accounts: Account[];
    filters: {
        search?: string;
        month?: number;
        year?: number;
    };
}

export default function Index({ payments, teachers, accounts, filters }: SalaryPaymentsIndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [filterMonth, setFilterMonth] = useState(filters.month?.toString() || '');
    const [filterYear, setFilterYear] = useState(filters.year?.toString() || '');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [bulkPayment, setBulkPayment] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);

    const [formData, setFormData] = useState({
        staff_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        base_salary: '',
        payment_date: new Date().toISOString().split('T')[0],
        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
        payment_method: 'bank_transfer',
        reference_number: '',
        remarks: '',
    });

    const employeePF = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) * 0.05).toFixed(2)
        : '0.00';

    const employerPF = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) * 0.05).toFixed(2)
        : '0.00';

    const netSalary = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) - parseFloat(employeePF)).toFixed(2)
        : '0.00';

    const totalAmount = selectedTeacher && formData.base_salary
        ? (parseFloat(formData.base_salary) + parseFloat(employerPF)).toFixed(2)
        : '0.00';

    const handleTeacherChange = (teacherId: string) => {
        const teacher = teachers.find((t: Teacher) => t.id === parseInt(teacherId));
        setSelectedTeacher(teacher || null);
        setFormData({
            ...formData,
            staff_id: teacherId,
            base_salary: teacher?.salary?.toString() || '',
        });
    };

    const handleBulkPaymentToggle = () => {
        setBulkPayment(!bulkPayment);
        setSelectedTeachers([]);
        setSelectedTeacher(null);
        setFormData({
            ...formData,
            staff_id: '',
            base_salary: '',
        });
    };

    const handleTeacherSelect = (teacherId: number) => {
        if (selectedTeachers.includes(teacherId)) {
            setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
        } else {
            setSelectedTeachers([...selectedTeachers, teacherId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedTeachers.length === filteredTeachers.length) {
            setSelectedTeachers([]);
        } else {
            setSelectedTeachers(filteredTeachers.map(t => t.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (bulkPayment) {
            // Process bulk payments
            const bulkData = {
                teacher_ids: selectedTeachers,
                month: formData.month,
                year: formData.year,
                payment_date: formData.payment_date,
                account_id: formData.account_id,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number,
                remarks: formData.remarks,
            };

            router.post('/salary-payments/bulk', bulkData, {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedTeachers([]);
                    setBulkPayment(false);
                    setFormData({
                        staff_id: '',
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        base_salary: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
                        payment_method: 'bank_transfer',
                        reference_number: '',
                        remarks: '',
                    });
                },
            });
        } else {
            // Process single payment
            router.post(route('salary-payments.store'), formData, {
                onSuccess: () => {
                    setShowModal(false);
                    setSelectedTeacher(null);
                    setFormData({
                        staff_id: '',
                        month: new Date().getMonth() + 1,
                        year: new Date().getFullYear(),
                        base_salary: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
                        payment_method: 'bank_transfer',
                        reference_number: '',
                        remarks: '',
                    });
                },
            });
        }
    };

    const handleFilter = () => {
        router.get(route('salary-payments.index'), {
            search: search,
            month: filterMonth,
            year: filterYear,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setFilterMonth('');
        setFilterYear('');
        router.get(route('salary-payments.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const totalPaid = payments.data.reduce((sum, p) => sum + parseFloat(p.total_amount.toString()), 0);
    const totalNetSalary = payments.data.reduce((sum, p) => sum + parseFloat(p.net_salary.toString()), 0);

    const filteredTeachers = teachers.filter((teacher) =>
        teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.employee_id.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.designation.toLowerCase().includes(teacherSearch.toLowerCase())
    );

    // Debug: Log teachers data
    console.log('Teachers data:', teachers);
    console.log('Filtered teachers:', filteredTeachers);

    return (
        <AuthenticatedLayout>
            <Head title="Salary Payments" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Teacher Salary Payments
                        </h1>
                        <p className="text-gray-600 mt-2">Manage monthly salary payments with automatic Provident Fund calculation</p>
                    </div>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                        icon={<Plus className="w-5 h-5" />}
                    >
                        Pay Salary
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Payments</p>
                                <p className="text-2xl font-bold text-gray-900">{payments.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-gray-900">৳{totalPaid.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Net Salary</p>
                                <p className="text-2xl font-bold text-gray-900">৳{totalNetSalary.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Teachers</p>
                                <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                type="text"
                                placeholder="Search by name or employee ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                icon={<Search className="w-5 h-5" />}
                            />
                        </div>
                        <div>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Months</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">All Years</option>
                                {[2023, 2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleFilter}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            icon={<Filter className="w-5 h-5" />}
                        >
                            Apply Filters
                        </Button>
                        <Button
                            onClick={handleClearFilters}
                            variant="ghost"
                            className="hover:bg-gray-100"
                            icon={<X className="w-5 h-5" />}
                        >
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Teacher</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Period</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Base Salary</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">PF (5%)</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Net Salary</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Total Paid</span>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <span className="text-sm font-semibold text-gray-900">Date</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data.length > 0 ? payments.data.map((payment, index) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-blue-50/50 transition-colors duration-150 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                                                    <UserIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{payment.staff.user.name}</p>
                                                    <p className="text-sm text-gray-600">{payment.staff.employee_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info" size="sm">
                                                {getMonthName(payment.month)} {payment.year}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                                            ৳{parseFloat(payment.base_salary.toString()).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-600 font-semibold">
                                            -৳{parseFloat(payment.provident_fund_deduction.toString()).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">
                                            ৳{parseFloat(payment.net_salary.toString()).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                                            ৳{parseFloat(payment.total_amount.toString()).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {formatDate(payment.payment_date)}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No salary payments found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer with Pagination */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{payments.data.length}</span> of{' '}
                                <span className="font-medium text-gray-900">{payments.total}</span> payments
                            </p>
                            {payments.last_page > 1 && (
                                <div className="flex gap-2">
                                    {Array.from({ length: payments.last_page }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/salary-payments?page=${page}`}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                page === payments.current_page
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pay Salary Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-blue-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up transform transition-all">
                            <div className="p-8">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center mb-8 pb-6 border-b-2" style={{borderImage: 'linear-gradient(to right, rgb(59, 130, 246), rgb(168, 85, 247), rgb(236, 72, 153)) 1'}}>
                                    <div>
                                        <h3 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                                            💰 Pay Teacher Salary
                                        </h3>
                                        <p className="text-sm text-gray-700 mt-2 font-medium">Process monthly salary with automatic 5% PF calculation</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-3 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 rounded-xl transition-all duration-300 hover:scale-110 group"
                                    >
                                        <X className="w-6 h-6 text-gray-500 group-hover:text-red-600 transition-colors" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Bulk Payment Toggle */}
                                    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-300">
                                        <span className="font-bold text-gray-800 flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-indigo-600" />
                                            Pay Multiple Teachers at Once
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleBulkPaymentToggle}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                                bulkPayment ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                    bulkPayment ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Teacher Selection */}
                                    <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 rounded-xl border border-blue-200/50">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                            <UserIcon className="w-4 h-4 text-blue-600" />
                                            {bulkPayment ? 'Select Teachers' : 'Teacher'} <span className="text-red-500">*</span>
                                        </label>

                                        {/* Search Teachers */}
                                        <div className="mb-3">
                                            <Input
                                                type="text"
                                                placeholder="Search by name, ID, or designation..."
                                                value={teacherSearch}
                                                onChange={(e) => setTeacherSearch(e.target.value)}
                                                icon={<Search className="w-5 h-5" />}
                                            />
                                        </div>

                                        {bulkPayment ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-blue-200">
                                                    <span className="text-sm font-semibold text-blue-900">
                                                        {selectedTeachers.length} of {filteredTeachers.length} selected
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={handleSelectAll}
                                                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        {selectedTeachers.length === filteredTeachers.length ? 'Deselect All' : 'Select All'}
                                                    </button>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto space-y-2 bg-white rounded-lg p-2">
                                                    {filteredTeachers.map((teacher) => (
                                                        <label
                                                            key={teacher.id}
                                                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-gray-200"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTeachers.includes(teacher.id)}
                                                                onChange={() => handleTeacherSelect(teacher.id)}
                                                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">{teacher.name}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    {teacher.employee_id} • {teacher.designation} • Salary: ৳{teacher.salary.toLocaleString('en-IN')}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <select
                                                value={formData.staff_id}
                                                onChange={(e) => handleTeacherChange(e.target.value)}
                                                required={!bulkPayment}
                                                className="w-full rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            >
                                                <option value="">Select Teacher</option>
                                                {filteredTeachers.map((teacher) => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.name} ({teacher.employee_id}) - {teacher.designation} - Salary: ৳{teacher.salary.toLocaleString('en-IN')}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Month/Year */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 p-4 rounded-xl border border-green-200/50">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                <Calendar className="w-4 h-4 text-green-600" />
                                                Month <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.month}
                                                onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                                required
                                                className="w-full rounded-xl border-2 border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 rounded-xl border border-purple-200/50">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                <Calendar className="w-4 h-4 text-purple-600" />
                                                Year <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                                required
                                                className="w-full rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            >
                                                {[2023, 2024, 2025, 2026].map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Base Salary - Only for Single Payment */}
                                    {!bulkPayment && (
                                        <div className="bg-gradient-to-r from-orange-50/50 to-yellow-50/50 p-4 rounded-xl border border-orange-200/50">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                <DollarSign className="w-4 h-4 text-orange-600" />
                                                Base Salary <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.base_salary}
                                                onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                                                required={!bulkPayment}
                                                placeholder="5000.00"
                                                icon={<DollarSign className="w-5 h-5" />}
                                            />
                                        </div>
                                    )}

                                    {/* PF Calculation Summary */}
                                    {bulkPayment && selectedTeachers.length > 0 ? (
                                        (() => {
                                            const selectedTeachersList = teachers.filter(t => selectedTeachers.includes(t.id));
                                            const totalBaseSalary = selectedTeachersList.reduce((sum, t) => sum + parseFloat(t.salary.toString()), 0);
                                            const totalEmployeePF = totalBaseSalary * 0.05;
                                            const totalEmployerPF = totalBaseSalary * 0.05;
                                            const totalNetSalary = totalBaseSalary - totalEmployeePF;
                                            const totalAmount = totalBaseSalary + totalEmployerPF;

                                            return (
                                                <div className="bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 border-4 border-green-400 rounded-2xl p-8 space-y-4 animate-fade-in shadow-xl">
                                                    <h4 className="font-extrabold text-green-900 mb-4 flex items-center gap-3 text-lg">
                                                        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
                                                            <UserIcon className="w-6 h-6 text-white" />
                                                        </div>
                                                        Bulk Payment Summary
                                                    </h4>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center py-2 border-b border-green-200">
                                                            <span className="text-sm font-medium text-gray-700">Selected Teachers:</span>
                                                            <span className="font-bold text-lg text-gray-900">{selectedTeachers.length}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm font-medium text-gray-700">Total Base Salary:</span>
                                                            <span className="font-bold text-lg text-gray-900">
                                                                ৳{totalBaseSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm font-medium text-gray-700">Total Employee PF (5%):</span>
                                                            <span className="font-bold text-lg text-red-600">
                                                                -৳{totalEmployeePF.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center py-2">
                                                            <span className="text-sm font-medium text-gray-700">Total Employer PF (5%):</span>
                                                            <span className="font-bold text-lg text-blue-600">
                                                                +৳{totalEmployerPF.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                        <div className="border-t-2 border-green-400 pt-4 mt-3 space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold text-green-700">Total Net Salary (Teachers Receive):</span>
                                                                <span className="font-extrabold text-green-700 text-2xl">
                                                                    ৳{totalNetSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-bold text-gray-900">Total Amount (From Account):</span>
                                                                <span className="font-extrabold text-gray-900 text-2xl">
                                                                    ৳{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : selectedTeacher && formData.base_salary && (
                                        <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-4 border-blue-400 rounded-2xl p-8 space-y-4 animate-fade-in shadow-xl transform hover:scale-[1.02] transition-all duration-300">
                                            <h4 className="font-extrabold text-blue-900 mb-4 flex items-center gap-3 text-lg">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                                                    <Wallet className="w-6 h-6 text-white" />
                                                </div>
                                                Provident Fund Calculation (5% each)
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-700">Base Salary:</span>
                                                    <span className="font-semibold">৳{parseFloat(formData.base_salary).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-700">Employee PF (5%):</span>
                                                    <span className="font-semibold text-red-600">-৳{parseFloat(employeePF).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-700">Employer PF (5%):</span>
                                                    <span className="font-semibold text-blue-600">+৳{parseFloat(employerPF).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div className="border-t-2 border-blue-300 pt-3 mt-3">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-green-700">Net Salary (Teacher Receives):</span>
                                                        <span className="font-bold text-green-700 text-lg">৳{parseFloat(netSalary).toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <div className="flex justify-between mt-2">
                                                        <span className="font-semibold text-gray-900">Total Amount (From Account):</span>
                                                        <span className="font-bold text-gray-900 text-lg">৳{parseFloat(totalAmount).toLocaleString('en-IN')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Details */}
                                    <div className="bg-gradient-to-r from-cyan-50/50 to-teal-50/50 p-4 rounded-xl border border-cyan-200/50">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                            <Wallet className="w-4 h-4 text-cyan-600" />
                                            Payment Account <span className="text-red-500">*</span>
                                            {formData.account_id === (accounts[0]?.id.toString() || '') && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Auto-selected</span>
                                            )}
                                        </label>
                                        <select
                                            value={formData.account_id}
                                            onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                            required
                                            className="w-full rounded-xl border-2 border-cyan-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.account_name} ({account.account_number})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-4 rounded-xl border border-indigo-200/50">
                                            <label className="block text-sm font-bold text-gray-800 mb-3">
                                                Payment Method <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                                required
                                                className="w-full rounded-xl border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            >
                                                <option value="cash">💵 Cash</option>
                                                <option value="bank_transfer">🏦 Bank Transfer</option>
                                                <option value="cheque">📝 Cheque</option>
                                            </select>
                                        </div>
                                        <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 p-4 rounded-xl border border-rose-200/50">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-3">
                                                <Calendar className="w-4 h-4 text-rose-600" />
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                                required
                                                className="w-full rounded-xl border-2 border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 p-4 rounded-xl border border-amber-200/50">
                                        <label className="block text-sm font-bold text-gray-800 mb-3">Reference Number</label>
                                        <Input
                                            type="text"
                                            value={formData.reference_number}
                                            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                            placeholder="Cheque/Transaction number..."
                                        />
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 p-4 rounded-xl border border-gray-200/50">
                                        <label className="block text-sm font-bold text-gray-800 mb-3">Remarks</label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            rows={3}
                                            className="w-full rounded-xl border-2 border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-500 shadow-sm font-medium text-gray-900 p-3 bg-white"
                                            placeholder="Additional notes..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-6 border-t-2 border-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mt-6">
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold text-lg py-4"
                                            icon={<DollarSign className="w-6 h-6" />}
                                            disabled={bulkPayment ? selectedTeachers.length === 0 : !formData.staff_id}
                                        >
                                            💰 {bulkPayment ? `Process ${selectedTeachers.length} Payments` : 'Process Payment'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-8 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold border-2 border-gray-300 hover:border-gray-400 transform hover:scale-105 transition-all duration-300"
                                        >
                                            ✖ Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
