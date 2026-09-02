import React, { ReactNode } from 'react';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';
import FlashMessage from '@/Components/FlashMessage';
import { usePage } from '@inertiajs/react';

interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode;
}

export default function AuthenticatedLayout({ children, header }: AuthenticatedLayoutProps) {
    const { url, component } = usePage();
    
    // Check if the current page is an attendance page or report page
    const isAttendancePage = url.includes('attendance') || /attendance/i.test(component);
    const isReportPage = url.includes('/reports') || /report/i.test(component);

    let layoutClass = 'index-premium-layout';
    if (isAttendancePage) {
        layoutClass = 'attendance-module-layout';
    } else if (isReportPage) {
        layoutClass = 'report-page-layout';
    }

    return (
        <div className={`min-h-screen ${isAttendancePage ? 'bg-slate-50/80 text-slate-900' : 'bg-emerald-50/40'}`}>
            <FlashMessage />
            <Sidebar />
            <div className="ml-56">
                <Navbar />
                <main className={`pt-14 pb-6 px-4 sm:px-6 ${layoutClass}`}>
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
