import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Eye, BookOpen, Search, Award, FileText } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    name_bengali: string;
    code: string;
    type: string;
    total_marks: number;
    pass_marks: number;
    status: string;
    classes_count: number;
}

interface IndexProps {
    subjects: {
        data: Subject[];
    };
}

export default function Index({ subjects }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete Subject "${name}"?`)) {
            router.delete(`/subjects/${id}`);
        }
    };

    const filteredSubjects = subjects.data.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.name_bengali.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Subjects" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Subjects
                        </h1>
                        <p className="text-gray-600 mt-1">Manage subjects and courses</p>
                    </div>
                    <Link href="/subjects/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Subject
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
                                <p className="text-sm text-gray-600">Total Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{subjects.data.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.data.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Theory</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.data.filter(s => s.type === 'theory').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Practical</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {subjects.data.filter(s => s.type === 'practical').length}
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
                            placeholder="Search subjects by name, bengali name, or code..."
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
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Marks</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pass Marks</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Classes</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSubjects.map((subject, index) => (
                                <tr key={subject.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <BookOpen className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{subject.name}</p>
                                                <p className="text-sm text-gray-600">{subject.name_bengali}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-mono text-sm">{subject.code}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={subject.type === 'theory' ? 'default' : subject.type === 'practical' ? 'warning' : 'info'} className="capitalize">
                                            {subject.type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900">{subject.total_marks}</td>
                                    <td className="px-6 py-4 text-gray-900">{subject.pass_marks}</td>
                                    <td className="px-6 py-4 text-gray-900">{subject.classes_count}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={subject.status === 'active' ? 'success' : 'default'} className="capitalize">
                                            {subject.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/subjects/${subject.id}`}>
                                                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/subjects/${subject.id}/edit`}>
                                                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(subject.id, subject.name)}
                                                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredSubjects.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Subjects Found</h4>
                            <p className="text-gray-600 mt-1">Create your first subject to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
