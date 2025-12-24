import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';

interface Account {
    id: number;
    account_name: string;
}

interface DailyData {
    date: string;
    date_formatted: string;
    credit: {
        fund_in: number;
        student_fee: number;
        other_credit: number;
        total: number;
    };
    debit: {
        fund_out: number;
        salary: number;
        fixed_asset: number;
        other_expense: number;
        total: number;
    };
    balance: number;
}

interface MonthlyTotals {
    credit: {
        fund_in: number;
        student_fee: number;
        other_credit: number;
        total: number;
    };
    debit: {
        fund_out: number;
        salary: number;
        fixed_asset: number;
        other_expense: number;
        total: number;
    };
}

interface BankReportProps {
    reportData: DailyData[];
    monthlyTotals: MonthlyTotals;
    openingBalance: number;
    closingBalance: number;
    filters: {
        month: string;
        account_id?: number;
    };
    accounts: Account[];
}

export default function BankReport({
    reportData,
    monthlyTotals,
    openingBalance,
    closingBalance,
    filters,
    accounts,
}: BankReportProps) {
    const [month, setMonth] = useState(filters?.month || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');

    const handleFilter = () => {
        router.get('/accounting/reports/bank-report',
            { month, account_id: accountId },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setMonth('');
        setAccountId('');
        router.get('/accounting/reports/bank-report');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handlePrint = () => {
        window.print();
    };

    const selectedAccount = accounts.find(a => a.id == accountId);
    const monthDate = filters.month ? new Date(filters.month + '-01') : new Date();
    const monthYear = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <AuthenticatedLayout>
            <Head title="Bank Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Bank Report
                            </h1>
                            <p className="text-gray-600 mt-1">Monthly bank transaction report</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrint}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                icon={<Printer className="w-4 h-4" />}
                            >
                                Print Report
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Month
                            </label>
                            <input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account
                            </label>
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="">All Accounts</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button onClick={handleFilter} className="bg-blue-600 text-white hover:bg-blue-700 flex-1">
                                Apply Filter
                            </Button>
                            <Button onClick={handleReset} className="bg-gray-500 text-white hover:bg-gray-600 flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Screen Report Container */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {accountId && (
                        <div className="mb-4">
                            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-900 uppercase">Opening Balance:</span>
                                    <span className="text-lg font-bold text-blue-900">৳ {formatCurrency(openingBalance)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse excel-table">
                            <thead>
                                <tr className="bg-gray-800 text-white">
                                    <th rowSpan={2} className="border-2 border-gray-900 px-3 py-3 text-center font-bold text-sm uppercase whitespace-nowrap w-32">
                                        Date
                                    </th>
                                    <th colSpan={4} className="border-2 border-gray-900 px-3 py-3 text-center font-bold text-sm uppercase bg-green-700">
                                        Credit (৳)
                                    </th>
                                    <th colSpan={5} className="border-2 border-gray-900 px-3 py-3 text-center font-bold text-sm uppercase bg-red-700">
                                        Debit (৳)
                                    </th>
                                    <th rowSpan={2} className="border-2 border-gray-900 px-3 py-3 text-center font-bold text-sm uppercase bg-blue-800 whitespace-nowrap w-32">
                                        Balance (৳)
                                    </th>
                                </tr>
                                <tr className="bg-gray-700 text-white">
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-green-600 whitespace-nowrap">Fund In</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-green-600 whitespace-nowrap">Student Fee</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-green-600 whitespace-nowrap">Other Credit</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-green-800 whitespace-nowrap">Total Credit</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-red-600 whitespace-nowrap">Fund Out</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-red-600 whitespace-nowrap">Salary</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-red-600 whitespace-nowrap">Fixed Asset</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-red-600 whitespace-nowrap">Other Expense</th>
                                    <th className="border-2 border-gray-900 px-3 py-2 text-center font-semibold text-xs uppercase bg-red-800 whitespace-nowrap">Total Debit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((day, index) => (
                                    <tr key={day.date} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="border border-gray-900 px-3 py-2 text-xs font-semibold text-gray-900 whitespace-nowrap">{day.date_formatted}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.credit.fund_in > 0 ? formatCurrency(day.credit.fund_in) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.credit.student_fee > 0 ? formatCurrency(day.credit.student_fee) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.credit.other_credit > 0 ? formatCurrency(day.credit.other_credit) : '-'}</td>
                                        <td className="border-2 border-gray-900 px-3 py-2 text-xs text-right font-bold font-mono bg-green-50 text-green-900">{day.credit.total > 0 ? formatCurrency(day.credit.total) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.debit.fund_out > 0 ? formatCurrency(day.debit.fund_out) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.debit.salary > 0 ? formatCurrency(day.debit.salary) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.debit.fixed_asset > 0 ? formatCurrency(day.debit.fixed_asset) : '-'}</td>
                                        <td className="border border-gray-900 px-3 py-2 text-xs text-right font-mono text-gray-900">{day.debit.other_expense > 0 ? formatCurrency(day.debit.other_expense) : '-'}</td>
                                        <td className="border-2 border-gray-900 px-3 py-2 text-xs text-right font-bold font-mono bg-red-50 text-red-900">{day.debit.total > 0 ? formatCurrency(day.debit.total) : '-'}</td>
                                        <td className="border-2 border-gray-900 px-3 py-2 text-xs text-right font-bold font-mono bg-blue-50 text-blue-900">{formatCurrency(day.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-900 text-white font-bold">
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs uppercase text-center">Monthly Total</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.credit.fund_in)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.credit.student_fee)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.credit.other_credit)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono bg-green-700">{formatCurrency(monthlyTotals.credit.total)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.debit.fund_out)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.debit.salary)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.debit.fixed_asset)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono">{formatCurrency(monthlyTotals.debit.other_expense)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono bg-red-700">{formatCurrency(monthlyTotals.debit.total)}</td>
                                    <td className="border-2 border-gray-900 px-3 py-3 text-xs text-right font-mono bg-blue-700">{formatCurrency(closingBalance)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {accountId && (
                        <div className="mt-4">
                            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-900 uppercase">Closing Balance:</span>
                                    <span className="text-lg font-bold text-green-900">৳ {formatCurrency(closingBalance)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Print View - Completely Separate */}
            <div className="hidden print:block print-container">
                {/* Professional Header */}
                <div className="text-center mb-3 pb-2 border-b-2 border-gray-800">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">School Management Pro</h1>
                    <h2 className="text-lg font-bold text-gray-800 mb-1">BANK REPORT</h2>
                    <p className="text-sm font-semibold text-gray-700">Month: {monthYear}</p>
                    {selectedAccount && (
                        <p className="text-xs text-gray-600 mt-0.5">Account: {selectedAccount.account_name}</p>
                    )}
                </div>

                {/* Opening Balance */}
                {accountId && (
                    <div className="mb-2">
                        <table className="w-full border-2 border-black">
                            <tbody>
                                <tr>
                                    <td className="border border-black px-2 py-1 font-bold text-xs bg-gray-100">Opening Balance:</td>
                                    <td className="border border-black px-2 py-1 text-right font-bold text-xs">৳ {formatCurrency(openingBalance)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Main Report Table */}
                <table className="w-full border-collapse border-2 border-black print-table">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th rowSpan={2} className="border-2 border-black px-1 py-1.5 text-center font-bold" style={{fontSize: '8px', width: '70px'}}>Date</th>
                            <th colSpan={4} className="border-2 border-black px-1 py-1.5 text-center font-bold bg-green-700" style={{fontSize: '8px'}}>Credit (৳)</th>
                            <th colSpan={5} className="border-2 border-black px-1 py-1.5 text-center font-bold bg-red-700" style={{fontSize: '8px'}}>Debit (৳)</th>
                            <th rowSpan={2} className="border-2 border-black px-1 py-1.5 text-center font-bold bg-blue-800" style={{fontSize: '8px', width: '80px'}}>Balance (৳)</th>
                        </tr>
                        <tr className="bg-gray-700 text-white">
                            <th className="border-2 border-black px-1 py-1 text-center bg-green-600" style={{fontSize: '7px'}}>Fund In</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-green-600" style={{fontSize: '7px'}}>Student Fee</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-green-600" style={{fontSize: '7px'}}>Other Credit</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-green-800" style={{fontSize: '7px'}}>Total</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-red-600" style={{fontSize: '7px'}}>Fund Out</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-red-600" style={{fontSize: '7px'}}>Salary</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-red-600" style={{fontSize: '7px'}}>Fixed Asset</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-red-600" style={{fontSize: '7px'}}>Other Expense</th>
                            <th className="border-2 border-black px-1 py-1 text-center bg-red-800" style={{fontSize: '7px'}}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((day, index) => {
                            const hasTransaction = day.credit.total > 0 || day.debit.total > 0;
                            const rowClass = hasTransaction
                                ? 'bg-yellow-50'
                                : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
                            return (
                            <tr key={day.date} className={rowClass}>
                                <td className="border border-black px-1 py-0.5 font-semibold" style={{fontSize: '7px'}}>{day.date_formatted}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.credit.fund_in > 0 ? formatCurrency(day.credit.fund_in) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.credit.student_fee > 0 ? formatCurrency(day.credit.student_fee) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.credit.other_credit > 0 ? formatCurrency(day.credit.other_credit) : '-'}</td>
                                <td className="border-2 border-black px-1 py-0.5 text-right font-bold font-mono bg-green-50" style={{fontSize: '7px'}}>{day.credit.total > 0 ? formatCurrency(day.credit.total) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.debit.fund_out > 0 ? formatCurrency(day.debit.fund_out) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.debit.salary > 0 ? formatCurrency(day.debit.salary) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.debit.fixed_asset > 0 ? formatCurrency(day.debit.fixed_asset) : '-'}</td>
                                <td className="border border-black px-1 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>{day.debit.other_expense > 0 ? formatCurrency(day.debit.other_expense) : '-'}</td>
                                <td className="border-2 border-black px-1 py-0.5 text-right font-bold font-mono bg-red-50" style={{fontSize: '7px'}}>{day.debit.total > 0 ? formatCurrency(day.debit.total) : '-'}</td>
                                <td className="border-2 border-black px-1 py-0.5 text-right font-bold font-mono bg-blue-50" style={{fontSize: '7px'}}>{formatCurrency(day.balance)}</td>
                            </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-900 text-white font-bold">
                            <td className="border-2 border-black px-1 py-1 text-center" style={{fontSize: '8px'}}>TOTAL</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.credit.fund_in)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.credit.student_fee)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.credit.other_credit)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono bg-green-700" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.credit.total)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.debit.fund_out)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.debit.salary)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.debit.fixed_asset)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.debit.other_expense)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono bg-red-700" style={{fontSize: '8px'}}>{formatCurrency(monthlyTotals.debit.total)}</td>
                            <td className="border-2 border-black px-1 py-1 text-right font-mono bg-blue-700" style={{fontSize: '8px'}}>{formatCurrency(closingBalance)}</td>
                        </tr>
                    </tfoot>
                </table>

                {/* Closing Balance */}
                {accountId && (
                    <div className="mt-2">
                        <table className="w-full border-2 border-black">
                            <tbody>
                                <tr>
                                    <td className="border border-black px-2 py-1 font-bold text-xs bg-gray-100">Closing Balance:</td>
                                    <td className="border border-black px-2 py-1 text-right font-bold text-xs">৳ {formatCurrency(closingBalance)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Signature Section */}
                <div className="mt-6 pt-4">
                    <div className="grid grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{fontSize: '8px'}}>Prepared By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{fontSize: '8px'}}>Checked By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-10">
                                <p className="font-semibold" style={{fontSize: '8px'}}>Approved By</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-gray-600" style={{fontSize: '7px'}}>
                    <p>Printed on: {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>

            {/* Professional Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 10mm 8mm;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    html, body {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-container,
                    .print-container * {
                        visibility: visible;
                    }

                    .print-container {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white;
                    }

                    table {
                        page-break-inside: auto;
                        border-collapse: collapse;
                        width: 100%;
                    }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tfoot {
                        display: table-footer-group;
                    }

                    th, td {
                        page-break-inside: avoid;
                    }

                    /* Ensure colors print */
                    .bg-gray-800,
                    .bg-gray-700,
                    .bg-gray-900,
                    .bg-green-700,
                    .bg-green-600,
                    .bg-green-800,
                    .bg-red-700,
                    .bg-red-600,
                    .bg-red-800,
                    .bg-blue-800,
                    .bg-blue-700,
                    .bg-green-50,
                    .bg-red-50,
                    .bg-blue-50,
                    .bg-gray-50,
                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }

                .excel-table {
                    border-spacing: 0;
                    border-collapse: collapse;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
