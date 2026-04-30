export default function AdminStatCardGrid({ items, activeKey, onSelect }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {items.map((item) => {
                const isActive = activeKey === item.key;

                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => onSelect(item.key)}
                        className={`w-full rounded-xl border px-3.5 py-3 text-left transition-all ${
                            isActive
                                ? 'border-slate-300 bg-white shadow-sm'
                                : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white'
                        }`}
                    >
                        <div className="text-[13px] font-semibold text-slate-900">{item.label}</div>
                        <div className="mt-2 text-[26px] font-semibold leading-none" style={{ color: item.color }}>
                            {item.count}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
