import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { Grid } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface CreateProps {
    classes: SchoolClass[];
}

export default function Create({ classes }: CreateProps) {
    const [formData, setFormData] = useState({
        class_id: '',
        name: '',
        capacity: '',
        room_number: '',
        description: '',
        status: 'active',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        router.post('/sections', formData, {
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
            <Head title="Create Section" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                        <Grid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Create Section
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new section to the system</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Section Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700 mb-2">
                                    Class <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="class_id"
                                    name="class_id"
                                    value={formData.class_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name} ({cls.name_bengali})
                                        </option>
                                    ))}
                                </select>
                                {errors.class_id && (
                                    <p className="text-sm text-red-600 mt-1">{errors.class_id}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Section Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., A, B, C"
                                    error={errors.name}
                                />
                            </div>

                            <div>
                                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="capacity"
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder="e.g., 40"
                                    error={errors.capacity}
                                />
                            </div>

                            <div>
                                <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Number <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="room_number"
                                    name="room_number"
                                    type="text"
                                    value={formData.room_number}
                                    onChange={handleChange}
                                    placeholder="e.g., 101, 202"
                                    error={errors.room_number}
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
                                    placeholder="Additional details about this section..."
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
                            onClick={() => router.visit('/sections')}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                        >
                            Create Section
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
