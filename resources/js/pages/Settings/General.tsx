import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Save, Building2 } from 'lucide-react';

interface Props {
    settings: Record<string, string>;
}

export default function General({ settings }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        school_name: settings.school_name || '',
        school_code: settings.school_code || '',
        school_email: settings.school_email || '',
        school_phone: settings.school_phone || '',
        school_address: settings.school_address || '',
        school_website: settings.school_website || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const settingsPayload = [
            { key: 'school_name', value: data.school_name },
            { key: 'school_code', value: data.school_code },
            { key: 'school_email', value: data.school_email },
            { key: 'school_phone', value: data.school_phone },
            { key: 'school_address', value: data.school_address },
            { key: 'school_website', value: data.school_website },
        ];
        router.post('/settings', { settings: settingsPayload });
    };

    return (
        <AuthenticatedLayout>
            <Head title="General Settings" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                        <p className="text-gray-600">Configure school basic information</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card title="School Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.school_name}
                                    onChange={(e) => setData('school_name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.school_name && <p className="text-red-500 text-sm mt-1">{errors.school_name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    School Code *
                                </label>
                                <input
                                    type="text"
                                    value={data.school_code}
                                    onChange={(e) => setData('school_code', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.school_code && <p className="text-red-500 text-sm mt-1">{errors.school_code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={data.school_email}
                                    onChange={(e) => setData('school_email', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.school_email && <p className="text-red-500 text-sm mt-1">{errors.school_email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="text"
                                    value={data.school_phone}
                                    onChange={(e) => setData('school_phone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.school_phone && <p className="text-red-500 text-sm mt-1">{errors.school_phone}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={data.school_website}
                                    onChange={(e) => setData('school_website', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com"
                                />
                                {errors.school_website && <p className="text-red-500 text-sm mt-1">{errors.school_website}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    value={data.school_address}
                                    onChange={(e) => setData('school_address', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.school_address && <p className="text-red-500 text-sm mt-1">{errors.school_address}</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Settings
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
