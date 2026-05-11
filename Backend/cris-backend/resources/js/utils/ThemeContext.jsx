import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { buildAntdTokens } from './designTokens';

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children, cspNonce }) {
    const [dark, setDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cris-theme') === 'dark';
        }
        return false;
    });

    // Sync <html> class and localStorage on every change.
    useEffect(() => {
        const html = document.documentElement;
        if (dark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('cris-theme', dark ? 'dark' : 'light');
    }, [dark]);

    const toggleDark = () => setDark((v) => !v);

    const antd = buildAntdTokens(dark);

    return (
        <ThemeContext.Provider value={{ dark, toggleDark }}>
            <ConfigProvider
                csp={cspNonce ? { nonce: cspNonce } : undefined}
                theme={{
                    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                    ...antd,
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}
