import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';

interface Account {
    id: number;
    account_name: string;
}

interface ReceiptPaymentItem {
    description: string;
    month_amount: number;
    cumulative_amount: number;
    type: string;
}

interface ReceiptPaymentProps {
    receipts: ReceiptPaymentItem[];
    payments: ReceiptPaymentItem[];
    openingBalance: number;
    totalMonthReceipts: number;
    totalMonthPayments: number;
    totalCumulativeReceipts: number;
    totalCumulativePayments: number;
    closingBalance: number;
    cumulativeClosingBalance: number;
    filters: {
        start_date: string;
        end_date: string;
        account_id?: number;
    };
    accounts: Account[];
    schoolName?: string;
    schoolAddress?: string;
}

export default function ReceiptPayment({
    receipts,
    payments,
    openingBalance,
    totalMonthReceipts,
    totalMonthPayments,
    totalCumulativeReceipts,
    totalCumulativePayments,
    closingBalance,
    cumulativeClosingBalance,
    filters,
    accounts,
    schoolName = 'School Management Pro',
    schoolAddress = '',
}: ReceiptPaymentProps) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');

    const handleFilter = () => {
        router.get('/accounting/reports/receipt-payment',
            { start_date: startDate, end_date: endDate, account_id: accountId },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setAccountId('');
        router.get('/accounting/reports/receipt-payment');
    };

    const formatCurrency = (amount: number) => {
        const num = Number(amount) || 0;
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const handlePrint = () => {
        window.print();
    };

    const selectedAccount = accounts.find(a => a.id == accountId);
    const dateRange = `${new Date(filters.start_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} to ${new Date(filters.end_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    // Calculate max rows for balanced layout
    const maxRows = Math.max(receipts.length, payments.length);

    return (
        <AuthenticatedLayout>
            <Head title="Receipt & Payment Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Receipt & Payment Report
                            </h1>
                            <p className="text-gray-600 mt-1">Detailed receipt and payment account</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
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
                                Apply
                            </Button>
                            <Button onClick={handleReset} className="bg-gray-500 text-white hover:bg-gray-600 flex-1">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Screen Report Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Header Info */}
                    <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">RECEIPT AND PAYMENT ACCOUNT</h2>
                        <p className="text-sm font-semibold text-gray-600">For the period: {dateRange}</p>
                        {selectedAccount && (
                            <p className="text-xs mt-1 text-gray-500">Account: {selectedAccount.account_name}</p>
                        )}
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr>
                                    {/* Receipts Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        RECEIPTS
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Month
                                    </th>
                                    <th className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Cumulative
                                    </th>

                                    {/* Payments Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        PAYMENTS
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Month
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Cumulative
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Opening Balance Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5 font-semibold text-xs">
                                        Opening Balance
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(openingBalance)}
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(openingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                </tr>

                                {/* Data Rows */}
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const receipt = receipts[index];
                                    const payment = payments[index];

                                    return (
                                        <tr key={index}>
                                            {/* Receipt Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {receipt ? receipt.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {receipt ? formatCurrency(receipt.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                                {receipt ? formatCurrency(receipt.cumulative_amount) : ''}
                                            </td>

                                            {/* Payment Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {payment ? payment.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {payment ? formatCurrency(payment.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {payment ? formatCurrency(payment.cumulative_amount) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Closing Balance Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5 font-semibold text-xs">
                                        Closing Balance
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(closingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {formatCurrency(cumulativeClosingBalance)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Total Row */}
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        TOTAL:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(openingBalance + totalMonthReceipts)}
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(openingBalance + totalCumulativeReceipts)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        TOTAL:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthPayments + closingBalance)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativePayments + cumulativeClosingBalance)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Month Receipts</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(totalMonthReceipts)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-gray-600 mb-1">Total Month Payments</p>
                            <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(totalMonthPayments)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-xl font-bold mb-1">{schoolName}</h1>
                    {schoolAddress && <p className="text-xs mb-0.5">{schoolAddress}</p>}
                    <h2 className="text-lg font-bold mb-1">RECEIPT AND PAYMENT ACCOUNT</h2>
                    <p className="text-sm font-semibold">For the period: {dateRange}</p>
                    {selectedAccount && (
                        <p className="text-xs mt-1">Account: {selectedAccount.account_name}</p>
                    )}
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            {/* Receipts Headers */}
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '25%'}}>
                                RECEIPTS
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%'}}>
                                Month
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%', borderRightWidth: '3px'}}>
                                Cumulative
                            </th>

                            {/* Payments Headers */}
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '25%'}}>
                                PAYMENTS
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%'}}>
                                Month
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%'}}>
                                Cumulative
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Opening Balance Row */}
                        <tr>
                            <td className="border border-black px-2 py-0.5 font-semibold" style={{fontSize: '7px'}}>
                                Opening Balance
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px'}}>
                                {formatCurrency(openingBalance)}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px', borderRightWidth: '3px'}}>
                                {formatCurrency(openingBalance)}
                            </td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                        </tr>

                        {/* Data Rows */}
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const receipt = receipts[index];
                            const payment = payments[index];

                            return (
                                <tr key={index}>
                                    {/* Receipt Side */}
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                        {receipt ? receipt.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {receipt ? formatCurrency(receipt.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                        {receipt ? formatCurrency(receipt.cumulative_amount) : ''}
                                    </td>

                                    {/* Payment Side */}
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                        {payment ? payment.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {payment ? formatCurrency(payment.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {payment ? formatCurrency(payment.cumulative_amount) : ''}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Closing Balance Row */}
                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px', borderRightWidth: '3px'}}></td>
                            <td className="border border-black px-2 py-0.5 font-semibold" style={{fontSize: '7px'}}>
                                Closing Balance
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px'}}>
                                {formatCurrency(closingBalance)}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px'}}>
                                {formatCurrency(cumulativeClosingBalance)}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {/* Total Row */}
                        <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                TOTAL:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(openingBalance + totalMonthReceipts)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px', borderRightWidth: '3px'}}>
                                {formatCurrency(openingBalance + totalCumulativeReceipts)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                TOTAL:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(totalMonthPayments + closingBalance)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(totalCumulativePayments + cumulativeClosingBalance)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* Signature Section */}
                <div className="mt-10">
                    <div className="grid grid-cols-3 gap-16">
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-14">
                                <p className="font-semibold" style={{fontSize: '9px'}}>Prepared By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-14">
                                <p className="font-semibold" style={{fontSize: '9px'}}>Checked By</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-black pt-1 mt-14">
                                <p className="font-semibold" style={{fontSize: '9px'}}>Approved By</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-gray-600" style={{fontSize: '7px'}}>
                    <p>Printed on: {new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm;
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
                        border-collapse: collapse !important;
                        width: 100%;
                    }

                    th, td {
                        border: 1px solid #000 !important;
                    }

                    /* Bold divider between Receipt and Payment sections */
                    th:nth-child(3),
                    td:nth-child(3) {
                        border-right: 3px solid #000 !important;
                    }

                    .bg-gray-800,
                    .bg-gray-100,
                    .bg-blue-50 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
