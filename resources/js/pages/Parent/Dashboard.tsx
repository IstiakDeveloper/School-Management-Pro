import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
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

function route(name: string, params?: any): string {
    const routes: Record<string, string> = {
        'parent.children.show': '/parent/children/:id',
        'parent.attendance.index': '/parent/attendance',
        'parent.exams.index': '/parent/exams',
        'parent.fees.index': '/parent/fees',
        'parent.notices.index': '/parent/notices',
        'parent.notices.show': '/parent/notices/:id',
        'parent.messages.index': '/parent/messages',
        'parent.children.index': '/parent/children',
        'parent.profile.show': '/parent/profile',
    };

    if (params) {
        if (name === 'parent.children.show') {
            return `/parent/children/${params}`;
        }
        if (name === 'parent.notices.show') {
            return `/parent/notices/${params}`;
        }
        if (name === 'parent.attendance.index' && params.student_id) {
            return `/parent/attendance?student_id=${params.student_id}`;
        }
        if (name === 'parent.exams.index' && params.student_id) {
            return `/parent/exams?student_id=${params.student_id}`;
        }
        if (name === 'parent.fees.index' && params.student_id) {
            return `/parent/fees?student_id=${params.student_id}`;
        }
    }

    return routes[name] || '/';
}

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
                    <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-md">
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <User className="h-12 w-12" />
                                <div>
                                    <h1 className="text-2xl font-bold">Welcome, {parent.father_name}</h1>
                                    <p className="text-indigo-100">Parent Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Children</p>
                                        <p className="text-2xl font-bold">{children.length}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Due</p>
                                        <p className="text-2xl font-bold">
                                            ৳{children.reduce((sum, c) => sum + c.fee_status.total_due, 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Unread Messages</p>
                                        <p className="text-2xl font-bold">{unreadMessages}</p>
                                    </div>
                                    <MessageSquare className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Recent Notices</p>
                                        <p className="text-2xl font-bold">{recentNotices.length}</p>
                                    </div>
                                    <Bell className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Children Cards */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">My Children</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {children.map((child) => (
                                            <div key={child.id} className="border rounded-lg shadow-sm">
                                                <div className="p-4">
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
                                                                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 mb-2">
                                                                    {child.fee_status.overdue_count} Overdue Fee(s)
                                                                </span>
                                                            )}
                                                            <div className="flex gap-2 flex-wrap">
                                                                <Link href={route('parent.children.show', child.id)}>
                                                                    <button className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                                                        <User className="h-4 w-4 mr-1" />
                                                                        View Profile
                                                                    </button>
                                                                </Link>
                                                                <Link href={route('parent.attendance.index', { student_id: child.id })}>
                                                                    <button className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                                                        <Calendar className="h-4 w-4 mr-1" />
                                                                        Attendance
                                                                    </button>
                                                                </Link>
                                                                <Link href={route('parent.exams.index', { student_id: child.id })}>
                                                                    <button className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                                                        <TrendingUp className="h-4 w-4 mr-1" />
                                                                        Results
                                                                    </button>
                                                                </Link>
                                                                <Link href={route('parent.fees.index', { student_id: child.id })}>
                                                                    <button className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                                                                        <DollarSign className="h-4 w-4 mr-1" />
                                                                        Fees
                                                                    </button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Notices */}
                        <div>
                            <div className="bg-white rounded-lg shadow-md">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Notices</h2>
                                        <Link href={route('parent.notices.index')}>
                                            <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md">View All</button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-6">
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
                                                                <span className="px-2 py-0.5 text-xs border border-gray-300 rounded">
                                                                    {notice.type}
                                                                </span>
                                                                <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(notice.priority)}`}>
                                                                    {notice.priority}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No recent notices</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-md mt-6">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-2">
                                        <Link href={route('parent.messages.index')}>
                                            <button className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Messages
                                                {unreadMessages > 0 && (
                                                    <span className="ml-auto px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">{unreadMessages}</span>
                                                )}
                                            </button>
                                        </Link>
                                        <Link href={route('parent.notices.index')}>
                                            <button className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <Bell className="h-4 w-4 mr-2" />
                                                View All Notices
                                            </button>
                                        </Link>
                                        <Link href={route('parent.children.index')}>
                                            <button className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <Users className="h-4 w-4 mr-2" />
                                                My Children
                                            </button>
                                        </Link>
                                        <Link href={route('parent.profile.show')}>
                                            <button className="w-full inline-flex items-center justify-start px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                                <User className="h-4 w-4 mr-2" />
                                                My Profile
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

