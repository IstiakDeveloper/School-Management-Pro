import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Calendar, TrendingDown } from 'lucide-react';
import { FixedAsset } from '@/types/accounting';

interface ShowProps {
    asset: FixedAsset;
}

export default function Show({ asset }: ShowProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const calculateDepreciation = () => {
        if (!asset.depreciation_rate) return 0;
        return asset.purchase_price - asset.current_value;
    };

    const getDepreciationPercentage = () => {
        if (asset.purchase_price === 0) return 0;
        return ((calculateDepreciation() / asset.purchase_price) * 100).toFixed(2);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Asset: ${asset.asset_name}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {asset.asset_name}
                        </h1>
                        <p className="text-gray-600 mt-1">Fixed Asset Details</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/accounting/fixed-assets/${asset.id}/edit`}>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                icon={<Edit className="w-5 h-5" />}
                            >
                                Edit Asset
                            </Button>
                        </Link>
                        <Link href="/accounting/fixed-assets">
                            <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />}>
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Asset Code</p>
                                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{asset.asset_code}</code>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Category</p>
                                    <p className="text-lg font-semibold text-gray-900">{asset.category}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Purchase Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <p className="text-gray-900">{formatDate(asset.purchase_date)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Status</p>
                                    <Badge
                                        variant={
                                            asset.status === 'active' ? 'success' :
                                            asset.status === 'disposed' ? 'default' : 'error'
                                        }
                                    >
                                        {asset.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Financial Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                                    <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(asset.purchase_price)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                                    <p className="text-2xl font-bold text-blue-600">৳{formatCurrency(asset.current_value)}</p>
                                </div>
                                {asset.depreciation_rate && (
                                    <>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Depreciation Rate</p>
                                            <p className="text-lg font-semibold text-gray-900">{asset.depreciation_rate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Depreciation</p>
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                <p className="text-lg font-semibold text-red-600">
                                                    ৳{formatCurrency(calculateDepreciation())} ({getDepreciationPercentage()}%)
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {asset.description && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                                <p className="text-gray-700">{asset.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Asset Status</span>
                                    <Badge
                                        variant={
                                            asset.status === 'active' ? 'success' :
                                            asset.status === 'disposed' ? 'default' : 'error'
                                        }
                                    >
                                        {asset.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Category</span>
                                    <span className="font-semibold text-gray-900">{asset.category}</span>
                                </div>
                                <div className="pt-3 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600">Purchase Price</span>
                                        <span className="font-semibold text-gray-900">৳{formatCurrency(asset.purchase_price)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600">Depreciation</span>
                                        <span className="font-semibold text-red-600">-৳{formatCurrency(calculateDepreciation())}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <span className="font-semibold text-gray-900">Current Value</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            ৳{formatCurrency(asset.current_value)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Purchased</p>
                                        <p className="text-xs text-gray-600">{formatDate(asset.purchase_date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Last Updated</p>
                                        <p className="text-xs text-gray-600">{formatDate(asset.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
