export default function DangerButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            className={
                'inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ease-in-out hover:bg-red-700 hover:shadow-md active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ' +
                className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
