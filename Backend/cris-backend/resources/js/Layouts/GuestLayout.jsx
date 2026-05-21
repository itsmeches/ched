import { Link } from '@inertiajs/react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';

export default function GuestLayout({ children }) {
    const { dark, toggleDark } = useTheme();

    return (
        <div className="flex min-h-screen transition-colors duration-300">
            <a
                href="#guest-main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white dark:focus:bg-[#111827] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900 dark:focus:text-white"
            >
                Skip to main content
            </a>
            {/* Left branding panel */}
            <div
                className="hidden lg:flex lg:w-1/2 flex-col justify-between px-12 py-10 text-white"
                style={{
                    background: 'linear-gradient(135deg, #0033a0 0%, #001f66 50%, #1a1a2e 100%)',
                }}
            >
                <Link
                    href="/"
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                    <img src="/cris-mark.svg" alt="CRIS" className="h-10 w-10" />
                    <span className="text-xl font-bold tracking-wide">CRIS</span>
                </Link>

                <div>
                    <h1 className="text-4xl font-bold leading-tight">
                        Calabarzon Research
                        <br />
                        <span style={{ color: '#b3d9ff' }}>Information System</span>
                    </h1>
                    <p
                        className="mt-4 text-base max-w-sm leading-relaxed"
                        style={{ color: 'rgba(179, 217, 255, 0.8)' }}
                    >
                        A unified platform for research submission, institutional review, and public
                        discovery across the CALABARZON region.
                    </p>
                </div>

                <p className="text-xs" style={{ color: 'rgba(179, 217, 255, 0.6)' }}>
                    &copy; {new Date().getFullYear()} CHED CALABARZON. All rights reserved.
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-slate-50 dark:bg-[#0a0f1e] px-6 py-10 relative transition-colors duration-300">
                {/* Dark mode toggle — top right */}
                <button
                    type="button"
                    onClick={toggleDark}
                    aria-label="Toggle theme"
                    className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg transition-colors bg-slate-100 dark:bg-[#1a2540] text-slate-600 dark:text-yellow-300 hover:bg-slate-200 dark:hover:bg-[#243054]"
                >
                    {dark ? <SunOutlined /> : <MoonOutlined />}
                </button>

                {/* Mobile logo */}
                <div className="mb-8 lg:hidden flex items-center gap-3">
                    <img src="/cris-mark.svg" alt="CRIS" className="h-10 w-10" />
                    <div>
                        <p
                            className="text-xs font-semibold uppercase tracking-widest"
                            style={{ color: '#0033a0' }}
                        >
                            CRIS
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            Calabarzon Research Information System
                        </p>
                    </div>
                </div>

                <main id="guest-main-content" tabIndex={-1} className="w-full max-w-sm">
                    {children}
                </main>

                <p className="mt-8 text-xs text-slate-400 lg:hidden">
                    &copy; {new Date().getFullYear()} CHED CALABARZON
                </p>
            </div>
        </div>
    );
}
