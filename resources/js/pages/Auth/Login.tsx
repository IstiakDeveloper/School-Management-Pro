import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import { Mail, Lock, GraduationCap, ArrowRight, Sparkles, BookOpen, Users, Award } from 'lucide-react';

export default function Login() {
    const [data, setData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/login', data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Head title="Login" />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient"></div>

            {/* Animated floating shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animation-delay-2000 animate-blob"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animation-delay-4000 animate-blob"></div>
            </div>

            {/* Floating icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <GraduationCap className="absolute top-20 left-20 w-16 h-16 text-white/10 animate-float" />
                <BookOpen className="absolute top-40 right-32 w-12 h-12 text-white/10 animation-delay-1000 animate-float" />
                <Users className="absolute bottom-32 left-40 w-16 h-16 text-white/10 animation-delay-2000 animate-float" />
                <Award className="absolute bottom-20 right-20 w-14 h-14 text-white/10 animation-delay-3000 animate-float" />
                <Sparkles className="absolute top-1/3 right-1/4 w-10 h-10 text-white/10 animation-delay-4000 animate-float" />
            </div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo and branding */}
                    <div className="text-center mb-8 animate-fade-in-down">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 shadow-2xl border border-white/30 transform hover:scale-110 transition-all duration-300">
                            <GraduationCap className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-2xl tracking-tight">
                            School <span className="text-yellow-300">Management</span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-white/90 text-lg font-medium">
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                            <span>Welcome Back!</span>
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>
                    </div>

                    {/* Login card with glassmorphism */}
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50 animate-fade-in-up hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-5">
                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        error={errors.email}
                                        icon={<Mail className="w-5 h-5 text-blue-500 group-hover:text-purple-600 transition-colors duration-300" />}
                                        required
                                        autoFocus
                                        className="focus:ring-4 focus:ring-purple-300 transition-all duration-300"
                                    />
                                </div>

                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="password"
                                        label="Password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        error={errors.password}
                                        icon={<Lock className="w-5 h-5 text-blue-500 group-hover:text-purple-600 transition-colors duration-300" />}
                                        required
                                        className="focus:ring-4 focus:ring-purple-300 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData({ ...data, remember: e.target.checked })}
                                        className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-300 cursor-pointer transition-all duration-200 hover:scale-110"
                                    />
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors duration-200">
                                        Remember me
                                    </span>
                                </label>

                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-bold text-purple-600 hover:text-pink-600 transition-all duration-200 hover:underline hover:scale-105 inline-block"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                {processing ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign in to Dashboard</span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </>
                                )}
                            </Button>
                        </form>



                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/90 text-sm mt-8 animate-fade-in font-medium drop-shadow-lg">
                        © 2025 School Management Pro • Built by ❤️ Mousumi Digital Window
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes gradient {
                    0%, 100% {
                        background-size: 200% 200%;
                        background-position: 0% 50%;
                    }
                    50% {
                        background-size: 200% 200%;
                        background-position: 100% 50%;
                    }
                }
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-30px) rotate(10deg);
                    }
                }
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                .animate-gradient {
                    animation: gradient 15s ease infinite;
                }
                .animate-blob {
                    animation: blob 7s ease-in-out infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-fade-in-down {
                    animation: fade-in-down 1s ease-out;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out 0.2s both;
                }
                .animate-fade-in {
                    animation: fade-in 1.5s ease-out;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-3000 {
                    animation-delay: 3s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
