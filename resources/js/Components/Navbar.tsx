import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const { auth } = usePage().props as any;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 fixed top-0 right-0 left-64 z-40 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Welcome Section with Gradient */}
                <div className="flex-1">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                        Welcome, {auth?.user?.name} 👋
                    </h2>
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications with Gradient */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group hover:scale-110"
                        >
                            <Bell className="w-5 h-5 text-blue-600 group-hover:text-purple-600 transition-colors" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-scale-in">
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-200/50">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        Notifications
                                    </h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <Link
                                        href="/notifications"
                                        className="block px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border-b border-gray-100"
                                    >
                                        <p className="text-sm font-semibold text-gray-900">
                                            New student admission
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <span className="w-1 h-1 bg-blue-500 rounded-full" />
                                            2 minutes ago
                                        </p>
                                    </Link>
                                </div>
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-t border-gray-200/50">
                                    <Link
                                        href="/notifications"
                                        className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                                    >
                                        View all notifications →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* User Menu with Gradient Avatar */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group hover:scale-105"
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 hidden md:block">
                                {auth?.user?.name}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden animate-scale-in">
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-200/50">
                                    <p className="font-bold text-gray-900">{auth?.user?.name}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">{auth?.user?.email}</p>
                                </div>
                                <Link
                                    href={
                                        auth?.user?.roles?.some((role: any) => role.name === 'Student')
                                            ? '/student/profile'
                                            : auth?.user?.roles?.some((role: any) => role.name === 'Teacher')
                                            ? '/teacher/profile'
                                            : auth?.user?.roles?.some((role: any) => role.name === 'Parent')
                                            ? '/parent/profile'
                                            : `/users/${auth?.user?.id}`
                                    }
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
                                >
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 text-red-600 border-t border-gray-200/50 group"
                                >
                                    <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                        <LogOut className="w-4 h-4 text-red-600" />
                                    </div>
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
