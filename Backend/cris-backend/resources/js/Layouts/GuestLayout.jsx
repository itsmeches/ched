import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[linear-gradient(180deg,#f8fbfd_0%,#edf4f7_100%)] px-4 py-6 sm:justify-center sm:py-0">
            <div className="mb-6 text-center">
                <Link href="/" className="inline-flex items-center gap-3">
                    <ApplicationLogo className="h-14 w-14 rounded-2xl shadow-sm" />
                    <div className="text-left">
                        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">CRIS</div>
                        <div className="text-lg font-semibold text-slate-900">Calabarzon Research Information System</div>
                    </div>
                </Link>
                <p className="mt-3 max-w-xl text-sm text-slate-600">
                    Secure access for research submission, institutional review, and public discovery.
                </p>
            </div>

            <div className="w-full overflow-hidden rounded-2xl bg-white/95 px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60 backdrop-blur sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
