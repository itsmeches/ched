import { router, usePage } from '@inertiajs/react';
import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, MoonOutlined, SunOutlined, UserOutlined } from '@ant-design/icons';
import { useTheme } from '@/utils/ThemeContext';
import Dropdown from '@/Components/Dropdown';
import { useEffect, useRef, useState } from 'react';

function getRoleLabel(role) {
    switch (role) {
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
}

export default function Topbar({ title, sidebarCollapsed = false, onToggleSidebar, onOpenMobileSidebar }) {
    const { auth, notifications = [] } = usePage().props;
    const user = auth?.user;
    const { dark, toggleDark } = useTheme();
    const roleLabel = getRoleLabel(user?.role);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatNotifDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <header className="sticky top-0 z-20 min-h-[76px] border-b border-slate-200/80 bg-gradient-to-r from-white/95 via-slate-50/95 to-white/95 px-3 py-2 backdrop-blur-sm dark:border-[#1e2d47] dark:from-[#111827]/95 dark:via-[#0f172a]/95 dark:to-[#111827]/95 sm:px-6 sm:py-0 lg:px-8">
            <div className="flex min-h-[60px] items-start justify-between gap-3 sm:min-h-[76px] sm:items-center">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <button
                        type="button"
                        onClick={onOpenMobileSidebar}
                        className="inline-flex rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1a2540] lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <MenuUnfoldOutlined />
                    </button>

                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1a2540] lg:inline-flex"
                        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </button>

                    <div className="min-w-0">
                        {title ? (
                            <div className="min-w-0">{title}</div>
                        ) : (
                            <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-white">Dashboard</h1>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleDark}
                        aria-label="Toggle theme"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-[#1a2540] dark:text-yellow-300 dark:hover:bg-[#243054]"
                    >
                        {dark ? <SunOutlined /> : <MoonOutlined />}
                    </button>

                    <div className="relative" ref={notifRef}>
                            <button
                                type="button"
                                aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`}
                                className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-[#1a2540] dark:text-slate-200 dark:hover:bg-[#243054]"
                                onClick={() => setNotifOpen((open) => !open)}
                            >
                                <BellOutlined />
                                {notifications.length > 0 && (
                                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#0033a0] px-1 text-center text-[11px] font-semibold text-white">
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-[#1e2d47] dark:bg-[#111827]">
                                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#1e2d47]">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Notifications
                                            {notifications.length > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#0033a0] px-1.5 py-0.5 text-xs font-bold text-white">
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
                                                        preserveScroll: true,
                                                        onSuccess: () => setNotifOpen(false),
                                                    });
                                                }}
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-[#1e2d47]">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                                No new notifications.
                                            </div>
                                        ) : (
                                            notifications.map((item) => (
                                                item.link_url ? (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className="w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1a2540]"
                                                        onClick={() => {
                                                            setNotifOpen(false);
                                                            router.post(
                                                                route('notifications.read-one', { id: item.id }),
                                                                { redirect: item.link_url },
                                                                { preserveScroll: false },
                                                            );
                                                        }}
                                                    >
                                                        <p className="text-sm leading-snug text-slate-700 dark:text-slate-200">{item.message}</p>
                                                        <p className="mt-1 text-xs text-[#0033a0] dark:text-blue-300">{formatNotifDate(item.created_at)}</p>
                                                    </button>
                                                ) : (
                                                    <div key={item.id} className="px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a2540]">
                                                        <p className="text-sm leading-snug text-slate-700 dark:text-slate-200">{item.message}</p>
                                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{formatNotifDate(item.created_at)}</p>
                                                    </div>
                                                )
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-[#2a3a5c] dark:bg-[#0d1526] dark:text-slate-200 dark:hover:bg-[#1a2540]"
                                aria-label="Open user menu"
                            >
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0033a0] text-xs font-semibold text-white">
                                    {user?.name?.charAt(0)?.toUpperCase() || <UserOutlined />}
                                </span>
                                <span className="hidden max-w-28 truncate sm:inline">{user?.name || 'User'}</span>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right">
                            <div className="border-b border-slate-200 px-4 py-2 text-sm text-slate-700 dark:border-[#1e2d47] dark:text-slate-300">
                                <p className="font-semibold dark:text-white">{user?.name || 'User'}</p>
                                <p className="mb-1 truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || ''}</p>
                                <p className="text-xs font-medium text-[#0033a0] dark:text-blue-300">{roleLabel}</p>
                            </div>
                            <Dropdown.Link href={route('profile.edit')}>Profile Settings</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">Sign Out</Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}
