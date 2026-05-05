export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-lg border border-transparent bg-[#0033a0] px-4 py-2 text-sm font-semibold text-white shadow-sm transition duration-150 ease-in-out hover:bg-[#001f66] focus:outline-none focus:ring-2 focus:ring-[#0033a0]/45 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-blue-400/60 dark:focus:ring-offset-[#111827] ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
