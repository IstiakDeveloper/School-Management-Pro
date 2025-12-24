import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Search, Eye, Edit, Trash2, Building2, TrendingUp } from 'lucide-react';
import { FixedAsset, PaginatedData } from '@/types/accounting';

interface IndexProps {
    assets: PaginatedData<FixedAsset>;
    filters?: {
        search?: string;
        category?: string;
        status?: string;
    };
    stats: {
        total_value: number;
        total_assets: number;
    };
}

export default function Index({ assets, filters, stats }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [status, setStatus] = useState(filters?.status || '');

    const handleFilter = () => {
        router.get('/accounting/fixed-assets', { search, category, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        router.get('/accounting/fixed-assets');
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete fixed asset "${name}"?`)) {
            router.delete(`/accounting/fixed-assets/${id}`);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Fixed Assets" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Fixed Assets
                        </h1>
                        <p className="text-gray-600 mt-1">Manage school fixed assets and equipment</p>
                    </div>
                    <Link href="/accounting/fixed-assets/create">
                        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Add Asset
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Asset Value</p>
                                <p className="text-2xl font-bold text-gray-900">৳{formatCurrency(stats.total_value)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Assets</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_assets}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            placeholder="Filter by category..."
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="disposed">Disposed</option>
                            <option value="damaged">Damaged</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <Button onClick={handleFilter} icon={<Search className="w-5 h-5" />}>
                            Filter
                        </Button>
                        <Button variant="ghost" onClick={handleReset}>
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {assets.data.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{asset.asset_name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="px-2 py-1 bg-gray-100 rounded text-sm">{asset.asset_code}</code>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{asset.category}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatDate(asset.purchase_date)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-900">
                                                ৳{formatCurrency(asset.purchase_price)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-gray-900">
                                                ৳{formatCurrency(asset.current_value)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge
                                                variant={
                                                    asset.status === 'active' ? 'success' :
                                                    asset.status === 'disposed' ? 'default' : 'error'
                                                }
                                            >
                                                {asset.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/accounting/fixed-assets/${asset.id}`}>
                                                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                </Link>
                                                <Link href={`/accounting/fixed-assets/${asset.id}/edit`}>
                                                    <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(asset.id, asset.asset_name)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {assets.data.length === 0 && (
                            <div className="text-center py-12">
                                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No fixed assets found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
