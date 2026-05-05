import Navbar from '@/Components/Navbar';

export default function AuthenticatedLayout({ header, children, showHeader = true }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] transition-colors duration-300">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white dark:focus:bg-[#111827] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 dark:focus:text-white"
            >
                Skip to main content
            </a>
            <Navbar />

            {showHeader && header && (
                <header className="bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-[#1e2d47] sticky top-[57px] z-30">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
                        <div className="w-[3px] h-6 rounded-full bg-[#0033a0] dark:bg-blue-400 flex-shrink-0" />
                        {header}
                    </div>
                </header>
            )}

            <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>
        </div>
    );
}
