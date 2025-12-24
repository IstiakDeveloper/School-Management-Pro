import React from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    GraduationCap,
    Users,
    FileText,
    Activity,
    DollarSign,
    Download,
    Eye
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

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
}

interface Parent {
    id: number;
    user: User;
    relation: string;
}

interface Document {
    id: number;
    type: string;
    title?: string;
    file_path: string;
    file_name: string;
    file_size: number;
    created_at: string;
}

interface Attendance {
    id: number;
    date: string;
    status: string;
}

interface FeeCollection {
    id: number;
    amount: number;
    payment_date: string;
    status: string;
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
    status: string;
    user?: User;
    academicYear?: AcademicYear;
    schoolClass?: SchoolClass;
    section?: Section;
    parents?: Parent[];
    documents?: Document[];
    attendance?: Attendance[];
    feeCollections?: FeeCollection[];
}

interface ShowProps {
    student: Student;
}

export default function Show({ student }: ShowProps) {
    const calculateAge = () => {
        const today = new Date();
        const birthDate = new Date(student.date_of_birth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateAttendancePercentage = () => {
        if (!student.attendance || student.attendance.length === 0) return 0;
        const present = student.attendance.filter(a => a.status === 'present').length;
        return Math.round((present / student.attendance.length) * 100);
    };

    const calculateTotalFees = () => {
        if (!student.feeCollections || student.feeCollections.length === 0) return 0;
        return student.feeCollections.reduce((sum, fee) => sum + fee.amount, 0);
    };

    const getPendingFees = () => {
        if (!student.feeCollections) return 0;
        return student.feeCollections.filter(fee => fee.status === 'pending').length;
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${student.first_name} ${student.last_name}"?`)) {
            router.delete(`/students/${student.id}`);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            graduated: 'bg-blue-100 text-blue-800',
            transferred: 'bg-yellow-100 text-yellow-800',
            dropped: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getAttendanceColor = (status: string) => {
        const colors: Record<string, string> = {
            present: 'bg-green-100 text-green-800',
            absent: 'bg-red-100 text-red-800',
            late: 'bg-yellow-100 text-yellow-800',
            half_day: 'bg-orange-100 text-orange-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${student.first_name} ${student.last_name}`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/students')}>
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Student Profile
                            </h1>
                            <p className="text-gray-600 mt-1">Complete student information</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={() => router.visit(`/students/${student.id}/edit`)} icon={<Edit className="w-5 h-5" />}>
                            Edit
                        </Button>
                        <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="w-5 h-5" />}>
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Age</p>
                                <p className="text-2xl font-bold text-gray-900">{calculateAge()} years</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Attendance</p>
                                <p className="text-2xl font-bold text-gray-900">{calculateAttendancePercentage()}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending Fees</p>
                                <p className="text-2xl font-bold text-gray-900">{getPendingFees()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-100 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Academic Year</p>
                                <p className="text-xl font-bold text-gray-900">{student.academicYear?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Personal Information
                            </h3>

                            <div className="flex items-start gap-6">
                                {student.photo ? (
                                    <img src={student.photo} alt={student.first_name} className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200" />
                                ) : (
                                    <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}

                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-semibold text-gray-900">{student.first_name} {student.last_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Bengali Name</p>
                                        <p className="font-semibold text-gray-900">
                                            {student.first_name_bengali} {student.last_name_bengali}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Date of Birth</p>
                                        <p className="font-semibold text-gray-900">{new Date(student.date_of_birth).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Gender</p>
                                        <p className="font-semibold text-gray-900 capitalize">{student.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Blood Group</p>
                                        <p className="font-semibold text-gray-900">{student.blood_group || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Birth Certificate No</p>
                                        <p className="font-semibold text-gray-900">{student.birth_certificate_no || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Religion</p>
                                        <p className="font-semibold text-gray-900">{student.religion || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nationality</p>
                                        <p className="font-semibold text-gray-900">{student.nationality || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                Academic Information
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Admission Number</p>
                                    <p className="font-semibold text-gray-900">{student.admission_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Roll Number</p>
                                    <p className="font-semibold text-gray-900">{student.roll_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Admission Date</p>
                                    <p className="font-semibold text-gray-900">{new Date(student.admission_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Academic Year</p>
                                    <p className="font-semibold text-gray-900">{student.academicYear?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Class</p>
                                    <p className="font-semibold text-gray-900">{student.schoolClass?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Section</p>
                                    <p className="font-semibold text-gray-900">{student.section?.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.status)}`}>
                                        {student.status}
                                    </span>
                                </div>
                            </div>

                            {(student.previous_school || student.previous_class || student.previous_exam_result) && (
                                <>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <h4 className="font-semibold text-gray-900 mb-3">Previous Education</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                            {student.previous_school && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Previous School</p>
                                                    <p className="font-semibold text-gray-900">{student.previous_school}</p>
                                                </div>
                                            )}
                                            {student.previous_class && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Previous Class</p>
                                                    <p className="font-semibold text-gray-900">{student.previous_class}</p>
                                                </div>
                                            )}
                                            {student.previous_exam_result && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Exam Result</p>
                                                    <p className="font-semibold text-gray-900">{student.previous_exam_result}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Contact & Address */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Contact & Address
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-semibold text-gray-900">{student.user?.email || student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-semibold text-gray-900">{student.user?.phone || student.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {student.present_address && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Present Address</p>
                                    <p className="text-gray-900">{student.present_address}</p>
                                    {student.city && <p className="text-sm text-gray-600">{student.city}, {student.state} - {student.postal_code}</p>}
                                </div>
                            )}

                            {student.permanent_address && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Permanent Address</p>
                                    <p className="text-gray-900">{student.permanent_address}</p>
                                </div>
                            )}
                        </div>

                        {/* Parent/Guardian Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                Parent/Guardian Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {student.father_name && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-sm font-semibold text-blue-900 mb-2">Father</p>
                                        <p className="font-semibold text-gray-900">{student.father_name}</p>
                                        {student.father_phone && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4" />
                                                {student.father_phone}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {student.mother_name && (
                                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                                        <p className="text-sm font-semibold text-pink-900 mb-2">Mother</p>
                                        <p className="font-semibold text-gray-900">{student.mother_name}</p>
                                        {student.mother_phone && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4" />
                                                {student.mother_phone}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {student.guardian_name && (
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-sm font-semibold text-purple-900 mb-2">Guardian ({student.guardian_relation})</p>
                                        <p className="font-semibold text-gray-900">{student.guardian_name}</p>
                                        {student.guardian_phone && (
                                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4" />
                                                {student.guardian_phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Medical Information */}
                        {(student.medical_conditions || student.allergies || student.special_notes) && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Medical Information
                                </h3>

                                {student.medical_conditions && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Medical Conditions</p>
                                        <p className="text-gray-900">{student.medical_conditions}</p>
                                    </div>
                                )}

                                {student.allergies && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Allergies</p>
                                        <p className="text-gray-900">{student.allergies}</p>
                                    </div>
                                )}

                                {student.special_notes && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Special Notes</p>
                                        <p className="text-gray-900">{student.special_notes}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Documents */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Documents
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit(`/students/${student.id}/documents`)}
                                >
                                    View All
                                </Button>
                            </div>

                            {student.documents && student.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {student.documents.slice(0, 5).map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-900 capitalize">{doc.type.replace('_', ' ')}</p>
                                                    <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    <Eye className="w-4 h-4 text-gray-600" />
                                                </button>
                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                    <Download className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">No documents uploaded</p>
                            )}
                        </div>

                        {/* Recent Attendance */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Recent Attendance
                                </h3>
                                <span className="text-sm font-semibold text-blue-600">{calculateAttendancePercentage()}%</span>
                            </div>

                            {student.attendance && student.attendance.length > 0 ? (
                                <div className="space-y-2">
                                    {student.attendance.slice(0, 10).map((record) => (
                                        <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700">{new Date(record.date).toLocaleDateString()}</p>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getAttendanceColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-4">No attendance records</p>
                            )}
                        </div>

                        {/* Fee Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                    Fee Status
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.visit(`/fee-collections?student_id=${student.id}`)}
                                >
                                    View All
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">Total Collected</p>
                                    <p className="font-bold text-green-600">৳{calculateTotalFees().toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">Pending Payments</p>
                                    <p className="font-bold text-orange-600">{getPendingFees()}</p>
                                </div>
                            </div>

                            {student.feeCollections && student.feeCollections.length > 0 && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <p className="text-xs text-gray-600 mb-2">Recent Payments</p>
                                    <div className="space-y-2">
                                        {student.feeCollections.slice(0, 5).map((fee) => (
                                            <div key={fee.id} className="flex items-center justify-between text-sm">
                                                <p className="text-gray-600">{new Date(fee.payment_date).toLocaleDateString()}</p>
                                                <p className="font-semibold text-gray-900">৳{fee.amount.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
