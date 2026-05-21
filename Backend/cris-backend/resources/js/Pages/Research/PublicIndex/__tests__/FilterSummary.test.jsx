import FilterSummary from '../FilterSummary';
import { renderWithProviders } from '@/test/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({}));

const SORT_LABEL_MAP = {
    recent: 'Recently approved',
    year_desc: 'Year: newest first',
};

function makeProps(overrides = {}) {
    return {
        D: false,
        textPrim: '',
        textSecond: '',
        proposals: { data: [{ id: 1 }], total: 42 },
        hasActiveFilters: true,
        search: 'climate',
        setSearch: vi.fn(),
        yearFrom: '2020',
        setYearFrom: vi.fn(),
        yearTo: '',
        setYearTo: vi.fn(),
        school: '',
        setSchool: vi.fn(),
        institutionId: '',
        setInstitutionId: vi.fn(),
        selectedInstitutionLabel: '',
        category: '',
        setCategory: vi.fn(),
        selectedCategoryLabel: '',
        disciplineCode: '',
        setDisciplineCode: vi.fn(),
        selectedDisciplineLabel: '',
        sort: 'year_desc',
        setSort: vi.fn(),
        sortLabelMap: SORT_LABEL_MAP,
        applyFilters: vi.fn(),
        saveCurrentSearch: vi.fn(),
        clearAll: vi.fn(),
        savedSearches: [],
        applySavedSearch: vi.fn(),
        deleteSavedSearch: vi.fn(),
        ...overrides,
    };
}

describe('FilterSummary', () => {
    it('renders the showing-of-total summary', () => {
        renderWithProviders(<FilterSummary {...makeProps()} />);
        expect(screen.getByText(/Showing/)).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders chips for active filters', () => {
        renderWithProviders(<FilterSummary {...makeProps()} />);
        expect(screen.getByText(/Query: climate/)).toBeInTheDocument();
        expect(screen.getByText(/From: 2020/)).toBeInTheDocument();
        expect(screen.getByText(/Sort: Year: newest first/)).toBeInTheDocument();
    });

    it('omits chips when hasActiveFilters is false', () => {
        renderWithProviders(<FilterSummary {...makeProps({ hasActiveFilters: false })} />);
        expect(screen.queryByText(/Query:/)).not.toBeInTheDocument();
        expect(screen.queryByText('Save search')).not.toBeInTheDocument();
    });

    it('clicking the search chip close clears search and re-applies', async () => {
        const user = userEvent.setup();
        const props = makeProps();
        renderWithProviders(<FilterSummary {...props} />);

        const queryChip = screen.getByText(/Query: climate/).closest('.ant-tag');
        const closeBtn = queryChip.querySelector('.ant-tag-close-icon');
        await user.click(closeBtn);

        expect(props.setSearch).toHaveBeenCalledWith('');
        expect(props.applyFilters).toHaveBeenCalled();
    });

    it('Save search and Clear all buttons fire their handlers', async () => {
        const user = userEvent.setup();
        const props = makeProps();
        renderWithProviders(<FilterSummary {...props} />);

        await user.click(screen.getByRole('button', { name: 'Save search' }));
        expect(props.saveCurrentSearch).toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Clear all' }));
        expect(props.clearAll).toHaveBeenCalled();
    });

    it('renders the saved searches panel when entries exist', async () => {
        const user = userEvent.setup();
        const props = makeProps({
            savedSearches: [{ id: 1, name: 'My Topic', filters: {} }],
        });
        renderWithProviders(<FilterSummary {...props} />);

        expect(screen.getByText('Saved Searches')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'My Topic' }));
        expect(props.applySavedSearch).toHaveBeenCalledWith(props.savedSearches[0]);

        await user.click(screen.getByRole('button', { name: /Delete saved search My Topic/ }));
        expect(props.deleteSavedSearch).toHaveBeenCalledWith(1);
    });
});
