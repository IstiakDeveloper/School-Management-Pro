import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import IndexPagination from '@/Components/IndexPagination';
import { Plus, Edit, Trash2, Eye, Grid, Search, Users, BookOpen } from 'lucide-react';

interface Section {
    id: number;
    name: string;
    capacity: number;
    room_number: string;
    status: string;
    students_count: number;
    school_class?: { id: number; name: string };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexProps {
    sections: {
        data: Section[];
        current_page?: number;
        last_page?: number;
        total?: number;
        from?: number;
        to?: number;
        links?: PaginationLink[];
    };
    classes: Array<{ id: number; name: string }>;
    filters?: { class_id?: string };
}

export default function Index({ sections, classes, filters }: IndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [classId, setClassId] = useState(filters?.class_id ?? '');

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Delete section "${name}"?`)) router.delete(`/sections/${id}`);
    };

    const handleClassFilter = (value: string) => {
        setClassId(value);
        router.get('/sections', value ? { class_id: value } : {}, { preserveState: true });
    };

    const data = sections.data ?? [];
    const displayData = data.filter(s =>
        !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.school_class?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lastPage = sections.last_page ?? 1;
    const hasPagination = lastPage > 1 && Array.isArray(sections.links) && sections.links.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Sections" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Sections</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage class sections</p>
                    </div>
                    <Link href="/sections/create">
                        <Button size="sm" icon={<Plus className="w-4 h-4" />}>Create Section</Button>
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-wrap items-end gap-2">
                        <input
                            type="text"
                            placeholder="Search sections..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-48 focus:ring-1 focus:ring-gray-400"
                        />
                        <select
                            value={classId}
                            onChange={(e) => handleClassFilter(e.target.value)}
                            className="text-sm px-2.5 py-1.5 border border-gray-300 rounded w-36 focus:ring-1 focus:ring-gray-400"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/80 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Room</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Students</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-2.5 text-right text-[11px] font-medium text-gray-500 uppercase tracking-wider w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayData.length > 0 ? displayData.map((section) => (
                                    <tr key={section.id} className="hover:bg-gray-50/80">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                                    <Grid className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">Section {section.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{section.school_class?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{section.room_number || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{section.capacity}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{section.students_count}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={section.status === 'active' ? 'success' : 'default'} className="capitalize text-xs">{section.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link href={`/sections/${section.id}`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Eye className="w-3.5 h-3.5" /></Link>
                                                <Link href={`/sections/${section.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-600 rounded"><Edit className="w-3.5 h-3.5" /></Link>
                                                <button type="button" onClick={() => handleDelete(section.id, section.name)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">No sections found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {hasPagination && (
                        <IndexPagination
                            links={sections.links!}
                            from={sections.from}
                            to={sections.to}
                            total={sections.total}
                            lastPage={lastPage}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
