import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Eye, Grid, Search, Users, BookOpen } from 'lucide-react';

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string;
    status: string;
    students_count: number;
    class?: {
        id: number;
        name: string;
    };
}

interface IndexProps {
    sections: {
        data: Section[];
    };
}

export default function Index({ sections }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete Section "${name}"?`)) {
            router.delete(`/sections/${id}`);
        }
    };

    const filteredSections = sections.data.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.class?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Sections" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Sections
                        </h1>
                        <p className="text-gray-600 mt-1">Manage class sections and rooms</p>
                    </div>
                    <Link href="/sections/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Section
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Grid className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Sections</p>
                                <p className="text-2xl font-bold text-gray-900">{sections.data.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sections.data.reduce((sum, sec) => sum + sec.students_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {sections.data.reduce((sum, sec) => sum + sec.capacity, 0)}
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
                            placeholder="Search sections..."
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
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Section</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Capacity</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Students</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSections.map((section, index) => (
                                <tr key={section.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Grid className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-gray-900">Section {section.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">{section.class?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-900">Room {section.room_number}</td>
                                    <td className="px-6 py-4 text-gray-900">{section.capacity}</td>
                                    <td className="px-6 py-4 text-gray-900">{section.students_count}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={section.status === 'active' ? 'success' : 'default'} className="capitalize">
                                            {section.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/sections/${section.id}`}>
                                                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/sections/${section.id}/edit`}>
                                                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(section.id, section.name)}
                                                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredSections.length === 0 && (
                        <div className="text-center py-12">
                            <Grid className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Sections Found</h4>
                            <p className="text-gray-600 mt-1">Create your first section to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
