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

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            router.delete(`/classes/${id}`);
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Classes" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Classes
                        </h1>
                        <p className="text-gray-600 mt-1">Manage school classes and grades</p>
                    </div>
                    <Link href="/classes/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Class
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Classes</p>
                                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Grid className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Sections</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classes.reduce((sum, cls) => sum + cls.sections_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classes.reduce((sum, cls) => sum + cls.students_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {classes.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sections</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Students</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subjects</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fees</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredClasses.map((cls, index) => (
                                <tr key={cls.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{cls.name}</p>
                                                {cls.name_bengali && <p className="text-sm text-gray-600">{cls.name_bengali}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">{cls.numeric_value}</td>
                                    <td className="px-6 py-4 text-gray-900">{cls.sections_count}</td>
                                    <td className="px-6 py-4 text-gray-900">{cls.students_count}</td>
                                    <td className="px-6 py-4 text-gray-900">{cls.subjects_count}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-medium text-green-600">{cls.fee_structures_count}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={cls.status === 'active' ? 'success' : 'default'} className="capitalize">
                                            {cls.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/classes/${cls.id}`}>
                                                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/classes/${cls.id}/edit`}>
                                                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(cls.id, cls.name)}
                                                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredClasses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Classes Found</h4>
                            <p className="text-gray-600 mt-1">Create your first class to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
