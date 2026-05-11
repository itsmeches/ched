export default function PrimaryButton({
    className = '',
    disabled,
    loading = false,
    children,
    ...props
}) {
    const isDisabled = disabled || loading;
    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-[var(--cris-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-[var(--cris-primary-dark)] hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--cris-primary)] disabled:hover:shadow-sm ' +
                className
            }
            disabled={isDisabled}
            aria-busy={loading || undefined}
        >
            {loading && (
                <span
                    aria-hidden="true"
                    className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
            )}
            {children}
        </button>
    );
}
