import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
    formatNotifDate,
    getNotificationMeta,
    NOTIFICATION_FILTER_TABS,
    useNotifications,
} from '../useNotifications';

describe('getNotificationMeta', () => {
    it('classifies edit_permission_request as Request', () => {
        expect(getNotificationMeta('', 'edit_permission_request').label).toBe('Request');
    });

    it('classifies edit_permission_approved as Decision (approved badge)', () => {
        const meta = getNotificationMeta('', 'edit_permission_approved');
        expect(meta.label).toBe('Decision');
        expect(meta.filterKey).toBe('decisions');
    });

    it('classifies review_action_needed as Action Needed', () => {
        expect(getNotificationMeta('', 'review_action_needed').filterKey).toBe('action-needed');
    });

    it('falls back to text-based detection for missing type', () => {
        expect(getNotificationMeta('Edit permission request from Alice').label).toBe('Request');
        expect(getNotificationMeta('Awaiting your review').filterKey).toBe('action-needed');
        expect(getNotificationMeta('Your paper has been approved').label).toBe('Approved');
        expect(getNotificationMeta('Your paper has been rejected').label).toBe('Rejected');
    });

    it('returns Update for fully unmatched messages', () => {
        expect(getNotificationMeta('hello world').label).toBe('Update');
    });
});

describe('formatNotifDate', () => {
    it('returns empty string for nullish input', () => {
        expect(formatNotifDate('')).toBe('');
        expect(formatNotifDate(null)).toBe('');
    });

    it('formats a valid ISO date to a human string', () => {
        const result = formatNotifDate('2026-05-21T10:30:00Z');
        expect(result).toMatch(/2026/);
        expect(result.length).toBeGreaterThan(5);
    });
});

describe('useNotifications', () => {
    const sample = [
        { id: 1, message: 'Awaiting your review', type: 'review_action_needed' },
        { id: 2, message: 'Approved', type: 'research_approved' },
        { id: 3, message: 'Edit permission request from Alice', type: 'edit_permission_request' },
    ];

    it('starts with all filter and returns all items', () => {
        const { result } = renderHook(() => useNotifications(sample));
        expect(result.current.filter).toBe('all');
        expect(result.current.filtered).toHaveLength(3);
    });

    it('filters by action-needed', () => {
        const { result } = renderHook(() => useNotifications(sample));
        act(() => result.current.setFilter('action-needed'));
        expect(result.current.filtered).toHaveLength(1);
        expect(result.current.filtered[0].id).toBe(1);
    });

    it('filters by decisions', () => {
        const { result } = renderHook(() => useNotifications(sample));
        act(() => result.current.setFilter('decisions'));
        expect(result.current.filtered.map((i) => i.id)).toEqual([2]);
    });

    it('filters by requests', () => {
        const { result } = renderHook(() => useNotifications(sample));
        act(() => result.current.setFilter('requests'));
        expect(result.current.filtered.map((i) => i.id)).toEqual([3]);
    });

    it('exposes the canonical filter tabs', () => {
        expect(NOTIFICATION_FILTER_TABS.map((t) => t.key)).toEqual([
            'all',
            'action-needed',
            'decisions',
            'requests',
        ]);
    });
});
