import StudentLockSection from '../StudentLockSection';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();
const mockSetData = vi.fn();
const mockReset = vi.fn();
const mockUseForm = vi.fn();

vi.mock('@inertiajs/react', () => ({
    useForm: () => mockUseForm(),
}));

function setUseForm(reason = '') {
    mockUseForm.mockReturnValue({
        data: { reason },
        setData: mockSetData,
        post: mockPost,
        reset: mockReset,
        processing: false,
    });
}

describe('StudentLockSection', () => {
    beforeEach(() => {
        mockPost.mockReset();
        mockSetData.mockReset();
        mockReset.mockReset();
        setUseForm();
    });

    it('shows the request form when no edit permission exists (approved status)', () => {
        renderWithProviders(
            <StudentLockSection proposal={{ id: 7, status: 'approved' }} editPermission={null} />
        );
        expect(screen.getByText(/This research has been approved/i)).toBeVisible();
        expect(screen.getByPlaceholderText('Reason for edit request (optional)')).toBeVisible();
        expect(screen.getByRole('button', { name: /Request Edit Permission/i })).toBeVisible();
    });

    it('shows pending alert when permission is pending', () => {
        renderWithProviders(
            <StudentLockSection
                proposal={{ id: 7, status: 'approved' }}
                editPermission={{ status: 'pending' }}
            />
        );
        expect(screen.getByText('Request Pending')).toBeVisible();
        expect(
            screen.queryByPlaceholderText('Reason for edit request (optional)')
        ).not.toBeInTheDocument();
    });

    it('shows approved alert when permission is granted', () => {
        renderWithProviders(
            <StudentLockSection
                proposal={{ id: 7, status: 'approved' }}
                editPermission={{ status: 'approved' }}
            />
        );
        expect(screen.getByText('Permission Granted')).toBeVisible();
    });

    it('shows denied alert plus the request form when permission was denied', () => {
        renderWithProviders(
            <StudentLockSection
                proposal={{ id: 7, status: 'approved' }}
                editPermission={{ status: 'denied' }}
            />
        );
        expect(screen.getByText('Request Denied')).toBeVisible();
        expect(screen.getByPlaceholderText('Reason for edit request (optional)')).toBeVisible();
    });

    it('submits the edit-permission form when button is clicked', async () => {
        const user = userEvent.setup();
        setUseForm('I need to fix a typo');
        renderWithProviders(
            <StudentLockSection proposal={{ id: 7, status: 'approved' }} editPermission={null} />
        );

        await user.click(screen.getByRole('button', { name: /Request Edit Permission/i }));
        expect(mockPost).toHaveBeenCalledWith(
            '/research.edit-permission.store',
            expect.objectContaining({ onSuccess: expect.any(Function) })
        );
    });
});
