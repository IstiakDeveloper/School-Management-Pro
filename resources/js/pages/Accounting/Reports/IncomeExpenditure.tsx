import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';

interface Account {
    id: number;
    account_name: string;
}

interface IncomeExpenditureItem {
    description: string;
    month_amount: number;
    cumulative_amount: number;
}

interface IncomeExpenditureProps {
    income: IncomeExpenditureItem[];
    expenditure: IncomeExpenditureItem[];
    totalMonthIncome: number;
    totalMonthExpenditure: number;
    totalCumulativeIncome: number;
    totalCumulativeExpenditure: number;
    monthSurplus: number;
    cumulativeSurplus: number;
    filters: {
        start_date: string;
        end_date: string;
        account_id?: number;
    };
    accounts: Account[];
    schoolName?: string;
    schoolAddress?: string;
}

export default function IncomeExpenditure({
    income,
    expenditure,
    totalMonthIncome,
    totalMonthExpenditure,
    totalCumulativeIncome,
    totalCumulativeExpenditure,
    monthSurplus,
    cumulativeSurplus,
    filters,
    accounts,
    schoolName = 'School Management Pro',
    schoolAddress = '',
}: IncomeExpenditureProps) {
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [accountId, setAccountId] = useState(filters?.account_id || '');

    const handleFilter = () => {
        router.get('/accounting/reports/income-expenditure',
            { start_date: startDate, end_date: endDate, account_id: accountId },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setAccountId('');
        router.get('/accounting/reports/income-expenditure');
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
    const maxRows = Math.max(income.length, expenditure.length);

    return (
        <AuthenticatedLayout>
            <Head title="Comprehensive Statement of Income and Expenditure" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Comprehensive Statement of Income and Expenditure
                            </h1>
                            <p className="text-gray-600 mt-1">Comprehensive statement of income and expenditure</p>
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
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Comprehensive Statement of Income and Expenditure</h2>
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
                                    {/* Expenditure Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        Expenditure
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Month
                                    </th>
                                    <th className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '10%'}}>
                                        Cumulative
                                    </th>

                                    {/* Income Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '25%'}}>
                                        Income
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
                                {/* Data Rows */}
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const incomeItem = income[index];
                                    const expenditureItem = expenditure[index];

                                    return (
                                        <tr key={index}>
                                            {/* Expenditure Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {expenditureItem ? expenditureItem.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {expenditureItem ? formatCurrency(expenditureItem.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                                {expenditureItem ? formatCurrency(expenditureItem.cumulative_amount) : ''}
                                            </td>

                                            {/* Income Side */}
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                {incomeItem ? incomeItem.description : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {incomeItem ? formatCurrency(incomeItem.month_amount) : ''}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {incomeItem ? formatCurrency(incomeItem.cumulative_amount) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Total Expenditure Row */}
                                <tr className="bg-gray-100">
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold text-xs">
                                        Total Expenditure:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold text-xs">
                                        {formatCurrency(totalMonthExpenditure)}
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right font-semibold text-xs">
                                        {formatCurrency(totalCumulativeExpenditure)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                </tr>

                                {/* Surplus/Deficit Row with +/- sign */}
                                <tr className={monthSurplus >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-semibold text-xs">
                                        Surplus/Deficit
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right text-xs">
                                        {monthSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(monthSurplus))}
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right text-xs">
                                        {cumulativeSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(cumulativeSurplus))}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                    <td className="border border-gray-400 px-2 py-1.5"></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Final Total Row - Both sides equal */}
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        Total:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthIncome)}
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativeIncome)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        Total:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalMonthIncome)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(totalCumulativeIncome)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(totalMonthIncome)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-gray-600 mb-1">Total Expenditure</p>
                            <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(totalMonthExpenditure)}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${monthSurplus >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
                            <p className="text-gray-600 mb-1">{monthSurplus >= 0 ? 'Surplus' : 'Deficit'}</p>
                            <p className={`text-2xl font-bold ${monthSurplus >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                ৳ {formatCurrency(Math.abs(monthSurplus))}
                            </p>
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
                    <h2 className="text-lg font-bold mb-1">Comprehensive Statement of Income and Expenditure</h2>
                    <p className="text-sm font-semibold">For the period: {dateRange}</p>
                    {selectedAccount && (
                        <p className="text-xs mt-1">Account: {selectedAccount.account_name}</p>
                    )}
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            {/* Expenditure Headers */}
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '25%'}}>
                                Expenditure
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%'}}>
                                Month
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '10%', borderRightWidth: '3px'}}>
                                Cumulative
                            </th>

                            {/* Income Headers */}
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '25%'}}>
                                Income
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
                        {/* Data Rows */}
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const incomeItem = income[index];
                            const expenditureItem = expenditure[index];

                            return (
                                <tr key={index}>
                                    {/* Expenditure Side */}
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                        {expenditureItem ? expenditureItem.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {expenditureItem ? formatCurrency(expenditureItem.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                        {expenditureItem ? formatCurrency(expenditureItem.cumulative_amount) : ''}
                                    </td>

                                    {/* Income Side */}
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                        {incomeItem ? incomeItem.description : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {incomeItem ? formatCurrency(incomeItem.month_amount) : ''}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {incomeItem ? formatCurrency(incomeItem.cumulative_amount) : ''}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Total Expenditure Row */}
                        <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-0.5 text-right font-semibold" style={{fontSize: '7px'}}>
                                Total Expenditure:
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right font-semibold" style={{fontSize: '7px'}}>
                                {formatCurrency(totalMonthExpenditure)}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right font-semibold" style={{fontSize: '7px', borderRightWidth: '3px'}}>
                                {formatCurrency(totalCumulativeExpenditure)}
                            </td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                        </tr>

                        {/* Surplus/Deficit Row with +/- sign */}
                        <tr>
                            <td className="border border-black px-2 py-0.5 font-semibold" style={{fontSize: '7px'}}>
                                {monthSurplus >= 0 ? 'Surplus (+)' : 'Deficit (-)'}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px'}}>
                                {monthSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(monthSurplus))}
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '7px', borderRightWidth: '3px'}}>
                                {cumulativeSurplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(cumulativeSurplus))}
                            </td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}></td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {/* Final Total Row - Both sides equal */}
                        <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(totalMonthIncome)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px', borderRightWidth: '3px'}}>
                                {formatCurrency(totalCumulativeIncome)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(totalMonthIncome)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(totalCumulativeIncome)}
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

                    /* Bold divider between Income and Expenditure sections */
                    th:nth-child(3),
                    td:nth-child(3) {
                        border-right: 3px solid #000 !important;
                    }

                    .bg-gray-100 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
