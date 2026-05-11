import Login from '../Login';
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
    Link: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
    useForm: () => mockUseForm(),
}));

describe('Login page', () => {
    beforeEach(() => {
        mockPost.mockReset();
        mockReset.mockReset();
        mockSetData.mockReset();

        mockUseForm.mockReturnValue({
            data: {
                email: '',
                password: '',
                remember: false,
            },
            setData: mockSetData,
            post: mockPost,
            processing: false,
            errors: {},
            reset: mockReset,
        });
    });

    it('renders the forgot password link below the password field', () => {
        renderWithProviders(<Login canResetPassword />);

        expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
        expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password');
        expect(screen.getByRole('link', { name: 'Register here' })).toHaveAttribute('href', '/register');
    });

    it('submits credentials and resets the password field on finish', async () => {
        const user = userEvent.setup();

        mockPost.mockImplementation((url, options) => {
            options.onFinish();
        });

        renderWithProviders(<Login canResetPassword />);

        await user.type(screen.getByPlaceholderText('you@example.com'), 'superadmin@cris.gov.ph');
        await user.type(screen.getByPlaceholderText('••••••••'), 'password');
        await user.click(screen.getByRole('button', { name: 'Sign in' }));

        expect(mockPost).toHaveBeenCalledWith('/login', expect.objectContaining({ onFinish: expect.any(Function) }));
        expect(mockReset).toHaveBeenCalledWith('password');
    });
});