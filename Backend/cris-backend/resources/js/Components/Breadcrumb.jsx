import { Link } from '@inertiajs/react';

export default function Breadcrumb({ items = [] }) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav className="border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 dark:border-[#1e2d47] dark:bg-[#111827]">
            <div className="mx-auto max-w-7xl">
                <ol className="flex flex-wrap items-center gap-2 py-3 text-sm">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        
                        return (
                            <li key={index} className="flex items-center gap-2">
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className={`transition-colors ${
                                            isLast
                                                ? 'font-medium text-[#0033a0] dark:text-blue-300'
                                                : 'text-slate-600 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={`font-medium ${isLast ? 'text-[#0033a0] dark:text-blue-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                        {item.label}
                                    </span>
                                )}
                                
                                {!isLast && (
                                    <svg className="h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </nav>
    );
}
