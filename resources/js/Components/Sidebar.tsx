import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    Calendar,
    ClipboardCheck,
    FileText,
    DollarSign,
    Library,
    Bell,
    BarChart3,
    Settings,
    ChevronDown,
    Wallet,
    Building2,
    TrendingUp,
    TrendingDown,
    UserPlus,
    Briefcase,
    User,
    Award,
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    roles?: Array<{ name: string }>;
}

interface MenuItem {
    name: string;
    href?: string;
    icon: React.ReactNode;
    roles?: string[];
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
    { name: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Teacher'] },
    { name: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Student'] },
    {
        name: 'Users',
        icon: <Users className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin'],
        children: [
            { name: 'All Users', href: '/users', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin'] },
            { name: 'Roles', href: '/roles', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin'] },
            { name: 'Permissions', href: '/permissions', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin'] },
        ],
    },
    {
        name: 'Academic',
        icon: <BookOpen className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal'],
        children: [
            { name: 'Academic Years', href: '/academic-years', icon: <Calendar className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Classes', href: '/classes', icon: <BookOpen className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Sections', href: '/sections', icon: <BookOpen className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Subjects', href: '/subjects', icon: <BookOpen className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Students',
        icon: <GraduationCap className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
        children: [
            { name: 'All Students', href: '/students', icon: <GraduationCap className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'My Students', href: '/teacher/students', icon: <GraduationCap className="w-5 h-5" />, roles: ['Teacher'] },
            { name: 'Promotions', href: '/student-promotions', icon: <GraduationCap className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Parents', href: '/student-parents', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Teachers',
        icon: <Users className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal'],
        children: [
            { name: 'All Teachers', href: '/teachers', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Teacher Subjects', href: '/teacher-subjects', icon: <BookOpen className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Staff & Salary',
        icon: <Briefcase className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal'],
        children: [
            // { name: 'Staff', href: '/staff', icon: <Users className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Salary Payments', href: '/salary-payments', icon: <DollarSign className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Provident Fund', href: '/provident-fund', icon: <Wallet className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Attendance',
        icon: <ClipboardCheck className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
        children: [
            { name: 'Student Attendance', href: '/student-attendance', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'View Attendance', href: '/teacher/attendance', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Teacher'] },
            { name: 'My Attendance', href: '/teacher/attendance/my', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Teacher'] },
            { name: 'Teacher Attendance', href: '/teacher-attendance', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Device Settings', href: '/device-settings', icon: <Settings className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Exams',
        icon: <FileText className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Teacher'],
        children: [
            { name: 'All Exams', href: '/exams', icon: <FileText className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'My Exams', href: '/teacher/exams', icon: <FileText className="w-5 h-5" />, roles: ['Teacher'] },
            { name: 'Schedules', href: '/exam-schedules', icon: <Calendar className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Marks', href: '/marks', icon: <FileText className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
            { name: 'Results', href: '/results', icon: <FileText className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
        ],
    },
    {
        name: 'Fees',
        icon: <DollarSign className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
        children: [
            { name: 'Fee Types', href: '/fee-types', icon: <DollarSign className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Collections', href: '/fee-collections', icon: <DollarSign className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Overdue Fees', href: '/overdue-fees', icon: <TrendingDown className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
        ],
    },
    {
        name: 'Accounting',
        icon: <DollarSign className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'],
        children: [
            { name: 'Dashboard', href: '/accounting/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Accounts', href: '/accounting/accounts', icon: <Wallet className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Transactions', href: '/accounting/transactions', icon: <DollarSign className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Fixed Assets', href: '/accounting/fixed-assets', icon: <Building2 className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Investors', href: '/accounting/investors', icon: <UserPlus className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Funds', href: '/accounting/funds', icon: <Briefcase className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Income Categories', href: '/accounting/income-categories', icon: <TrendingUp className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
            { name: 'Expense Categories', href: '/accounting/expense-categories', icon: <TrendingDown className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Accountant'] },
        ],
    },
    {
        name: 'Library',
        icon: <Library className="w-5 h-5" />,
        roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'],
        children: [
            { name: 'Books', href: '/books', icon: <Library className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'] },
            { name: 'Issue/Return', href: '/book-issues', icon: <Library className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal', 'Librarian'] },
        ],
    },
    {
        name: 'Messages',
        icon: <Bell className="w-5 h-5" />,
        roles: ['Teacher'],
        href: '/teacher/messages',
    },
    { name: 'Notices', href: '/notices', icon: <Bell className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
    { name: 'Notices', href: '/teacher/notices', icon: <Bell className="w-5 h-5" />, roles: ['Teacher'] },

    // ============================================
    // STUDENT PORTAL MENU ITEMS
    // ============================================
    { name: 'Profile', href: '/student/profile', icon: <User className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Attendance', href: '/student/attendance', icon: <ClipboardCheck className="w-5 h-5" />, roles: ['Student'] },
    {
        name: 'Exams & Results',
        icon: <Award className="w-5 h-5" />,
        roles: ['Student'],
        children: [
            { name: 'My Exams', href: '/student/exams', icon: <FileText className="w-5 h-5" />, roles: ['Student'] },
            { name: 'My Results', href: '/student/results', icon: <Award className="w-5 h-5" />, roles: ['Student'] },
        ],
    },
    { name: 'Fees', href: '/student/fees', icon: <DollarSign className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Library', href: '/student/library', icon: <Library className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Messages', href: '/student/messages', icon: <Bell className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Notices', href: '/student/notices', icon: <Bell className="w-5 h-5" />, roles: ['Student'] },
    { name: 'Events', href: '/student/events', icon: <Calendar className="w-5 h-5" />, roles: ['Student'] },

    { name: 'Reports', href: '/reports', icon: <BarChart3 className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" />, roles: ['Super Admin', 'Admin', 'Principal'] },
];

export default function Sidebar() {
    const { url, props } = usePage<{ auth: { user: User } }>();
    const [openMenus, setOpenMenus] = React.useState<string[]>([]);

    const user = props.auth?.user;
    const userRoles = user?.roles?.map(role => role.name) || [];

    // Auto-expand parent menu if child is active
    React.useEffect(() => {
        menuItems.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some((child) => child.href && url.startsWith(child.href));
                if (hasActiveChild && !openMenus.includes(item.name)) {
                    setOpenMenus((prev) => [...prev, item.name]);
                }
            }
        });
    }, [url]);

    const toggleMenu = (name: string) => {
        setOpenMenus((prev) =>
            prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        // Exact match for dashboard
        if (href === '/dashboard') return url === '/dashboard';
        // For other routes, check if current URL starts with the href
        return url.startsWith(href);
    };

    // Check if user has access to menu item
    const hasAccess = (itemRoles?: string[]) => {
        if (!itemRoles || itemRoles.length === 0) return true;
        return itemRoles.some(role => userRoles.includes(role));
    };

    // Filter menu items based on user roles
    const filteredMenuItems = menuItems
        .filter(item => hasAccess(item.roles))
        .map(item => {
            if (item.children) {
                return {
                    ...item,
                    children: item.children.filter(child => hasAccess(child.roles))
                };
            }
            return item;
        });

    return (
        <aside className="w-64 bg-gradient-to-b from-slate-900 via-purple-900/90 to-slate-900 text-white h-screen fixed left-0 top-0 overflow-y-auto shadow-2xl backdrop-blur-xl border-r border-white/10">
            {/* Logo Section with Gradient */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            School Pro
                        </h1>
                        <p className="text-xs text-gray-400">Management System</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="px-3 py-4 space-y-1">
                {filteredMenuItems.map((item, index) => (
                    <div key={item.name} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        {item.children ? (
                            <>
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group hover:translate-x-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-300 ${
                                            openMenus.includes(item.name) ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                                {openMenus.includes(item.name) && (
                                    <div className="ml-4 mt-1 space-y-1 animate-fade-in-down">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href!}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group hover:translate-x-1 ${
                                                    isActive(child.href)
                                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                                        : 'hover:bg-white/10 text-gray-300 hover:text-white'
                                                }`}
                                            >
                                                <div className="group-hover:scale-110 transition-transform duration-300">
                                                    {child.icon}
                                                </div>
                                                <span className="text-sm font-medium">{child.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href={item.href!}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group hover:translate-x-1 ${
                                    isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                                        : 'hover:bg-white/10 text-gray-300 hover:text-white'
                                }`}
                            >
                                <div className="group-hover:scale-110 transition-transform duration-300">
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        )}
                    </div>
                ))}
            </nav>

            {/* Bottom Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-600/20 to-transparent pointer-events-none" />
        </aside>
    );
}
