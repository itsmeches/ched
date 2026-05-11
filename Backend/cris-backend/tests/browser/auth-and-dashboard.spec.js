import { expect, test } from '@playwright/test';

const credentials = {
    email: process.env.E2E_EMAIL ?? 'superadmin@cris.gov.ph',
    password: process.env.E2E_PASSWORD ?? 'password',
};

async function loginAsSuperAdmin(page) {
    await page.goto('/login');
    await page.locator('input[name="email"]').fill(credentials.email);
    await page.locator('input[name="password"]').fill(credentials.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
}

test('login page exposes the expected auth controls', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('super admin can apply and reset dashboard status filters', async ({ page }) => {
    await loginAsSuperAdmin(page);

    await expect(page.getByText('Dashboard Filters')).toBeVisible();

    await page.locator('.dashboard-filter-status').click();
    await page.locator('.ant-select-item-option', { hasText: 'Rejected' }).click();

    await expect(page).toHaveURL(/status=rejected/);
    await expect(page.getByText('Status: Rejected')).toBeVisible();

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page).not.toHaveURL(/status=/);
});