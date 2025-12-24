import React, { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">School Pro</h1>
                    <p className="text-gray-600 mt-2">School Management System</p>
                </div>
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
