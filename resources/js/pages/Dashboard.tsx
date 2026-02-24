import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users,
    GraduationCap,
    BookOpen,
    DollarSign,
    UserCheck,
    ClipboardList,
    CalendarDays,
    ChevronRight,
    FileText,
    UserCircle2,
    Mail,
    ShieldCheck,
    LayoutDashboard,
    Clock,
    Zap,
    BarChart3,
    Bell,
    Megaphone,
    Settings,
} from 'lucide-react';

interface TodayAttendance {
    student_present: number;
    student_total: number;
    teacher_present: number;
    teacher_absent: number;
    teacher_total: number;
}

interface ExamItem {
    id: number;
    name: string;
    exam_type: string;
    start_date: string;
    end_date: string;
}

interface NoticeItem {
    id: number;
    title: string;
    published_at: string | null;
}

interface EventItem {
    id: number;
    title: string;
    start_date: string;
    end_date: string | null;
    type: string | null;
}

interface DashboardUser {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions?: string[];
    avatar?: string | null;
}

interface DashboardProps {
    stats: {
        total_students?: number;
        total_teachers?: number;
        total_staff?: number;
        total_classes?: number;
        pending_fees?: number;
        today_attendance?: number;
    };
    todayAttendance?: TodayAttendance;
    upcomingExams?: ExamItem[];
    recentNotices?: NoticeItem[];
    upcomingEvents?: EventItem[];
    user?: DashboardUser;
}

