import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { BookOpen } from 'lucide-react';

interface CreateProps {}

export default function Create({}: CreateProps) {
    const [formData, setFormData] = useState({
        name: '',
        name_bengali: '',
        code: '',
        type: 'theory',
        total_marks: '',
        pass_marks: '',
        description: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        router.post('/subjects', formData, {
            onError: (errors) => setErrors(errors),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Subject" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Create Subject
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new subject to the system</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Subject Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Name (English) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Mathematics"
                                    error={errors.name}
                                />
                            </div>

                            <div>
                                <label htmlFor="name_bengali" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Name (Bengali) <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name_bengali"
                                    name="name_bengali"
                                    type="text"
                                    value={formData.name_bengali}
                                    onChange={handleChange}
                                    placeholder="e.g., গণিত"
                                    error={errors.name_bengali}
                                />
                            </div>

                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Code <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="code"
                                    name="code"
                                    type="text"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g., MATH101"
                                    error={errors.code}
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="theory">Theory</option>
                                    <option value="practical">Practical</option>
                                    <option value="both">Both</option>
                                </select>
                                {errors.type && (
                                    <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="total_marks" className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="total_marks"
                                    name="total_marks"
                                    type="number"
                                    value={formData.total_marks}
                                    onChange={handleChange}
                                    placeholder="e.g., 100"
                                    error={errors.total_marks}
                                />
                            </div>

                            <div>
                                <label htmlFor="pass_marks" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pass Marks <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="pass_marks"
                                    name="pass_marks"
                                    type="number"
                                    value={formData.pass_marks}
                                    onChange={handleChange}
                                    placeholder="e.g., 40"
                                    error={errors.pass_marks}
                                />
                            </div>

                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.status && (
                                    <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Additional details about this subject..."
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/subjects')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        >
                            Create Subject
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
