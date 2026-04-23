export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            style={{ backgroundColor: '#0033a0' }}
            onMouseEnter={(e) => !disabled && (e.target.style.backgroundColor = '#001f66')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#0033a0')}
            className={
                `inline-flex items-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
