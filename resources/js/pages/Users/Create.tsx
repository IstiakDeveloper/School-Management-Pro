import React, { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import {
    User,
    Mail,
    Lock,
    Phone,
    ArrowLeft,
    Save,
    Shield,
    CheckCircle,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface CreateProps {
    roles: Role[];
}

export default function Create({ roles }: CreateProps) {
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role_ids: [] as number[],
        status: 'active',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/users', data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            }
        });
    };

    const toggleRoleSelection = (roleId: number) => {
        setData(prev => ({
            ...prev,
            role_ids: prev.role_ids.includes(roleId)
                ? prev.role_ids.filter(id => id !== roleId)
                : [...prev.role_ids, roleId]
        }));
    };

    const getRoleColor = (roleName: string) => {
        const colors: Record<string, string> = {
            'Super Admin': 'from-purple-500 to-pink-500',
            'Principal': 'from-blue-500 to-cyan-500',
            'Teacher': 'from-emerald-500 to-teal-500',
            'Accountant': 'from-orange-500 to-red-500',
            'Librarian': 'from-cyan-500 to-blue-500',
            'Student': 'from-pink-500 to-rose-500',
            'Parent': 'from-indigo-500 to-purple-500',
        };
        return colors[roleName] || 'from-gray-500 to-gray-600';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create User" />

            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft className="w-5 h-5" />}
                        onClick={() => router.visit('/users')}
                        className="hover:bg-blue-50 hover:text-blue-600"
                    >
                        Back
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Create New User
                        </h1>
                        <p className="text-gray-600 mt-1">Add a new user to the system with roles and permissions</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <User className="w-6 h-6" />
                                Basic Information
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Input
                                    label="Full Name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    error={errors.name}
                                    icon={<User className="w-5 h-5" />}
                                    placeholder="Enter full name"
                                    required
                                    className="transition-all duration-300 focus:scale-[1.02]"
                                />
                            </div>

                            <Input
                                type="email"
                                label="Email Address"
                                value={data.email}
                                onChange={(e) => setData({ ...data, email: e.target.value })}
                                error={errors.email}
                                icon={<Mail className="w-5 h-5" />}
                                placeholder="user@example.com"
                                required
                                className="transition-all duration-300 focus:scale-[1.02]"
                            />

                            <Input
                                type="tel"
                                label="Phone Number"
                                value={data.phone}
                                onChange={(e) => setData({ ...data, phone: e.target.value })}
                                error={errors.phone}
                                icon={<Phone className="w-5 h-5" />}
                                placeholder="+880 1XXX-XXXXXX"
                                className="transition-all duration-300 focus:scale-[1.02]"
                            />

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    error={errors.password}
                                    icon={<Lock className="w-5 h-5" />}
                                    placeholder="••••••••"
                                    required
                                    className="transition-all duration-300 focus:scale-[1.02]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    label="Confirm Password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                    error={errors.password_confirmation}
                                    icon={<Lock className="w-5 h-5" />}
                                    placeholder="••••••••"
                                    required
                                    className="transition-all duration-300 focus:scale-[1.02]"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield className="w-6 h-6" />
                                Assign Roles
                            </h2>
                            <p className="text-purple-100 text-sm mt-1">Select one or more roles for this user</p>
                        </div>
                        <div className="p-6">
                            {errors.role_ids && (
                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{errors.role_ids}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roles.map((role, index) => {
                                    const isSelected = data.role_ids.includes(role.id);
                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => toggleRoleSelection(role.id)}
                                            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 animate-scale-in ${
                                                isSelected
                                                    ? 'border-transparent bg-gradient-to-br ' + getRoleColor(role.name) + ' shadow-xl'
                                                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
                                            }`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={`p-3 rounded-xl ${
                                                    isSelected
                                                        ? 'bg-white/20'
                                                        : 'bg-gradient-to-br ' + getRoleColor(role.name)
                                                }`}>
                                                    <Shield className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
                                                </div>
                                                {isSelected && (
                                                    <div className="bg-white/20 backdrop-blur-lg rounded-full p-1">
                                                        <CheckCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className={`font-bold text-lg mb-1 ${
                                                isSelected ? 'text-white' : 'text-gray-900'
                                            }`}>
                                                {role.name}
                                            </h3>
                                            {role.description && (
                                                <p className={`text-sm ${
                                                    isSelected ? 'text-white/80' : 'text-gray-600'
                                                }`}>
                                                    {role.description}
                                                </p>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {data.role_ids.length > 0 && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">
                                            {data.role_ids.length} role{data.role_ids.length > 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Selection Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Account Status
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setData({ ...data, status: 'active' })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                                    data.status === 'active'
                                        ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl'
                                        : 'border-gray-200 bg-white hover:border-green-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="font-bold">Active</div>
                                        <div className={`text-sm ${data.status === 'active' ? 'text-green-100' : 'text-gray-600'}`}>
                                            User can access the system
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setData({ ...data, status: 'inactive' })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                                    data.status === 'inactive'
                                        ? 'border-gray-500 bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-xl'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-6 h-6" />
                                    <div className="text-left">
                                        <div className="font-bold">Inactive</div>
                                        <div className={`text-sm ${data.status === 'inactive' ? 'text-gray-100' : 'text-gray-600'}`}>
                                            User cannot access the system
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit('/users')}
                            disabled={processing}
                            className="hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                            icon={<Save className="w-5 h-5" />}
                        >
                            {processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
