// theme/colors.ts
// Bảng màu LumiShop phong cách Minimalist & Indigo Sang Trọng

export interface ColorTheme {
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  primary: string;
}

export const lightColors: ColorTheme = {
  bg: '#F8F9FA', // Xám nhạt hiện đại
  card: '#FFFFFF',
  text: '#1E293B', // Slate 800 sắc nét
  muted: '#64748B', // Slate 500
  accent: '#6366F1', // Tím Indigo cao cấp
  accentLight: '#EEF2FF', // Indigo pastel dịu nhẹ
  accentDark: '#4F46E5', // Indigo đậm
  border: '#F1F5F9', // Viền siêu mềm
  success: '#10B981', // Xanh lục ngọc
  danger: '#EF4444',
  warning: '#F59E0B',
  primary: '#6366F1',
};

export const darkColors: ColorTheme = {
  bg: '#0F172A', // Nền xanh đêm sâu
  card: '#1E293B',
  text: '#F1F5F9',
  muted: '#94A3B8',
  accent: '#818CF8', // Indigo sáng nền tối
  accentLight: '#1E1B4B',
  accentDark: '#6366F1',
  border: '#334155',
  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',
  primary: '#818CF8',
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};

export default colors;
