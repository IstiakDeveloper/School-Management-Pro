import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexPaginationProps {
    links?: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    lastPage?: number;
}

export default function IndexPagination({ links = [], from, to, total = 0, lastPage = 1 }: IndexPaginationProps) {
    if (total === 0) return null;

    // Clean up label text or render chevrons
    const renderLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('laquo')) {
            return <ChevronLeft className="w-3.5 h-3.5" />;
        }
        if (label.includes('Next') || label.includes('raquo')) {
            return <ChevronRight className="w-3.5 h-3.5" />;
        }
        return <span dangerouslySetInnerHTML={{ __html: label }} />;
    };

    return (
        <div className="bg-slate-50/75 border-t border-slate-200/80 px-4 py-2.5 flex items-center justify-between rounded-b-xl select-none">
            <span className="text-xs font-medium text-slate-500">
                {from != null && to != null ? (
                    <>
                        Showing <span className="font-semibold text-slate-800">{from}</span> to{' '}
                        <span className="font-semibold text-slate-800">{to}</span> of{' '}
                        <span className="font-semibold text-slate-800">{total}</span> records
                    </>
                ) : (
                    <>
                        Total <span className="font-semibold text-slate-800">{total}</span> records
                    </>
                )}
            </span>

            {lastPage > 1 && links.length > 0 ? (
                <div className="flex items-center gap-1">
                    {links.map((link, i) => {
                        if (link.url) {
                            return (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveState
                                    preserveScroll
                                    className={`flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-semibold rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-slate-900 text-white shadow-xs'
                                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    {renderLabel(link.label)}
                                </Link>
                            );
                        } else {
                            return (
                                <span
                                    key={i}
                                    className="flex items-center justify-center min-w-[28px] h-7 px-2 text-xs text-slate-300 border border-slate-100 bg-slate-50 rounded-lg cursor-not-allowed"
                                >
                                    {renderLabel(link.label)}
                                </span>
                            );
                        }
                    })}
                </div>
            ) : (
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-400">Page 1 of 1</span>
                </div>
            )}
        </div>
    );
}
