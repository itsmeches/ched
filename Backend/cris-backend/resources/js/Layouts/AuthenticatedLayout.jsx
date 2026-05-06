import { useEffect, useState } from 'react';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';

const SIDEBAR_STORAGE_KEY = 'cris_sidebar_collapsed';

export default function AuthenticatedLayout({ header, children, showHeader = true }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? 'true' : 'false');
        } catch {
            // localStorage unavailable — silently ignore
        }
    }, [sidebarCollapsed]);

    return (
        <div className="h-screen overflow-hidden bg-slate-100 dark:bg-[#0a0f1e] transition-colors duration-300">
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_520px_at_88%_-10%,rgba(56,189,248,0.12),transparent_60%),radial-gradient(900px_460px_at_5%_100%,rgba(59,130,246,0.12),transparent_60%)] dark:bg-[radial-gradient(1200px_520px_at_88%_-10%,rgba(14,165,233,0.16),transparent_60%),radial-gradient(900px_460px_at_5%_100%,rgba(37,99,235,0.16),transparent_60%)]" />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white dark:focus:bg-[#111827] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 dark:focus:text-white"
            >
                Skip to main content
            </a>
            <div className="flex h-full">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    mobileOpen={mobileSidebarOpen}
                    onCloseMobile={() => setMobileSidebarOpen(false)}
                />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Topbar
                        title={showHeader ? header : null}
                        sidebarCollapsed={sidebarCollapsed}
                        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
                        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                    />

                    <main id="main-content" tabIndex={-1} className="main-scroll flex-1 overflow-y-auto px-3 py-5 sm:px-5 sm:py-6 lg:px-7 lg:py-7">
                        <div className="mx-auto w-full max-w-[1700px]">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
