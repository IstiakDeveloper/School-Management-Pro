import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import { Mail, Lock, User, GraduationCap, ArrowRight, Sparkles, Phone } from 'lucide-react';

export default function Register() {
    const [data, setData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/register', data, {
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
            <Head title="Register" />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 animate-gradient"></div>

            {/* Animated floating shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animation-delay-2000 animate-blob"></div>
            </div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    {/* Logo and branding */}
                    <div className="text-center mb-8 animate-fade-in-down">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 shadow-2xl border border-white/30 transform hover:scale-110 transition-all duration-300">
                            <GraduationCap className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-2xl tracking-tight">
                            Create <span className="text-yellow-300">Account</span>
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-white/90 text-lg font-medium">
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                            <span>Join Us Today!</span>
                            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                        </div>
                    </div>

                    {/* Register card with glassmorphism */}
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50 animate-fade-in-up hover:shadow-3xl transition-all duration-500">
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-4">
                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="text"
                                        label="Full Name"
                                        value={data.name}
                                        onChange={(e) => setData({ ...data, name: e.target.value })}
                                        error={errors.name}
                                        icon={<User className="w-5 h-5 text-emerald-500 group-hover:text-teal-600 transition-colors duration-300" />}
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="email"
                                        label="Email Address"
                                        value={data.email}
                                        onChange={(e) => setData({ ...data, email: e.target.value })}
                                        error={errors.email}
                                        icon={<Mail className="w-5 h-5 text-emerald-500 group-hover:text-teal-600 transition-colors duration-300" />}
                                        required
                                    />
                                </div>

                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="tel"
                                        label="Phone Number"
                                        value={data.phone}
                                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                                        error={errors.phone}
                                        icon={<Phone className="w-5 h-5 text-emerald-500 group-hover:text-teal-600 transition-colors duration-300" />}
                                        required
                                    />
                                </div>

                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="password"
                                        label="Password"
                                        value={data.password}
                                        onChange={(e) => setData({ ...data, password: e.target.value })}
                                        error={errors.password}
                                        icon={<Lock className="w-5 h-5 text-emerald-500 group-hover:text-teal-600 transition-colors duration-300" />}
                                        required
                                    />
                                </div>

                                <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                    <Input
                                        type="password"
                                        label="Confirm Password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                        error={errors.password_confirmation}
                                        icon={<Lock className="w-5 h-5 text-emerald-500 group-hover:text-teal-600 transition-colors duration-300" />}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-3 group relative overflow-hidden mt-6"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                {processing ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t-2 border-gray-200">
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="font-bold text-emerald-600 hover:text-teal-600 transition-all duration-200 hover:underline inline-flex items-center gap-1 group"
                                >
                                    Sign In
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-white/90 text-sm mt-8 animate-fade-in font-medium drop-shadow-lg">
                        © 2025 School Management Pro • Secure & Trusted
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
                .animate-fade-in-down {
                    animation: fade-in-down 1s ease-out;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out 0.2s both;
                }
                .animate-fade-in {
                    animation: fade-in 1.5s ease-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}
