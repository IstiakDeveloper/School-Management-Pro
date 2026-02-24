import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Edit, Trash2, Eye, Users, Search, Mail, Phone, Filter } from 'lucide-react';

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
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    students: {
        data: Student[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { search?: string; class_id?: string; section_id?: string; academic_year_id?: string; status?: string };
    classes: Array<{ id: number; name: string }>;
    academicYears: Array<{ id: number; name: string }>;
}

export default function Index({ students, filters = {}, classes, academicYears }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [classId, setClassId] = useState(filters.class_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (id: number, name: string) => setDeleteModal({ isOpen: true, id, name });
    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/students/${deleteModal.id}`, {
                onFinish: () => { setIsDeleting(false); setDeleteModal({ isOpen: false, id: null, name: '' }); },
            });
        }
    };
    const handleDeleteCancel = () => setDeleteModal({ isOpen: false, id: null, name: '' });

    const handleSearch = () => {
        router.get('/students', { search: searchTerm, class_id: classId || undefined, status: status || undefined }, { preserveState: true });
    };
    const handleReset = () => {
        setSearchTerm(''); setClassId(''); setStatus('');
        router.get('/students');
    };

    const data = students.data;
    const colSpan = 8;

    return (
        <AuthenticatedLayout>
            <Head title="Students" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Students</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage student records</p>
                    </div>
                    <Link href="/students/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add Student</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-wrap items-end gap-2">
                        <div className="flex-1 min-w-[160px]">
                            <input
                                type="text"
                                placeholder="Search name, admission no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            />
                        </div>
                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-36 focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-32 focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="graduated">Graduated</option>
                            <option value="transferred">Transferred</option>
                            <option value="dropped">Dropped</option>
                        </select>
                        <Button size="sm" variant="secondary" onClick={handleSearch} icon={<Filter className="w-4 h-4" />}>Filter</Button>
                        <button type="button" onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700">Reset</button>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Adm No</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Roll</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            {student.photo_url ? (
                                                <img src={student.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {student.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{student.admission_number}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.roll_number}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{student.full_name}</p>
                                            {student.academic_year && <p className="text-xs text-gray-500">{student.academic_year.name}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {student.school_class?.name}{student.section ? ` / ${student.section.name}` : ''}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            {student.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{student.email}</div>}
                                            {student.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{student.phone}</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={student.status === 'active' ? 'success' : student.status === 'graduated' ? 'info' : student.status === 'transferred' ? 'warning' : 'default'}
                                                className="capitalize text-xs"
                                            >
                                                {student.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/students/${student.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDeleteClick(student.id, student.full_name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">No students found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={students.links ?? []}
                        from={students.from}
                        to={students.to}
                        total={students.total}
                        lastPage={students.last_page}
                    />
                </div>
            </div>
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
