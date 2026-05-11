import ForgotPassword from '../ForgotPassword';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();
const mockSetData = vi.fn();
const mockUseForm = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
    useForm: () => mockUseForm(),
}));

describe('ForgotPassword page', () => {
    beforeEach(() => {
        mockPost.mockReset();
        mockSetData.mockReset();

        mockUseForm.mockReturnValue({
            data: {
                email: '',
            },
            setData: mockSetData,
            post: mockPost,
            processing: false,
            errors: {},
        });
    });

    it('renders reset-link instructions and a way back to sign in', () => {
        renderWithProviders(<ForgotPassword status="Reset link sent" />);

        expect(screen.getByText('Reset link sent')).toBeVisible();
        expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login');
    });

    it('submits the email to the password email endpoint', async () => {
        const user = userEvent.setup();

        renderWithProviders(<ForgotPassword />);

        await user.type(screen.getByPlaceholderText('you@example.com'), 'user@example.com');
        await user.click(screen.getByRole('button', { name: 'Send password reset link' }));

        expect(mockPost).toHaveBeenCalledWith('/forgot-password');
    });
});