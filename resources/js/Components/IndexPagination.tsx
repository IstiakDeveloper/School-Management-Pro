import React from 'react';
import { Link } from '@inertiajs/react';

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

    return (
        <div className="bg-white rounded-lg border border-emerald-100 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-emerald-700/80">
                {from != null && to != null && total != null
                    ? `${from}–${to} of ${total}`
                    : total != null
                    ? `${total} total`
                    : null}
            </span>
            <div className="flex gap-1">
                {links.map((link, i) =>
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            preserveState
                            preserveScroll
                            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                                link.active
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : (
                        <span
                            key={i}
                            className="px-2.5 py-1 text-xs text-gray-400 border border-emerald-100 rounded cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    )
                )}
            </div>
        </div>
    );
}
