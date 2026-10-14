export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryGlow: string;
  accentTeal: string;
  accentCyan: string;
  accentAmber: string;
  success: string;
  warning: string;
  danger: string;
  cardShadow: string;
  tint: string;
  tabBarBg: string;
  badgeBg: string;
  badgeText: string;
}

export const lightColors: ThemeColors = {
  background: '#F0F5FA',
  surface: '#FFFFFF',
  surfaceSubtle: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  border: '#CBD5E1',
  borderSubtle: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#0284C7',
  primaryLight: '#E0F2FE',
  primaryGlow: 'rgba(2, 132, 199, 0.15)',
  accentTeal: '#0D9488',
  accentCyan: '#0284C7',
  accentAmber: '#D97706',
  success: '#16A34A',
  warning: '#EAB308',
  danger: '#DC2626',
  cardShadow: 'rgba(15, 23, 42, 0.08)',
  tint: '#0284C7',
  tabBarBg: '#FFFFFF',
  badgeBg: '#E0F2FE',
  badgeText: '#0369A1',
};

export const darkColors: ThemeColors = {
  background: '#0A1118',
  surface: '#121E2B',
  surfaceSubtle: '#182738',
  surfaceElevated: '#1E3248',
  border: '#233950',
  borderSubtle: '#1C2E42',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#38BDF8',
  primaryLight: '#0C4A6E',
  primaryGlow: 'rgba(56, 189, 248, 0.25)',
  accentTeal: '#2DD4BF',
  accentCyan: '#38BDF8',
  accentAmber: '#FBBF24',
  success: '#4ADE80',
  warning: '#FDE047',
  danger: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  tint: '#38BDF8',
  tabBarBg: '#0F1823',
  badgeBg: '#0C4A6E',
  badgeText: '#7DD3FC',
};
