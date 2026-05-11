/**
 * Consistent stat / KPI card used across dashboards.
 * Drop-in replacement for the various ad-hoc stat tiles in Pages/Dashboard.
 */
export default function StatCard({
    label,
    value,
    delta,
    deltaTone = 'neutral', // 'positive' | 'negative' | 'neutral'
    icon = null,
    accent,
    loading = false,
    className = '',
}) {
    const deltaToneCls =
        deltaTone === 'positive'
            ? 'text-emerald-600 dark:text-emerald-400'
            : deltaTone === 'negative'
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-500 dark:text-slate-400';

    return (
        <div className={`cris-stat-card flex items-start gap-4 ${className}`}>
            {icon && (
                <div
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{
                        background: accent ? `${accent}1f` : 'var(--cris-primary-soft)',
                        color: accent || 'var(--cris-primary)',
                    }}
                >
                    {icon}
                </div>
            )}
            <div className="min-w-0 flex-1">
                <div className="cris-stat-label truncate">{label}</div>
                {loading ? (
                    <div className="cris-skeleton mt-2 h-7 w-24" />
                ) : (
                    <div className="cris-stat-value mt-1">{value}</div>
                )}
                {delta != null && !loading && (
                    <div className={`cris-stat-delta mt-1 ${deltaToneCls}`}>{delta}</div>
                )}
            </div>
        </div>
    );
}
