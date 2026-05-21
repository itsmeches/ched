/** Shared status badge for research proposals */
export const statusColors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    under_review_faculty: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    under_review_hei: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
    under_review_ched: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
};

const statusDotColors = {
    draft: 'bg-slate-400',
    submitted: 'bg-amber-500',
    under_review_faculty: 'bg-amber-500',
    under_review_hei: 'bg-indigo-500',
    under_review_ched: 'bg-cyan-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    needs_revision: 'bg-orange-500',
};

const statusLabels = {
    under_review_faculty: 'Under Review (Faculty)',
    under_review_hei: 'Under Review (HEI)',
    under_review_ched: 'Under Review (CHED)',
    needs_revision: 'Needs Revision',
};

export function StatusBadge({ status }) {
    const cls =
        statusColors[status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200';
    const dot = statusDotColors[status] ?? 'bg-slate-400';
    const label = statusLabels[status] ?? status?.replaceAll('_', ' ');
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
            aria-label={`Status: ${label}`}
        >
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
}
