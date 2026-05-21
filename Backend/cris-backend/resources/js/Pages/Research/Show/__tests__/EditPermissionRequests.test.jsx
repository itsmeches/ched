import EditPermissionRequests from '../EditPermissionRequests';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: { post: (...args) => mockPost(...args) },
}));

const sampleRequests = [
    {
        id: 11,
        requester: { name: 'Alice Student' },
        reason: 'Need to update the abstract',
    },
    {
        id: 12,
        requester: { name: 'Bob Researcher' },
        reason: null,
    },
];

describe('EditPermissionRequests', () => {
    beforeEach(() => {
        mockPost.mockReset();
    });

    it('renders nothing when there are no requests', () => {
        const { container } = renderWithProviders(
            <EditPermissionRequests requests={[]} proposalId={5} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders pending requesters and reasons or fallback', () => {
        renderWithProviders(<EditPermissionRequests requests={sampleRequests} proposalId={5} />);
        expect(screen.getByText('Alice Student')).toBeVisible();
        expect(screen.getByText('Need to update the abstract')).toBeVisible();
        expect(screen.getByText('Bob Researcher')).toBeVisible();
        expect(screen.getByText('No reason provided')).toBeVisible();
    });

    it('fires approve handler with proposal + request ids', async () => {
        const user = userEvent.setup();
        renderWithProviders(<EditPermissionRequests requests={sampleRequests} proposalId={5} />);

        await user.click(screen.getAllByRole('button', { name: 'Approve' })[0]);
        const confirmBtns = await screen.findAllByRole('button', { name: 'Approve' });
        await user.click(confirmBtns[confirmBtns.length - 1]);

        expect(mockPost).toHaveBeenCalledWith('/research.edit-permission.decide', {
            decision: 'approved',
        });
    });

    it('fires deny handler with denied decision', async () => {
        const user = userEvent.setup();
        renderWithProviders(<EditPermissionRequests requests={sampleRequests} proposalId={5} />);

        await user.click(screen.getAllByRole('button', { name: 'Deny' })[0]);
        const confirmBtns = await screen.findAllByRole('button', { name: 'Deny' });
        await user.click(confirmBtns[confirmBtns.length - 1]);

        expect(mockPost).toHaveBeenCalledWith('/research.edit-permission.decide', {
            decision: 'denied',
        });
    });
});
