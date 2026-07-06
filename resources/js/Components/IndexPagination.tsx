import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface IndexPaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
    lastPage: number;
}

export default function IndexPagination({ links, from, to, total, lastPage }: IndexPaginationProps) {
    if (!links?.length || lastPage <= 1) return null;

    // Clean up label text or render chevrons
    const renderLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('laquo')) {
            return <ChevronLeft className="w-4 h-4" />;
        }
        if (label.includes('Next') || label.includes('raquo')) {
            return <ChevronRight className="w-4 h-4" />;
        }
        return <span dangerouslySetInnerHTML={{ __html: label }} />;
    };

    return (
        <div className="bg-white/90 backdrop-blur-sm border-t border-emerald-50 px-6 py-4 flex items-center justify-between rounded-b-xl">
            <span className="text-xs font-medium text-emerald-800/80">
                {from != null && to != null && total != null ? (
                    <>
                        Showing <span className="font-semibold text-emerald-950">{from}</span> to{' '}
                        <span className="font-semibold text-emerald-950">{to}</span> of{' '}
                        <span className="font-semibold text-emerald-950">{total}</span> records
                    </>
                ) : total != null ? (
                    <>
                        Total <span className="font-semibold text-emerald-950">{total}</span> records
                    </>
                ) : null}
            </span>
            <div className="flex items-center gap-1.5">
                {links.map((link, i) => {
                    const isArrow = link.label.includes('Previous') || link.label.includes('Next') || link.label.includes('laquo') || link.label.includes('raquo');
                    
                    if (link.url) {
                        return (
                            <Link
                                key={i}
                                href={link.url}
                                preserveState
                                preserveScroll
                                className={`flex items-center justify-center min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                                    link.active
                                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700'
                                        : 'bg-emerald-50/40 text-emerald-800 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-0.5'
                                }`}
                            >
                                {renderLabel(link.label)}
                            </Link>
                        );
                    } else {
                        return (
                            <span
                                key={i}
                                className="flex items-center justify-center min-w-[32px] h-8 px-2 text-xs text-gray-300 border border-gray-100 bg-gray-50/50 rounded-lg cursor-not-allowed"
                            >
                                {renderLabel(link.label)}
                            </span>
                        );
                    }
                })}
            </div>
        </div>
    );
}

