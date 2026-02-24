import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Eye, BookOpen, Search, Users, Grid, DollarSign } from 'lucide-react';

interface SchoolClass {
    id: number;
    name: string;
    name_bengali?: string;
    numeric_value: number;
    order: number;
    status: string;
    sections_count: number;
    students_count: number;
    subjects_count: number;
    fee_structures_count: number;
}

interface IndexProps {
    classes: SchoolClass[];
}

export default function Index({ classes }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete "${name}"?`)) router.delete(`/classes/${id}`);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Classes" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Classes</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage classes and grades</p>
                    </div>
                    <Link href="/classes/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Create Class</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <input
                        type="text"
                        placeholder="Search classes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xs text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Sections</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Fees</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filtered.length > 0 ? filtered.map((cls) => (
                                    <tr key={cls.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{cls.name}</p>
                                                    {cls.name_bengali && <p className="text-xs text-gray-500">{cls.name_bengali}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{cls.numeric_value}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{cls.sections_count}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{cls.students_count}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{cls.subjects_count}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{cls.fee_structures_count}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={cls.status === 'active' ? 'success' : 'default'} className="capitalize text-xs">{cls.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/classes/${cls.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/classes/${cls.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDelete(cls.id, cls.name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">No classes found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
