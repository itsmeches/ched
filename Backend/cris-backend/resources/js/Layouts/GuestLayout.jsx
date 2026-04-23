import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <a
                href="#guest-main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-slate-900"
            >
                Skip to main content
            </a>
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between px-12 py-10 text-white" style={{ background: 'linear-gradient(135deg, #0033a0 0%, #001f66 50%, #1a1a2e 100%)' }}>
                <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <img src="/cris-mark.svg" alt="CRIS" className="h-10 w-10" />
                    <span className="text-xl font-bold tracking-wide">CRIS</span>
                </Link>

                <div>
                    <h1 className="text-4xl font-bold leading-tight">
                        Calabarzon Research<br />
                        <span style={{ color: '#b3d9ff' }}>Information System</span>
                    </h1>
                    <p className="mt-4 text-base max-w-sm leading-relaxed" style={{ color: 'rgba(179, 217, 255, 0.8)' }}>
                        A unified platform for research submission, institutional review, and public discovery across the CALABARZON region.
                    </p>

                   
                </div>

                <p className="text-xs" style={{ color: 'rgba(179, 217, 255, 0.6)' }}>
                    &copy; {new Date().getFullYear()} CHED CALABARZON. All rights reserved.
                </p>
            </div>

            {/* Right form panel */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-slate-50 px-6 py-10">
                {/* Mobile logo */}
                <div className="mb-8 lg:hidden flex items-center gap-3">
                    <img src="/cris-mark.svg" alt="CRIS" className="h-10 w-10" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#0033a0' }}>CRIS</p>
                        <p className="text-sm font-semibold text-slate-900">Calabarzon Research Information System</p>
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
