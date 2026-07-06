import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    lastPage,
    total,
    perPage,
    onPageChange,
}: PaginationProps) {
    const from = (currentPage - 1) * perPage + 1;
    const to = Math.min(currentPage * perPage, total);

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        let endPage = Math.min(lastPage, startPage + showPages - 1);

        if (endPage - startPage < showPages - 1) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (lastPage <= 1) return null;

    return (
        <div className="bg-white/90 backdrop-blur-sm border-t border-emerald-50 px-6 py-4 flex items-center justify-between rounded-b-xl">
            <div className="text-xs font-medium text-emerald-800/80">
                Showing <span className="font-semibold text-emerald-950">{from}</span> to{' '}
                <span className="font-semibold text-emerald-950">{to}</span> of{' '}
                <span className="font-semibold text-emerald-950">{total}</span> results
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex items-center justify-center min-w-[32px] h-8 px-2 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 ${
                            page === currentPage
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700'
                                : 'bg-emerald-50/40 text-emerald-800 border border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200 hover:-translate-y-0.5'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-emerald-100 bg-emerald-50/40 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

