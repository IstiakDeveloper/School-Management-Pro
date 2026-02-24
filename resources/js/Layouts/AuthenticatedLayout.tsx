import React, { ReactNode } from 'react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import FlashMessage from '@/Components/FlashMessage';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return (
        <div className="min-h-screen bg-emerald-50/40">
            <FlashMessage />
            <Sidebar />
            <div className="ml-56">
                <Navbar />
                <main className="pt-14 pb-6 px-4 sm:px-6">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
