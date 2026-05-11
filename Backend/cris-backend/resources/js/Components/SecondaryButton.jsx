export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 ease-in-out hover:bg-slate-50 hover:border-slate-400 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2a3a5c] dark:bg-[#111827] dark:text-slate-200 dark:hover:bg-[#1a2540] dark:hover:border-[#3b5ba5] ' +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
