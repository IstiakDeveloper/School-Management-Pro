import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Button from '@/Components/Button';
import { Plus, Filter, Eye, Edit, Trash2, Pin, AlertCircle } from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    content: string;
    type: string;
    priority: string;
    target_audience: string[] | null;
    valid_from: string | null;
    valid_to: string | null;
    is_published: boolean;
    published_at: string | null;
    created_by: number;
    creator?: {
        name: string;
    };
}

interface Props {
    notices: {
        data: Notice[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        type?: string;
        is_published?: boolean;
    };
}

export default function Index({ notices, filters }: Props) {
    const priorityColors: Record<string, string> = {
        low: 'bg-gray-100 text-gray-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
    };

    const typeColors: Record<string, string> = {
        general: 'bg-blue-100 text-blue-800',
        academic: 'bg-purple-100 text-purple-800',
        event: 'bg-green-100 text-green-800',
        holiday: 'bg-yellow-100 text-yellow-800',
        urgent: 'bg-red-100 text-red-800',
    };

    const handleFilter = (key: string, value: string) => {
        router.get('/notices', { ...filters, [key]: value });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this notice?')) {
            router.delete(`/notices/${id}`);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notices" />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6" />
                            Notices
                        </h1>
                        <p className="text-gray-600 mt-1">Manage school notices and announcements</p>
                    </div>
                    <Link href="/notices/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Notice
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="mb-6 flex gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Filter className="h-4 w-4 inline mr-1" />
                                Type
                            </label>
                            <select
                                value={filters.type || ''}
                                onChange={(e) => handleFilter('type', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                <option value="general">General</option>
                                <option value="academic">Academic</option>
                                <option value="event">Event</option>
                                <option value="holiday">Holiday</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={filters.is_published?.toString() || ''}
                                onChange={(e) => handleFilter('is_published', e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Status</option>
                                <option value="1">Published</option>
                                <option value="0">Draft</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Published
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notices.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No notices found
                                        </td>
                                    </tr>
                                ) : (
                                    notices.data.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">{notice.content}</div>
                                                    {notice.target_audience && notice.target_audience.length > 0 && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Target: {notice.target_audience.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[notice.type]}`}>
                                                    {notice.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[notice.priority]}`}>
                                                    {notice.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${notice.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {notice.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {notice.published_at ? new Date(notice.published_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/notices/${notice.id}/edit`}>
                                                        <Button size="sm" variant="secondary">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDelete(notice.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {notices.last_page > 1 && (
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-700">
                                Showing {(notices.current_page - 1) * notices.per_page + 1} to{' '}
                                {Math.min(notices.current_page * notices.per_page, notices.total)} of {notices.total} results
                            </div>
                            <div className="flex gap-2">
                                {notices.current_page > 1 && (
                                    <Button
                                        variant="secondary"
                                        onClick={() => router.get(`/notices?page=${notices.current_page - 1}`)}
                                    >
                                        Previous
                                    </Button>
                                )}
                                {notices.current_page < notices.last_page && (
                                    <Button
                                        onClick={() => router.get(`/notices?page=${notices.current_page + 1}`)}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
