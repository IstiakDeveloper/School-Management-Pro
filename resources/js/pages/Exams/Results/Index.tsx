import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import {
    Filter, Eye, TrendingUp, Award, Users,
    CheckCircle, XCircle, BarChart, Download
} from 'lucide-react';
import { Result, PaginatedData, ResultFilters, Exam, SchoolClass } from '@/types/exam';

interface IndexProps {
    results: PaginatedData<Result>;
    filters?: ResultFilters;
    exams: Exam[];
    classes: SchoolClass[];
}

export default function Index({ results, filters, exams, classes }: IndexProps) {
    const [examId, setExamId] = useState<string>(filters?.exam_id?.toString() || '');
    const [classId, setClassId] = useState<string>(filters?.class_id?.toString() || '');

    const handleFilter = () => {
        router.get('/results', { exam_id: examId, class_id: classId }, { preserveState: true });
    };

    const handleReset = () => {
        setExamId('');
        setClassId('');
        router.get('/results');
    };

    const handleGenerate = () => {
        if (!examId || !classId) {
            alert('Please select both exam and class first from the dropdowns below.');
            return;
        }
        if (confirm('Generate results for the selected exam and class?')) {
            router.post('/results/generate', { exam_id: examId, class_id: classId });
        }
    };

    const handlePublish = () => {
        if (!examId || !classId) {
            alert('Please select both exam and class first from the dropdowns below.');
            return;
        }
        if (confirm('Are you sure you want to publish these results? Students will be able to view them.')) {
            router.post('/results/publish', { exam_id: examId, class_id: classId });
        }
    };

    const totalResults = results.total;
    const passCount = results.data.filter(r => r.status === 'pass').length;
    const avgPercentage = results.data.length > 0
        ? results.data.reduce((sum, r) => sum + parseFloat(r.percentage as any), 0) / results.data.length
        : 0;

    return (
        <AuthenticatedLayout>
            <Head title="Exam Results" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Exam Results
                        </h1>
                        <p className="text-gray-600 mt-1">View and manage student results</p>
                    </div>
                </div>

                {/* Filters - Moved to top */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <select
                            value={examId}
                            onChange={(e) => setExamId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Select Exam</option>
                            {exams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.name}</option>
                            ))}
                        </select>

                        <select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>

                        <Button
                            onClick={handleGenerate}
                            variant="outline"
                            icon={<BarChart className="w-5 h-5" />}
                            className="w-full"
                        >
                            Generate Results
                        </Button>

                        <Button
                            onClick={handlePublish}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white w-full"
                            icon={<CheckCircle className="w-5 h-5" />}
                        >
                            Publish Results
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Users className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">{totalResults}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Passed</p>
                                <p className="text-2xl font-bold text-gray-900">{passCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-xl">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Failed</p>
                                <p className="text-2xl font-bold text-gray-900">{totalResults - passCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg Percentage</p>
                                <p className="text-2xl font-bold text-gray-900">{avgPercentage.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Exam</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Class</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Marks</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Obtained</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Percentage</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {results.data.map((result, index) => (
                                    <tr
                                        key={result.id}
                                        className="hover:bg-gray-50 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {result.student?.full_name || result.student?.user?.name}
                                                </p>
                                                <p className="text-sm text-gray-600">{result.student?.roll_number}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{result.exam?.name}</td>
                                        <td className="px-6 py-4 text-gray-900">{result.schoolClass?.name}</td>
                                        <td className="px-6 py-4 text-gray-900">{result.total_marks}</td>
                                        <td className="px-6 py-4 text-gray-900 font-semibold">{result.obtained_marks}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-900">{parseFloat(result.percentage as any).toFixed(1)}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={
                                                    ['A+', 'A'].includes(result.grade) ? 'success' :
                                                    ['B', 'C'].includes(result.grade) ? 'info' :
                                                    result.grade === 'D' ? 'warning' : 'default'
                                                }
                                            >
                                                {result.grade} ({parseFloat(result.gpa as any).toFixed(1)})
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={result.status === 'pass' ? 'success' : 'default'}
                                                className="flex items-center gap-1 w-fit"
                                            >
                                                {result.status === 'pass' ? (
                                                    <CheckCircle className="w-3 h-3" />
                                                ) : (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {result.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/results/${result.id}`}>
                                                <Button variant="ghost" size="sm" icon={<Eye className="w-4 h-4" />} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {results.data.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                        <div className="text-center">
                            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Results Found</h4>
                            <p className="text-gray-600 mt-1">Generate results to get started.</p>
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {results.last_page > 1 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Showing page {results.current_page} of {results.last_page} ({results.total} total)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/results', { ...filters, page: results.current_page - 1 })}
                                    disabled={results.current_page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.get('/results', { ...filters, page: results.current_page + 1 })}
                                    disabled={results.current_page === results.last_page}
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
