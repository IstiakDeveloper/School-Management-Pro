import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, X, AlertCircle, CheckCircle, DollarSign, Filter, Printer, Search, Download } from 'lucide-react';
import PrintReport from './PrintReport';

// Print styles - simplified
const printStyles = `
    @media print {
        @page {
            size: A4 portrait;
            margin: 15mm;
        }
        .no-print {
            display: none !important;
        }
    }
`;

function route(name: string, params?: any): string {
    if (name === 'fee-collections.store') return '/fee-collections';
    if (name === 'fee-collections.destroy' && params) return `/fee-collections/${params.id}`;
    return '/fee-collections';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function isOverdue(dueDate: string): boolean {
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
}

interface Student {
    id: number;
    admission_number: string;
    user: { name: string };
    school_class: { id: number; name: string };
}

interface FeeStructure {
    id: number;
    fee_type: { id: number; name: string; frequency: string };
    amount: number;
    due_date: string;
}

interface SelectedFeeItem {
    fee_structure_id: number;
    fee_type_name: string;
    amount: number;
    frequency: string;
    month: number;
    year: number;
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
    amount: number;
    paid_amount: number;
    payment_date: string;
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
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [availableFees, setAvailableFees] = useState<FeeStructure[]>([]);
    const [selectedFeeItems, setSelectedFeeItems] = useState<SelectedFeeItem[]>([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Collection | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showPrintReport, setShowPrintReport] = useState(false);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const form = useForm({
        student_id: '',
        fee_structure_ids: [] as number[],
        account_id: accounts[0]?.id || '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        discount: 0,
        remarks: '',
    });

    // Load student's class fees when student is selected
    const handleStudentChange = async (studentId: string) => {
        const student = students.find(s => s.id === parseInt(studentId));
        setSelectedStudent(student || null);
        form.setData('student_id', studentId);
        setSelectedFeeItems([]);

        if (student) {
            // Fetch fee structures for this student's class
            try {
                const response = await fetch(`/api/fee-structures?class_id=${student.school_class.id}`);
                const data = await response.json();
                setAvailableFees(data);
            } catch (error) {
                console.error('Failed to load fees:', error);
            }
        } else {
            setAvailableFees([]);
        }
    };

    // Add fee to selection with month/year
    const addFeeItem = (feeStructure: FeeStructure) => {
        const newItem: SelectedFeeItem = {
            fee_structure_id: feeStructure.id,
            fee_type_name: feeStructure.fee_type.name,
            amount: feeStructure.amount,
            frequency: feeStructure.fee_type.frequency,
            month: currentMonth,
            year: currentYear,
        };
        setSelectedFeeItems([...selectedFeeItems, newItem]);
    };

    // Remove fee item
    const removeFeeItem = (index: number) => {
        setSelectedFeeItems(selectedFeeItems.filter((_, i) => i !== index));
    };

    // Update month/year for a fee item
    const updateFeeItem = (index: number, field: 'month' | 'year', value: number) => {
        const updated = [...selectedFeeItems];
        updated[index][field] = value;
        setSelectedFeeItems(updated);
    };

    // Get month name
    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    // Calculate total
    const calculateTotal = () => {
        const subtotal = selectedFeeItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
        return subtotal - (form.data.discount || 0);
    };

    // Filter collections
    const filteredCollections = collections.data.filter(collection => {
        const matchesSearch = searchTerm === '' ||
            collection.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            collection.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMonth = filterMonth === '' || collection.month === parseInt(filterMonth);
        const matchesYear = filterYear === '' || collection.year === parseInt(filterYear);
        const matchesStatus = filterStatus === '' || collection.status === filterStatus;

        return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });

    // Print receipt
    const handlePrintReceipt = (collection: Collection) => {
        setSelectedReceipt(collection);
        setShowReceipt(true);
        setTimeout(() => window.print(), 100);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare fee structures with their month/year
        const feeStructures = selectedFeeItems.map(item => ({
            fee_structure_id: item.fee_structure_id,
            month: item.month,
            year: item.year,
        }));

        // Submit with fee_structures array
        router.post(route('fee-collections.store'), {
            ...form.data,
            fee_structures: feeStructures,
        }, {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
                setSelectedStudent(null);
                setAvailableFees([]);
                setSelectedFeeItems([]);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fee Collection" />
            <style>{printStyles}</style>

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center no-print">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Fee Collection</h1>
                            <p className="text-gray-600 mt-1">Collect student fees easily</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Collect Fee
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Collected</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        ৳{stats.total_collected?.toLocaleString('en-IN') || 0}
                                    </p>
                                </div>
                                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Fees</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        ৳{stats.pending_fees?.toLocaleString('en-IN') || 0}
                                    </p>
                                </div>
                                <DollarSign className="w-12 h-12 text-yellow-500 opacity-20" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Overdue Fees</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">
                                        ৳{stats.overdue_fees?.toLocaleString('en-IN') || 0}
                                    </p>
                                </div>
                                <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
                            </div>
                        </div>
                    </div>

                    {/* Monthly Collection Summary */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 no-print">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Collection Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {(() => {
                                const monthlyData: { [key: string]: number } = {};
                                collections.data.forEach(c => {
                                    const key = `${c.year}-${c.month}`;
                                    if (!monthlyData[key]) monthlyData[key] = 0;
                                    monthlyData[key] += parseFloat(c.paid_amount.toString());
                                });

                                return Object.entries(monthlyData)
                                    .sort(([a], [b]) => b.localeCompare(a))
                                    .slice(0, 6)
                                    .map(([key, total]) => {
                                        const [year, month] = key.split('-');
                                        return (
                                            <div key={key} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                                                <p className="text-xs text-indigo-600 font-medium">{getMonthName(parseInt(month))} {year}</p>
                                                <p className="text-xl font-bold text-indigo-700 mt-1">৳{total.toLocaleString('en-IN')}</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {collections.data.filter(c => c.year === parseInt(year) && c.month === parseInt(month)).length} payments
                                                </p>
                                            </div>
                                        );
                                    });
                            })()}
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6 no-print">
                        <div className="flex items-center gap-4 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student, receipt..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <select
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Months</option>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                    <option key={m} value={m}>{getMonthName(m)}</option>
                                ))}
                            </select>
                            <select
                                value={filterYear}
                                onChange={(e) => setFilterYear(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Years</option>
                                {[2023, 2024, 2025, 2026].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="partial">Partial</option>
                                <option value="pending">Pending</option>
                            </select>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterMonth('');
                                    setFilterYear('');
                                    setFilterStatus('');
                                }}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Collections Table */}
                    <div id="collections-table" className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Print Header */}
                        <div className="hidden print:block text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">SCHOOL MANAGEMENT SYSTEM</h1>
                            <h2 className="text-xl font-semibold text-gray-700 mb-1">Fee Collection Report</h2>
                            <p className="text-sm text-gray-600">Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <div className="border-b-2 border-gray-800 mt-4 mb-6"></div>
                        </div>

                        <div className="flex justify-between items-center p-4 border-b border-gray-200 no-print">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Collections ({filteredCollections.length})</h3>
                            <button
                                onClick={() => setShowPrintReport(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                            >
                                <Printer className="w-4 h-4" />
                                Print All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month/Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase no-print">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCollections.map((collection) => (
                                        <tr key={collection.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {collection.receipt_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{collection.student.user.name}</div>
                                                <div className="text-xs text-gray-500">{collection.student.admission_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {collection.fee_type.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                                                {getMonthName(collection.month)} {collection.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                ৳{parseFloat(collection.amount.toString()).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                ৳{parseFloat(collection.paid_amount.toString()).toLocaleString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(collection.payment_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                                                    collection.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                    collection.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {collection.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap no-print">
                                                <button
                                                    onClick={() => handlePrintReceipt(collection)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition text-sm"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Print Footer - Hidden */}
                        <div className="hidden">
                            <div className="grid grid-cols-3 gap-8 text-center">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Prepared By:</p>
                                    <div className="border-t-2 border-gray-800 pt-2 mt-8">
                                        <p className="font-semibold">________________</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Verified By:</p>
                                    <div className="border-t-2 border-gray-800 pt-2 mt-8">
                                        <p className="font-semibold">________________</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Approved By:</p>
                                    <div className="border-t-2 border-gray-800 pt-2 mt-8">
                                        <p className="font-semibold">________________</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collect Fee Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-indigo-50">
                            <h3 className="text-2xl font-bold text-indigo-800">Collect Fee</h3>
                            <button onClick={() => { setShowModal(false); form.reset(); setSelectedStudent(null); setAvailableFees([]); setSelectedFeeItems([]); }} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Student Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Student <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.data.student_id}
                                    onChange={(e) => handleStudentChange(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Choose student...</option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.user.name} - {student.admission_number} ({student.school_class.name})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Student Payment Summary */}
                            {selectedStudent && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Payment Summary</h4>
                                    {(() => {
                                        const studentPayments = collections.data.filter(c => c.student.admission_number === selectedStudent.admission_number);
                                        const lastPayment = studentPayments.length > 0 ? studentPayments[0] : null;
                                        const currentDate = new Date();
                                        const overdueCount = studentPayments.filter(c => {
                                            const paymentDate = new Date(c.year, c.month - 1);
                                            return paymentDate < currentDate && c.status !== 'paid';
                                        }).length;

                                        return (
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Last Payment:</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {lastPayment ? `${getMonthName(lastPayment.month)} ${lastPayment.year}` : 'No payment yet'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Total Paid:</p>
                                                    <p className="font-semibold text-green-600">
                                                        ৳{studentPayments.reduce((sum, p) => sum + parseFloat(p.paid_amount.toString()), 0).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Available Fees - Add Buttons */}
                            {selectedStudent && availableFees.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Available Fees for {selectedStudent.school_class.name}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableFees.map((fee) => (
                                            <button
                                                key={fee.id}
                                                type="button"
                                                onClick={() => addFeeItem(fee)}
                                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {fee.fee_type.name} (৳{parseFloat(fee.amount.toString()).toLocaleString('en-IN')})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Fees with Month/Year Dropdowns */}
                            {selectedFeeItems.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Fees to Collect <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-3">
                                        {selectedFeeItems.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-4 p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.fee_type_name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{item.frequency}</div>
                                                </div>

                                                {/* Month Selector */}
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Month</label>
                                                    <select
                                                        value={item.month}
                                                        onChange={(e) => updateFeeItem(index, 'month', parseInt(e.target.value))}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                                            <option key={m} value={m}>{getMonthName(m)}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Year Selector */}
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">Year</label>
                                                    <select
                                                        value={item.year}
                                                        onChange={(e) => updateFeeItem(index, 'year', parseInt(e.target.value))}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-indigo-600">
                                                        ৳{parseFloat(item.amount.toString()).toLocaleString('en-IN')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getMonthName(item.month)} {item.year}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removeFeeItem(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedStudent && availableFees.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>No fees found for {selectedStudent.school_class.name}</p>
                                    <p className="text-sm mt-1">Please set up fee structures for this class first.</p>
                                </div>
                            )}

                            {/* Payment Details */}
                            {selectedFeeItems.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
                                            <select
                                                value={form.data.account_id}
                                                onChange={(e) => form.setData('account_id', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                {accounts.map((acc) => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.account_name} - ৳{acc.current_balance.toLocaleString('en-IN')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                            <select
                                                value={form.data.payment_method}
                                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="bank_transfer">Bank Transfer</option>
                                                <option value="cheque">Cheque</option>
                                                <option value="mobile_banking">Mobile Banking</option>
                                                <option value="online">Online</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                                            <input
                                                type="date"
                                                value={form.data.payment_date}
                                                onChange={(e) => form.setData('payment_date', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (৳)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={form.data.discount}
                                                onChange={(e) => form.setData('discount', parseFloat(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                                        <textarea
                                            value={form.data.remarks}
                                            onChange={(e) => form.setData('remarks', e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Optional notes..."
                                        />
                                    </div>

                                    {/* Total Amount Display */}
                                    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                                            <span className="text-3xl font-bold text-indigo-600">
                                                ৳{calculateTotal().toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); form.reset(); setSelectedStudent(null); setAvailableFees([]); setSelectedFeeItems([]); }}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={form.processing || selectedFeeItems.length === 0}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {form.processing ? 'Processing...' : 'Collect Fee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receipt Print Modal - Laser Print Format */}
            {showReceipt && selectedReceipt && (
                <div className="fixed inset-0 bg-white z-50 overflow-auto">
                    <div id="receipt-print-area" className="max-w-4xl mx-auto p-8">
                        {/* Close Button - Hidden on Print */}
                        <div className="flex justify-end mb-4 no-print">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Receipt Content */}
                        <div className="bg-white">
                            {/* Header */}
                            <div className="text-center mb-8 border-b-4 border-gray-800 pb-6">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">SCHOOL MANAGEMENT SYSTEM</h1>
                                <p className="text-xl text-gray-600 mb-4">Fee Collection Receipt</p>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-left">
                                        <p className="text-sm text-gray-600">Receipt No:</p>
                                        <p className="text-2xl font-bold text-indigo-600">{selectedReceipt.receipt_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Date:</p>
                                        <p className="text-xl font-semibold text-gray-900">{formatDate(selectedReceipt.payment_date)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div className="mb-8 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase border-b pb-2">Student Details</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Student Name</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedReceipt.student.user.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Admission Number</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedReceipt.student.admission_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Class</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedReceipt.student.school_class.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Fee Period</p>
                                        <p className="text-lg font-bold text-indigo-600">{getMonthName(selectedReceipt.month)} {selectedReceipt.year}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Details */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase border-b pb-2">Payment Details</h2>
                                <table className="w-full border-2 border-gray-800">
                                    <thead>
                                        <tr className="bg-gray-800 text-white">
                                            <th className="px-6 py-4 text-left text-sm font-bold uppercase">Description</th>
                                            <th className="px-6 py-4 text-center text-sm font-bold uppercase">Period</th>
                                            <th className="px-6 py-4 text-right text-sm font-bold uppercase">Amount (৳)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b-2 border-gray-300">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{selectedReceipt.fee_type.name}</td>
                                            <td className="px-6 py-4 text-center text-gray-700">{getMonthName(selectedReceipt.month)} {selectedReceipt.year}</td>
                                            <td className="px-6 py-4 text-right font-bold text-gray-900">{parseFloat(selectedReceipt.amount.toString()).toLocaleString('en-IN')}</td>
                                        </tr>
                                        <tr className="bg-gray-100">
                                            <td colSpan={2} className="px-6 py-4 text-right font-bold text-gray-900 text-lg uppercase">Total Paid Amount:</td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600 text-2xl">৳{parseFloat(selectedReceipt.paid_amount.toString()).toLocaleString('en-IN')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Payment Status */}
                            <div className="mb-8 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Payment Status</p>
                                        <p className="text-2xl font-bold text-green-600 uppercase">{selectedReceipt.status}</p>
                                    </div>
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t-2 border-gray-300">
                                <div className="grid grid-cols-2 gap-12 mb-8">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-6">Received By:</p>
                                        <div className="border-t-2 border-gray-800 pt-2">
                                            <p className="text-center font-semibold">Authorized Signature</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 mb-6">Student/Parent Signature:</p>
                                        <div className="border-t-2 border-gray-800 pt-2">
                                            <p className="text-center font-semibold">Signature</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center mt-8">
                                    <p className="text-sm text-gray-600 font-semibold">Thank you for your payment!</p>
                                    <p className="text-xs text-gray-500 mt-2">This is a computer-generated receipt and does not require a physical signature.</p>
                                    <p className="text-xs text-gray-400 mt-1">Printed on: {new Date().toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Print Button - Hidden on Print */}
                        <div className="flex justify-center gap-4 mt-8 no-print">
                            <button
                                onClick={() => setShowReceipt(false)}
                                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Printer className="w-5 h-5" />
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Report Component */}
            {showPrintReport && (
                <PrintReport
                    collections={filteredCollections}
                    onClose={() => setShowPrintReport(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
