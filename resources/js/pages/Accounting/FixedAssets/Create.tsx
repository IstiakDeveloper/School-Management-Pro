import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import { Save, ArrowLeft } from 'lucide-react';
import { Account } from '@/types/accounting';

interface CreateProps {
    accounts: Account[];
    nextAssetCode: string;
}

export default function Create({ accounts, nextAssetCode }: CreateProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        asset_name: '',
        asset_code: nextAssetCode,
        category: '',
        account_id: '',
        purchase_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
        depreciation_rate: '0',
        description: '',
        status: 'active',
    });

    // Auto-select first account
    useEffect(() => {
        if (accounts.length > 0 && !formData.account_id) {
            setFormData(prev => ({ ...prev, account_id: accounts[0].id.toString() }));
        }
    }, [accounts]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/accounting/fixed-assets', formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Add Fixed Asset" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Add Fixed Asset
                        </h1>
                        <p className="text-gray-600 mt-1">Register a new fixed asset</p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/accounting/fixed-assets')}
                        icon={<ArrowLeft className="w-5 h-5" />}
                    >
                        Back
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Asset Name"
                                value={formData.asset_name}
                                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                                error={errors.asset_name}
                                required
                                placeholder="e.g., School Bus"
                            />

                            <Input
                                label="Asset Code"
                                value={formData.asset_code}
                                onChange={(e) => setFormData({ ...formData, asset_code: e.target.value })}
                                error={errors.asset_code}
                                required
                                readOnly
                                className="bg-gray-50"
                                placeholder="Auto-generated"
                            />

                            <Input
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                error={errors.category}
                                required
                                placeholder="e.g., Vehicle, Furniture, Equipment"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Account <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.account_id}
                                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.account_name} (৳{parseFloat(account.current_balance.toString()).toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                                {errors.account_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>
                                )}
                            </div>

                            <Input
                                label="Purchase Price"
                                type="number"
                                step="0.01"
                                value={formData.purchase_price}
                                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                error={errors.purchase_price}
                                required
                                placeholder="0.00"
                            />

                            <Input
                                label="Purchase Date"
                                type="date"
                                value={formData.purchase_date}
                                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                error={errors.purchase_date}
                                required
                            />

                            <Input
                                label="Depreciation Rate (%)"
                                type="number"
                                step="0.01"
                                value={formData.depreciation_rate}
                                onChange={(e) => setFormData({ ...formData, depreciation_rate: e.target.value })}
                                error={errors.depreciation_rate}
                                placeholder="e.g., 10.00"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="disposed">Disposed</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Optional asset description"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t">
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                loading={isSubmitting}
                                icon={<Save className="w-5 h-5" />}
                            >
                                Add Asset
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.visit('/accounting/fixed-assets')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
