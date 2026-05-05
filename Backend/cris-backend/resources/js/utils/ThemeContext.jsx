import { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

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

    return (
        <ThemeContext.Provider value={{ dark, toggleDark }}>
            <ConfigProvider
                csp={cspNonce ? { nonce: cspNonce } : undefined}
                theme={{
                    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#0033a0',
                        colorInfo: '#0033a0',
                        borderRadius: 14,
                        fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif',
                        // navy-based dark surfaces
                        ...(dark ? {
                            colorBgBase: '#0a0f1e',
                            colorBgContainer: '#111827',
                            colorBgElevated: '#111827',
                            colorBgLayout: '#0a0f1e',
                            colorBgSpotlight: '#1a2540',
                            colorBorder: '#1e2d47',
                            colorBorderSecondary: '#1e2d47',
                            colorText: '#e2e8f0',
                            colorTextSecondary: '#94a3b8',
                            colorTextTertiary: '#64748b',
                            colorTextQuaternary: '#475569',
                            colorFillAlter: 'rgba(30,45,71,0.6)',
                            colorFillContent: 'rgba(30,45,71,0.45)',
                        } : {}),
                    },
                    components: {
                        Card: { borderRadiusLG: 22 },
                        Button: { borderRadius: 12 },
                        Table: {
                            headerBg: dark ? 'rgba(30,45,71,0.8)' : '#f8fafc',
                            headerColor: dark ? '#94a3b8' : '#475569',
                            rowHoverBg: dark ? 'rgba(26,37,64,0.9)' : undefined,
                            borderColor: dark ? '#1e2d47' : undefined,
                        },
                        Select: {
                            optionSelectedBg: dark ? '#1a2540' : undefined,
                        },
                        Input: {
                            hoverBorderColor: dark ? '#3b5ba5' : undefined,
                            activeBorderColor: dark ? '#0033a0' : undefined,
                        },
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
}
