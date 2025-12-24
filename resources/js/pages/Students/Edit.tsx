import React, { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import DeleteModal from '@/Components/DeleteModal';
import { ArrowLeft, Save, User, Mail, Phone, GraduationCap, Calendar, Upload, Users, Trash2 } from 'lucide-react';
import axios from 'axios';

interface AcademicYear {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
    class_id: number;
}

interface Student {
    id: number;
    user_id: number;
    academic_year_id: number;
    class_id: number;
    section_id: number;
    admission_number: string;
    roll_number: string;
    first_name: string;
    last_name: string;
    first_name_bengali: string | null;
    last_name_bengali: string | null;
    date_of_birth: string;
    gender: string;
    blood_group: string | null;
    birth_certificate_no: string | null;
    religion: string | null;
    nationality: string | null;
    phone: string | null;
    email: string;
    present_address: string | null;
    permanent_address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    father_name: string | null;
    father_phone: string | null;
    mother_name: string | null;
    mother_phone: string | null;
    guardian_name: string | null;
    guardian_phone: string | null;
    guardian_relation: string | null;
    admission_date: string;
    previous_school: string | null;
    previous_class: string | null;
    previous_exam_result: string | null;
    medical_conditions: string | null;
    allergies: string | null;
    special_notes: string | null;
    photo: string | null;
    photo_url?: string | null;
    status: string;
    user?: {
        name: string;
        email: string;
        phone: string;
    };
}

interface EditProps {
    student: Student;
    academicYears: AcademicYear[];
    classes: SchoolClass[];
    sections: Section[];
}

export default function Edit({ student, academicYears, classes, sections: initialSections }: EditProps) {
    const [data, setData] = useState({
        academic_year_id: student.academic_year_id.toString(),
        class_id: student.class_id.toString(),
        section_id: student.section_id.toString(),
        admission_number: student.admission_number,
        roll_number: student.roll_number,
        admission_date: student.admission_date.split('T')[0],
        name: student.user?.name || `${student.first_name} ${student.last_name}`,
        first_name: student.first_name,
        last_name: student.last_name,
        first_name_bengali: student.first_name_bengali || '',
        last_name_bengali: student.last_name_bengali || '',
        email: student.user?.email || student.email,
        phone: student.user?.phone || student.phone || '',
        date_of_birth: student.date_of_birth.split('T')[0],
        gender: student.gender,
        blood_group: student.blood_group || '',
        birth_certificate_no: student.birth_certificate_no || '',
        religion: student.religion || '',
        nationality: student.nationality || 'Bangladeshi',
        present_address: student.present_address || '',
        permanent_address: student.permanent_address || '',
        city: student.city || '',
        state: student.state || '',
        postal_code: student.postal_code || '',
        father_name: student.father_name || '',
        father_phone: student.father_phone || '',
        mother_name: student.mother_name || '',
        mother_phone: student.mother_phone || '',
        guardian_name: student.guardian_name || '',
        guardian_phone: student.guardian_phone || '',
        guardian_relation: student.guardian_relation || '',
        previous_school: student.previous_school || '',
        previous_class: student.previous_class || '',
        previous_exam_result: student.previous_exam_result || '',
        medical_conditions: student.medical_conditions || '',
        allergies: student.allergies || '',
        special_notes: student.special_notes || '',
        status: student.status,
        photo: student.photo ? String(student.photo) : '',
    });
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(student.photo_url || null);
    const [newPhoto, setNewPhoto] = useState<File | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (data.class_id) {
            axios.get(`/students/sections/${data.class_id}`)
                .then(response => setSections(response.data))
                .catch(() => setSections([]));
        } else {
            setSections([]);
        }
    }, [data.class_id]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        console.log('=== SUBMIT START ===');
        console.log('All form data:', data);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'photo') {
                // Skip the photo path string, handle file upload separately
                if (newPhoto) {
                    formData.append('photo', newPhoto);
                    console.log('Photo: NEW FILE UPLOADED');
                }
            } else if (value !== null && value !== '') {
                formData.append(key, value.toString());
            }
        });

        console.log('=== FormData Contents ===');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ':', pair[1]);
        }

        console.log('Submitting to:', `/students/${student.id}`);

        router.post(`/students/${student.id}`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.error('=== SUBMISSION ERRORS ===', errors);
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                console.log('=== SUBMISSION SUCCESS ===');
                setProcessing(false);
                setNewPhoto(null);
            },
        });
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        setIsDeleting(true);
        router.delete(`/students/${student.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setShowDeleteModal(false);
            },
        });
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Student" />

            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Edit Student
                            </h1>
                            <p className="text-gray-600 mt-1">Update student information</p>
                        </div>
                    </div>
                    <Button variant="danger" onClick={handleDeleteClick} icon={<Trash2 className="w-5 h-5" />}>
                        Delete Student
                    </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">
                            Editing: {student.first_name} {student.last_name} ({student.admission_number})
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Admission Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Admission Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year *</label>
                                <select
                                    value={data.academic_year_id}
                                    onChange={(e) => setData({ ...data, academic_year_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {academicYears.map(year => (
                                        <option key={year.id} value={year.id}>{year.name}</option>
                                    ))}
                                </select>
                                {errors.academic_year_id && <p className="text-red-600 text-sm mt-1">{errors.academic_year_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData({ ...data, class_id: e.target.value, section_id: '' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                                {errors.class_id && <p className="text-red-600 text-sm mt-1">{errors.class_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                                <select
                                    value={data.section_id}
                                    onChange={(e) => setData({ ...data, section_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    disabled={!data.class_id}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>{section.name}</option>
                                    ))}
                                </select>
                                {errors.section_id && <p className="text-red-600 text-sm mt-1">{errors.section_id}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Admission Number"
                                value={data.admission_number}
                                onChange={(e) => setData({ ...data, admission_number: e.target.value })}
                                error={errors.admission_number}
                                required
                                placeholder="ADM2024001"
                            />
                            <Input
                                label="Roll Number"
                                value={data.roll_number}
                                onChange={(e) => setData({ ...data, roll_number: e.target.value })}
                                error={errors.roll_number}
                                required
                                placeholder="001"
                            />
                            <Input
                                label="Admission Date"
                                type="date"
                                value={data.admission_date}
                                onChange={(e) => setData({ ...data, admission_date: e.target.value })}
                                error={errors.admission_date}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Personal Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-10 h-10 text-gray-400" />
                                    </div>
                                )}
                                <label className="cursor-pointer">
                                    <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                                        <Upload className="w-4 h-4" />
                                        Change Photo
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            </div>
                            {errors.photo && <p className="text-red-600 text-sm mt-1">{errors.photo}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name (for login)"
                                value={data.name}
                                onChange={(e) => setData({ ...data, name: e.target.value })}
                                error={errors.name}
                                required
                                placeholder="John Doe"
                            />
                            <Input
                                label="Date of Birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                                error={errors.date_of_birth}
                                required
                                icon={<Calendar className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                value={data.first_name}
                                onChange={(e) => setData({ ...data, first_name: e.target.value })}
                                error={errors.first_name}
                                placeholder="John"
                            />
                            <Input
                                label="Last Name"
                                value={data.last_name}
                                onChange={(e) => setData({ ...data, last_name: e.target.value })}
                                error={errors.last_name}
                                placeholder="Doe"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name (Bengali)"
                                value={data.first_name_bengali}
                                onChange={(e) => setData({ ...data, first_name_bengali: e.target.value })}
                                error={errors.first_name_bengali}
                                placeholder="জন"
                            />
                            <Input
                                label="Last Name (Bengali)"
                                value={data.last_name_bengali}
                                onChange={(e) => setData({ ...data, last_name_bengali: e.target.value })}
                                error={errors.last_name_bengali}
                                placeholder="ডো"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData({ ...data, gender: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                                <select
                                    value={data.blood_group}
                                    onChange={(e) => setData({ ...data, blood_group: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <Input
                                label="Birth Certificate No"
                                value={data.birth_certificate_no}
                                onChange={(e) => setData({ ...data, birth_certificate_no: e.target.value })}
                                error={errors.birth_certificate_no}
                                placeholder="1234567890123456"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Religion"
                                value={data.religion}
                                onChange={(e) => setData({ ...data, religion: e.target.value })}
                                error={errors.religion}
                                placeholder="Islam, Hindu, etc."
                            />
                            <Input
                                label="Nationality"
                                value={data.nationality}
                                onChange={(e) => setData({ ...data, nationality: e.target.value })}
                                error={errors.nationality}
                                placeholder="Bangladeshi"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                error={errors.email}
                                required
                                placeholder="student@school.com"
                                icon={<Mail className="w-5 h-5" />}
                            />
                            <Input
                                label="Phone"
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                error={errors.phone}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Present Address</label>
                            <textarea
                                value={data.present_address}
                                onChange={(e) => setData({ ...data, present_address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Current residential address..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Permanent Address</label>
                            <textarea
                                value={data.permanent_address}
                                onChange={(e) => setData({ ...data, permanent_address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Permanent residential address..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="City"
                                value={data.city}
                                onChange={(e) => setData({ ...data, city: e.target.value })}
                                error={errors.city}
                                placeholder="Dhaka"
                            />
                            <Input
                                label="State/Division"
                                value={data.state}
                                onChange={(e) => setData({ ...data, state: e.target.value })}
                                error={errors.state}
                                placeholder="Dhaka Division"
                            />
                            <Input
                                label="Postal Code"
                                value={data.postal_code}
                                onChange={(e) => setData({ ...data, postal_code: e.target.value })}
                                error={errors.postal_code}
                                placeholder="1200"
                            />
                        </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Parent/Guardian Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Father's Name"
                                value={data.father_name}
                                onChange={(e) => setData({ ...data, father_name: e.target.value })}
                                error={errors.father_name}
                                placeholder="Father's full name"
                            />
                            <Input
                                label="Father's Phone"
                                value={data.father_phone}
                                onChange={(e) => setData({ ...data, father_phone: e.target.value })}
                                error={errors.father_phone}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Mother's Name"
                                value={data.mother_name}
                                onChange={(e) => setData({ ...data, mother_name: e.target.value })}
                                error={errors.mother_name}
                                placeholder="Mother's full name"
                            />
                            <Input
                                label="Mother's Phone"
                                value={data.mother_phone}
                                onChange={(e) => setData({ ...data, mother_phone: e.target.value })}
                                error={errors.mother_phone}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Guardian's Name"
                                value={data.guardian_name}
                                onChange={(e) => setData({ ...data, guardian_name: e.target.value })}
                                error={errors.guardian_name}
                                placeholder="If different from parents"
                            />
                            <Input
                                label="Guardian's Phone"
                                value={data.guardian_phone}
                                onChange={(e) => setData({ ...data, guardian_phone: e.target.value })}
                                error={errors.guardian_phone}
                                placeholder="01700000000"
                                icon={<Phone className="w-5 h-5" />}
                            />
                            <Input
                                label="Guardian Relation"
                                value={data.guardian_relation}
                                onChange={(e) => setData({ ...data, guardian_relation: e.target.value })}
                                error={errors.guardian_relation}
                                placeholder="Uncle, Aunt, etc."
                            />
                        </div>
                    </div>

                    {/* Previous Education & Medical */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Previous Education & Medical Info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Previous School"
                                value={data.previous_school}
                                onChange={(e) => setData({ ...data, previous_school: e.target.value })}
                                error={errors.previous_school}
                                placeholder="School name"
                            />
                            <Input
                                label="Previous Class"
                                value={data.previous_class}
                                onChange={(e) => setData({ ...data, previous_class: e.target.value })}
                                error={errors.previous_class}
                                placeholder="Class 9"
                            />
                            <Input
                                label="Previous Exam Result"
                                value={data.previous_exam_result}
                                onChange={(e) => setData({ ...data, previous_exam_result: e.target.value })}
                                error={errors.previous_exam_result}
                                placeholder="GPA 5.00"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Conditions</label>
                                <textarea
                                    value={data.medical_conditions}
                                    onChange={(e) => setData({ ...data, medical_conditions: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any medical conditions..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                                <textarea
                                    value={data.allergies}
                                    onChange={(e) => setData({ ...data, allergies: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Any known allergies..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
                            <textarea
                                value={data.special_notes}
                                onChange={(e) => setData({ ...data, special_notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Any special notes or requirements..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData({ ...data, status: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="graduated">Graduated</option>
                                <option value="transferred">Transferred</option>
                                <option value="dropped">Dropped</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.visit('/students')}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Updating...' : 'Update Student'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Student"
                message="Are you sure you want to delete this student? All associated data including attendance, fees, and documents will be permanently removed."
                itemName={`${student.first_name} ${student.last_name} (${student.admission_number})`}
                isDeleting={isDeleting}
            />
        </AuthenticatedLayout>
    );
}
