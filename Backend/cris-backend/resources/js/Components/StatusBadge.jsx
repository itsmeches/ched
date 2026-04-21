/** Shared status badge for research proposals */
export const statusColors = {
    draft:        'bg-gray-100 text-gray-700',
    submitted:    'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved:     'bg-green-100 text-green-700',
    rejected:     'bg-red-100 text-red-700',
};

export function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[status] ?? 'bg-gray-100 text-gray-700'}`}>
            {status?.replace('_', ' ')}
        </span>
    );
}
