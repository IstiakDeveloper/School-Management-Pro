import React, { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white p-2 rounded-2xl shadow-md mb-4 border border-slate-100">
                        <img src="/logo.png" alt="Mousumi Bidyaniketon" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Mousumi Bidyaniketon</h1>
                    <p className="text-slate-500 mt-1 text-sm">School Management System</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                    {children}
                </div>
            </div>
        </div>
    );
}
