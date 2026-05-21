import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, error = false, ...props },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const base =
        'block w-full rounded-xl border bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-colors duration-150 dark:bg-[#1a2540] dark:text-white dark:placeholder-slate-500 disabled:cursor-not-allowed disabled:opacity-60 ';
    const borderCls = error
        ? 'border-red-400 dark:border-red-500/70 focus:border-red-500 focus:ring-red-500/40'
        : 'border-slate-300 dark:border-[#2a3a5c] focus:border-[var(--cris-primary)] focus:ring-[var(--cris-primary)]/35';

    return (
        <input
            {...props}
            type={type}
            aria-invalid={error || undefined}
            className={
                base +
                borderCls +
                ' focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-[#0a0f1e] ' +
                className
            }
            ref={localRef}
        />
    );
});
