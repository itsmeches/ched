/**
 * Consistent form section wrapper. Replaces repeated inline
 * `rounded-2xl border ... dark:bg-[#111827]` blocks across Profile,
 * Accounts, and Research forms.
 */
export default function FormSection({
    title,
    description,
    actions = null,
    className = '',
    children,
}) {
    const hasHeader = title || description || actions;
    return (
        <section className={`cris-form-section ${className}`}>
            {hasHeader && (
                <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        {title && <h3 className="cris-form-section-title">{title}</h3>}
                        {description && (
                            <p className="cris-form-section-subtitle">{description}</p>
                        )}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            {children}
        </section>
    );
}
