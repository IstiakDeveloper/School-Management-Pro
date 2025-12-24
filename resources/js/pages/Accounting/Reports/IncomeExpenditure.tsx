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
    amount: number;
}

interface IncomeExpenditureProps {
    incomes: IncomeExpenditureItem[];
    expenditures: IncomeExpenditureItem[];
    totalIncome: number;
    totalExpenditure: number;
    surplusDeficit: number;
    filters: {
        start_date: string;
        end_date: string;
        account_id?: number;
    };
    accounts: Account[];
}

export default function IncomeExpenditure({
    incomes,
    expenditures,
    totalIncome,
    totalExpenditure,
    surplusDeficit,
    filters,
    accounts,
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

    // Add cumulative amounts to expenditures
    const expendituresWithCumulative = expenditures.map((expenditure, index) => {
        const cumulative = expenditures.slice(0, index + 1).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        return { ...expenditure, cumulative };
    });

    // Add cumulative amounts to incomes
    const incomesWithCumulative = incomes.map((income, index) => {
        const cumulative = incomes.slice(0, index + 1).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        return { ...income, cumulative };
    });

    // Calculate max rows for balanced layout
    const maxRows = Math.max(expendituresWithCumulative.length, incomesWithCumulative.length);

    // Determine if surplus or deficit
    const isSurplus = surplusDeficit >= 0;
    const isDeficit = surplusDeficit < 0;
    const surplusDeficitAmount = Math.abs(surplusDeficit);

    return (
        <AuthenticatedLayout>
            <Head title="Income & Expenditure Report" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Income & Expenditure Report
                            </h1>
                            <p className="text-gray-600 mt-1">Detailed income and expenditure account</p>
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
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">INCOME & EXPENDITURE ACCOUNT</h2>
                        <p className="text-sm font-semibold text-gray-600">For the period: {dateRange}</p>
                        {selectedAccount && (
                            <p className="text-xs mt-1 text-gray-500">Account: {selectedAccount.account_name}</p>
                        )}
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {/* Expenditure Main Header */}
                                    <th colSpan={4} className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-200 text-base">
                                        Expenditure
                                    </th>
                                    {/* Income Main Header */}
                                    <th colSpan={4} className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-200 text-base">
                                        Income
                                    </th>
                                </tr>
                                <tr>
                                    {/* Expenditure Sub Headers */}
                                    <th className="border-2 border-gray-400 px-2 py-2 text-center font-bold bg-gray-100 text-xs" style={{width: '3%'}}>
                                        SL
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '20%'}}>
                                        Particulars
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '10%'}}>
                                        Current Month
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '10%'}}>
                                        Cumulative
                                    </th>

                                    {/* Income Sub Headers */}
                                    <th className="border-2 border-gray-400 px-2 py-2 text-center font-bold bg-gray-100 text-xs" style={{width: '3%'}}>
                                        SL
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '20%'}}>
                                        Particulars
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '10%'}}>
                                        Current Month
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '10%'}}>
                                        Cumulative
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Data Rows */}
                                {Array.from({ length: maxRows }).map((_, index) => {
                                    const expenditure = expendituresWithCumulative[index];
                                    const income = incomesWithCumulative[index];

                                    return (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {/* Expenditure Side */}
                                            <td className="border border-gray-400 px-2 py-1.5 text-center text-xs">
                                                {expenditure ? index + 1 : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-sm">
                                                {expenditure ? expenditure.description : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-right font-mono text-sm">
                                                {expenditure ? formatCurrency(expenditure.amount) : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-right font-mono text-sm">
                                                {expenditure ? formatCurrency(expenditure.cumulative) : <span>&nbsp;</span>}
                                            </td>

                                            {/* Income Side */}
                                            <td className="border border-gray-400 px-2 py-1.5 text-center text-xs">
                                                {income ? index + 1 : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-sm">
                                                {income ? income.description : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-right font-mono text-sm">
                                                {income ? formatCurrency(income.amount) : <span>&nbsp;</span>}
                                            </td>
                                            <td className="border border-gray-400 px-3 py-1.5 text-right font-mono text-sm">
                                                {income ? formatCurrency(income.cumulative) : <span>&nbsp;</span>}
                                            </td>
                                        </tr>
                                    );
                                })}

                            </tbody>
                            <tfoot>
                                {/* Total Expenditure / Total Income Row */}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total Expenditure:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalExpenditure)}
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalExpenditure)}
                                    </td>

                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total Income:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                </tr>

                                {/* Surplus/Deficit Row - On Expenditure Side */}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Surplus/(Deficit):
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(surplusDeficit)}
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(surplusDeficit)}
                                    </td>

                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-sm">
                                        &nbsp;
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-sm">
                                        &nbsp;
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-sm">
                                        &nbsp;
                                    </td>
                                </tr>

                                {/* Grand Total Row */}
                                <tr className="font-bold">
                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalExpenditure + surplusDeficit)}
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalExpenditure + surplusDeficit)}
                                    </td>

                                    <td colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalIncome)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Income</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="text-gray-600 mb-1">Total Expenditure</p>
                            <p className="text-2xl font-bold text-red-600">৳ {formatCurrency(totalExpenditure)}</p>
                        </div>
                        <div className={`${isSurplus ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} p-4 rounded-lg border`}>
                            <p className="text-gray-600 mb-1">{isSurplus ? 'Surplus' : 'Deficit'}</p>
                            <p className={`text-2xl font-bold ${isSurplus ? 'text-blue-600' : 'text-orange-600'}`}>
                                ৳ {formatCurrency(surplusDeficitAmount)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-xl font-bold mb-1">School Management Pro</h1>
                    <h2 className="text-lg font-bold mb-1">INCOME & EXPENDITURE ACCOUNT</h2>
                    <p className="text-sm font-semibold">For the period: {dateRange}</p>
                    {selectedAccount && (
                        <p className="text-xs mt-1">Account: {selectedAccount.account_name}</p>
                    )}
                </div>

                {/* Main Table */}
                <table className="w-full border-collapse" style={{borderCollapse: 'collapse'}}>
                    <thead>
                        <tr>
                            {/* Expenditure Main Header */}
                            <th colSpan={4} className="border-2 border-black px-2 py-1.5 text-center font-bold bg-gray-200" style={{fontSize: '9px'}}>
                                Expenditure
                            </th>
                            {/* Income Main Header */}
                            <th colSpan={4} className="border-2 border-black px-2 py-1.5 text-center font-bold bg-gray-200" style={{fontSize: '9px'}}>
                                Income
                            </th>
                        </tr>
                        <tr>
                            {/* Expenditure Sub Headers */}
                            <th className="border-2 border-black px-1 py-1 text-center font-bold bg-gray-100" style={{fontSize: '7px', width: '2%'}}>
                                SL
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '21%'}}>
                                Particulars
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '9%'}}>
                                Current Month
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '9%'}}>
                                Cumulative
                            </th>

                            {/* Income Sub Headers */}
                            <th className="border-2 border-black px-1 py-1 text-center font-bold bg-gray-100" style={{fontSize: '7px', width: '2%'}}>
                                SL
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '21%'}}>
                                Particulars
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '9%'}}>
                                Current Month
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '9%'}}>
                                Cumulative
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Data Rows */}
                        {Array.from({ length: maxRows }).map((_, index) => {
                            const expenditure = expendituresWithCumulative[index];
                            const income = incomesWithCumulative[index];

                            return (
                                <tr key={index}>
                                    {/* Expenditure Side */}
                                    <td className="border border-black px-1 py-0.5 text-center" style={{fontSize: '6px'}}>
                                        {expenditure ? index + 1 : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}>
                                        {expenditure ? expenditure.description : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>
                                        {expenditure ? formatCurrency(expenditure.amount) : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>
                                        {expenditure ? formatCurrency(expenditure.cumulative) : <span>&nbsp;</span>}
                                    </td>

                                    {/* Income Side */}
                                    <td className="border border-black px-1 py-0.5 text-center" style={{fontSize: '6px'}}>
                                        {income ? index + 1 : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '7px'}}>
                                        {income ? income.description : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>
                                        {income ? formatCurrency(income.amount) : <span>&nbsp;</span>}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right font-mono" style={{fontSize: '7px'}}>
                                        {income ? formatCurrency(income.cumulative) : <span>&nbsp;</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        {/* Total Expenditure / Total Income Row */}
                        <tr className="font-bold">
                            <td colSpan={2} className="border-2 border-black px-2 py-1 text-right" style={{fontSize: '7.5px'}}>
                                Total Expenditure:
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(totalExpenditure)}
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(totalExpenditure)}
                            </td>

                            <td colSpan={2} className="border-2 border-black px-2 py-1 text-right" style={{fontSize: '7.5px'}}>
                                Total Income:
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(totalIncome)}
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(totalIncome)}
                            </td>
                        </tr>

                        {/* Surplus/Deficit Row - On Expenditure Side */}
                        <tr className="font-bold">
                            <td colSpan={2} className="border-2 border-black px-2 py-1 text-right" style={{fontSize: '7.5px'}}>
                                Surplus/(Deficit):
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(surplusDeficit)}
                            </td>
                            <td className="border-2 border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(surplusDeficit)}
                            </td>

                            <td colSpan={2} className="border-2 border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                &nbsp;
                            </td>
                            <td className="border-2 border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                &nbsp;
                            </td>
                            <td className="border-2 border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                &nbsp;
                            </td>
                        </tr>

                        {/* Grand Total Row */}
                        <tr className="font-bold">
                            <td colSpan={2} className="border-2 border-black px-2 py-1.5 text-right" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(totalExpenditure + surplusDeficit)}
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(totalExpenditure + surplusDeficit)}
                            </td>

                            <td colSpan={2} className="border-2 border-black px-2 py-1.5 text-right" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(totalIncome)}
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(totalIncome)}
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

                    .bg-gray-800,
                    .bg-gray-100,
                    .bg-green-50,
                    .bg-red-50 {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
