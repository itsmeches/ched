# CRIS Universal Navbar Design Guide

## Overview

Your CRIS system now uses a unified, modern navbar design across all pages. This replaces the old inconsistent sidebar/navbar layouts.

## What Changed

### 1. **Backend/Inertia (Laravel React Pages)**

- **Old**: Basic navbar with only Dashboard link visible
- **New**: Full-featured `Navbar.jsx` component with role-based navigation

### 2. **Application Layout**

- **Old**: Mixed sidebar/navbar layouts
- **New**: Clean top navbar matching the current CRIS branding

### 3. **Shared Design Direction**

- Updated to use modern Tailwind styling (slate/teal color scheme)
- Consistent with CRIS branding (SVG logo, teal accent color)
- Fully responsive (desktop + mobile hamburger menu)

---

## Navbar Features

### Logo Section

- CRIS mark SVG icon
- Text label "CRIS"
- Links to dashboard on click
- Visible on all screen sizes

### Navigation Menu (Role-Based)

Displays different items based on user role:

**All Users:**

- Dashboard

**Super Admin:**

- Dashboard
- User Management
- System Settings

**CHED Reviewer:**

- Dashboard
- Research Queue
- My Decisions

**HEI Researcher:**

- Dashboard
- My Research
- Submit Paper

### User Section

**Desktop:**

- User name and role label (right side)
- Avatar circle with first initial
- Dropdown menu with Profile & Sign Out

**Mobile:**

- Avatar circle with dropdown
- Hamburger menu button

### Mobile Responsiveness

- Desktop nav items hidden on `md:` breakpoint
- Mobile menu toggles with hamburger button
- Full-width dropdown for navigation
- Touch-friendly button sizes

---

## Files Modified

### Backend

1. **[Components/Navbar.jsx](../Components/Navbar.jsx)** _(New)_
   - Universal navbar component for Inertia pages
   - Uses `usePage()` for auth data
   - Role-based navigation logic
   - Mobile menu state management

2. **[Layouts/AuthenticatedLayout.jsx](../Layouts/AuthenticatedLayout.jsx)** _(Updated)_
   - Now imports and uses `<Navbar />`
   - Removed old navbar HTML
   - Clean, minimal header section
   - Better spacing with max-width container

---

## Design System

### Colors

- **Primary**: Teal (`from-teal-400 to-teal-600` gradient)
- **Text**: Slate (`text-slate-900`, `text-slate-600`, `text-slate-500`)
- **Background**: Light slate (`bg-slate-50`)
- **Borders**: Subtle slate (`border-slate-200`)

### Spacing

- Navbar height: `h-16` (64px)
- Horizontal padding: `px-4 sm:px-6 lg:px-8`
- Vertical padding: `py-8` for main content
- Gap between items: `gap-4`, `gap-8`

### Typography

- Logo: `font-bold text-slate-900`
- Nav items: `text-sm font-medium`
- User name: `text-sm font-semibold`
- Role label: `text-xs text-slate-500`

### Breakpoints

- Mobile: Default (0px)
- Tablet/Desktop: `md:` (768px) - nav items visible, mobile menu hidden
- Large: `lg:` - additional padding adjustments

---

## User Experience Improvements

✅ **Consistency** - Same navbar design across the active application
✅ **Clarity** - Role-based navigation shows only relevant items
✅ **Responsive** - Works perfectly on mobile, tablet, desktop
✅ **Branding** - CRIS SVG logo, modern color scheme
✅ **Accessibility** - Clear labels, sufficient contrast, keyboard navigation
✅ **Performance** - Minimal state, optimized rendering

---

## Implementation Notes

### Backend (Inertia)

The `Navbar.jsx` component automatically:

- Reads `auth.user` from Inertia props
- Determines role-based menu items
- Generates correct routes using Laravel's `route()` helper
- Handles active link highlighting

## How to Extend

### Add New Navigation Item

In the `getNavItems()` function, add to the appropriate role array:

```jsx
{ label: 'New Feature', href: route('feature.index') }
```

### Customize Colors

Update Tailwind classes in the components:

- Change `from-teal-400 to-teal-600` to use different gradient
- Update `text-teal-700`, `bg-teal-50` for accent colors
- Modify `text-slate-*` for typography colors

### Adjust Mobile Breakpoint

Change `md:` class to `lg:` (or `sm:`) to show/hide mobile menu at different screen sizes

---

## Testing Checklist

- [ ] Desktop navbar displays all navigation items
- [ ] Tablet view hides nav items, shows hamburger menu
- [ ] Mobile menu opens/closes on hamburger click
- [ ] User dropdown shows profile options
- [ ] Active nav item highlighted correctly
- [ ] Logo links to dashboard
- [ ] Role-based items display correctly
- [ ] Mobile menu closes after clicking a link
- [ ] Responsive at all breakpoints (320px, 768px, 1024px, 1440px)

---

## Screenshots/Locations

- CRIS logo: `/public/cris-mark.svg`
- Backend navbar: [Components/Navbar.jsx](../Components/Navbar.jsx)
- Backend layout: [Layouts/AuthenticatedLayout.jsx](../Layouts/AuthenticatedLayout.jsx)
