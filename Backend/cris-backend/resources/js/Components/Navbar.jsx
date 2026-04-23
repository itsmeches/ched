import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Dropdown from './Dropdown';

export default function Navbar() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);

    const getRoleLabel = () => {
        switch (user.role) {
            case 'super_admin':
                return 'Admin';
            case 'ched':
                return 'CHED Reviewer';
            case 'hei':
                return 'HEI Researcher';
            default:
                return 'User';
        }
    };

    const getNavItems = () => {
        const commonItems = [
            {
                label: 'Dashboard',
                href: route('dashboard'),
                activePatterns: ['dashboard', 'admin.dashboard', 'ched.dashboard', 'hei.dashboard'],
            },
        ];

        if (user.role === 'super_admin') {
            return [
                ...commonItems,
                { label: 'User Management', href: route('admin.users.index'), activePatterns: ['admin.users.*'] },
                { label: 'Institutions', href: route('admin.institutions.index'), activePatterns: ['admin.institutions.*'] },
                { label: 'Keywords', href: route('admin.keywords.index'), activePatterns: ['admin.keywords.*'] },
            ];
        }

        if (user.role === 'ched') {
            return [
                ...commonItems,
                {
                    label: 'Research Queue',
                    href: route('research.index'),
                    activePatterns: ['research.index', 'research.show', 'research.file', 'research.edit', 'research.update', 'research.destroy'],
                },
                { label: 'My Decisions', href: route('ched.decisions'), activePatterns: ['ched.decisions'] },
            ];
        }

        if (user.role === 'hei') {
            return [
                ...commonItems,
                {
                    label: 'My Research',
                    href: route('research.index'),
                    activePatterns: ['research.index', 'research.show', 'research.edit', 'research.update', 'research.destroy'],
                },
                { label: 'Submit Paper', href: route('research.create'), activePatterns: ['research.create', 'research.store'] },
            ];
        }

        return commonItems;
    };

    const navItems = getNavItems();
    const isActive = (item) => item.activePatterns?.some((pattern) => route().current(pattern));

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link href={route('dashboard')} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
                            <div className="relative">
                                <img src="/cris-mark.svg" alt="CRIS" className="h-8 w-8" />
                            </div>
                            <span className="hidden sm:block font-bold text-slate-900">CRIS</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(item)
                                            ? 'bg-blue-50 text-blue-900 border-b-2'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                    style={isActive(item) ? { borderColor: '#0033a0' } : {}}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Section: User Info & Dropdown */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-9 items-center px-3">
                            <span className="text-sm font-medium leading-5 text-slate-700">{user.name}</span>
                        </div>

                        {/* User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    aria-label="Open user menu"
                                    aria-haspopup="menu"
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white hover:shadow-md transition-shadow"
                                    style={{ background: 'linear-gradient(to bottom right, #0047d4, #0033a0)' }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content align="right">
                                <div className="px-4 py-2 text-sm text-slate-700 border-b border-slate-200">
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-xs text-slate-500 mb-1">{user.email}</p>
                                    <p className="text-xs font-medium" style={{ color: '#0033a0' }}>{getRoleLabel()}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile Settings
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Sign Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav-menu"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {menuOpen && (
                    <div id="mobile-nav-menu" className="md:hidden border-t border-slate-200 bg-slate-50 py-2">
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive(item)
                                            ? 'bg-blue-50 text-blue-900'
                                            : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                    }`}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="border-t border-slate-200 mt-2 px-4 py-3">
                            <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
                            <p className="mt-1 text-xs leading-none text-slate-500 mb-2">{user.email}</p>
                            <Link
                                href={route('profile.edit')}
                                className="block text-sm text-slate-600 hover:text-slate-900 mb-2"
                            >
                                Profile Settings
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block w-full text-left text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
