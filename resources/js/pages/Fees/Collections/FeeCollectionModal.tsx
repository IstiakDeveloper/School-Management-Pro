import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    X,
    Search,
    User,
    AlertCircle,
    Plus,
    CheckCircle,
    Calendar,
    DollarSign,
    Clock,
    XCircle,
} from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    user: { name: string };
    school_class: { id: number; name: string };
}

interface FeeStructure {
    id: number;
    fee_type: { id: number; name: string; frequency: string };
    amount: number;
    due_date: string;
}

interface PendingFee {
    id: number;
    fee_type: string;
    month: number;
    year: number;
    month_name: string;
    amount: number;
    late_fee: number;
    total_amount: number;
    status: 'pending' | 'overdue';
}

interface Account {
    id: number;
    account_name: string;
    current_balance: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    students: Student[];
    accounts: Account[];
}

export default function FeeCollectionModal({ isOpen, onClose, students, accounts }: Props) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
    const [availableFees, setAvailableFees] = useState<FeeStructure[]>([]);
    const [selectedPendingFees, setSelectedPendingFees] = useState<number[]>([]);
    const [newFeeItems, setNewFeeItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'advance'>('pending');
    const [nextUnpaidMonth, setNextUnpaidMonth] = useState(currentMonth);
    const [nextUnpaidYear, setNextUnpaidYear] = useState(currentYear);

    const form = useForm({
        student_id: '',
        fee_collection_ids: [] as number[],
        fee_structures: [] as { fee_structure_id: number; month: number; year: number }[],
        account_id: accounts.length > 0 ? accounts[0].id.toString() : '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        discount: 0,
        remarks: '',
    });

    // Filter students based on search
    const filteredStudents = students.filter((student) => {
        const search = searchTerm.toLowerCase();
        return (
            student.user?.name?.toLowerCase().includes(search) ||
            student.roll_number?.toLowerCase().includes(search) ||
            student.admission_number?.toLowerCase().includes(search) ||
            student.school_class?.name?.toLowerCase().includes(search)
        );
    });

    // Load student data
    const handleStudentSelect = async (student: Student) => {
        setSelectedStudent(student);
        form.setData('student_id', student.id.toString());
        setSearchTerm('');
        setSelectedPendingFees([]);
        setNewFeeItems([]);

        setLoading(true);
        try {
            // Fetch pending fees and next unpaid month
            const duesResponse = await fetch(`/api/fee-collections/student-dues?student_id=${student.id}`);
            const duesData = await duesResponse.json();

            // Extract dues and next month info
            const dues = duesData.dues || duesData;
            setPendingFees(Array.isArray(dues) ? dues : []);

            // Set next unpaid month if provided
            if (duesData.next_month && duesData.next_year) {
                setNextUnpaidMonth(duesData.next_month);
                setNextUnpaidYear(duesData.next_year);
            }

            // Fetch available fee structures
            if (student.school_class?.id) {
                const feesResponse = await fetch(`/api/fee-structures?class_id=${student.school_class.id}`);
                const feesData = await feesResponse.json();
                setAvailableFees(feesData);
            }

            if (Array.isArray(dues) && dues.length > 0) {
                setActiveTab('pending');
            }
        } catch (error) {
            console.error('Failed to load student data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle pending fee
    const togglePendingFee = (feeId: number) => {
        setSelectedPendingFees((prev) =>
            prev.includes(feeId) ? prev.filter((id) => id !== feeId) : [...prev, feeId]
        );
    };

    // Select all pending
    const selectAllPending = () => {
        if (selectedPendingFees.length === pendingFees.length) {
            setSelectedPendingFees([]);
        } else {
            setSelectedPendingFees(pendingFees.map((fee) => fee.id));
        }
    };

    // Add new fee
    const addNewFeeItem = (feeStructure: FeeStructure) => {
        setNewFeeItems([
            ...newFeeItems,
            {
                fee_structure_id: feeStructure.id,
                fee_type_name: feeStructure.fee_type.name,
                amount: feeStructure.amount,
                month: nextUnpaidMonth, // Use next unpaid month instead of current month
                year: nextUnpaidYear,   // Use next unpaid year
                months_count: 1, // Default to 1 month
            },
        ]);
    };

    // Remove fee
    const removeNewFeeItem = (index: number) => {
        setNewFeeItems(newFeeItems.filter((_, i) => i !== index));
    };

    // Update fee month/year/months_count
    const updateNewFeeItem = (index: number, field: 'month' | 'year' | 'months_count', value: number) => {
        const updated = [...newFeeItems];
        updated[index][field] = value;
        setNewFeeItems(updated);
    };

    // Generate month list for multiple months
    const generateMonthsList = (startMonth: number, startYear: number, count: number) => {
        const months = [];
        let currentM = startMonth;
        let currentY = startYear;

        for (let i = 0; i < count; i++) {
            months.push(`${getMonthName(currentM)} ${currentY}`);
            currentM++;
            if (currentM > 12) {
                currentM = 1;
                currentY++;
            }
        }
        return months.join(', ');
    };

    // Calculate totals
    const calculatePendingTotal = () => {
        const selected = pendingFees.filter((fee) => selectedPendingFees.includes(fee.id));
        const total = selected.reduce((sum, fee) => sum + (parseFloat(fee.total_amount.toString()) || 0), 0);
        return isNaN(total) ? 0 : total;
    };

    const calculateAdvanceTotal = () => {
        const total = newFeeItems.reduce((sum, item) => {
            const monthsCount = item.months_count || 1;
            return sum + (parseFloat(item.amount.toString()) || 0) * monthsCount;
        }, 0);
        return isNaN(total) ? 0 : total;
    };

    const calculateGrandTotal = () => {
        const pending = calculatePendingTotal();
        const advance = calculateAdvanceTotal();
        const discount = parseFloat(form.data.discount.toString()) || 0;
        const total = pending + advance - discount;
        return isNaN(total) ? 0 : total;
    };

    // Get month name
    const getMonthName = (month: number) => {
        return new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
    };

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submitData: any = {
            student_id: form.data.student_id,
            account_id: form.data.account_id,
            payment_method: form.data.payment_method,
            payment_date: form.data.payment_date,
            discount: form.data.discount,
            remarks: form.data.remarks,
        };

        if (selectedPendingFees.length > 0) {
            submitData.fee_collection_ids = selectedPendingFees;
        }

        if (newFeeItems.length > 0) {
            submitData.fee_structures = newFeeItems.flatMap((item) => {
                const monthsCount = item.months_count || 1;
                const fees = [];
                let currentM = item.month;
                let currentY = item.year;

                for (let i = 0; i < monthsCount; i++) {
                    fees.push({
                        fee_structure_id: item.fee_structure_id,
                        month: currentM,
                        year: currentY,
                    });
                    currentM++;
                    if (currentM > 12) {
                        currentM = 1;
                        currentY++;
                    }
                }
                return fees;
            });
        }

        router.post('/fee-collections', submitData, {
            onSuccess: () => {
                onClose();
                setSelectedStudent(null);
                setSelectedPendingFees([]);
                setNewFeeItems([]);
                form.reset();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Fee Collection</h2>
                            <p className="text-indigo-100 text-sm mt-1">Collect student fees easily</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Student Search */}
                    {!selectedStudent ? (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <User className="w-4 h-4 inline mr-2" />
                                Select Student
                            </label>

                            {/* Select Dropdown */}
                            <div className="mb-4">
                                <select
                                    onChange={(e) => {
                                        const student = students.find((s) => s.id === parseInt(e.target.value));
                                        if (student) handleStudentSelect(student);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-base"
                                    defaultValue=""
                                >
                                    <option value="" disabled className="text-gray-500">
                                        Select student by name or roll number
                                    </option>
                                    {students.map((student) => (
                                        <option key={student.id} value={student.id} className="py-2">
                                            {student.user?.name || 'N/A'} | Roll: {student.roll_number || 'N/A'} | Class: {student.school_class?.name || 'N/A'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="text-sm text-gray-500 font-medium">OR SEARCH</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by student name or roll number..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Search Results */}
                            {searchTerm && (
                                <div className="mt-2 max-h-80 overflow-y-auto border-2 border-gray-200 rounded-lg shadow-lg">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <button
                                                key={student.id}
                                                type="button"
                                                onClick={() => handleStudentSelect(student)}
                                                className="w-full p-4 hover:bg-indigo-50 text-left border-b border-gray-100 last:border-0 transition flex items-center gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <User className="w-10 h-10 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-lg text-gray-900">{student.user?.name || 'N/A'}</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <span className="font-semibold">Roll:</span> {student.roll_number || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-semibold">Class:</span> {student.school_class?.name || 'N/A'}
                                                    </p>
                                                </div>
                                                <Plus className="w-5 h-5 text-indigo-600" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                            <p>No students found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!searchTerm && (
                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    Type to search for a student
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Selected Student Info */}
                            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">
                                                {selectedStudent.user?.name || 'N/A'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {selectedStudent.admission_number || 'N/A'} • {selectedStudent.school_class?.name || 'N/A'}
                                            </p>
                                            <p className="text-sm font-semibold text-red-600 mt-1">
                                                Pending: ৳{pendingFees.reduce((sum, fee) => sum + (parseFloat(fee.total_amount.toString()) || 0), 0).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setPendingFees([]);
                                            setSelectedPendingFees([]);
                                            setNewFeeItems([]);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Loading fees...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Tabs */}
                                    <div className="mb-6 border-b border-gray-200">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('pending')}
                                                className={`px-6 py-3 font-medium border-b-2 transition ${
                                                    activeTab === 'pending'
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                                }`}
                                            >
                                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                                Pending ({pendingFees.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('advance')}
                                                className={`px-6 py-3 font-medium border-b-2 transition ${
                                                    activeTab === 'advance'
                                                        ? 'border-indigo-600 text-indigo-600'
                                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                                }`}
                                            >
                                                <Plus className="w-4 h-4 inline mr-2" />
                                                Advance Payment
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="mb-6 max-h-96 overflow-y-auto">
                                        {/* Pending Tab */}
                                        {activeTab === 'pending' && (
                                            <div className="space-y-3">
                                                {pendingFees.length > 0 ? (
                                                    <>
                                                        <div className="flex justify-between items-center mb-3 px-1">
                                                            <p className="text-sm text-gray-600">Select fees to pay:</p>
                                                            <button
                                                                type="button"
                                                                onClick={selectAllPending}
                                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                            >
                                                                {selectedPendingFees.length === pendingFees.length
                                                                    ? 'Deselect All'
                                                                    : 'Select All'}
                                                            </button>
                                                        </div>
                                                        {pendingFees.map((fee) => (
                                                            <div
                                                                key={fee.id}
                                                                onClick={() => togglePendingFee(fee.id)}
                                                                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                                                    selectedPendingFees.includes(fee.id)
                                                                        ? 'border-indigo-500 bg-indigo-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedPendingFees.includes(fee.id)}
                                                                            onChange={() => togglePendingFee(fee.id)}
                                                                            className="h-5 w-5 text-indigo-600 rounded"
                                                                        />
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <p className="font-semibold text-gray-900">
                                                                                    {fee.fee_type}
                                                                                </p>
                                                                                <span
                                                                                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                                                        fee.status === 'overdue'
                                                                                            ? 'bg-red-100 text-red-800'
                                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                                    }`}
                                                                                >
                                                                                    {fee.status === 'overdue' ? (
                                                                                        <>
                                                                                            <XCircle className="w-3 h-3 inline mr-1" />
                                                                                            Overdue
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Clock className="w-3 h-3 inline mr-1" />
                                                                                            Pending
                                                                                        </>
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-600">
                                                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                                                {fee.month_name}
                                                                            </p>
                                                                            {fee.late_fee > 0 && (
                                                                                <p className="text-xs text-red-600 mt-1">
                                                                                    + Late Fee: ৳{fee.late_fee.toLocaleString('en-IN')}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-xl font-bold text-indigo-600">
                                                                        ৳{fee.total_amount.toLocaleString('en-IN')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                                                        <p className="text-gray-600">No pending fees</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Advance Tab */}
                                        {activeTab === 'advance' && (
                                            <div className="space-y-4">
                                                {availableFees.length > 0 ? (
                                                    <>
                                                        {/* Available Fee Types */}
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 mb-3">Select Fee Type:</p>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {availableFees.map((fee) => (
                                                                    <button
                                                                        key={fee.id}
                                                                        type="button"
                                                                        onClick={() => addNewFeeItem(fee)}
                                                                        className="p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-left"
                                                                    >
                                                                        <p className="font-semibold text-gray-900">{fee.fee_type.name}</p>
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            ৳{fee.amount.toLocaleString('en-IN')} / {fee.fee_type.frequency}
                                                                        </p>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Selected Fees */}
                                                        {newFeeItems.length > 0 && (
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 mb-3">Selected Fees:</p>
                                                                <div className="space-y-3">
                                                                    {newFeeItems.map((item, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50"
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="flex-1">
                                                                                    <p className="font-bold text-gray-900 mb-3">
                                                                                        {item.fee_type_name}
                                                                                    </p>

                                                                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                                                                        <div>
                                                                                            <label className="text-xs text-gray-600 block mb-1">Start Month</label>
                                                                                            <select
                                                                                                value={item.month}
                                                                                                onChange={(e) =>
                                                                                                    updateNewFeeItem(
                                                                                                        index,
                                                                                                        'month',
                                                                                                        parseInt(e.target.value)
                                                                                                    )
                                                                                                }
                                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                                            >
                                                                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                                                                    (m) => (
                                                                                                        <option key={m} value={m}>
                                                                                                            {getMonthName(m)}
                                                                                                        </option>
                                                                                                    )
                                                                                                )}
                                                                                            </select>
                                                                                        </div>
                                                                                        <div>
                                                                                            <label className="text-xs text-gray-600 block mb-1">Year</label>
                                                                                            <select
                                                                                                value={item.year}
                                                                                                onChange={(e) =>
                                                                                                    updateNewFeeItem(
                                                                                                        index,
                                                                                                        'year',
                                                                                                        parseInt(e.target.value)
                                                                                                    )
                                                                                                }
                                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                                                                                            >
                                                                                                {Array.from(
                                                                                                    { length: 5 },
                                                                                                    (_, i) => currentYear - 2 + i
                                                                                                ).map((y) => (
                                                                                                    <option key={y} value={y}>
                                                                                                        {y}
                                                                                                    </option>
                                                                                                ))}
                                                                                            </select>
                                                                                        </div>
                                                                                        <div>
                                                                                            <label className="text-xs text-gray-600 block mb-1">Months Count</label>
                                                                                            <select
                                                                                                value={item.months_count || 1}
                                                                                                onChange={(e) =>
                                                                                                    updateNewFeeItem(
                                                                                                        index,
                                                                                                        'months_count',
                                                                                                        parseInt(e.target.value)
                                                                                                    )
                                                                                                }
                                                                                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-semibold"
                                                                                            >
                                                                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                                                                    (count) => (
                                                                                                        <option key={count} value={count}>
                                                                                                            {count} {count === 1 ? 'Month' : 'Months'}
                                                                                                        </option>
                                                                                                    )
                                                                                                )}
                                                                                            </select>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="bg-white rounded p-2 border border-indigo-200">
                                                                                        <p className="text-xs text-gray-600 mb-1">Payment for:</p>
                                                                                        <p className="text-sm font-semibold text-indigo-700">
                                                                                            {generateMonthsList(item.month, item.year, item.months_count || 1)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                                                                                    <p className="text-xl font-bold text-indigo-600">
                                                                                        ৳{((item.amount || 0) * (item.months_count || 1)).toLocaleString('en-IN')}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                                        ৳{item.amount.toLocaleString('en-IN')} × {item.months_count || 1}
                                                                                    </p>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeNewFeeItem(index)}
                                                                                        className="text-red-600 hover:text-red-800 text-sm mt-2 font-medium"
                                                                                    >
                                                                                        Remove
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                                        <p className="text-gray-600">No fee structures available</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment Form */}
                                    {(selectedPendingFees.length > 0 || newFeeItems.length > 0) && (
                                        <div className="border-t pt-6 space-y-4">
                                            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5" />
                                                Payment Information
                                            </h4>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Account <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.data.account_id}
                                                        onChange={(e) => form.setData('account_id', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        required
                                                    >
                                                        {accounts.map((account) => (
                                                            <option key={account.id} value={account.id}>
                                                                {account.account_name} (৳
                                                                {account.current_balance.toLocaleString('en-IN')})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Payment Method <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={form.data.payment_method}
                                                        onChange={(e) => form.setData('payment_method', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        required
                                                    >
                                                        <option value="cash">Cash</option>
                                                        <option value="bank_transfer">Bank Transfer</option>
                                                        <option value="cheque">Cheque</option>
                                                        <option value="mobile_banking">Mobile Banking</option>
                                                        <option value="online">Online Payment</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Payment Date <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={form.data.payment_date}
                                                        onChange={(e) => form.setData('payment_date', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Discount (Optional)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                                                            ৳
                                                        </span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={form.data.discount || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                                                form.setData('discount', isNaN(value) ? 0 : value);
                                                            }}
                                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Remarks (Optional)
                                                </label>
                                                <textarea
                                                    value={form.data.remarks}
                                                    onChange={(e) => form.setData('remarks', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Add any notes..."
                                                />
                                            </div>

                                            {/* Total Summary */}
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-5 text-white">
                                                <div className="space-y-2">
                                                    {selectedPendingFees.length > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span>Pending Fees ({selectedPendingFees.length})</span>
                                                            <span className="font-bold text-lg">
                                                                ৳{calculatePendingTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {newFeeItems.length > 0 && (
                                                        <div className="flex justify-between items-center">
                                                            <span>Advance Fees ({newFeeItems.length})</span>
                                                            <span className="font-bold text-lg">
                                                                ৳{calculateAdvanceTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {(parseFloat(form.data.discount.toString()) || 0) > 0 && (
                                                        <div className="flex justify-between items-center text-green-200">
                                                            <span>Discount</span>
                                                            <span className="font-bold text-lg">
                                                                -৳{(parseFloat(form.data.discount.toString()) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="border-t border-white/30 pt-2 mt-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xl font-semibold">Grand Total</span>
                                                            <span className="text-3xl font-bold">
                                                                ৳{calculateGrandTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={form.processing}
                                                    className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {form.processing ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DollarSign className="w-5 h-5" />
                                                            Collect Payment
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
