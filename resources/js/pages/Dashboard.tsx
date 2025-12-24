import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Users, GraduationCap, BookOpen, DollarSign, TrendingUp, TrendingDown,
    Calendar, Clock, Award, UserCheck, AlertCircle, Sparkles, ArrowRight
} from 'lucide-react';

interface DashboardProps {
    stats: {
        total_students?: number;
        total_teachers?: number;
        total_staff?: number;
        total_classes?: number;
        pending_fees?: number;
        today_attendance?: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Students',
            value: stats.total_students || 0,
            icon: Users,
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'from-blue-50 to-cyan-50',
            iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            trend: '+12%',
            trendUp: true,
        },
        {
            title: 'Total Teachers',
            value: stats.total_teachers || 0,
            icon: GraduationCap,
            gradient: 'from-purple-500 to-pink-500',
            bg: 'from-purple-50 to-pink-50',
            iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
            trend: '+5%',
            trendUp: true,
        },
        {
            title: 'Active Classes',
            value: stats.total_classes || 0,
            icon: BookOpen,
            gradient: 'from-emerald-500 to-teal-500',
            bg: 'from-emerald-50 to-teal-50',
            iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
            trend: '+3',
            trendUp: true,
        },
        {
            title: 'Pending Fees',
            value: `৳${(stats.pending_fees || 0).toLocaleString()}`,
            icon: DollarSign,
            gradient: 'from-orange-500 to-red-500',
            bg: 'from-orange-50 to-red-50',
            iconBg: 'bg-gradient-to-br from-orange-500 to-red-500',
            trend: '-8%',
            trendUp: false,
        },
    ];

    const recentActivities = [
        {
            icon: UserCheck,
            title: 'New Student Admission',
            description: 'John Doe admitted to Class 10-A',
            time: '10 minutes ago',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            icon: BookOpen,
            title: 'Exam Schedule Updated',
            description: 'Mid-term exams scheduled for next week',
            time: '1 hour ago',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            icon: DollarSign,
            title: 'Fee Payment Received',
            description: '৳50,000 received from 15 students',
            time: '2 hours ago',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            icon: AlertCircle,
            title: 'Attendance Alert',
            description: '5 students absent today in Class 9-B',
            time: '3 hours ago',
            color: 'text-orange-600',
            bgColor: 'bg-orange-100',
        },
    ];

    const upcomingEvents = [
        {
            date: '15',
            month: 'Dec',
            title: 'Parent-Teacher Meeting',
            time: '10:00 AM - 2:00 PM',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            date: '20',
            month: 'Dec',
            title: 'Mid-Term Examinations',
            time: '9:00 AM - 12:00 PM',
            color: 'from-purple-500 to-pink-500',
        },
        {
            date: '25',
            month: 'Dec',
            title: 'Christmas Celebration',
            time: 'Full Day Event',
            color: 'from-red-500 to-pink-500',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="space-y-8 animate-fade-in">
                {/* Welcome Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl transform hover:scale-[1.01] transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                                    <h1 className="text-4xl font-extrabold drop-shadow-lg">Welcome Back!</h1>
                                </div>
                                <p className="text-white/90 text-lg font-medium">
                                    Here's what's happening in your school today
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-white/80 text-sm">Today</p>
                                    <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                                <Calendar className="w-16 h-16 text-white/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className={`bg-gradient-to-br ${stat.bg} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-white/50 group animate-scale-in`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${stat.iconBg} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                                        stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {stat.trendUp ? (
                                            <TrendingUp className="w-4 h-4" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4" />
                                        )}
                                        {stat.trend}
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-semibold mb-2">{stat.title}</h3>
                                <p className={`text-4xl font-extrabold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                                    {stat.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activities */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Recent Activities</h2>
                            </div>
                            <button className="text-blue-600 hover:text-purple-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all duration-200">
                                View All
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentActivities.map((activity, index) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 group cursor-pointer"
                                    >
                                        <div className={`${activity.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`w-6 h-6 ${activity.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {activity.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                        </div>

                        <div className="space-y-4">
                            {upcomingEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all duration-300 border border-gray-100 group cursor-pointer"
                                >
                                    <div className={`bg-gradient-to-br ${event.color} rounded-2xl p-4 text-white text-center min-w-[70px] group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        <p className="text-3xl font-extrabold">{event.date}</p>
                                        <p className="text-sm font-medium">{event.month}</p>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {event.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-8 h-8 text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: 'Add Student', icon: Users, color: 'from-blue-500 to-cyan-500' },
                            { name: 'Mark Attendance', icon: UserCheck, color: 'from-green-500 to-emerald-500' },
                            { name: 'Create Exam', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
                            { name: 'Collect Fee', icon: DollarSign, color: 'from-orange-500 to-red-500' },
                        ].map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={index}
                                    className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group`}
                                >
                                    <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="font-bold text-lg">{action.name}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }
                .animate-scale-in {
                    animation: scale-in 0.5s ease-out both;
                }
                .bg-grid-white\\/10 {
                    background-image: linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
