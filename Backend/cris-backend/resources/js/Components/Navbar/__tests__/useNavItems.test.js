import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNavItems, getRoleLabel } from '../useNavItems';

describe('useNavItems', () => {
    it('returns dashboard + admin items for super_admin', () => {
        const { result } = renderHook(() => useNavItems({ role: 'super_admin' }));
        const labels = result.current.map((i) => i.label);
        expect(labels).toEqual(['Dashboard', 'User Management', 'Settings', 'History']);
        const settings = result.current.find((i) => i.label === 'Settings');
        expect(settings.dropdown).toBe(true);
        expect(settings.children.map((c) => c.label)).toEqual([
            'Institutions',
            'Keywords',
            'Categories',
            'Disciplines',
        ]);
    });

    it('returns CHED-specific items', () => {
        const { result } = renderHook(() => useNavItems({ role: 'ched' }));
        const labels = result.current.map((i) => i.label);
        expect(labels).toEqual([
            'Dashboard',
            'Create HEI',
            'Account Hierarchy',
            'Research Queue',
            'My Decisions',
            'History',
        ]);
    });

    it('returns HEI items including Review Queue and Create Faculty', () => {
        const { result } = renderHook(() => useNavItems({ role: 'hei' }));
        const labels = result.current.map((i) => i.label);
        expect(labels).toContain('Create Faculty');
        expect(labels).toContain('Account Hierarchy');
        expect(labels).toContain('Review Queue');
        expect(labels).toContain('My Research');
        expect(labels).not.toContain('Submit Paper');
    });

    it('returns Faculty items including Create Student', () => {
        const { result } = renderHook(() => useNavItems({ role: 'faculty' }));
        const labels = result.current.map((i) => i.label);
        expect(labels).toContain('Create Student');
        expect(labels).toContain('Review Queue');
        expect(labels).not.toContain('Submit Paper');
    });

    it('returns Student items including Submit Paper but no Review Queue', () => {
        const { result } = renderHook(() => useNavItems({ role: 'student' }));
        const labels = result.current.map((i) => i.label);
        expect(labels).toContain('Submit Paper');
        expect(labels).toContain('My Research');
        expect(labels).not.toContain('Review Queue');
        expect(labels).not.toContain('Create Faculty');
    });

    it('falls back to common items for unknown role', () => {
        const { result } = renderHook(() => useNavItems({ role: 'mystery' }));
        expect(result.current.map((i) => i.label)).toEqual(['Dashboard']);
    });
});

describe('getRoleLabel', () => {
    it.each([
        ['super_admin', 'Admin'],
        ['ched', 'CHED Reviewer'],
        ['hei', 'HEI Researcher'],
        ['faculty', 'Faculty'],
        ['student', 'Student'],
        ['unknown', 'User'],
    ])('maps %s -> %s', (role, expected) => {
        expect(getRoleLabel(role)).toBe(expected);
    });
});
