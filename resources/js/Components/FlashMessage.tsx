import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface FlashData {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function FlashMessage() {
    const { flash } = usePage().props as { flash: FlashData };
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState<string>('');
    const [type, setType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash.warning) {
            setMessage(flash.warning);
            setType('warning');
            setVisible(true);
        } else if (flash.info) {
            setMessage(flash.info);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const styles = {
        success: {
            container: 'bg-gradient-to-r from-emerald-500 to-green-500',
            icon: CheckCircle,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            progressBar: 'bg-white/30',
            progressActive: 'bg-white',
        },
        error: {
            container: 'bg-gradient-to-r from-red-500 to-pink-500',
            icon: XCircle,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            progressBar: 'bg-white/30',
            progressActive: 'bg-white',
        },
        warning: {
            container: 'bg-gradient-to-r from-amber-500 to-orange-500',
            icon: AlertTriangle,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            progressBar: 'bg-white/30',
            progressActive: 'bg-white',
        },
        info: {
            container: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            icon: Info,
            iconBg: 'bg-white/20',
            iconColor: 'text-white',
            progressBar: 'bg-white/30',
            progressActive: 'bg-white',
        },
    };

    const currentStyle = styles[type];
    const Icon = currentStyle.icon;

    return (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
            <div
                className={`${currentStyle.container} rounded-2xl shadow-2xl overflow-hidden max-w-md backdrop-blur-xl border border-white/20 transform transition-all duration-300 hover:scale-105`}
            >
                <div className="flex items-start gap-4 p-4">
                    <div className={`${currentStyle.iconBg} p-2.5 rounded-xl flex-shrink-0 shadow-lg`}>
                        <Icon className={`w-6 h-6 ${currentStyle.iconColor}`} />
                    </div>
                    <div className="flex-1 pt-1">
                        <p className="text-white font-semibold text-base leading-relaxed pr-4">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={() => setVisible(false)}
                        className="flex-shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
                <div className={`h-1.5 ${currentStyle.progressBar} relative overflow-hidden`}>
                    <div
                        className={`h-full ${currentStyle.progressActive} animate-progress-bar shadow-lg`}
                    />
                </div>
            </div>
        </div>
    );
}
