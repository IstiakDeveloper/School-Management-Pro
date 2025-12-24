import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Edit, Trash2, Eye, Calendar, BookOpen,
    Filter, ClipboardList, FileText, CheckCircle,
    Clock, XCircle, AlertCircle
} from 'lucide-react';
import { Exam, PaginatedData, ExamFilters, AcademicYear } from '@/types/exam';

interface IndexProps {
    exams: PaginatedData<Exam>;
    filters?: ExamFilters;
    academicYears: AcademicYear[];
}

export default function Index({ exams, filters, academicYears }: IndexProps) {
    const [academicYearId, setAcademicYearId] = useState(filters?.academic_year_id || '');
    const [examType, setExamType] = useState(filters?.exam_type || '');
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
            router.delete(`/exams/${deleteModal.id}`, {
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

    const handleFilter = () => {
        router.get('/exams', {
            academic_year_id: academicYearId,
            exam_type: examType
        }, { preserveState: true });
    };

    const handleReset = () => {
        setAcademicYearId('');
        setExamType('');
        router.get('/exams');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'upcoming':
                return <Clock className="w-4 h-4" />;
            case 'ongoing':
                return <AlertCircle className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getExamTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            first_term: 'First Term',
            mid_term: 'Mid Term',
            final: 'Final',
            test: 'Test',
            practical: 'Practical',
        };
        return labels[type] || type;
    };

    const upcomingCount = exams.data.filter(e => e.status === 'upcoming').length;
    const ongoingCount = exams.data.filter(e => e.status === 'ongoing').length;
    const completedCount = exams.data.filter(e => e.status === 'completed').length;

    return (
        <AuthenticatedLayout>
            <Head title="Exams" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Exams
                        </h1>
                        <p className="text-gray-600 mt-1">Manage exam schedules and assessments</p>
                    </div>
                    <Link href="/exams/create">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Exam
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Exams</p>
                                <p className="text-2xl font-bold text-gray-900">{exams.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Upcoming</p>
                                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Ongoing</p>
                                <p className="text-2xl font-bold text-gray-900">{ongoingCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={academicYearId}
                            onChange={(e) => setAcademicYearId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Academic Years</option>
                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>{year.name}</option>
                            ))}
                        </select>

                        <select
                            value={examType}
                            onChange={(e) => setExamType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Exam Types</option>
                            <option value="first_term">First Term</option>
                            <option value="mid_term">Mid Term</option>
                            <option value="final">Final</option>
                            <option value="test">Test</option>
                            <option value="practical">Practical</option>
                        </select>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleFilter}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-1"
                                icon={<Filter className="w-4 h-4" />}
                            >
                                Apply Filters
                            </Button>
                            <Button onClick={handleReset} variant="ghost">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Exams Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {exams.data.map((exam, index) => (
                        <div
                            key={exam.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
                                            <p className="text-sm text-gray-600">{exam.academicYear?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge
                                            variant={
                                                exam.status === 'upcoming' ? 'info' :
                                                exam.status === 'ongoing' ? 'warning' :
                                                exam.status === 'completed' ? 'success' :
                                                'default'
                                            }
                                            className="capitalize flex items-center gap-1"
                                        >
                                            {getStatusIcon(exam.status)}
                                            {exam.status}
                                        </Badge>
                                        <Badge variant="default" className="capitalize">
                                            {getExamTypeLabel(exam.exam_type)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {exam.result_publish_date && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <FileText className="w-4 h-4" />
                                        <span>Results: {new Date(exam.result_publish_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {exam.classes && exam.classes.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <ClipboardList className="w-4 h-4" />
                                        <span>{exam.classes.length} Classes</span>
                                    </div>
                                )}
                            </div>

                            {exam.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                <Link href={`/exams/${exam.id}`} className="flex-1">
                                    <Button variant="ghost" size="sm" className="w-full" icon={<Eye className="w-4 h-4" />}>
                                        View
                                    </Button>
                                </Link>
                                <Link href={`/exams/${exam.id}/edit`} className="flex-1">
                                    <Button variant="ghost" size="sm" className="w-full" icon={<Edit className="w-4 h-4" />}>
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(exam.id, exam.name)}
                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {exams.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Exams Found</h4>
                            <p className="text-gray-600 mt-1">Create your first exam to get started.</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {exams.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {exams.current_page} of {exams.last_page} ({exams.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/exams', { ...filters, page: exams.current_page - 1 })}
                                    disabled={exams.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/exams', { ...filters, page: exams.current_page + 1 })}
                                    disabled={exams.current_page === exams.last_page}
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
                title="Delete Exam"
                message="Are you sure you want to delete this exam? This action cannot be undone."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
