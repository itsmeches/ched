import ResearchTimeline from '../ResearchTimeline';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({}));

const sampleHistory = [
    {
        id: 1,
        action: 'submitted',
        role: 'student',
        actor_name: 'Alice',
        created_at: '2026-01-10T10:00:00Z',
        remarks: null,
    },
    {
        id: 2,
        action: 'approved',
        role: 'faculty',
        actor_name: 'Prof Bob',
        created_at: '2026-01-11T09:00:00Z',
        remarks: 'Looks good',
    },
    {
        id: 3,
        action: 'approved',
        role: 'faculty',
        actor_name: 'Prof Bob',
        created_at: '2026-01-11T11:00:00Z',
        remarks: null,
    },
];

describe('ResearchTimeline', () => {
    it('renders empty state when no history', () => {
        renderWithProviders(<ResearchTimeline researchHistory={[]} />);
        expect(screen.getByText('No timeline entries yet.')).toBeVisible();
    });

    it('renders grouped entries with count tag for repeats on same day', () => {
        renderWithProviders(<ResearchTimeline researchHistory={sampleHistory} />);
        expect(screen.getByText('Submitted')).toBeVisible();
        expect(screen.getByText('Approved')).toBeVisible();
        expect(screen.getByText('x2')).toBeVisible();
    });

    it('toggles between grouped and raw views', async () => {
        const user = userEvent.setup();
        renderWithProviders(<ResearchTimeline researchHistory={sampleHistory} />);

        expect(screen.getByRole('button', { name: 'Show Raw' })).toBeVisible();
        await user.click(screen.getByRole('button', { name: 'Show Raw' }));
        expect(screen.getByRole('button', { name: 'Show Grouped' })).toBeVisible();
        expect(screen.queryByText('x2')).not.toBeInTheDocument();
    });

    it('renders mixed action and role tags', () => {
        renderWithProviders(<ResearchTimeline researchHistory={sampleHistory} />);
        expect(screen.getByText('STUDENT')).toBeVisible();
        expect(screen.getByText('FACULTY')).toBeVisible();
    });
});
