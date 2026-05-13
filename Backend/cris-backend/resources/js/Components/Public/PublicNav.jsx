import { Link, usePage } from '@inertiajs/react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';

/**
 * Shared sticky glass navbar used across all public-facing pages.
 * Matches the design of the PublicIndex nav bar for consistent UX.
 */
export default function PublicNav({ canLogin, canRegister }) {
    const { auth } = usePage().props;
    const { dark: D, toggleDark } = useTheme();

    return (
        <nav
            className={`sticky top-0 z-40 border-b backdrop-blur-md ${
                D ? 'bg-[#0a0f1e]/90 border-[#1e2d47]' : 'bg-white/90 border-slate-200'
            }`}
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <Link href={route('research.public.index')} className="flex items-center gap-2.5">
                    <img src="/cris-mark.svg" alt="CRIS" className="h-8 w-8 rounded-lg" />
                    <span className={`hidden text-sm font-semibold sm:block ${D ? 'text-white' : 'text-slate-800'}`}>
                        CRIS
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleDark}
                        aria-label="Toggle theme"
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                            D
                                ? 'bg-[#1a2540] text-yellow-300 hover:bg-[#243054]'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {D ? <SunOutlined /> : <MoonOutlined />}
                    </button>

                    {auth?.user ? (
                        <Link href={route('dashboard')}>
                            <button
                                type="button"
                                className="rounded-lg bg-[#0033a0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                                Dashboard
                            </button>
                        </Link>
                    ) : (
                        <>
                            {canLogin && (
                                <Link href={route('login')}>
                                    <button
                                        type="button"
                                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                            D
                                                ? 'text-slate-300 hover:text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Sign In
                                    </button>
                                </Link>
                            )}
                            {canRegister && (
                                <Link href={route('register')}>
                                    <button
                                        type="button"
                                        className="rounded-lg bg-[#0033a0] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                                    >
                                        Submit Research
                                    </button>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