function formatDate(s: string) {
    const d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function Dashboard({
    stats,
    todayAttendance,
    upcomingExams = [],
    recentNotices = [],
    upcomingEvents = [],
    user,
}: DashboardProps) {
    const statCards = [
        { title: 'Total Students', value: stats?.total_students ?? 0, icon: Users, color: 'text-emerald-700 bg-emerald-100', borderColor: 'border-l-emerald-500' },
        { title: 'Total Teachers', value: stats?.total_teachers ?? 0, icon: GraduationCap, color: 'text-emerald-700 bg-emerald-100', borderColor: 'border-l-emerald-500' },
        { title: 'Classes', value: stats?.total_classes ?? 0, icon: BookOpen, color: 'text-emerald-700 bg-emerald-100', borderColor: 'border-l-emerald-500' },
        { title: 'Pending Fees', value: `৳${(stats?.pending_fees ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-amber-700 bg-amber-50', borderColor: 'border-l-amber-500' },
    ];

    const quickActions = [
        { name: 'Add Student', href: '/students/create', icon: Users, desc: 'Register new student' },
        { name: 'Student Attendance', href: '/student-attendance', icon: UserCheck, desc: 'Mark daily attendance' },
        { name: 'Teacher Attendance', href: '/teacher-attendance', icon: UserCheck, desc: 'View teacher attendance' },
        { name: 'Fee Collection', href: '/fee-collections', icon: DollarSign, desc: 'Collect & manage fees' },
    ];

    const studentPercent = todayAttendance && todayAttendance.student_total > 0
        ? Math.round((todayAttendance.student_present / todayAttendance.student_total) * 100)
        : null;
    const teacherPresent = todayAttendance?.teacher_present ?? 0;
    const teacherAbsent = todayAttendance?.teacher_absent ?? 0;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-5">
                {/* Header with welcome & date */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <LayoutDashboard className="w-5 h-5 text-emerald-600" />
                            Dashboard
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {getGreeting()}, {user?.name?.split(' ')[0] || 'Admin'}
                        </p>
                        <p className="text-xs text-emerald-700/80 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Stats row - more professional with icons and left border */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statCards.map(({ title, value, icon: Icon, color, borderColor }) => (
                        <div
                            key={title}
                            className={`bg-white rounded-lg border border-emerald-100 border-l-4 ${borderColor} shadow-sm px-4 py-3.5 flex items-center gap-3 transition-shadow hover:shadow-md`}
                        >
                            <div className={`p-2 rounded-lg ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                                <p className="text-base font-semibold text-gray-900 truncate mt-0.5">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left column: Attendance, Quick Actions */}
                    <div className="lg:col-span-2 space-y-4">
                        {todayAttendance && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                                    <span className="text-sm font-medium text-emerald-800">Today&apos;s Attendance</span>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80">
                                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Students</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {todayAttendance.student_present} <span className="text-gray-400">/</span> {todayAttendance.student_total}
                                                    {studentPercent != null && (
                                                        <span className="text-emerald-600 ml-1 text-xs">({studentPercent}%)</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80">
                                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                                                <GraduationCap className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-medium">Teachers</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Present: {teacherPresent}
                                                    {teacherAbsent > 0 && (
                                                        <span className="text-amber-600 ml-1 text-xs">Absent: {teacherAbsent}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-3">
                                        <Link
                                            href="/student-attendance"
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                                        >
                                            Student attendance <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                        <Link
                                            href="/teacher-attendance"
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
                                        >
                                            Teacher attendance <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-emerald-700" />
                                <span className="text-sm font-medium text-emerald-800">Quick Actions</span>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {quickActions.map(({ name, href, icon: Icon, desc }) => (
                                        <Link
                                            key={name}
                                            href={href}
                                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 transition-colors text-center"
                                        >
                                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">{name}</span>
                                            <span className="text-[10px] text-gray-500 hidden sm:block">{desc}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column: Account Info + Exams, Notices, Events */}
                    <div className="space-y-4">
                        {/* Account Info card */}
                        {user && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center gap-2">
                                    <UserCircle2 className="w-4 h-4 text-emerald-700" />
                                    <span className="text-sm font-medium text-emerald-800">Account Info</span>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircle2 className="w-7 h-7 text-emerald-700" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                <Mail className="w-3 h-3 shrink-0" />
                                                {user.email}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                {user.roles?.map((role) => (
                                                    <span
                                                        key={role}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-medium"
                                                    >
                                                        <ShieldCheck className="w-3 h-3" />
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/settings"
                                        className="mt-3 flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                    >
                                        <Settings className="w-3.5 h-3.5" />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        )}

                        {upcomingExams.length > 0 && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                        <ClipboardList className="w-4 h-4" />
                                        Upcoming Exams
                                    </span>
                                    <Link href="/exams" className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <ul className="divide-y divide-emerald-50">
                                    {upcomingExams.slice(0, 5).map((exam) => (
                                        <li key={exam.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-gray-50/80">
                                            <ClipboardList className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-gray-900">{exam.name}</p>
                                                <p className="text-[11px] text-gray-500">{formatDate(exam.start_date)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {recentNotices.length > 0 && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                        <Megaphone className="w-4 h-4" />
                                        Recent Notices
                                    </span>
                                    <Link href="/notices" className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <ul className="divide-y divide-emerald-50">
                                    {recentNotices.slice(0, 5).map((notice) => (
                                        <li key={notice.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-gray-50/80">
                                            <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <Link href={`/notices/${notice.id}`} className="text-xs font-medium text-gray-900 hover:text-emerald-700 truncate block">
                                                    {notice.title}
                                                </Link>
                                                {notice.published_at && (
                                                    <p className="text-[11px] text-gray-500">{notice.published_at}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {upcomingEvents.length > 0 && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                        Upcoming Events
                                    </span>
                                    <Link href="/events" className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-0.5">
                                        View all <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                                <ul className="divide-y divide-emerald-50">
                                    {upcomingEvents.slice(0, 5).map((event) => (
                                        <li key={event.id} className="px-4 py-2.5 flex items-start gap-2 hover:bg-gray-50/80">
                                            <CalendarDays className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <Link href={`/events/${event.id}`} className="text-xs font-medium text-gray-900 hover:text-emerald-700 block">
                                                    {event.title}
                                                </Link>
                                                <p className="text-[11px] text-gray-500">{formatDate(event.start_date)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {upcomingExams.length === 0 && recentNotices.length === 0 && upcomingEvents.length === 0 && (
                            <div className="bg-white rounded-lg border border-emerald-100 shadow-sm p-4">
                                <p className="text-xs font-medium text-emerald-700 mb-2 flex items-center gap-2">
                                    <Bell className="w-4 h-4" />
                                    Quick Links
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link href="/exams" className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded bg-emerald-50">Exams</Link>
                                    <Link href="/notices" className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded bg-emerald-50">Notices</Link>
                                    <Link href="/events" className="text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded bg-emerald-50">Events</Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
