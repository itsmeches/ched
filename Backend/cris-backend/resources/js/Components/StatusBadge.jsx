/** Shared status badge for research proposals */
export const statusColors = {
    pending:      'bg-amber-100 text-amber-700',
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
