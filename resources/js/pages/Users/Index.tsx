import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';
import { Plus, Search, Edit, Trash2, Mail, Phone, User as UserIcon, Eye, Shield } from 'lucide-react';

interface User {
    id: number;
    name: string | null;
    email: string | null;
    phone?: string | null;
    roles: Array<{ name: string | null }>;
    status: string;
    created_at: string;
}

interface UsersIndexProps {
    users: {
        data: User[] | null;
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ users, filters }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${id}`);
        }
    };

    const getStatusColor = (status: string): any => {
        return status === 'active' ? 'success' : 'default';
    };

    const getRoleBadgeColor = (role: string): any => {
        const colors: Record<string, any> = {
            'Super Admin': 'purple',
            'Principal': 'info',
            'Teacher': 'success',
            'Accountant': 'warning',
            'Librarian': 'cyan',
            'Student': 'pink',
            'Parent': 'indigo',
        };
        return colors[role] || 'default';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users Management" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Users Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage system users and their roles</p>
                    </div>
                    <Link href="/users/create">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            icon={<Plus className="w-5 h-5" />}
                        >
                            Add User
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{users.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.data?.filter(u => u?.status === 'active').length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Page</p>
                                <p className="text-2xl font-bold text-gray-900">{users.current_page} / {users.last_page}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Per Page</p>
                                <p className="text-2xl font-bold text-gray-900">{users.per_page}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <Input
                                type="text"
                                placeholder="Search users by name, email, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-5 h-5" />}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            icon={<Search className="w-5 h-5" />}
                        >
                            Search
                        </Button>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">User</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Phone</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Roles</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <span className="text-sm font-semibold text-gray-900">Status</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.data?.map((user, index) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-blue-50/50 transition-colors duration-150 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                                                    <UserIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name || 'N/A'}</p>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.phone ? (
                                                <span className="text-sm text-gray-900">{user.phone}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles?.map((role, i) => (
                                                    <Badge key={i} variant={getRoleBadgeColor(role?.name || '')} size="sm">
                                                        {role?.name || 'N/A'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusColor(user.status)} className="capitalize">
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/users/${user.id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/users/${user.id}/edit`}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="hover:bg-purple-50 hover:text-purple-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(user.id)}
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer with Pagination Info */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-medium text-gray-900">{users.data?.length || 0}</span> of{' '}
                                <span className="font-medium text-gray-900">{users.total}</span> users
                            </p>
                            {users.last_page > 1 && (
                                <div className="flex gap-2">
                                    {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/users?page=${page}`}
                                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                                page === users.current_page
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
