export default function InputLabel({
    value,
    className = '',
    required = false,
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={'block text-sm font-medium text-slate-700 dark:text-slate-300 ' + className}
        >
            {value ? value : children}
            {required && (
                <span aria-hidden="true" className="ml-0.5 text-red-500">
                    *
                </span>
            )}
        </label>
    );
}
