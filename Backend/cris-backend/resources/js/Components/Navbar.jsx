import { Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Dropdown as AntDropdown } from 'antd';
import { useTheme } from '@/utils/ThemeContext';

export default function Navbar() {
    const page = usePage();
    const { auth, notifications = [] } = page.props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const currentTab = new URLSearchParams((page.url || '').split('?')[1] || '').get('tab');
    const { dark, toggleDark } = useTheme();

    const getRoleLabel = () => {
        switch (user.role) {
            case 'super_admin':
                return 'Admin';
            case 'ched':
                return 'CHED Reviewer';
            case 'hei':
                return 'HEI Researcher';
            case 'faculty':
                return 'Faculty';
            case 'student':
                return 'Student';
            default:
                return 'User';
        }
    };

    const getNavItems = () => {
        const commonItems = [
            {
                label: 'Dashboard',
                href: route('dashboard'),
                activePatterns: ['dashboard', 'admin.dashboard', 'ched.dashboard', 'hei.dashboard', 'faculty.dashboard', 'student.dashboard'],
            },
        ];

        if (user.role === 'super_admin') {
            return [
                ...commonItems,
                { label: 'User Management', href: route('admin.users.index'), activePatterns: ['admin.users.*'] },
                {
                    label: 'Settings',
                    dropdown: true,
                    activePatterns: ['admin.institutions.*', 'admin.keywords.*', 'admin.taxonomy.*'],
                    children: [
                        { label: 'Institutions', href: route('admin.institutions.index'), activePatterns: ['admin.institutions.*'], isLink: true },
                        { label: 'Keywords', href: route('admin.keywords.index'), activePatterns: ['admin.keywords.*'], isLink: true },
                        { label: 'Categories', href: route('admin.taxonomy.categories.index'), activePatterns: ['admin.taxonomy.categories.*'], isLink: true },
                        { label: 'Disciplines', href: route('admin.taxonomy.disciplines.index'), activePatterns: ['admin.taxonomy.disciplines.*'], isLink: true },
                    ],
                },
                { label: 'History', href: route('history.index'), activePatterns: ['history.index'] },
            ];
        }

        if (user.role === 'ched') {
            return [
                ...commonItems,
                { label: 'Create HEI', href: route('accounts.create'), activePatterns: ['accounts.create'] },
                { label: 'Account Hierarchy', href: route('accounts.hierarchy'), activePatterns: ['accounts.hierarchy'] },
                {
                    label: 'Research Queue',
                    href: route('research.index'),
                    activePatterns: ['research.index', 'research.show', 'research.file', 'research.edit', 'research.update', 'research.destroy'],
                },
                { label: 'My Decisions', href: route('ched.decisions'), activePatterns: ['ched.decisions'] },
                { label: 'History', href: route('history.index'), activePatterns: ['history.index'] },
            ];
        }

        if (['hei', 'faculty', 'student'].includes(user.role)) {
            const accountItem = user.role === 'hei'
                ? { label: 'Create Faculty', href: route('accounts.create'), activePatterns: ['accounts.create'] }
                : user.role === 'faculty'
                    ? { label: 'Create Student', href: route('accounts.create'), activePatterns: ['accounts.create'] }
                    : null;

            const hierarchyItem = ['hei', 'faculty'].includes(user.role)
                ? { label: 'Account Hierarchy', href: route('accounts.hierarchy'), activePatterns: ['accounts.hierarchy'] }
                : null;

            const reviewItem = user.role === 'student'
                ? null
                : {
                    label: 'Review Queue',
                    href: route('research.index', { tab: 'queue' }),
                    activePatterns: ['research.index', 'research.review'],
                    tab: 'queue',
                };

            return [
                ...commonItems,
                ...(accountItem ? [accountItem] : []),
                ...(hierarchyItem ? [hierarchyItem] : []),
                ...(reviewItem ? [reviewItem] : []),
                {
                    label: 'My Research',
                    href: route('research.index', { tab: 'mine' }),
                    activePatterns: ['research.index', 'research.show', 'research.edit', 'research.update', 'research.destroy'],
                    tab: 'mine',
                },
                ...(user.role === 'student' ? [{ label: 'Submit Paper', href: route('research.create'), activePatterns: ['research.create', 'research.store'] }] : []),
                { label: 'History', href: route('history.index'), activePatterns: ['history.index'] },
            ];
        }

        return commonItems;
    };

    const navItems = getNavItems();
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifFilter, setNotifFilter] = useState('all');
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatNotifDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getNotificationMeta = (message, type) => {
        const normalizedType = (type || '').toLowerCase();
        const text = (message || '').toLowerCase();

        if (normalizedType === 'edit_permission_request') {
            return {
                label: 'Request',
                filterKey: 'requests',
                badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
            };
        }

        if (normalizedType === 'edit_permission_submitted') {
            return {
                label: 'Request',
                filterKey: 'requests',
                badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
            };
        }

        if (normalizedType === 'edit_permission_approved' || normalizedType === 'edit_permission_denied') {
            return {
                label: 'Decision',
                filterKey: 'decisions',
                badgeClass: normalizedType === 'edit_permission_approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
            };
        }

        if (normalizedType === 'review_action_needed') {
            return {
                label: 'Action Needed',
                filterKey: 'action-needed',
                badgeClass: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
            };
        }

        if (normalizedType === 'research_approved') {
            return {
                label: 'Approved',
                filterKey: 'decisions',
                badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
            };
        }

        if (normalizedType === 'research_rejected') {
            return {
                label: 'Rejected',
                filterKey: 'decisions',
                badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
            };
        }

        if (text.includes('edit permission request')) {
            return {
                label: 'Request',
                filterKey: 'requests',
                badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
            };
        }

        if (text.includes('edit permission') && (text.includes('approved') || text.includes('denied'))) {
            return {
                label: 'Decision',
                filterKey: 'decisions',
                badgeClass: text.includes('approved')
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
            };
        }

        if (text.includes('awaiting your review') || text.includes('waiting for your review')) {
            return {
                label: 'Action Needed',
                filterKey: 'action-needed',
                badgeClass: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
            };
        }

        if (text.includes('approved')) {
            return {
                label: 'Approved',
                filterKey: 'decisions',
                badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200',
            };
        }

        if (text.includes('rejected') || text.includes('denied')) {
            return {
                label: 'Rejected',
                filterKey: 'decisions',
                badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200',
            };
        }

        return {
            label: 'Update',
            filterKey: 'all',
            badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
        };
    };

    const notificationFilterTabs = [
        { key: 'all', label: 'All' },
        { key: 'action-needed', label: 'Action Needed' },
        { key: 'decisions', label: 'Decisions' },
        { key: 'requests', label: 'Requests' },
    ];

    const filteredNotifications = notifications.filter((item) => {
        if (notifFilter === 'all') {
            return true;
        }

        return getNotificationMeta(item.message, item.type).filterKey === notifFilter;
    });

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
        <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#0a0f1e] shadow-sm transition-colors duration-300">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-8">
                        <Link href={route('dashboard')} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
                            <div className="relative">
                                <img src="/cris-mark.svg" alt="CRIS" className="h-8 w-8" />
                            </div>
                            <span className="hidden sm:block font-bold text-slate-900 dark:text-white">CRIS</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map((item) =>
                                item.dropdown ? (
                                    <AntDropdown
                                        key="settings-dropdown"
                                        trigger={['click']}
                                        placement="bottomLeft"
                                        dropdownRender={() => (
                                            <div className="min-w-[192px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-[#1e2d47] dark:bg-[#111827]">
                                                {item.children.map((child) => {
                                                    const childActive = child.activePatterns?.some((p) => route().current(p));
                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                                                                childActive
                                                                    ? 'bg-blue-50 text-blue-900 dark:bg-[#1a2540] dark:text-blue-300'
                                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[#1a2540] dark:hover:text-white'
                                                            }`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    >
                                        <button
                                            type="button"
                                            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                isActive(item)
                                                    ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300 border-b-2'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                            style={isActive(item) ? { borderColor: '#0033a0' } : {}}
                                        >
                                            {item.label}
                                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </AntDropdown>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive(item)
                                                ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300 border-b-2'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        style={isActive(item) ? { borderColor: '#0033a0' } : {}}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </div>
                    </div>

                    {/* Right Section: Theme toggle, Notifications, User Info & Dropdown */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Dark / Light toggle */}
                        <button
                            type="button"
                            onClick={toggleDark}
                            aria-label="Toggle theme"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] text-slate-600 dark:text-yellow-300 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-[#1a2540] focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            {dark ? <SunOutlined /> : <MoonOutlined />}
                        </button>

                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`}
                                onClick={() => setNotifOpen((o) => !o)}
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {notifications.length > 0 && (
                                    <span
                                        className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                                        style={{ background: '#0033a0', lineHeight: 1 }}
                                    >
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] shadow-lg">
                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e2d47] px-4 py-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Notifications
                                            {notifications.length > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold text-white" style={{ background: '#0033a0' }}>
                                                    {notifications.length}
                                                </span>
                                            )}
                                        </span>
                                        {notifications.length > 0 && (
                                            <button
                                                type="button"
                                                className="text-xs font-medium text-[#0033a0] hover:underline dark:text-blue-300"
                                                onClick={() => {
                                                    router.post(route('notifications.read-all'), {}, {
                                                        onSuccess: () => setNotifOpen(false),
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-80 divide-y divide-slate-100 dark:divide-[#1e2d47] overflow-y-auto">
                                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2 dark:border-[#1e2d47] dark:bg-[#111827]">
                                            <div className="flex flex-wrap gap-1">
                                                {notificationFilterTabs.map((tab) => (
                                                    <button
                                                        key={tab.key}
                                                        type="button"
                                                        onClick={() => setNotifFilter(tab.key)}
                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                                            notifFilter === tab.key
                                                                ? 'bg-[#0033a0] text-white'
                                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-[#1a2540] dark:text-slate-200 dark:hover:bg-[#24365d]'
                                                        }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                No new notifications.
                                            </div>
                                        ) : filteredNotifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                No notifications in this filter.
                                            </div>
                                        ) : (
                                            filteredNotifications.map((item) => (
                                                item.link_url ? (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className="w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1a2540]"
                                                        onClick={() => {
                                                            setNotifOpen(false);
                                                            router.post(
                                                                route('notifications.read-one', { id: item.id }),
                                                                { redirect: item.link_url },
                                                                { preserveScroll: false },
                                                            );
                                                        }}
                                                    >
                                                        {(() => {
                                                            const meta = getNotificationMeta(item.message, item.type);
                                                            return (
                                                                <span className={`mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${meta.badgeClass}`}>
                                                                    {meta.label}
                                                                </span>
                                                            );
                                                        })()}
                                                        <p className="whitespace-pre-line text-sm leading-snug text-slate-700 dark:text-slate-200">{item.message}</p>
                                                        <p className="mt-1 text-xs text-[#0033a0] dark:text-blue-300">{formatNotifDate(item.created_at)}</p>
                                                    </button>
                                                ) : (
                                                    <div key={item.id} className="px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a2540]">
                                                        {(() => {
                                                            const meta = getNotificationMeta(item.message, item.type);
                                                            return (
                                                                <span className={`mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${meta.badgeClass}`}>
                                                                    {meta.label}
                                                                </span>
                                                            );
                                                        })()}
                                                        <p className="whitespace-pre-line text-sm leading-snug text-slate-700 dark:text-slate-200">{item.message}</p>
                                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatNotifDate(item.created_at)}</p>
                                                    </div>
                                                )
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="hidden h-9 items-center pl-1 pr-2 sm:flex">
                            <span className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-200">{user.name}</span>
                        </div>

                        {/* User Dropdown */}
                        <AntDropdown
                            trigger={['click']}
                            placement="bottomRight"
                            dropdownRender={() => (
                                <div className="min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="border-b border-slate-200 px-4 py-2 dark:border-[#1e2d47]">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                        <p className="mb-1 text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                        <p className="text-xs font-medium text-[#0033a0] dark:text-blue-300">{getRoleLabel()}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link
                                            href={route('profile.edit')}
                                            className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#1a2540]"
                                        >
                                            Profile Settings
                                        </Link>
                                        <button
                                            type="button"
                                            className="block w-full px-4 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-slate-50 dark:text-rose-400 dark:hover:bg-[#1a2540]"
                                            onClick={() => router.post(route('logout'))}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        >
                            <button
                                type="button"
                                aria-label="Open user menu"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-sm transition-shadow hover:shadow-md"
                                style={{ background: 'linear-gradient(to bottom right, #0047d4, #0033a0)' }}
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                        </AntDropdown>

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-nav-menu"
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-300 dark:hover:bg-[#1a2540] md:hidden"
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
                    <div id="mobile-nav-menu" className="md:hidden border-t border-slate-200 dark:border-[#1e2d47] bg-slate-50 dark:bg-[#0d1526] py-2">
                        <div className="space-y-1">
                            {navItems.map((item) =>
                                item.dropdown ? (
                                    <div key="settings-mobile">
                                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                            {item.label}
                                        </div>
                                        {item.children.map((child) => {
                                                const childActive = child.activePatterns?.some((p) => route().current(p));
                                                const cls = `block pl-7 pr-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                    childActive
                                                        ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300'
                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-white'
                                                }`;
                                                return child.isLink ? (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cls}
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        key={child.href}
                                                        href={child.href}
                                                        className={cls}
                                                        onClick={() => setMenuOpen(false)}
                                                    >
                                                        {child.label}
                                                    </a>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive(item)
                                                ? 'bg-blue-50 dark:bg-[#1a2540] text-blue-900 dark:text-blue-300'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2540] hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </div>
                        <div className="border-t border-slate-200 dark:border-[#1e2d47] mt-2 px-4 py-3">
                            <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">{user.name}</p>
                            <p className="mt-1 text-xs leading-none text-slate-500 dark:text-slate-400 mb-2">{user.email}</p>
                            <Link
                                href={route('profile.edit')}
                                className="block text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white mb-2"
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
