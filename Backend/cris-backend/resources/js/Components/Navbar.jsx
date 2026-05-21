import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';
import DesktopNav from '@/Components/Navbar/DesktopNav';
import MobileNav from '@/Components/Navbar/MobileNav';
import NotificationsDropdown from '@/Components/Navbar/NotificationsDropdown';
import UserMenu from '@/Components/Navbar/UserMenu';
import { useNavItems } from '@/Components/Navbar/useNavItems';

export default function Navbar() {
    const page = usePage();
    const { auth, notifications = [] } = page.props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const currentTab = new URLSearchParams((page.url || '').split('?')[1] || '').get('tab');
    const { dark, toggleDark } = useTheme();

    const navItems = useNavItems(user);

    const isActive = (item) => {
        if (item.tab && route().current('research.index')) {
            return currentTab === item.tab;
        }
        if (item.dropdown) {
            return item.activePatterns?.some((pattern) => route().current(pattern));
        }
        return item.activePatterns?.some((pattern) => route().current(pattern));
    };

    return (
        <nav
            aria-label="Primary navigation"
            className="sticky top-0 z-50 border-b border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#0a0f1e] shadow-sm transition-colors duration-300"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
                        >
                            <div className="relative">
                                <img src="/cris-mark.svg" alt="CRIS" className="h-8 w-8" />
                            </div>
                            <span className="hidden sm:block font-bold text-slate-900 dark:text-white">
                                CRIS
                            </span>
                        </Link>

                        <DesktopNav items={navItems} isActive={isActive} />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={toggleDark}
                            aria-label="Toggle theme"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] text-slate-600 dark:text-yellow-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-[#1a2540] focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            {dark ? <SunOutlined /> : <MoonOutlined />}
                        </button>

                        <NotificationsDropdown notifications={notifications} />

                        <div className="hidden h-9 items-center pl-1 pr-2 sm:flex">
                            <span className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-200">
                                {user.name}
                            </span>
                        </div>

                        <UserMenu user={user} />

                        <button
                            type="button"
                            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav-menu"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-300 dark:hover:bg-[#1a2540] md:hidden"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {menuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <MobileNav
                        items={navItems}
                        user={user}
                        isActive={isActive}
                        onClose={() => setMenuOpen(false)}
                    />
                )}
            </div>
        </nav>
    );
}
