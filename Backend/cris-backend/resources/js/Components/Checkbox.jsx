export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'h-4 w-4 rounded border-slate-300 bg-white text-[var(--cris-primary)] shadow-sm transition-colors focus:ring-[var(--cris-primary)] focus:ring-offset-1 dark:border-[#2a3a5c] dark:bg-[#1a2540] dark:focus:ring-offset-[#0a0f1e] ' +
                className
            }
        />
    );
}
