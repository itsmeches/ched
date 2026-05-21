import '@testing-library/jest-dom/vitest';

globalThis.route = (name) => {
    const routes = {
        login: '/login',
        register: '/register',
        'password.request': '/forgot-password',
        'password.email': '/forgot-password',
        'password.store': '/reset-password',
        dashboard: '/dashboard',
    };

    return routes[name] ?? `/${name}`;
};

if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

if (!window.ResizeObserver) {
    window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

window.scrollTo = window.scrollTo ?? (() => {});
