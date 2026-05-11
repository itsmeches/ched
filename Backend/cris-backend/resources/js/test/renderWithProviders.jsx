import { ThemeProvider } from '@/utils/ThemeContext';
import { render } from '@testing-library/react';

export function renderWithProviders(ui) {
    return render(
        <ThemeProvider>
            {ui}
        </ThemeProvider>,
    );
}