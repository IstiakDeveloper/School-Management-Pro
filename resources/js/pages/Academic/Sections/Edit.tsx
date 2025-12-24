import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { Grid, Trash2 } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
    capacity: number;
    room_number: string;
    description: string;
    status: string;
}

interface EditProps {
    section: Section;
    classes: SchoolClass[];
}

export default function Edit({ section, classes }: EditProps) {
    const [formData, setFormData] = useState({
        class_id: section.class_id.toString(),
        name: section.name,
        capacity: section.capacity.toString(),
        room_number: section.room_number,
        description: section.description || '',
        status: section.status,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        router.put(`/sections/${section.id}`, formData, {
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

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete Section "${section.name}"?`)) {
            router.delete(`/sections/${section.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Section ${section.name}`} />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                            <Grid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Edit Section
                            </h1>
                            <p className="text-gray-600 mt-1">Update section details</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700"
                        icon={<Trash2 className="w-5 h-5" />}
                    >
                        Delete Section
                    </Button>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        Currently editing: <span className="font-semibold">Section {section.name}</span>
                    </p>
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
                            Update Section
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
