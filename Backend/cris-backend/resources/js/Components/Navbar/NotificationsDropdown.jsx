import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import {
    formatNotifDate,
    getNotificationMeta,
    NOTIFICATION_FILTER_TABS,
    useNotifications,
} from './useNotifications';

export default function NotificationsDropdown({ notifications }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const { filter, setFilter, filtered } = useNotifications(notifications);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`}
                onClick={() => setOpen((o) => !o)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-[#1a2540] hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
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

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 dark:border-[#1e2d47] bg-white dark:bg-[#111827] shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1e2d47] px-4 py-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            Notifications
                            {notifications.length > 0 && (
                                <span
                                    className="ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
                                    style={{ background: '#0033a0' }}
                                >
                                    {notifications.length}
                                </span>
                            )}
                        </span>
                        {notifications.length > 0 && (
                            <button
                                type="button"
                                className="text-xs font-medium text-[#0033a0] hover:underline dark:text-blue-300"
                                onClick={() => {
                                    router.post(
                                        route('notifications.read-all'),
                                        {},
                                        {
                                            onSuccess: () => setOpen(false),
                                            preserveScroll: true,
                                        }
                                    );
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 divide-y divide-slate-100 dark:divide-[#1e2d47] overflow-y-auto">
                        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2 dark:border-[#1e2d47] dark:bg-[#111827]">
                            <div className="flex flex-wrap gap-1">
                                {NOTIFICATION_FILTER_TABS.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setFilter(tab.key)}
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                                            filter === tab.key
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
                        ) : filtered.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                No notifications in this filter.
                            </div>
                        ) : (
                            filtered.map((item) => {
                                const meta = getNotificationMeta(item.message, item.type);
                                const Badge = (
                                    <span
                                        className={`mb-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${meta.badgeClass}`}
                                    >
                                        {meta.label}
                                    </span>
                                );

                                if (item.link_url) {
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="w-full cursor-pointer px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-[#1a2540]"
                                            onClick={() => {
                                                setOpen(false);
                                                router.post(
                                                    route('notifications.read-one', {
                                                        id: item.id,
                                                    }),
                                                    { redirect: item.link_url },
                                                    { preserveScroll: false }
                                                );
                                            }}
                                        >
                                            {Badge}
                                            <p className="whitespace-pre-line text-sm leading-snug text-slate-700 dark:text-slate-200">
                                                {item.message}
                                            </p>
                                            <p className="mt-1 text-xs text-[#0033a0] dark:text-blue-300">
                                                {formatNotifDate(item.created_at)}
                                            </p>
                                        </button>
                                    );
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a2540]"
                                    >
                                        {Badge}
                                        <p className="whitespace-pre-line text-sm leading-snug text-slate-700 dark:text-slate-200">
                                            {item.message}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            {formatNotifDate(item.created_at)}
                                        </p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
