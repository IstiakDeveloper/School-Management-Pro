import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import DeleteModal from '@/Components/DeleteModal';
import {
    Plus, Edit, Trash2, Eye, Calendar, Clock,
    Filter, BookOpen, GraduationCap, FileText, MapPin
} from 'lucide-react';
import { ExamSchedule, PaginatedData, ScheduleFilters, Exam, SchoolClass } from '@/types/exam';

interface IndexProps {
    schedules: PaginatedData<ExamSchedule>;
    filters?: ScheduleFilters;
    exams: Exam[];
    classes: SchoolClass[];
}

export default function Index({ schedules, filters, exams, classes }: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || '');
    const [classId, setClassId] = useState(filters?.class_id || '');
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
            router.delete(`/exam-schedules/${deleteModal.id}`, {
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
        router.get('/exam-schedules', {
            exam_id: examId,
            class_id: classId
        }, { preserveState: true });
    };

    const handleReset = () => {
        setExamId('');
        setClassId('');
        router.get('/exam-schedules');
    };

    const totalSchedules = schedules.total;
    const todaySchedules = schedules.data.filter(s =>
        new Date(s.exam_date).toDateString() === new Date().toDateString()
    ).length;
    const upcomingSchedules = schedules.data.filter(s =>
        new Date(s.exam_date) > new Date()
    ).length;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Schedules" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Exam Schedules
                        </h1>
                        <p className="text-gray-600 mt-1">Manage examination timetables and schedules</p>
                    </div>
                    <Link href="/exam-schedules/create">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Create Schedule
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Schedules</p>
                                <p className="text-2xl font-bold text-gray-900">{totalSchedules}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Today's Exams</p>
                                <p className="text-2xl font-bold text-gray-900">{todaySchedules}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Upcoming</p>
                                <p className="text-2xl font-bold text-gray-900">{upcomingSchedules}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={examId}
                            onChange={(e) => setExamId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Exams</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>

                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
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

                {/* Schedules Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Exam
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Class
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Subject
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Marks
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Room
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {schedules.data.map((schedule, index) => (
                                    <tr
                                        key={schedule.id}
                                        className="hover:bg-gray-50 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-indigo-600" />
                                                <span className="font-medium text-gray-900">{schedule.exam?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-900">{schedule.schoolClass?.name || schedule.school_class?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="default">{schedule.subject?.name}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(schedule.exam_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    {schedule.start_time || '-'} - {schedule.end_time || '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-400">-</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.room_number ? (
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <MapPin className="w-4 h-4 text-gray-500" />
                                                    {schedule.room_number}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/exam-schedules/${schedule.id}`}>
                                                    <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                                </Link>
                                                <Link href={`/exam-schedules/${schedule.id}/edit`}>
                                                    <Button variant="ghost" size="sm" icon={<Edit className="w-4 h-4" />} />
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(
                                                        schedule.id,
                                                        `${schedule.exam?.name} - ${schedule.subject?.name}`
                                                    )}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {schedules.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Schedules Found</h4>
                            <p className="text-gray-600 mt-1">Create your first exam schedule to get started.</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {schedules.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {schedules.current_page} of {schedules.last_page} ({schedules.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/exam-schedules', { ...filters, page: schedules.current_page - 1 })}
                                    disabled={schedules.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/exam-schedules', { ...filters, page: schedules.current_page + 1 })}
                                    disabled={schedules.current_page === schedules.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Exam Schedule"
                message="Are you sure you want to delete this exam schedule? This action cannot be undone."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
