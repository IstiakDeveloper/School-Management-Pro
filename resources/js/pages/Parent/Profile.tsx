import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { User, Mail, Phone, MapPin, Upload, Lock, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Child {
    id: number;
    full_name: string;
    admission_number: string;
    photo: string | null;
    class_name: string;
    section_name: string;
}

interface Props {
    parent: {
        id: number;
        father_name: string;
        father_occupation: string;
        father_phone: string;
        mother_name: string;
        mother_occupation: string;
        mother_phone: string;
        phone: string;
        email: string;
        address: string;
        city: string;
        state: string;
        postal_code: string;
        photo: string | null;
    };
    children: Child[];
}

export default function Profile({ parent, children }: Props) {
    const [editing, setEditing] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        phone: parent.phone || '',
        email: parent.email || '',
        address: parent.address || '',
        city: parent.city || '',
        state: parent.state || '',
        postal_code: parent.postal_code || '',
        father_phone: parent.father_phone || '',
        mother_phone: parent.mother_phone || '',
    });

    const photoForm = useForm({
        photo: null as File | null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('parent.profile.update'), {
            onSuccess: () => {
                setEditing(false);
            },
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            photoForm.setData('photo', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = () => {
        photoForm.post(route('parent.profile.photo'), {
            onSuccess: () => {
                setPhotoPreview(null);
            },
        });
    };

    const handlePasswordChange: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put(route('parent.profile.password'), {
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="My Profile" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">My Profile</h1>
                        <p className="text-gray-600">Manage your profile information</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Picture Card */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Picture</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={photoPreview || parent.photo || '/default-avatar.png'}
                                            alt={parent.father_name}
                                            className="h-32 w-32 rounded-full object-cover mb-4"
                                        />
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="mb-2"
                                        />
                                        {photoPreview && (
                                            <Button
                                                onClick={handlePhotoUpload}
                                                disabled={photoForm.processing}
                                                className="w-full"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload Photo
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* My Children Card */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>My Children</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={route('parent.children.show', child.id)}
                                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition"
                                            >
                                                <img
                                                    src={child.photo || '/default-avatar.png'}
                                                    alt={child.full_name}
                                                    className="h-12 w-12 rounded-full object-cover"
                                                />
                                                <div>
                                                    <h4 className="font-medium">{child.full_name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        {child.class_name} - {child.section_name}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profile Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Basic Information</CardTitle>
                                        {!editing && (
                                            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Father's Information */}
                                            <div>
                                                <Label>Father's Name</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <p className="text-gray-900">{parent.father_name}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Father's Occupation</Label>
                                                <p className="text-gray-900 mt-1">{parent.father_occupation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label>Father's Phone</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.father_phone}
                                                        onChange={(e) => setData('father_phone', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <p className="text-gray-900">{parent.father_phone || 'N/A'}</p>
                                                    </div>
                                                )}
                                                {errors.father_phone && <p className="text-sm text-red-600 mt-1">{errors.father_phone}</p>}
                                            </div>

                                            {/* Mother's Information */}
                                            <div>
                                                <Label>Mother's Name</Label>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="h-4 w-4 text-gray-400" />
                                                    <p className="text-gray-900">{parent.mother_name}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Mother's Occupation</Label>
                                                <p className="text-gray-900 mt-1">{parent.mother_occupation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <Label>Mother's Phone</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.mother_phone}
                                                        onChange={(e) => setData('mother_phone', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <p className="text-gray-900">{parent.mother_phone || 'N/A'}</p>
                                                    </div>
                                                )}
                                                {errors.mother_phone && <p className="text-sm text-red-600 mt-1">{errors.mother_phone}</p>}
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <Label>Primary Phone</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                        <p className="text-gray-900">{parent.phone}</p>
                                                    </div>
                                                )}
                                                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <Label>Email</Label>
                                                {editing ? (
                                                    <Input
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                        <p className="text-gray-900">{parent.email}</p>
                                                    </div>
                                                )}
                                                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="mb-4">
                                            <Label>Address</Label>
                                            {editing ? (
                                                <Textarea
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    rows={3}
                                                />
                                            ) : (
                                                <div className="flex items-start gap-2 mt-1">
                                                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                                    <p className="text-gray-900">{parent.address || 'N/A'}</p>
                                                </div>
                                            )}
                                            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>City</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.city}
                                                        onChange={(e) => setData('city', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 mt-1">{parent.city || 'N/A'}</p>
                                                )}
                                                {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                                            </div>
                                            <div>
                                                <Label>State</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.state}
                                                        onChange={(e) => setData('state', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 mt-1">{parent.state || 'N/A'}</p>
                                                )}
                                                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
                                            </div>
                                            <div>
                                                <Label>Postal Code</Label>
                                                {editing ? (
                                                    <Input
                                                        value={data.postal_code}
                                                        onChange={(e) => setData('postal_code', e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 mt-1">{parent.postal_code || 'N/A'}</p>
                                                )}
                                                {errors.postal_code && <p className="text-sm text-red-600 mt-1">{errors.postal_code}</p>}
                                            </div>
                                        </div>

                                        {editing && (
                                            <div className="flex gap-2 mt-6">
                                                <Button type="submit" disabled={processing}>
                                                    Save Changes
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setEditing(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Change Password */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePasswordChange}>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Current Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordForm.data.current_password}
                                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                />
                                                {passwordForm.errors.current_password && (
                                                    <p className="text-sm text-red-600 mt-1">{passwordForm.errors.current_password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label>New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                />
                                                {passwordForm.errors.password && (
                                                    <p className="text-sm text-red-600 mt-1">{passwordForm.errors.password}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label>Confirm New Password</Label>
                                                <Input
                                                    type="password"
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                />
                                            </div>
                                            <Button type="submit" disabled={passwordForm.processing}>
                                                <Lock className="h-4 w-4 mr-2" />
                                                Change Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
