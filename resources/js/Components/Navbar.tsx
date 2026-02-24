import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const { auth } = usePage().props as { auth: { user: { id: number; name: string; email: string; roles?: Array<{ name: string }> } } };
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-white border-b border-emerald-200/80 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
                <div className="min-w-0 flex items-center gap-3">
                    <div className="w-1 h-8 bg-emerald-600 rounded-full hidden sm:block" />
                    <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {auth?.user?.name}
                        </p>
                        <p className="text-[11px] text-emerald-700/80">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })}
                    </p>
                </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-1 w-72 bg-white rounded-md border border-gray-200 shadow-lg py-1 z-50">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-xs font-medium text-gray-700">Notifications</p>
                                </div>
                                <Link
                                    href="/notifications"
                                    className="block px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                                >
                                    View all
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-emerald-700" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                                {auth?.user?.name}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        </button>

                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    aria-hidden
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg border border-emerald-100 shadow-lg py-1 z-50">
                                    <div className="px-3 py-2 border-b border-emerald-50">
                                        <p className="text-xs font-medium text-gray-900 truncate">{auth?.user?.name}</p>
                                        <p className="text-[11px] text-emerald-700/80 truncate">{auth?.user?.email}</p>
                                    </div>
                                    <Link
                                        href={
                                            auth?.user?.roles?.some((r: { name: string }) => r.name === 'Student')
                                                ? '/student/profile'
                                                : auth?.user?.roles?.some((r: { name: string }) => r.name === 'Teacher')
                                                ? '/teacher/profile'
                                                : auth?.user?.roles?.some((r: { name: string }) => r.name === 'Parent')
                                                ? '/parent/profile'
                                                : `/users/${auth?.user?.id}`
                                        }
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-emerald-50"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <User className="w-3.5 h-3.5 text-emerald-600" />
                                        Profile
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-gray-100"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
