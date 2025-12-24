import React, { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import { Mail, GraduationCap, ArrowLeft, Sparkles, Send, CheckCircle } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const [data, setData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.post('/forgot-password', data, {
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <Head title="Forgot Password" />

            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 animate-gradient"></div>

            {/* Animated floating shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animation-delay-2000 animate-blob"></div>
            </div>

            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Logo and branding */}
                    <div className="text-center mb-8 animate-fade-in-down">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl mb-6 shadow-2xl border border-white/30 transform hover:scale-110 transition-all duration-300">
                            <GraduationCap className="w-12 h-12 text-white drop-shadow-lg" />
                        </div>
                        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-2xl tracking-tight">
                            Reset <span className="text-yellow-300">Password</span>
                        </h1>
                        <p className="text-white/90 text-lg font-medium">
                            Don't worry, we'll send you reset instructions
                        </p>
                    </div>

                    {/* Reset password card with glassmorphism */}
                    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/50 animate-fade-in-up hover:shadow-3xl transition-all duration-500">
                        {status && (
                            <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl animate-bounce-in">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-green-800 mb-1">Email Sent!</p>
                                        <p className="text-sm text-green-700">{status}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <p className="text-gray-700 text-center">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="group transform transition-all duration-300 hover:scale-[1.02]">
                                <Input
                                    type="email"
                                    label="Email Address"
                                    value={data.email}
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    error={errors.email}
                                    icon={<Mail className="w-5 h-5 text-orange-500 group-hover:text-red-600 transition-colors duration-300" />}
                                    required
                                    autoFocus
                                    placeholder="Enter your registered email"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                                {processing ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Send Reset Link</span>
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t-2 border-gray-200">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm font-bold text-orange-600 hover:text-red-600 transition-all duration-200 hover:underline group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span>Back to Login</span>
                            </Link>
                        </div>

                        {/* Help text */}
                        <div className="mt-6 p-5 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-100">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-1">Need Help?</p>
                                    <p className="text-xs text-gray-600">If you don't receive the email within a few minutes, please check your spam folder or contact support.</p>
                                </div>
                            </div>
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
                @keyframes bounce-in {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
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
                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
}
