import React, { ReactNode } from 'react';

interface Column {
    key: string;
    label: string | ReactNode;
    sortable?: boolean;
    render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    onSort?: (key: string) => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    loading?: boolean;
}

export default function Table({
    columns,
    data,
    onSort,
    sortKey,
    sortDirection,
    loading = false,
}: TableProps) {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                }`}
                                onClick={() => column.sortable && onSort?.(column.key)}
                            >
                                <div className="flex items-center gap-2">
                                    {column.label}
                                    {column.sortable && sortKey === column.key && (
                                        <span className="text-blue-600">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center">
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                                No data found
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
