import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    User,
    Calendar,
    TrendingUp,
    DollarSign,
    MessageSquare,
    Bell,
    Users,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

interface Child {
    id: number;
    full_name: string;
    admission_number: string;
    roll_number: string;
    photo: string | null;
    class_name: string;
    section_name: string;
    today_attendance: {
        status: string;
        remarks?: string;
    };
    recent_results: any[];
    fee_status: {
        total_due: number;
        overdue_count: number;
    };
}

interface Notice {
    id: number;
    title: string;
    type: string;
    priority: string;
    publish_date: string;
    is_pinned: boolean;
}

interface Props {
    parent: {
        id: number;
        father_name: string;
        mother_name: string;
        phone: string;
        email: string;
    };
    children: Child[];
    recentNotices: Notice[];
    unreadMessages: number;
}

export default function Dashboard({ parent, children, recentNotices, unreadMessages }: Props) {
    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'absent':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'late':
                return <Clock className="h-5 w-5 text-orange-600" />;
            case 'half_day':
                return <Clock className="h-5 w-5 text-blue-600" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getAttendanceLabel = (status: string) => {
        switch (status) {
            case 'present':
                return 'Present';
            case 'absent':
                return 'Absent';
            case 'late':
                return 'Late';
            case 'half_day':
                return 'Half Day';
            default:
                return 'Not Marked';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Parent Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <Card className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <User className="h-12 w-12" />
                                <div>
                                    <h1 className="text-2xl font-bold">Welcome, {parent.father_name}</h1>
                                    <p className="text-indigo-100">Parent Dashboard</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Children</p>
                                        <p className="text-2xl font-bold">{children.length}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Due</p>
                                        <p className="text-2xl font-bold">
                                            ৳{children.reduce((sum, c) => sum + c.fee_status.total_due, 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Unread Messages</p>
                                        <p className="text-2xl font-bold">{unreadMessages}</p>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Recent Notices</p>
                                        <p className="text-2xl font-bold">{recentNotices.length}</p>
                                    </div>
                                    <Bell className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Children Cards */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>My Children</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {children.map((child) => (
                                            <Card key={child.id} className="border">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <img
                                                            src={child.photo || '/default-avatar.png'}
                                                            alt={child.full_name}
                                                            className="h-16 w-16 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h3 className="font-semibold text-lg">{child.full_name}</h3>
                                                                <div className="flex items-center gap-2">
                                                                    {getAttendanceIcon(child.today_attendance.status)}
                                                                    <span className="text-sm">
                                                                        {getAttendanceLabel(child.today_attendance.status)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                                <div>
                                                                    <span className="font-medium">Class:</span> {child.class_name} - {child.section_name}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">Roll:</span> {child.roll_number}
                                                                </div>
                                                            </div>
                                                            {child.fee_status.overdue_count > 0 && (
                                                                <Badge variant="destructive" className="mb-2">
                                                                    {child.fee_status.overdue_count} Overdue Fee(s)
                                                                </Badge>
                                                            )}
                                                            <div className="flex gap-2 flex-wrap">
                                                                <Link href={route('parent.children.show', child.id)}>
                                                                    <Button size="sm" variant="outline">
                                                                        <User className="h-4 w-4 mr-1" />
                                                                        View Profile
                                                                    </Button>
                                                                </Link>
                                                                <Link href={route('parent.attendance.index', { student_id: child.id })}>
                                                                    <Button size="sm" variant="outline">
                                                                        <Calendar className="h-4 w-4 mr-1" />
                                                                        Attendance
                                                                    </Button>
                                                                </Link>
                                                                <Link href={route('parent.exams.index', { student_id: child.id })}>
                                                                    <Button size="sm" variant="outline">
                                                                        <TrendingUp className="h-4 w-4 mr-1" />
                                                                        Results
                                                                    </Button>
                                                                </Link>
                                                                <Link href={route('parent.fees.index', { student_id: child.id })}>
                                                                    <Button size="sm" variant="outline">
                                                                        <DollarSign className="h-4 w-4 mr-1" />
                                                                        Fees
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Notices */}
                        <div>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Recent Notices</CardTitle>
                                        <Link href={route('parent.notices.index')}>
                                            <Button size="sm" variant="ghost">View All</Button>
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {recentNotices.length > 0 ? (
                                            recentNotices.map((notice) => (
                                                <Link
                                                    key={notice.id}
                                                    href={route('parent.notices.show', notice.id)}
                                                    className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                                                >
                                                    <div className="flex items-start gap-2 mb-1">
                                                        <Bell className="h-4 w-4 text-gray-400 mt-1" />
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-sm line-clamp-2">{notice.title}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {notice.type}
                                                                </Badge>
                                                                <Badge className={`text-xs ${getPriorityColor(notice.priority)}`}>
                                                                    {notice.priority}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent notices</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Link href={route('parent.messages.index')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Messages
                                                {unreadMessages > 0 && (
                                                    <Badge className="ml-auto">{unreadMessages}</Badge>
                                                )}
                                            </Button>
                                        </Link>
                                        <Link href={route('parent.notices.index')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Bell className="h-4 w-4 mr-2" />
                                                View All Notices
                                            </Button>
                                        </Link>
                                        <Link href={route('parent.children.index')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Users className="h-4 w-4 mr-2" />
                                                My Children
                                            </Button>
                                        </Link>
                                        <Link href={route('parent.profile.show')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <User className="h-4 w-4 mr-2" />
                                                My Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
