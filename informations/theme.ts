import { Appearance, useColorScheme } from 'react-native';

// ─── Light Mode — warm beige, golden yellow, steel blue ───────────────────────
const light = {
    primary: '#f2c94c',
    primaryDark: '#c9a318',
    primaryLight: '#f7df8a',
    primarySurface: '#fef9e7',

    accent: '#5b9eb3',
    accentDark: '#4a87a0',
    accentSurface: '#e4f2f7',

    background: '#eae4d6',
    surface: '#f5f0e8',
    surfaceAlt: '#ddd7c9',
    border: '#c8c0b0',
    borderLight: '#d8d2c4',

    text: '#2c2010',
    textSecondary: '#6b5c40',
    textMuted: '#a8997e',
    textOnPrimary: '#1c1400',

    error: '#dc2626',
    errorLight: '#fef2f2',
    success: '#059669',
    successLight: '#ecfdf5',
    warning: '#d97706',
    warningLight: '#fffbeb',

    badge: '#ef4444',
    overlay: 'rgba(0,0,0,0.4)',
    shimmer: '#ddd7c9',
} as const;

// ─── Dark Mode — deep navy/purple, golden yellow, warm cream ──────────────────
const dark = {
    primary: '#f2c94c',
    primaryDark: '#c9a318',
    primaryLight: '#f7df8a',
    primarySurface: 'rgba(242, 201, 76, 0.15)',

    accent: '#9b7fa7',
    accentDark: '#7d6289',
    accentSurface: 'rgba(155, 127, 167, 0.15)',

    background: '#37335a',
    surface: '#46416c',
    surfaceAlt: '#2e2b4e',
    border: '#5a556e',
    borderLight: '#46416c',

    text: '#e5d3c1',
    textSecondary: '#b8a49a',
    textMuted: '#8a7a72',
    textOnPrimary: '#1c1400',

    error: '#f87171',
    errorLight: 'rgba(239, 68, 68, 0.15)',
    success: '#34d399',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#fbbf24',
    warningLight: 'rgba(245, 158, 11, 0.15)',

    badge: '#f87171',
    overlay: 'rgba(0,0,0,0.6)',
    shimmer: '#2e2b4e',
} as const;

export const LightColors = light;
export const DarkColors = dark;

// Static snapshot — kept for any code that runs outside React components.
export const Colors = Appearance.getColorScheme() === 'dark' ? dark : light;

// Reactive hook — use this in components so styles re-render on system theme change.
export type ThemeColors = typeof light;
export function useThemeColors(): ThemeColors {
    const scheme = useColorScheme();
    return scheme === 'dark' ? dark : light;
}

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
} as const;

export const Typography = {
    h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    bodyBold: { fontSize: 15, fontWeight: '600' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    captionBold: { fontSize: 13, fontWeight: '600' as const },
    small: { fontSize: 11, fontWeight: '500' as const },
    button: { fontSize: 16, fontWeight: '700' as const, letterSpacing: 0.3 },
    price: { fontSize: 20, fontWeight: '800' as const },
} as const;

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
} as const;
