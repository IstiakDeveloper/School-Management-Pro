import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';

interface BalanceSheetProps {
    totalFundAvailable: number;
    surplusDeficit: number;
    liabilitiesTotal: number;
    bankBalance: number;
    fixedAssetsTotal: number;
    assetsTotal: number;
    filters: {
        as_on_date: string;
    };
}

export default function BalanceSheet({
    totalFundAvailable,
    surplusDeficit,
    liabilitiesTotal,
    bankBalance,
    fixedAssetsTotal,
    assetsTotal,
    filters,
}: BalanceSheetProps) {
    const [asOnDate, setAsOnDate] = useState(filters?.as_on_date || '');

    const handleFilter = () => {
        router.get('/accounting/reports/balance-sheet',
            { as_on_date: asOnDate },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setAsOnDate('');
        router.get('/accounting/reports/balance-sheet');
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

    const formattedDate = new Date(filters.as_on_date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const isSurplus = surplusDeficit >= 0;
    const isDeficit = surplusDeficit < 0;
    const surplusDeficitAmount = Math.abs(surplusDeficit);

    return (
        <AuthenticatedLayout>
            <Head title="Balance Sheet" />

            {/* Screen View */}
            <div className="print:hidden">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                Balance Sheet
                            </h1>
                            <p className="text-gray-600 mt-1">Financial position as on date</p>
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
                                As on Date
                            </label>
                            <input
                                type="date"
                                value={asOnDate}
                                onChange={(e) => setAsOnDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
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
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">BALANCE SHEET</h2>
                        <p className="text-sm font-semibold text-gray-600">As on: {formattedDate}</p>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {/* Liabilities Main Header */}
                                    <th colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-200 text-base">
                                        Fund and Liabilities
                                    </th>
                                    {/* Assets Main Header */}
                                    <th colSpan={2} className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-200 text-base">
                                        Property and Assets
                                    </th>
                                </tr>
                                <tr>
                                    {/* Liabilities Sub Headers */}
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '25%'}}>
                                        Particulars
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '25%'}}>
                                        Amount (৳)
                                    </th>

                                    {/* Assets Sub Headers */}
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '25%'}}>
                                        Particulars
                                    </th>
                                    <th className="border-2 border-gray-400 px-3 py-2 text-center font-bold bg-gray-100 text-sm" style={{width: '25%'}}>
                                        Amount (৳)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Fund Available Row */}
                                <tr className="bg-white">
                                    <td className="border border-gray-400 px-3 py-2 text-sm">
                                        Total Fund (Available)
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(totalFundAvailable)}
                                    </td>

                                    <td className="border border-gray-400 px-3 py-2 text-sm">
                                        Bank Balance
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(bankBalance)}
                                    </td>
                                </tr>

                                {/* Surplus/Deficit Row */}
                                <tr className={isDeficit ? 'bg-red-50' : 'bg-green-50'}>
                                    <td className="border border-gray-400 px-3 py-2 text-sm">
                                        Surplus{isDeficit ? ' (Deficit)' : ''}
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(surplusDeficitAmount)}
                                    </td>

                                    <td className="border border-gray-400 px-3 py-2 text-sm">
                                        Fixed Assets
                                    </td>
                                    <td className="border border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(fixedAssetsTotal)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Total Row */}
                                <tr className="bg-gray-800 text-white font-bold">
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(liabilitiesTotal)}
                                    </td>

                                    <td className="border-2 border-gray-400 px-3 py-2 text-right text-sm">
                                        Total:
                                    </td>
                                    <td className="border-2 border-gray-400 px-3 py-2 text-right font-mono text-sm">
                                        {formatCurrency(assetsTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-gray-600 mb-1">Total Fund Available</p>
                            <p className="text-2xl font-bold text-blue-600">৳ {formatCurrency(totalFundAvailable)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Bank Balance</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(bankBalance)}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <p className="text-gray-600 mb-1">Fixed Assets</p>
                            <p className="text-2xl font-bold text-purple-600">৳ {formatCurrency(fixedAssetsTotal)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-xl font-bold mb-1">School Management Pro</h1>
                    <h2 className="text-lg font-bold mb-1">BALANCE SHEET</h2>
                    <p className="text-sm font-semibold">As on: {formattedDate}</p>
                </div>

                {/* Main Table */}
                <table className="w-full border-collapse" style={{borderCollapse: 'collapse'}}>
                    <thead>
                        <tr>
                            {/* Liabilities Main Header */}
                            <th colSpan={2} className="border-2 border-black px-2 py-1.5 text-center font-bold bg-gray-200" style={{fontSize: '9px'}}>
                                Fund and Liabilities
                            </th>
                            {/* Assets Main Header */}
                            <th colSpan={2} className="border-2 border-black px-2 py-1.5 text-center font-bold bg-gray-200" style={{fontSize: '9px'}}>
                                Property and Assets
                            </th>
                        </tr>
                        <tr>
                            {/* Liabilities Sub Headers */}
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '25%'}}>
                                Particulars
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '25%'}}>
                                Amount (৳)
                            </th>

                            {/* Assets Sub Headers */}
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '25%'}}>
                                Particulars
                            </th>
                            <th className="border-2 border-black px-2 py-1 text-center font-bold bg-gray-100" style={{fontSize: '8px', width: '25%'}}>
                                Amount (৳)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Fund Available Row */}
                        <tr>
                            <td className="border border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                Total Fund (Available)
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(totalFundAvailable)}
                            </td>

                            <td className="border border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                Bank Balance
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(bankBalance)}
                            </td>
                        </tr>

                        {/* Surplus/Deficit Row */}
                        <tr className={isDeficit ? 'bg-red-50' : 'bg-green-50'}>
                            <td className="border border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                Surplus{isDeficit ? ' (Deficit)' : ''}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(surplusDeficitAmount)}
                            </td>

                            <td className="border border-black px-2 py-1" style={{fontSize: '7.5px'}}>
                                Fixed Assets
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-mono" style={{fontSize: '7.5px'}}>
                                {formatCurrency(fixedAssetsTotal)}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {/* Total Row */}
                        <tr className="bg-gray-800 text-white font-bold">
                            <td className="border-2 border-black px-2 py-1.5 text-right" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(liabilitiesTotal)}
                            </td>

                            <td className="border-2 border-black px-2 py-1.5 text-right" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border-2 border-black px-2 py-1.5 text-right font-mono" style={{fontSize: '8px'}}>
                                {formatCurrency(assetsTotal)}
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
