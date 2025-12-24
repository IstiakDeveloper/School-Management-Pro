import React, { useState, FormEventHandler } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import { ArrowLeft, Save, Calendar, Users, Check, X } from 'lucide-react';

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
    admission_number: string;
    first_name: string;
    last_name: string;
    user?: {
        name: string;
    };
    attendances?: Array<{
        status: string;
    }>;
}

interface CreateProps {
    classes: SchoolClass[];
    sections: Section[];
    date: string;
}

export default function Create({ classes, sections, date }: CreateProps) {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [filteredSections, setFilteredSections] = useState<Section[]>([]);

    const { data, setData, post, processing, errors } = useForm({
        date: date,
        class_id: '',
        section_id: '',
        attendances: [] as Array<{
            student_id: number;
            status: string;
            remarks: string;
        }>,
    });

    const loadStudents = async () => {
        if (!selectedClass || !selectedSection) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/student-attendance/students?class_id=${selectedClass}&section_id=${selectedSection}&date=${data.date}`,
                {
                    credentials: 'same-origin',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const studentsData = await response.json();
            setStudents(studentsData);

            // Initialize attendance data
            const attendances = studentsData.map((student: Student) => ({
                student_id: student.id,
                status: student.attendances && student.attendances.length > 0
                    ? student.attendances[0].status
                    : 'present',
                remarks: '',
            }));
            setData('attendances', attendances);
        } catch (error) {
            console.error('Failed to load students:', error);
            alert('Failed to load students. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setData('class_id', classId);
        setStudents([]);
        setSelectedSection('');
        setData('section_id', '');

        // Filter sections based on selected class
        const classSections = sections.filter(s => s.class_id === parseInt(classId));
        setFilteredSections(classSections);
    };

    const handleSectionChange = (sectionId: string) => {
        setSelectedSection(sectionId);
        setData('section_id', sectionId);
    };

    const updateAttendance = (studentId: number, field: 'status' | 'remarks', value: string) => {
        setData(
            'attendances',
            data.attendances.map((att) =>
                att.student_id === studentId ? { ...att, [field]: value } : att
            )
        );
    };

    const markAll = (status: string) => {
        setData(
            'attendances',
            data.attendances.map((att) => ({ ...att, status }))
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/student-attendance');
    };

    const getStatusColor = (status: string) => {
        const colors = {
            present: 'bg-green-500 hover:bg-green-600',
            absent: 'bg-red-500 hover:bg-red-600',
            late: 'bg-yellow-500 hover:bg-yellow-600',
            half_day: 'bg-blue-500 hover:bg-blue-600',
            holiday: 'bg-purple-500 hover:bg-purple-600',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mark Student Attendance" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/student-attendance"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Attendance
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Mark Student Attendance</h1>
                                <p className="text-gray-600 mt-1">Record daily attendance for students</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Date and Class Selection */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Date & Class</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                    {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => handleClassChange(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((cls) => (
                                            <option key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.class_id && <p className="mt-1 text-sm text-red-600">{errors.class_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Section <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedSection}
                                        onChange={(e) => handleSectionChange(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        disabled={!selectedClass}
                                    >
                                        <option value="">Select Section</option>
                                        {filteredSections.map((section) => (
                                            <option key={section.id} value={section.id}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.section_id && <p className="mt-1 text-sm text-red-600">{errors.section_id}</p>}
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button
                                    type="button"
                                    onClick={loadStudents}
                                    disabled={!selectedClass || !selectedSection || loading}
                                    icon={<Users className="w-5 h-5" />}
                                >
                                    {loading ? 'Loading Students...' : 'Load Students'}
                                </Button>
                            </div>
                        </div>

                        {/* Students List */}
                        {students.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Students ({students.length})
                                    </h2>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => markAll('present')}
                                            className="bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            Mark All Present
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => markAll('absent')}
                                            className="bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            Mark All Absent
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {students.map((student, index) => (
                                        <div
                                            key={student.id}
                                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500">{student.admission_number}</p>
                                            </div>

                                            <div className="flex gap-2">
                                                {['present', 'absent', 'late', 'half_day'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => updateAttendance(student.id, 'status', status)}
                                                        className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all ${
                                                            data.attendances[index]?.status === status
                                                                ? getStatusColor(status)
                                                                : 'bg-gray-300 hover:bg-gray-400'
                                                        }`}
                                                    >
                                                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Remarks (optional)"
                                                value={data.attendances[index]?.remarks || ''}
                                                onChange={(e) =>
                                                    updateAttendance(student.id, 'remarks', e.target.value)
                                                }
                                                className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Submit Buttons */}
                        {students.length > 0 && (
                            <div className="flex items-center justify-end gap-4">
                                <Link href="/student-attendance">
                                    <Button variant="ghost">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    icon={<Save className="w-5 h-5" />}
                                >
                                    {processing ? 'Saving...' : 'Save Attendance'}
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
