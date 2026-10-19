// theme/useTheme.ts
// Hook cung cấp bảng màu, bán kính bo góc và hiệu ứng đổ bóng mềm cho LumiShop

import { useColorScheme, Platform, ViewStyle } from 'react-native';
import { colors, ColorTheme } from './colors';

export interface UseThemeReturn {
  colors: ColorTheme;
  isDark: boolean;
  colorScheme: 'light' | 'dark';
  borderRadius: {
    input: number;
    card: number;
    button: number;
    pill: number;
    full: number;
  };
  shadow: ViewStyle;
  shadowSm: ViewStyle;
}

export function useTheme(): UseThemeReturn {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const activeColors = isDark ? colors.dark : colors.light;

  const shadow: ViewStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 12,
    },
    android: {
      elevation: 3,
    },
    web: {
      boxShadow: isDark
        ? '0 4px 14px rgba(0, 0, 0, 0.4)'
        : '0 4px 16px rgba(0, 0, 0, 0.05)',
    } as any,
    default: {},
  });

  const shadowSm: ViewStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.04,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: isDark
        ? '0 2px 8px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    } as any,
    default: {},
  });

  return {
    colors: activeColors,
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
    borderRadius: {
      input: 12,
      card: 16,
      button: 24,
      pill: 20,
      full: 9999,
    },
    shadow,
    shadowSm,
  };
}

export default useTheme;
