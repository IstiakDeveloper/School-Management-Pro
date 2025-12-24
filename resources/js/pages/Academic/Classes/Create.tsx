import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import { ArrowLeft, Save, BookOpen, DollarSign, Plus, X } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
}

interface FeeType {
    id: number;
    name: string;
    frequency: string;
}

interface AcademicYear {
    id: number;
    year: string;
}

interface CreateProps {
    subjects: Subject[];
    feeTypes: FeeType[];
    academicYears: AcademicYear[];
    currentAcademicYearId?: number;
}

export default function Create({ subjects, feeTypes, academicYears, currentAcademicYearId }: CreateProps) {
    const [data, setData] = useState({
        name: '',
        name_bengali: '',
        numeric_value: '',
        order: '',
        description: '',
        status: 'active',
        subjects: [] as number[],
        fee_structures: [] as Array<{ fee_type_id: string; academic_year_id: string; amount: string }>,
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const addFeeStructure = () => {
        setData(prev => ({
            ...prev,
            fee_structures: [
                ...prev.fee_structures,
                { fee_type_id: '', academic_year_id: currentAcademicYearId?.toString() || '', amount: '' }
            ]
        }));
    };

    const removeFeeStructure = (index: number) => {
        setData(prev => ({
            ...prev,
            fee_structures: prev.fee_structures.filter((_, i) => i !== index)
        }));
    };

    const updateFeeStructure = (index: number, field: string, value: string) => {
        setData(prev => ({
            ...prev,
            fee_structures: prev.fee_structures.map((fee, i) =>
                i === index ? { ...fee, [field]: value } : fee
            )
        }));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/classes', data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    };

    const toggleSubject = (id: number) => {
        setData(prev => ({
            ...prev,
            subjects: prev.subjects.includes(id)
                ? prev.subjects.filter(s => s !== id)
                : [...prev.subjects, id]
        }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Class" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/classes')}>
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Create Class
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new class to the school</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Class Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Class Name"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="Class 1, Class 10, etc."
                            />
                            <Input
                                label="Class Name (Bengali)"
                                value={data.name_bengali}
                                onChange={(e) => setData({ ...data, name_bengali: e.target.value })}
                                error={errors.name_bengali}
                                placeholder="প্রথম শ্রেণী"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Grade Number"
                                type="number"
                                value={data.numeric_value}
                                onChange={(e) => setData({ ...data, numeric_value: e.target.value })}
                                error={errors.numeric_value}
                                required
                                min="1"
                                max="12"
                                placeholder="1-12"
                            />
                            <Input
                                label="Display Order"
                                type="number"
                                value={data.order}
                                onChange={(e) => setData({ ...data, order: e.target.value })}
                                error={errors.order}
                                required
                                min="0"
                                placeholder="0, 1, 2..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData({ ...data, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData({ ...data, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Additional information about this class..."
                            />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Subjects</h3>
                        <p className="text-sm text-gray-600 mb-4">Select subjects that will be taught in this class</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {subjects.map((subject) => (
                                <label
                                    key={subject.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                        data.subjects.includes(subject.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.subjects.includes(subject.id)}
                                        onChange={() => toggleSubject(subject.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className={`text-sm font-medium ${
                                        data.subjects.includes(subject.id) ? 'text-blue-900' : 'text-gray-700'
                                    }`}>
                                        {subject.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Fee Structures */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-green-600" />
                                    Fee Structures
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">Configure fees for this class</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={addFeeStructure}
                            >
                                Add Fee
                            </Button>
                        </div>

                        {data.fee_structures.length > 0 ? (
                            <div className="space-y-4">
                                {data.fee_structures.map((fee, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-medium text-gray-900">Fee #{index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeFeeStructure(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type *</label>
                                                <select
                                                    value={fee.fee_type_id}
                                                    onChange={(e) => updateFeeStructure(index, 'fee_type_id', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select fee type...</option>
                                                    {feeTypes.map((type) => (
                                                        <option key={type.id} value={type.id}>
                                                            {type.name} ({type.frequency})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                                                <select
                                                    value={fee.academic_year_id}
                                                    onChange={(e) => updateFeeStructure(index, 'academic_year_id', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    required
                                                >
                                                    <option value="">Select Academic Year</option>
                                                    {academicYears.map((year) => (
                                                        <option key={year.id} value={year.id}>
                                                            {year.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (৳) *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={fee.amount}
                                                    onChange={(e) => updateFeeStructure(index, 'amount', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Note:</strong> Due date will be automatically set based on fee frequency (Monthly = Last day of each month, Yearly = December 31)
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-3">No fee structures added yet</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={addFeeStructure}
                                >
                                    Add First Fee
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <Button type="button" variant="ghost" onClick={() => router.visit('/classes')}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Creating...' : 'Create Class'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
