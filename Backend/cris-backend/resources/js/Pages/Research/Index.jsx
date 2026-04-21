import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';
import { useState } from 'react';

export default function ResearchIndex({ proposals, filters, canCreate }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilters(e) {
        e.preventDefault();
        router.get(route('research.index'), { search, status }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-gray-800">Research Papers</h2>}>
            <Head title="Research Papers" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Filter bar */}
                    <form onSubmit={applyFilters} className="mb-6 flex flex-wrap gap-3 items-end">
                        <input
                            type="text"
                            placeholder="Search title, author, keyword…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm text-sm w-64"
                        />
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="rounded-md border-gray-300 shadow-sm text-sm"
                        >
                            <option value="">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                            Search
                        </button>
                        {canCreate && (
                            <Link href={route('research.create')} className="ml-auto rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                                + New Paper
                            </Link>
                        )}
                    </form>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Authors</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Year</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Institution</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {proposals.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-400">No research papers found.</td>
                                    </tr>
                                )}
                                {proposals.data.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.authors}</td>
                                        <td className="px-4 py-3 text-gray-600">{p.year}</td>
                                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                                        <td className="px-4 py-3 text-gray-600">{p.institution?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={route('research.show', p.id)} className="text-blue-600 hover:underline text-xs">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {proposals.links && (
                        <div className="mt-4 flex justify-center gap-1">
                            {proposals.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`rounded px-3 py-1 text-xs ${link.active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
