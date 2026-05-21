import ResetPassword from '../ResetPassword';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPost = vi.fn();
const mockReset = vi.fn();
const mockSetData = vi.fn();
const mockUseForm = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    useForm: () => mockUseForm(),
}));

describe('ResetPassword page', () => {
    beforeEach(() => {
        mockPost.mockReset();
        mockReset.mockReset();
        mockSetData.mockReset();

        mockUseForm.mockReturnValue({
            data: {
                token: 'reset-token',
                email: 'user@example.com',
                password: '',
                password_confirmation: '',
            },
            setData: mockSetData,
            post: mockPost,
            processing: false,
            errors: {},
            reset: mockReset,
        });
    });

    it('renders the reset password form', () => {
        renderWithProviders(<ResetPassword token="reset-token" email="user@example.com" />);

        expect(screen.getByRole('heading', { name: 'Reset password' })).toBeVisible();
        expect(screen.getByDisplayValue('user@example.com')).toBeVisible();
        expect(screen.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', '/login');
    });

    it('submits the new password and clears password fields on finish', async () => {
        const user = userEvent.setup();

        mockPost.mockImplementation((url, options) => {
            options.onFinish();
        });

        renderWithProviders(<ResetPassword token="reset-token" email="user@example.com" />);

        await user.type(
            screen.getByPlaceholderText('Create a strong password'),
            'new-password-123'
        );
        await user.type(screen.getByPlaceholderText('Re-enter your password'), 'new-password-123');
        await user.click(screen.getByRole('button', { name: 'Reset password' }));

        expect(mockPost).toHaveBeenCalledWith(
            '/reset-password',
            expect.objectContaining({ onFinish: expect.any(Function) })
        );
        expect(mockReset).toHaveBeenCalledWith('password', 'password_confirmation');
    });
});
