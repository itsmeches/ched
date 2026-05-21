import { useMemo, useState } from 'react';

export const NOTIFICATION_FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'action-needed', label: 'Action Needed' },
    { key: 'decisions', label: 'Decisions' },
    { key: 'requests', label: 'Requests' },
];

const REQUEST_BADGE = 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200';
const APPROVED_BADGE =
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200';
const REJECTED_BADGE = 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200';
const ACTION_NEEDED_BADGE = 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200';
const DEFAULT_BADGE = 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200';

export function getNotificationMeta(message, type) {
    const normalizedType = (type || '').toLowerCase();
    const text = (message || '').toLowerCase();

    if (
        normalizedType === 'edit_permission_request' ||
        normalizedType === 'edit_permission_submitted'
    ) {
        return { label: 'Request', filterKey: 'requests', badgeClass: REQUEST_BADGE };
    }

    if (
        normalizedType === 'edit_permission_approved' ||
        normalizedType === 'edit_permission_denied'
    ) {
        return {
            label: 'Decision',
            filterKey: 'decisions',
            badgeClass:
                normalizedType === 'edit_permission_approved' ? APPROVED_BADGE : REJECTED_BADGE,
        };
    }

    if (normalizedType === 'review_action_needed') {
        return {
            label: 'Action Needed',
            filterKey: 'action-needed',
            badgeClass: ACTION_NEEDED_BADGE,
        };
    }

    if (normalizedType === 'research_approved') {
        return { label: 'Approved', filterKey: 'decisions', badgeClass: APPROVED_BADGE };
    }

    if (normalizedType === 'research_rejected') {
        return { label: 'Rejected', filterKey: 'decisions', badgeClass: REJECTED_BADGE };
    }

    if (text.includes('edit permission request')) {
        return { label: 'Request', filterKey: 'requests', badgeClass: REQUEST_BADGE };
    }

    if (
        text.includes('edit permission') &&
        (text.includes('approved') || text.includes('denied'))
    ) {
        return {
            label: 'Decision',
            filterKey: 'decisions',
            badgeClass: text.includes('approved') ? APPROVED_BADGE : REJECTED_BADGE,
        };
    }

    if (text.includes('awaiting your review') || text.includes('waiting for your review')) {
        return {
            label: 'Action Needed',
            filterKey: 'action-needed',
            badgeClass: ACTION_NEEDED_BADGE,
        };
    }

    if (text.includes('approved')) {
        return { label: 'Approved', filterKey: 'decisions', badgeClass: APPROVED_BADGE };
    }

    if (text.includes('rejected') || text.includes('denied')) {
        return { label: 'Rejected', filterKey: 'decisions', badgeClass: REJECTED_BADGE };
    }

    return { label: 'Update', filterKey: 'all', badgeClass: DEFAULT_BADGE };
}

export function formatNotifDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function useNotifications(notifications) {
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(
        () =>
            notifications.filter((item) => {
                if (filter === 'all') return true;
                return getNotificationMeta(item.message, item.type).filterKey === filter;
            }),
        [notifications, filter]
    );

    return { filter, setFilter, filtered };
}
