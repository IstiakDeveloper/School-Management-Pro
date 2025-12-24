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
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{from}</span> to{' '}
                <span className="font-medium">{to}</span> of{' '}
                <span className="font-medium">{total}</span> results
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
