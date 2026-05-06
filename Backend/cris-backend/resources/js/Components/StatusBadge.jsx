/** Shared status badge for research proposals */
export const statusColors = {
    draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    under_review_faculty: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    under_review_hei: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
    under_review_ched: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
    approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
};

const statusLabels = {
    under_review_faculty: 'Under Review (Faculty)',
    under_review_hei: 'Under Review (HEI)',
    under_review_ched: 'Under Review (CHED)',
    needs_revision: 'Needs Revision',
};

export function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[status] ?? 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-200'}`}>
            {statusLabels[status] ?? status?.replaceAll('_', ' ')}
        </span>
    );
}
