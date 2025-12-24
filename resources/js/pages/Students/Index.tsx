import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import { Plus, Edit, Trash2, Eye, Users, Search, Mail, Phone, GraduationCap, Filter } from 'lucide-react';

interface Student {
    id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    photo: string | null;
    photo_url: string | null;
    status: string;
    academic_year?: { name: string };
    school_class?: { name: string };
    section?: { name: string };
    user?: {
        name: string;
        email: string;
    };
}

interface IndexProps {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        class_id?: string;
        section_id?: string;
        academic_year_id?: string;
        status?: string;
    };
    classes: Array<{ id: number; name: string }>;
    academicYears: Array<{ id: number; name: string }>;
}

export default function Index({ students, filters, classes, academicYears }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [classId, setClassId] = useState(filters?.class_id || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/students/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, id: null, name: '' });
    };

    const handleSearch = () => {
        router.get('/students', { search: searchTerm, class_id: classId, status }, { preserveState: true });
    };

    const handleReset = () => {
        setSearchTerm('');
        setClassId('');
        setStatus('');
        router.get('/students');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Students" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Students
                        </h1>
                        <p className="text-gray-600 mt-1">Manage student records and admissions</p>
                    </div>
                    <Link href="/students/create">
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Add Student
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{students.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Users className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.data.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {students.data.filter(s => s.status === 'inactive').length}
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
                                <p className="text-sm text-gray-600">Current Page</p>
                                <p className="text-2xl font-bold text-gray-900">{students.data.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, admission number, roll number..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="transferred">Transferred</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Filter className="w-4 h-4" />}>
                            Apply Filters
                        </Button>
                        <Button onClick={handleReset} variant="ghost">
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Photo</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Admission No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Roll No</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class & Section</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.data.map((student, index) => (
                                <tr key={student.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {student.photo_url ? (
                                                <img src={student.photo_url} alt={student.full_name} className="h-10 w-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold text-sm">
                                                        {student.full_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-semibold text-gray-900">{student.admission_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-900">{student.roll_number}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{student.full_name}</p>
                                            {student.academic_year && (
                                                <p className="text-sm text-gray-600">{student.academic_year.name}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            {student.school_class && <p className="font-semibold text-gray-900">{student.school_class.name}</p>}
                                            {student.section && <p className="text-sm text-gray-600">Section {student.section.name}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm space-y-1">
                                            {student.email && (
                                                <div className="flex items-center text-gray-600">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    {student.email}
                                                </div>
                                            )}
                                            {student.phone && (
                                                <div className="flex items-center text-gray-600">
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    {student.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                student.status === 'active' ? 'success' :
                                                student.status === 'graduated' ? 'info' :
                                                student.status === 'transferred' ? 'warning' :
                                                'default'
                                            }
                                            className="capitalize"
                                        >
                                            {student.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/students/${student.id}`}>
                                                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />}>
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={`/students/${student.id}/edit`}>
                                                <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />}>
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteClick(student.id, student.full_name)}
                                                icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {students.data.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Students Found</h4>
                            <p className="text-gray-600 mt-1">Add your first student to get started.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {students.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {students.current_page} of {students.last_page} ({students.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/students', { ...filters, page: students.current_page - 1 })}
                                    disabled={students.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/students', { ...filters, page: students.current_page + 1 })}
                                    disabled={students.current_page === students.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Student"
                message="Are you sure you want to delete this student? All associated data will be permanently removed."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
