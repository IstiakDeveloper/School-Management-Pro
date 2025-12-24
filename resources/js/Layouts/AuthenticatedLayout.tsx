import React, { ReactNode } from 'react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import FlashMessage from '@/Components/FlashMessage';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
            {/* Animated Background Patterns */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
            </div>

            <FlashMessage />
            <Sidebar />
            <div className="ml-64 relative z-10">
                <Navbar />
                <main className="pt-24 pb-8 px-6">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
