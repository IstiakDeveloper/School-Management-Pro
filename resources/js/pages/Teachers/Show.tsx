import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { ArrowLeft, Edit, Trash2, Users, User, Mail, Phone, GraduationCap, Calendar, DollarSign, BookOpen } from 'lucide-react';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface SchoolClass {
    id: number;
    name: string;
    name_bengali: string;
}

interface TeacherSubject {
    id: number;
    subject: Subject;
    classes: SchoolClass[];
}

interface Teacher {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address: string;
    qualification: string;
    experience_years: number;
    joining_date: string;
    salary: number;
    status: string;
    photo: string | null;
    subjects_count: number;
    teacher_subjects?: TeacherSubject[];
}

interface ShowProps {
    teacher: Teacher;
}

export default function Show({ teacher }: ShowProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete "${teacher.full_name}"?`)) {
            router.delete(`/teachers/${teacher.id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${teacher.full_name} Details`} />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" icon={<ArrowLeft className="w-5 h-5" />} onClick={() => router.visit('/teachers')}>
                            Back
                        </Button>
                        <div className="flex items-center gap-3">
                            {teacher.photo ? (
                                <img src={teacher.photo} alt={teacher.full_name} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    {teacher.full_name}
                                </h1>
                                <p className="text-gray-600 mt-1">{teacher.employee_id} • {teacher.qualification}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/teachers/${teacher.id}/edit`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" icon={<Edit className="w-5 h-5" />}>
                                Edit Teacher
                            </Button>
                        </Link>
                        <Button
                            onClick={handleDelete}
                            className="bg-red-600 text-white hover:bg-red-700"
                            icon={<Trash2 className="w-5 h-5" />}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Experience</p>
                                <p className="text-2xl font-bold text-gray-900">{teacher.experience_years} years</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-xl">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Subjects</p>
                                <p className="text-2xl font-bold text-gray-900">{teacher.subjects_count}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <DollarSign className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Salary</p>
                                <p className="text-2xl font-bold text-gray-900">৳{teacher.salary.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-xl">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="capitalize mt-1">
                                    {teacher.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Employee ID</p>
                            <p className="text-base font-semibold text-gray-900 font-mono">{teacher.employee_id}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Full Name</p>
                            <p className="text-base font-semibold text-gray-900">{teacher.full_name}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <p className="text-base text-gray-900">{teacher.email}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Phone</p>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <p className="text-base text-gray-900">{teacher.phone}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                            <p className="text-base text-gray-900">{new Date(teacher.date_of_birth).toLocaleDateString()}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Gender</p>
                            <p className="text-base text-gray-900 capitalize">{teacher.gender}</p>
                        </div>

                        {teacher.address && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 mb-1">Address</p>
                                <p className="text-base text-gray-900">{teacher.address}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Qualification</p>
                            <p className="text-base font-semibold text-gray-900">{teacher.qualification}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Experience</p>
                            <p className="text-base text-gray-900">{teacher.experience_years} years</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Joining Date</p>
                            <p className="text-base text-gray-900">{new Date(teacher.joining_date).toLocaleDateString()}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Salary</p>
                            <p className="text-base font-semibold text-gray-900">৳{teacher.salary.toLocaleString()}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 mb-1">Status</p>
                            <Badge variant={teacher.status === 'active' ? 'success' : 'default'} className="capitalize">
                                {teacher.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Assigned Subjects */}
                {teacher.teacher_subjects && teacher.teacher_subjects.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Assigned Subjects ({teacher.teacher_subjects.length})
                            </h3>
                        </div>

                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Classes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {teacher.teacher_subjects.map((ts, index) => (
                                    <tr key={ts.id} className="hover:bg-gray-50 transition-colors" style={{ animationDelay: `${index * 30}ms` }}>
                                        <td className="px-6 py-4 font-semibold text-gray-900">{ts.subject.name}</td>
                                        <td className="px-6 py-4 text-gray-900 font-mono">{ts.subject.code}</td>
                                        <td className="px-6 py-4">
                                            {ts.classes && ts.classes.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {ts.classes.map(cls => (
                                                        <Badge key={cls.id} variant="info" size="sm">
                                                            {cls.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No classes assigned</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {(!teacher.teacher_subjects || teacher.teacher_subjects.length === 0) && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h4 className="text-lg font-semibold text-gray-900">No Subjects Assigned</h4>
                            <p className="text-gray-600 mt-1">This teacher hasn't been assigned any subjects yet.</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
