import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { Printer } from 'lucide-react';

interface FixedAssetItem {
    asset_name: string;
    current_value: number;
}

interface BalanceSheetProps {
    fundAndLiabilities: {
        fund: number;
        surplus: number;
        providentFund: number;
        staffWelfareFund: number;
        total: number;
    };
    propertyAndAssets: {
        fixedAssets: FixedAssetItem[];
        totalFixedAssets: number;
        welfareLoanOutstanding: number;
        closingBankBalance: number;
        total: number;
    };
    filters: {
        end_date: string;
    };
    balanceDifference: number;
}

export default function BalanceSheet({
    fundAndLiabilities,
    propertyAndAssets,
    filters,
    balanceDifference,
}: BalanceSheetProps) {
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const handleFilter = () => {
        router.get('/accounting/reports/balance-sheet',
            { end_date: endDate },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setEndDate('');
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

    const reportDate = new Date(filters.end_date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Calculate max rows for balanced layout
    const leftItems = 4; // Fund, Surplus, PF, Staff Welfare Fund
    const rightItems = propertyAndAssets.fixedAssets.length + 2; // Fixed assets + Welfare Loan + Bank Balance
    const maxRows = Math.max(leftItems, rightItems);

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
                            <p className="text-gray-600 mt-1">Statement of financial position</p>
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
                                As at Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
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
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">Balance Sheet</h2>
                        <p className="text-sm font-semibold text-gray-600">As at {reportDate}</p>
                    </div>

                    {/* Main Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                            <thead>
                                <tr>
                                    {/* Fund and Liabilities Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '35%'}}>
                                        Fund and Liabilities
                                    </th>
                                    <th className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '15%'}}>
                                        Amount
                                    </th>

                                    {/* Property and Assets Headers */}
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '35%'}}>
                                        Property and Assets
                                    </th>
                                    <th className="border border-gray-400 px-2 py-1.5 text-center font-semibold bg-white text-xs" style={{width: '15%'}}>
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Fund Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Fund
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                        {formatCurrency(fundAndLiabilities.fund)}
                                    </td>

                                    {/* Fixed Assets Header */}
                                    {propertyAndAssets.fixedAssets.length > 0 ? (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs font-semibold">
                                                Fixed Assets:
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">

                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs">
                                                Fixed Assets
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {formatCurrency(0)}
                                            </td>
                                        </>
                                    )}
                                </tr>

                                {/* Surplus/Deficit Row */}
                                <tr className={fundAndLiabilities.surplus >= 0 ? 'bg-green-50' : 'bg-red-50'}>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Surplus/Deficit
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                        {fundAndLiabilities.surplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(fundAndLiabilities.surplus))}
                                    </td>

                                    {/* First Fixed Asset or empty */}
                                    {propertyAndAssets.fixedAssets[0] ? (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                                                {propertyAndAssets.fixedAssets[0].asset_name}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {formatCurrency(propertyAndAssets.fixedAssets[0].current_value)}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs"></td>
                                        </>
                                    )}
                                </tr>

                                {/* Provident Fund Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Provident Fund
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                        {formatCurrency(fundAndLiabilities.providentFund)}
                                    </td>

                                    {/* Second Fixed Asset or empty */}
                                    {propertyAndAssets.fixedAssets[1] ? (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                                                {propertyAndAssets.fixedAssets[1].asset_name}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {formatCurrency(propertyAndAssets.fixedAssets[1].current_value)}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs"></td>
                                        </>
                                    )}
                                </tr>

                                {/* Staff Welfare Fund Row */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Staff Welfare Fund
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs">
                                        {formatCurrency(fundAndLiabilities.staffWelfareFund)}
                                    </td>

                                    {/* Remaining Fixed Assets */}
                                    {propertyAndAssets.fixedAssets[2] ? (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                                                {propertyAndAssets.fixedAssets[2].asset_name}
                                            </td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                                {formatCurrency(propertyAndAssets.fixedAssets[2].current_value)}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                            <td className="border border-gray-400 px-2 py-1 text-right text-xs"></td>
                                        </>
                                    )}
                                </tr>

                                {/* Additional Fixed Assets (if more than 3) */}
                                {propertyAndAssets.fixedAssets.slice(3).map((asset, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                        <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs"></td>
                                        <td className="border border-gray-400 px-2 py-1 text-xs pl-4">
                                            {asset.asset_name}
                                        </td>
                                        <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                            {formatCurrency(asset.current_value)}
                                        </td>
                                    </tr>
                                ))}

                                {/* Fixed Assets Total */}
                                {propertyAndAssets.fixedAssets.length > 0 && (
                                    <tr className="bg-gray-100">
                                        <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                        <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs"></td>
                                        <td className="border border-gray-400 px-2 py-1 text-xs font-semibold">
                                            Total Fixed Assets
                                        </td>
                                        <td className="border border-gray-400 px-2 py-1 text-right text-xs font-semibold">
                                            {formatCurrency(propertyAndAssets.totalFixedAssets)}
                                        </td>
                                    </tr>
                                )}

                                {/* Staff Welfare Fund (Loans) */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs"></td>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Staff Welfare Fund (Loans)
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                        {formatCurrency(propertyAndAssets.welfareLoanOutstanding)}
                                    </td>
                                </tr>

                                {/* Closing Bank Balance */}
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1 text-xs"></td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1 text-right text-xs"></td>
                                    <td className="border border-gray-400 px-2 py-1 text-xs">
                                        Closing Bank Balance
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1 text-right text-xs">
                                        {formatCurrency(propertyAndAssets.closingBankBalance)}
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                {/* Total Row */}
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        Total:
                                    </td>
                                    <td className="border border-gray-400 border-r-4 border-r-gray-700 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(fundAndLiabilities.total)}
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        Total:
                                    </td>
                                    <td className="border border-gray-400 px-2 py-1.5 text-right font-bold text-xs">
                                        {formatCurrency(propertyAndAssets.total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Balance Check */}
                    {Math.abs(balanceDifference) > 0.01 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Warning:</strong> Balance Sheet is not balanced. Difference: ৳{formatCurrency(Math.abs(balanceDifference))}
                            </p>
                        </div>
                    )}

                    {/* Summary Info */}
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-gray-600 mb-1">Total Fund and Liabilities</p>
                            <p className="text-2xl font-bold text-blue-600">৳ {formatCurrency(fundAndLiabilities.total)}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-gray-600 mb-1">Total Property and Assets</p>
                            <p className="text-2xl font-bold text-green-600">৳ {formatCurrency(propertyAndAssets.total)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div className="hidden print:block print-container">
                {/* Header */}
                <div className="text-center mb-4 pb-2 border-b-2 border-black">
                    <h1 className="text-xl font-bold mb-1">School Management Pro</h1>
                    <h2 className="text-lg font-bold mb-1">Balance Sheet</h2>
                    <p className="text-sm font-semibold">As at {reportDate}</p>
                </div>

                {/* Main Table - Print Style */}
                <table className="w-full border-collapse border border-black">
                    <thead>
                        <tr>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '35%'}}>
                                Fund and Liabilities
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '15%', borderRightWidth: '3px'}}>
                                Amount
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '35%'}}>
                                Property and Assets
                            </th>
                            <th className="border border-black px-2 py-1 text-center font-semibold" style={{fontSize: '8px', width: '15%'}}>
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Fund Row */}
                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Fund
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                {formatCurrency(fundAndLiabilities.fund)}
                            </td>
                            {propertyAndAssets.fixedAssets.length > 0 ? (
                                <>
                                    <td className="border border-black px-2 py-0.5 font-semibold" style={{fontSize: '6.5px'}}>
                                        Fixed Assets:
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>

                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                        Fixed Assets
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {formatCurrency(0)}
                                    </td>
                                </>
                            )}
                        </tr>

                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Surplus/Deficit
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                {fundAndLiabilities.surplus >= 0 ? '+' : '-'} {formatCurrency(Math.abs(fundAndLiabilities.surplus))}
                            </td>
                            {propertyAndAssets.fixedAssets[0] ? (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px', paddingLeft: '8px'}}>
                                        {propertyAndAssets.fixedAssets[0].asset_name}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {formatCurrency(propertyAndAssets.fixedAssets[0].current_value)}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}></td>
                                </>
                            )}
                        </tr>

                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Provident Fund
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                {formatCurrency(fundAndLiabilities.providentFund)}
                            </td>
                            {propertyAndAssets.fixedAssets[1] ? (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px', paddingLeft: '8px'}}>
                                        {propertyAndAssets.fixedAssets[1].asset_name}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {formatCurrency(propertyAndAssets.fixedAssets[1].current_value)}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}></td>
                                </>
                            )}
                        </tr>

                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Staff Welfare Fund
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}>
                                {formatCurrency(fundAndLiabilities.staffWelfareFund)}
                            </td>
                            {propertyAndAssets.fixedAssets[2] ? (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px', paddingLeft: '8px'}}>
                                        {propertyAndAssets.fixedAssets[2].asset_name}
                                    </td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                        {formatCurrency(propertyAndAssets.fixedAssets[2].current_value)}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                                    <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}></td>
                                </>
                            )}
                        </tr>

                        {propertyAndAssets.fixedAssets.slice(3).map((asset, index) => (
                            <tr key={index}>
                                <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                                <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}></td>
                                <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px', paddingLeft: '8px'}}>
                                    {asset.asset_name}
                                </td>
                                <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                    {formatCurrency(asset.current_value)}
                                </td>
                            </tr>
                        ))}

                        {propertyAndAssets.fixedAssets.length > 0 && (
                            <tr className="bg-gray-100">
                                <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                                <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}></td>
                                <td className="border border-black px-2 py-0.5 font-semibold" style={{fontSize: '6.5px'}}>
                                    Total Fixed Assets
                                </td>
                                <td className="border border-black px-2 py-0.5 text-right font-semibold" style={{fontSize: '6.5px'}}>
                                    {formatCurrency(propertyAndAssets.totalFixedAssets)}
                                </td>
                            </tr>
                        )}

                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Staff Welfare Fund (Loans)
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                {formatCurrency(propertyAndAssets.welfareLoanOutstanding)}
                            </td>
                        </tr>

                        <tr>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}></td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px', borderRightWidth: '3px'}}></td>
                            <td className="border border-black px-2 py-0.5" style={{fontSize: '6.5px'}}>
                                Closing Bank Balance
                            </td>
                            <td className="border border-black px-2 py-0.5 text-right" style={{fontSize: '6.5px'}}>
                                {formatCurrency(propertyAndAssets.closingBankBalance)}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px', borderRightWidth: '3px'}}>
                                {formatCurrency(fundAndLiabilities.total)}
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                Total:
                            </td>
                            <td className="border border-black px-2 py-1 text-right font-bold" style={{fontSize: '8px'}}>
                                {formatCurrency(propertyAndAssets.total)}
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

                    /* Bold divider between Fund/Liabilities and Property/Assets */
                    th:nth-child(2),
                    td:nth-child(2) {
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
