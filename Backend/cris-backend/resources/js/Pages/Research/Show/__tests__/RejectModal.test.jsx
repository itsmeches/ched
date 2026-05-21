import RejectModal from '../RejectModal';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({}));

function setup(overrides = {}) {
    const props = {
        open: true,
        title: 'Reject Submission',
        templates: ['Insufficient methodology details', 'Plagiarism concerns'],
        templateOptions: [
            {
                label: 'Insufficient methodology details',
                value: 'Insufficient methodology details',
            },
        ],
        comments: '',
        error: null,
        loading: false,
        onCommentsChange: vi.fn(),
        onSubmit: vi.fn(),
        onCancel: vi.fn(),
        ...overrides,
    };
    renderWithProviders(<RejectModal {...props} />);
    return props;
}

describe('RejectModal', () => {
    it('renders title, templates, and textarea when open', () => {
        setup();
        expect(screen.getByText('Reject Submission')).toBeInTheDocument();
        expect(screen.getByText('Insufficient methodology details')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter rejection remarks')).toBeInTheDocument();
    });

    it('calls onCommentsChange when a quick template is clicked', async () => {
        const user = userEvent.setup();
        const props = setup();
        await user.click(screen.getByText('Plagiarism concerns'));
        expect(props.onCommentsChange).toHaveBeenCalledWith('Plagiarism concerns');
    });

    it('calls onCommentsChange when typing in the textarea', async () => {
        const user = userEvent.setup();
        const props = setup();
        await user.type(screen.getByPlaceholderText('Enter rejection remarks'), 'Bad');
        expect(props.onCommentsChange).toHaveBeenCalled();
    });

    it('calls onSubmit when Reject button is pressed', async () => {
        const user = userEvent.setup();
        const props = setup({ comments: 'Final remarks' });
        await user.click(screen.getByRole('button', { name: 'Reject' }));
        expect(props.onSubmit).toHaveBeenCalled();
    });

    it('calls onCancel when Cancel is pressed', async () => {
        const user = userEvent.setup();
        const props = setup();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(props.onCancel).toHaveBeenCalled();
    });

    it('shows error alert when error prop is set', () => {
        setup({ error: 'Comment is required' });
        expect(screen.getByText('Comment is required')).toBeInTheDocument();
    });
});
