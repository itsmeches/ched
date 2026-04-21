import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { StatusBadge } from '@/Components/StatusBadge';

export default function ResearchShow({ proposal, canEdit, canReview }) {
    const reviewForm = useForm({ action: '', comments: '' });

    function submitReview(action) {
        reviewForm.setData('action', action);
        reviewForm.post(route('research.review', proposal.id));
    }

    function submitPaper() {
        router.post(route('research.submit', proposal.id));
    }

    return (
        <AuthenticatedLayout header={
            <div className="flex items-center gap-4">
                <Link href={route('research.index')} className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
                <h2 className="text-xl font-semibold text-gray-800 truncate">{proposal.title}</h2>
                <StatusBadge status={proposal.status} />
            </div>
        }>
            <Head title={proposal.title} />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Main card */}
                    <div className="rounded-lg bg-white p-8 shadow space-y-4">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                            <div><dt className="font-medium text-gray-500">Authors</dt><dd className="mt-1">{proposal.authors}</dd></div>
                            {proposal.co_authors && <div><dt className="font-medium text-gray-500">Co-Authors</dt><dd className="mt-1">{proposal.co_authors}</dd></div>}
                            <div><dt className="font-medium text-gray-500">School</dt><dd className="mt-1">{proposal.school}</dd></div>
                            <div><dt className="font-medium text-gray-500">Year</dt><dd className="mt-1">{proposal.year}</dd></div>
                            <div><dt className="font-medium text-gray-500">Category</dt><dd className="mt-1">{proposal.category}</dd></div>
                            {proposal.keywords && <div><dt className="font-medium text-gray-500">Keywords</dt><dd className="mt-1">{proposal.keywords}</dd></div>}
                            <div><dt className="font-medium text-gray-500">Institution</dt><dd className="mt-1">{proposal.institution?.name ?? '—'}</dd></div>
                            <div><dt className="font-medium text-gray-500">Submitted by</dt><dd className="mt-1">{proposal.submitter?.name ?? '—'}</dd></div>
                        </dl>

                        <div>
                            <dt className="font-medium text-gray-500 text-sm">Abstract</dt>
                            <dd className="mt-2 text-sm text-gray-700 whitespace-pre-line">{proposal.abstract}</dd>
                        </div>

                        {proposal.file_path && (
                            <div>
                                <a
                                    href={`/storage/${proposal.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                                >
                                    📄 View PDF
                                </a>
                            </div>
                        )}

                        {/* HEI actions */}
                        {canEdit && (
                            <div className="flex gap-3 pt-2">
                                <Link href={route('research.edit', proposal.id)} className="rounded-md bg-yellow-50 px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-100">
                                    Edit
                                </Link>
                                {proposal.status === 'draft' && (
                                    <button onClick={submitPaper} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                                        Submit for Review
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reviewer's past comments */}
                    {proposal.comments && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
                            <h3 className="font-medium text-yellow-800 text-sm mb-2">Reviewer Comments</h3>
                            <p className="text-sm text-yellow-700 whitespace-pre-line">{proposal.comments}</p>
                            {proposal.reviewer && <p className="mt-2 text-xs text-yellow-600">— {proposal.reviewer.name}</p>}
                        </div>
                    )}

                    {/* CHED review panel */}
                    {canReview && ['submitted', 'under_review'].includes(proposal.status) && (
                        <div className="rounded-lg bg-white p-8 shadow space-y-4">
                            <h3 className="font-semibold text-gray-800">Review Decision</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Comments (optional)</label>
                                <textarea
                                    rows={4}
                                    className="w-full rounded-md border-gray-300 shadow-sm text-sm"
                                    value={reviewForm.data.comments}
                                    onChange={e => reviewForm.setData('comments', e.target.value)}
                                    placeholder="Provide feedback to the researcher…"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => submitReview('approve')}
                                    disabled={reviewForm.processing}
                                    className="rounded-md bg-green-600 px-6 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    onClick={() => submitReview('reject')}
                                    disabled={reviewForm.processing}
                                    className="rounded-md bg-red-600 px-6 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
