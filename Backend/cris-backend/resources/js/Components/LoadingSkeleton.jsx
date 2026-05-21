/**
 * Lightweight skeleton placeholder. Use for consistent loading shells
 * in tables, cards, and dashboards.
 *
 * Usage:
 *   <LoadingSkeleton className="h-6 w-40" />
 *   <LoadingSkeleton lines={3} />
 */
export default function LoadingSkeleton({ className = '', lines = 1, gap = 'gap-2' }) {
    if (lines > 1) {
        return (
            <div className={`flex flex-col ${gap}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <span
                        key={i}
                        className={`cris-skeleton h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'} ${className}`}
                    />
                ))}
            </div>
        );
    }
    return <span className={`cris-skeleton h-4 w-full ${className}`} />;
}
