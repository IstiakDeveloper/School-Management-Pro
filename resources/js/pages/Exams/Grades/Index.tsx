import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import { Plus, Edit, Trash2, Award } from 'lucide-react';
import { GradeSetting } from '@/types/exam';

interface IndexProps {
    grades: GradeSetting[];
}

export default function Index({ grades }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState<GradeSetting | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        grade_name: '',
        grade_point: '',
        min_marks: '',
        max_marks: '',
        remarks: '',
    });

    const handleOpenCreate = () => {
        setEditingGrade(null);
        setFormData({
            grade_name: '',
            grade_point: '',
            min_marks: '',
            max_marks: '',
            remarks: '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEdit = (grade: GradeSetting) => {
        setEditingGrade(grade);
        setFormData({
            grade_name: grade.grade_name,
            grade_point: grade.grade_point.toString(),
            min_marks: grade.min_marks.toString(),
            max_marks: grade.max_marks.toString(),
            remarks: grade.remarks || '',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingGrade ? `/grade-settings/${editingGrade.id}` : '/grade-settings';
        const method = editingGrade ? 'put' : 'post';

        router[method](url, formData, {
            onError: (errors) => {
                setErrors(errors as Record<string, string>);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setShowModal(false);
            },
        });
    };

    const handleDeleteClick = (id: number, grade: string) => {
        setDeleteModal({ isOpen: true, id, name: grade });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/grade-settings/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Grade Settings" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Grade Settings
                        </h1>
                        <p className="text-gray-600 mt-1">Configure grading system and GPA calculation</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        icon={<Plus className="w-5 h-5" />}
                        onClick={handleOpenCreate}
                    >
                        Add Grade
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Grades</p>
                                <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Award className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Highest GPA</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.max(...grades.map(g => g.grade_point), 0).toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pass Grade</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {grades.find(g => g.min_marks === Math.min(...grades.map(g => g.min_marks)))?.grade_name || '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grades Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Grade</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">GPA</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min %</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Max %</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Remarks</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {grades.map((grade, index) => (
                                    <tr key={grade.id} className="hover:bg-gray-50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-800 font-bold text-lg">
                                                {grade.grade_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 font-semibold">{grade.grade_point.toFixed(1)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{grade.min_marks}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{grade.max_marks}%</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600">{grade.remarks || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEdit(grade)}
                                                    icon={<Edit className="w-4 h-4" />}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(grade.id, grade.grade_name)}
                                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {grades.length === 0 && (
                            <div className="text-center py-12">
                                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h4 className="text-lg font-semibold text-gray-900">No Grades Configured</h4>
                                <p className="text-gray-600 mt-1">Add your first grade setting to get started.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingGrade ? 'Edit Grade Setting' : 'Add Grade Setting'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Grade"
                            value={formData.grade_name}
                            onChange={(e) => setFormData({ ...formData, grade_name: e.target.value })}
                            error={errors.grade_name}
                            required
                            placeholder="e.g., A+, A, B"
                        />

                        <Input
                            label="Grade Point"
                            type="number"
                            step="0.1"
                            value={formData.grade_point}
                            onChange={(e) => setFormData({ ...formData, grade_point: e.target.value })}
                            error={errors.grade_point}
                            required
                            placeholder="e.g., 5.0, 4.0"
                        />

                        <Input
                            label="Minimum Marks (%)"
                            type="number"
                            step="0.01"
                            value={formData.min_marks}
                            onChange={(e) => setFormData({ ...formData, min_marks: e.target.value })}
                            error={errors.min_marks}
                            required
                            placeholder="e.g., 80"
                        />

                        <Input
                            label="Maximum Marks (%)"
                            type="number"
                            step="0.01"
                            value={formData.max_marks}
                            onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                            error={errors.max_marks}
                            required
                            placeholder="e.g., 100"
                        />
                    </div>

                    <Input
                        label="Remarks"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        error={errors.remarks}
                        placeholder="e.g., Outstanding, Excellent"
                    />

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            loading={isSubmitting}
                        >
                            {editingGrade ? 'Update Grade' : 'Add Grade'}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleDeleteConfirm}
                title="Delete Grade Setting"
                message="Are you sure you want to delete this grade setting? This may affect existing results."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
