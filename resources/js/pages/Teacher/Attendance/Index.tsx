import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Users, ClipboardCheck } from 'lucide-react';

interface Section {
    id: number;
    name: string;
    class_name: string;
    student_count: number;
}

interface Props {
    sections: Section[];
}

export default function Index({ sections }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Attendance Management
                </h2>
            }
        >
            <Head title="Attendance Management" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">My Classes</h3>
                            <p className="text-sm text-gray-600 mt-1">Select a class to view student attendance</p>
                        </div>
                        <div className="p-6">
                            {sections.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {sections.map((section) => (
                                        <div key={section.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-300 bg-gradient-to-br from-white to-blue-50">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        Class {section.class_name} - {section.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 flex items-center mt-2">
                                                        <Users className="mr-1 h-4 w-4 text-blue-600" />
                                                        {section.student_count} students
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/teacher/attendance/mark?section_id=${section.id}`}
                                                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                                >
                                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                                    View Attendance
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">No classes assigned</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
