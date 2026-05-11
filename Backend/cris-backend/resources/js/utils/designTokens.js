// Centralized design tokens for the CRIS UI.
// Single source of truth for colors, role mapping, and surface palettes.
// Keep in sync with CSS variables in resources/css/app.css and the
// ConfigProvider tokens in utils/ThemeContext.jsx.

import { useMemo } from 'react';
import { useTheme } from './ThemeContext';

export const palette = {
    primary: '#0033a0',
    primaryDark: '#001f66',
    primaryLight: '#0047d4',
    primarySoft: 'rgba(0, 51, 160, 0.10)',
    accent: '#d97706',
    accentSoft: 'rgba(217, 119, 6, 0.12)',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0ea5e9',
};

export const surfaces = {
    light: {
        page: '#f8fafc',
        card: '#ffffff',
        cardElevated: '#ffffff',
        muted: '#f1f5f9',
        border: 'rgba(226, 232, 240, 0.9)',
        borderStrong: '#cbd5e1',
        text: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#64748b',
    },
    dark: {
        page: '#0a0f1e',
        card: '#111827',
        cardElevated: '#162033',
        muted: 'rgba(30, 45, 71, 0.6)',
        border: '#1e2d47',
        borderStrong: '#2a3a5c',
        text: '#e2e8f0',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
    },
};

// Single role color map. Used by Admin/Users, Hierarchy, dashboards,
// avatars, and tags. Light/dark variants for both Tailwind classes
// (text/bg pairs) and Ant Design Tag colors.
export const roleColorMap = {
    super_admin:   { antTag: 'magenta', bg: '#7e22ce', soft: 'rgba(126, 34, 206, 0.12)', text: '#7e22ce', label: 'Super Admin' },
    superadmin:    { antTag: 'magenta', bg: '#7e22ce', soft: 'rgba(126, 34, 206, 0.12)', text: '#7e22ce', label: 'Super Admin' },
    ched:          { antTag: 'geekblue', bg: '#0033a0', soft: 'rgba(0, 51, 160, 0.12)',  text: '#0033a0', label: 'CHED' },
    hei:           { antTag: 'cyan',    bg: '#0e7490', soft: 'rgba(14, 116, 144, 0.12)', text: '#0e7490', label: 'HEI' },
    hei_admin:     { antTag: 'cyan',    bg: '#0e7490', soft: 'rgba(14, 116, 144, 0.12)', text: '#0e7490', label: 'HEI Admin' },
    faculty:       { antTag: 'purple',  bg: '#6d28d9', soft: 'rgba(109, 40, 217, 0.12)', text: '#6d28d9', label: 'Faculty' },
    student:       { antTag: 'orange',  bg: '#c2410c', soft: 'rgba(194, 65, 12, 0.12)',  text: '#c2410c', label: 'Student' },
    researcher:    { antTag: 'green',   bg: '#15803d', soft: 'rgba(21, 128, 61, 0.12)',  text: '#15803d', label: 'Researcher' },
    reviewer:      { antTag: 'gold',    bg: '#a16207', soft: 'rgba(161, 98, 7, 0.12)',   text: '#a16207', label: 'Reviewer' },
};

const ROLE_DARK_TEXT = {
    super_admin: '#e9d5ff',
    superadmin:  '#e9d5ff',
    ched:        '#bfdbfe',
    hei:         '#a5f3fc',
    hei_admin:   '#a5f3fc',
    faculty:     '#ddd6fe',
    student:     '#fed7aa',
    researcher:  '#bbf7d0',
    reviewer:    '#fde68a',
};

export function getRoleColor(role, dark = false) {
    const key = (role ?? '').toString().toLowerCase().replace(/-/g, '_');
    const base = roleColorMap[key] ?? { antTag: 'default', bg: '#475569', soft: 'rgba(71, 85, 105, 0.14)', text: '#475569', label: role };
    return {
        ...base,
        text: dark ? (ROLE_DARK_TEXT[key] ?? '#e2e8f0') : base.text,
    };
}

// Consistent chart palette used across all dashboards.
export const chartSeries = [
    palette.primary,
    palette.accent,
    palette.info,
    palette.success,
    palette.error,
    '#7e22ce',
    '#0e7490',
    '#6d28d9',
];

// Hook returning theme-aware tokens for dashboard pages so they stop
// redefining their own accentPrimary/surface palettes locally.
export function useAccent() {
    const { dark } = useTheme();
    return useMemo(() => {
        const surface = dark ? surfaces.dark : surfaces.light;
        return {
            dark,
            accentPrimary: palette.primary,
            accentPrimaryDark: palette.primaryDark,
            accentPrimaryLight: palette.primaryLight,
            accentSoft: dark ? 'rgba(59, 130, 246, 0.18)' : palette.primarySoft,
            accent: palette.accent,
            success: palette.success,
            warning: palette.warning,
            error: palette.error,
            info: palette.info,
            surface,
            chartSeries,
            chartGrid: dark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
            chartAxis: dark ? '#94a3b8' : '#64748b',
            chartTooltipBg: dark ? '#0f172a' : '#ffffff',
            chartTooltipBorder: dark ? '#1e2d47' : 'rgba(15, 23, 42, 0.08)',
        };
    }, [dark]);
}

// Ant Design ConfigProvider token bundle, derived from the same source.
export function buildAntdTokens(dark) {
    return {
        token: {
            colorPrimary: palette.primary,
            colorInfo: palette.primary,
            colorSuccess: palette.success,
            colorWarning: palette.warning,
            colorError: palette.error,
            borderRadius: 14,
            borderRadiusLG: 16,
            controlHeight: 40,
            controlHeightSM: 32,
            controlHeightLG: 46,
            fontSize: 14,
            fontFamily: 'Segoe UI, Helvetica Neue, Arial, sans-serif',
            ...(dark ? {
                colorBgBase: surfaces.dark.page,
                colorBgContainer: surfaces.dark.card,
                colorBgElevated: surfaces.dark.card,
                colorBgLayout: surfaces.dark.page,
                colorBgSpotlight: '#1a2540',
                colorBorder: surfaces.dark.border,
                colorBorderSecondary: surfaces.dark.border,
                colorText: surfaces.dark.text,
                colorTextSecondary: surfaces.dark.textSecondary,
                colorTextTertiary: surfaces.dark.textMuted,
                colorTextQuaternary: '#64748b',
                colorFillAlter: 'rgba(30,45,71,0.6)',
                colorFillContent: 'rgba(30,45,71,0.45)',
            } : {}),
        },
        components: {
            Card: { borderRadiusLG: 22, headerFontSize: 14, headerFontSizeSM: 13, bodyPadding: 18 },
            Button: { borderRadius: 12, fontWeight: 600 },
            Statistic: { titleFontSize: 13, contentFontSize: 28 },
            Tag: { borderRadiusSM: 999 },
            Table: {
                headerBg: dark ? 'rgba(30,45,71,0.8)' : '#f8fafc',
                headerColor: dark ? surfaces.dark.textSecondary : surfaces.light.textSecondary,
                rowHoverBg: dark ? 'rgba(26,37,64,0.9)' : undefined,
                borderColor: dark ? surfaces.dark.border : undefined,
            },
            Select: { borderRadius: 12, optionSelectedBg: dark ? '#1a2540' : undefined },
            Input: {
                borderRadius: 12,
                hoverBorderColor: dark ? '#3b5ba5' : undefined,
                activeBorderColor: dark ? palette.primary : undefined,
            },
            Modal: { borderRadiusLG: 18 },
        },
    };
}
