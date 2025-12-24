import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Badge from '@/Components/Badge';
import { Plus, Edit, Trash2, Shield, Users, Key } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    users_count: number;
    created_at: string;
}

interface RolesIndexProps {
    roles: Role[];
}

export default function Index({ roles }: RolesIndexProps) {
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete the "${name}" role?`)) {
            router.delete(`/roles/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Role Management" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Role Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage system roles and permissions</p>
                    </div>
                    <Link href="/roles/create">
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                            icon={<Plus className="w-5 h-5" />}
                        >
                            Create Role
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Roles</p>
                                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.reduce((sum, role) => sum + role.users_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                                <Key className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Permissions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {roles.reduce((sum, role) => sum + (role.permissions?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles Table */}
                <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Role Name</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Key className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Permissions</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm font-semibold text-gray-900">Users</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left">
                                        <span className="text-sm font-semibold text-gray-900">Created Date</span>
                                    </th>
                                    <th className="px-6 py-4 text-right">
                                        <span className="text-sm font-semibold text-gray-900">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {roles.map((role, index) => (
                                    <tr
                                        key={role.id}
                                        className="hover:bg-purple-50/50 transition-colors duration-150 animate-fade-in"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Shield className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <span className="font-semibold text-gray-900">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {(role.permissions || []).slice(0, 3).map((permission, i) => (
                                                    <Badge key={i} variant="purple" size="sm">
                                                        {permission.name}
                                                    </Badge>
                                                ))}
                                                {(role.permissions?.length || 0) > 3 && (
                                                    <Badge variant="default" size="sm">
                                                        +{(role.permissions?.length || 0) - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info">{role.users_count} users</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {new Date(role.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/roles/${role.id}/edit`}>
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
                                                    onClick={() => handleDelete(role.id, role.name)}
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

                    {/* Footer */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-medium text-gray-900">{roles.length}</span> roles
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
