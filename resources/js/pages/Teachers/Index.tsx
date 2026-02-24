import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Edit, Trash2, Eye, Users, Search, Mail, Phone, User } from 'lucide-react';

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    qualification: string;
    experience_years: number;
    status: string;
    photo: string | null;
    subjects_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    teachers: {
        data: Teacher[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    filters?: { search?: string; status?: string };
}

export default function Index({ teachers, filters = {} }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"?`)) router.delete(`/teachers/${id}`);
    };

    const handleSearch = () => {
        router.get('/teachers', { search: searchTerm || undefined }, { preserveState: true });
    };

    const getPhotoUrl = (photo: string | null) => {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        if (photo.startsWith('storage/')) return `/${photo}`;
        return `/storage/${photo}`;
    };

    const data = teachers.data;
    const colSpan = 8;

    return (
        <AuthenticatedLayout>
            <Head title="Teachers" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Teachers</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage teachers and staff</p>
                    </div>
                    <Link href="/teachers/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Add Teacher</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by name, email, employee ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 text-sm px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                        />
                        <Button type="submit" size="sm" variant="secondary" icon={<Search className="w-4 h-4" />}>Search</Button>
                    </form>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.length > 0 ? data.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            {teacher.photo && !imageErrors[teacher.id] ? (
                                                <img
                                                    src={getPhotoUrl(teacher.photo) || ''}
                                                    alt=""
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    onError={() => setImageErrors(prev => ({ ...prev, [teacher.id]: true }))}
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <User className="w-4 h-4 text-gray-600" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{teacher.employee_id}</td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{teacher.full_name}</p>
                                            <p className="text-xs text-gray-500">{teacher.experience_years} yrs exp.</p>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{teacher.email}</div>
                                            {teacher.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{teacher.phone}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{teacher.qualification || '—'}</td>
                                        <td className="px-4 py-3"><Badge variant="info" className="text-xs">{teacher.subjects_count} subjects</Badge></td>
                                        <td className="px-4 py-3">
                                            <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="capitalize text-xs">{teacher.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/teachers/${teacher.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/teachers/${teacher.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDelete(teacher.id, teacher.full_name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">No teachers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <IndexPagination
                        links={teachers.links ?? []}
                        from={teachers.from}
                        to={teachers.to}
                        total={teachers.total}
                        lastPage={teachers.last_page}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
