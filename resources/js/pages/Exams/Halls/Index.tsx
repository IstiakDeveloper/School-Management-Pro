import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Card from '@/Components/Card';
import Modal from '@/Components/Modal';
import DeleteModal from '@/Components/DeleteModal';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, MapPin, Users, Building } from 'lucide-react';
import { ExamHall } from '@/types/exam';

interface IndexProps {
    halls: ExamHall[];
}

export default function Index({ halls }: IndexProps) {
    const [showModal, setShowModal] = useState(false);
    const [editingHall, setEditingHall] = useState<ExamHall | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        capacity: '',
        location: '',
        facilities: '',
        status: 'active',
    });

    const handleOpenCreate = () => {
        setEditingHall(null);
        setFormData({
            name: '',
            code: '',
            capacity: '',
            location: '',
            facilities: '',
            status: 'active',
        });
        setErrors({});
        setShowModal(true);
    };

    const handleOpenEdit = (hall: ExamHall) => {
        setEditingHall(hall);
        setFormData({
            name: hall.name,
            code: hall.code,
            capacity: hall.capacity.toString(),
            location: hall.location || '',
            facilities: hall.facilities || '',
            status: hall.status,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = editingHall ? `/exam-halls/${editingHall.id}` : '/exam-halls';
        const method = editingHall ? 'put' : 'post';

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

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, id, name });
    };

    const handleDeleteConfirm = () => {
        if (deleteModal.id) {
            setIsDeleting(true);
            router.delete(`/exam-halls/${deleteModal.id}`, {
                onFinish: () => {
                    setIsDeleting(false);
                    setDeleteModal({ isOpen: false, id: null, name: '' });
                },
            });
        }
    };

    const activeHalls = halls.filter(h => h.status === 'active').length;
    const totalCapacity = halls.reduce((sum, h) => sum + h.capacity, 0);

    return (
        <AuthenticatedLayout>
            <Head title="Exam Halls" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Exam Halls
                        </h1>
                        <p className="text-gray-600 mt-1">Manage examination venues and facilities</p>
                    </div>
                    <Button
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                        icon={<Plus className="w-5 h-5" />}
                        onClick={handleOpenCreate}
                    >
                        Add Hall
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-100 rounded-xl">
                                <Building className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Halls</p>
                                <p className="text-2xl font-bold text-gray-900">{halls.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Building className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Halls</p>
                                <p className="text-2xl font-bold text-gray-900">{activeHalls}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Capacity</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCapacity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Halls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {halls.map((hall, index) => (
                        <div
                            key={hall.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-teal-100 rounded-lg">
                                        <Building className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{hall.name}</h3>
                                        <p className="text-sm text-gray-600 font-mono">{hall.code}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        hall.status === 'active' ? 'success' :
                                        hall.status === 'maintenance' ? 'warning' :
                                        'default'
                                    }
                                    className="capitalize"
                                >
                                    {hall.status}
                                </Badge>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>Capacity: <strong className="text-gray-900">{hall.capacity}</strong> students</span>
                                </div>
                                {hall.location && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{hall.location}</span>
                                    </div>
                                )}
                                {hall.facilities && (
                                    <div className="text-sm text-gray-600">
                                        <p className="font-medium mb-1">Facilities:</p>
                                        <p className="line-clamp-2">{hall.facilities}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleOpenEdit(hall)}
                                    icon={<Edit className="w-4 h-4" />}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(hall.id, hall.name)}
                                    icon={<Trash2 className="w-4 h-4 text-red-600" />}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {halls.length === 0 && (
                    <Card>
                        <div className="text-center py-12">
                            <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Exam Halls Found</h4>
                            <p className="text-gray-600 mt-1">Add your first exam hall to get started.</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editingHall ? 'Edit Exam Hall' : 'Add Exam Hall'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Hall Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                            required
                            placeholder="e.g., Main Hall, Science Lab"
                        />

                        <Input
                            label="Hall Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            error={errors.code}
                            required
                            placeholder="e.g., MH-001"
                        />

                        <Input
                            label="Capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            error={errors.capacity}
                            required
                            placeholder="e.g., 50"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            {errors.status && (
                                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                            )}
                        </div>
                    </div>

                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        error={errors.location}
                        placeholder="e.g., Ground Floor, Building A"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Facilities
                        </label>
                        <textarea
                            value={formData.facilities}
                            onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="e.g., AC, Projector, Whiteboard"
                        />
                        {errors.facilities && (
                            <p className="text-red-500 text-sm mt-1">{errors.facilities}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
                            loading={isSubmitting}
                        >
                            {editingHall ? 'Update Hall' : 'Add Hall'}
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
                title="Delete Exam Hall"
                message="Are you sure you want to delete this exam hall? This may affect existing seat plans."
                itemName={deleteModal.name}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
