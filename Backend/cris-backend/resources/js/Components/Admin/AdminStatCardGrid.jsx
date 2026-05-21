export default function AdminStatCardGrid({ items, activeKey, onSelect }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {items.map((item) => {
                const isActive = activeKey === item.key;

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelect(item.key)}
                        className={`w-full rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                            isActive
                                ? 'border-[#0033a0]/30 bg-blue-50 ring-1 ring-[#0033a0]/15 dark:border-blue-500/40 dark:bg-[#1a2540] dark:ring-blue-500/25'
                                : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-[#1e2d47] dark:bg-[#111827] dark:hover:border-[#3b5ba5]'
                        }`}
                    >
                        <div
                            className={`mb-2 text-[11px] font-bold uppercase tracking-wider truncate ${
                                isActive
                                    ? 'text-[#0033a0] dark:text-blue-300'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {item.label}
                        </div>
                        <div
                            className="text-2xl font-bold leading-none"
                            style={{ color: item.color }}
                        >
                            {(item.count ?? 0).toLocaleString()}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
