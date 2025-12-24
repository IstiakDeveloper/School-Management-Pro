import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    Plus, Filter, BookOpen, GraduationCap, User,
    CheckCircle, XCircle, Award
} from 'lucide-react';
import { Mark, PaginatedData, MarkFilters, Exam, SchoolClass, Subject } from '@/types/exam';

interface IndexProps {
    marks: PaginatedData<Mark>;
    filters?: MarkFilters;
    exams: Exam[];
    classes: SchoolClass[];
    subjects: Subject[];
}

export default function Index({ marks, filters, exams, classes, subjects }: IndexProps) {
    const [examId, setExamId] = useState(filters?.exam_id || '');
    const [classId, setClassId] = useState(filters?.class_id || '');
    const [subjectId, setSubjectId] = useState(filters?.subject_id || '');

    const handleFilter = () => {
        router.get('/marks', {
            exam_id: examId,
            class_id: classId,
            subject_id: subjectId
        }, { preserveState: true });
    };

    const handleReset = () => {
        setExamId('');
        setClassId('');
        setSubjectId('');
        router.get('/marks');
    };

    const totalMarks = marks.total;
    const averageMarks = marks.data.length > 0
        ? marks.data.reduce((sum, m) => sum + (parseFloat(m.total_marks) || 0), 0) / marks.data.length
        : 0;
    const passCount = marks.data.filter(m => (parseFloat(m.total_marks) || 0) >= 40).length;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Marks" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Exam Marks
                        </h1>
                        <p className="text-gray-600 mt-1">Enter and manage student marks</p>
                    </div>
                    <Link href="/marks/create">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white" icon={<Plus className="w-5 h-5" />}>
                            Enter Marks
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Entries</p>
                                <p className="text-2xl font-bold text-gray-900">{totalMarks}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Average Marks</p>
                                <p className="text-2xl font-bold text-gray-900">{averageMarks.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pass Count</p>
                                <p className="text-2xl font-bold text-gray-900">{passCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-3">
                            <Button
                                onClick={handleFilter}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex-1"
                                icon={<Filter className="w-4 h-4" />}
                            >
                                Apply
                            </Button>
                            <Button onClick={handleReset} variant="ghost">
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Marks Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Student
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Exam
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Subject
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Theory
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Practical
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Grade
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {marks.data.map((mark, index) => (
                                    <tr
                                        key={mark.id}
                                        className="hover:bg-gray-50 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{mark.student?.full_name || mark.student?.user?.name}</p>
                                                    <p className="text-sm text-gray-600">{mark.student?.roll_number}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-900">{mark.exam?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="default">{mark.subject?.name}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{mark.theory_marks ?? '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{mark.practical_marks ?? '-'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">{mark.total_marks}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {mark.grade ? (
                                                <Badge
                                                    variant={
                                                        ['A+', 'A'].includes(mark.grade) ? 'success' :
                                                        ['B', 'C'].includes(mark.grade) ? 'info' :
                                                        mark.grade === 'D' ? 'warning' : 'default'
                                                    }
                                                >
                                                    {mark.grade}
                                                </Badge>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {mark.total_marks >= 40 ? (
                                                <Badge variant="success" className="flex items-center gap-1 w-fit">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Pass
                                                </Badge>
                                            ) : (
                                                <Badge variant="default" className="flex items-center gap-1 w-fit">
                                                    <XCircle className="w-3 h-3" />
                                                    Fail
                                                </Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {marks.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Marks Found</h4>
                            <p className="text-gray-600 mt-1">Start entering marks for your exams.</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {marks.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {marks.current_page} of {marks.last_page} ({marks.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/marks', { ...filters, page: marks.current_page - 1 })}
                                    disabled={marks.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/marks', { ...filters, page: marks.current_page + 1 })}
                                    disabled={marks.current_page === marks.last_page}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
