// app/(auth)/sign-in.tsx
// Màn hình Đăng nhập LumiShop: Logo lớn, TextInput bo góc 12, Nút bấm bo góc 24 và các liên kết hỗ trợ

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/useTheme';

export default function SignInScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const { login, isLoading } = useAuthStore();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập!');
      return;
    }

    setErrorMessage('');
    const success = await login(username, password);

    if (success) {
      router.replace('/(app)');
    } else {
      const msg = 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản!';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Đăng nhập thất bại', msg);
      }
    }
  };

  const fillQuickAccount = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: borderRadius.card,
              borderColor: colors.border,
            },
            shadow,
          ]}
        >
          {/* Logo lớn trong vòng tròn accent */}
          <View style={styles.brandContainer}>
            <View
              style={[
                styles.logoCircle,
                {
                  backgroundColor: colors.accentLight,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Text style={styles.logoIcon}>🛍️</Text>
            </View>

            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandLumi, { color: colors.accent }]}>Lumi</Text>
              <Text style={[styles.brandShop, { color: colors.text }]}>Shop</Text>
            </View>

            <Text style={[styles.welcomeText, { color: colors.accent }]}>
              Chào mừng bạn đến với LumiShop
            </Text>
            <Text style={[styles.subText, { color: colors.muted }]}>
              Khám phá không gian mua sắm tối giản & đẳng cấp
            </Text>
          </View>

          {/* Hộp báo lỗi */}
          {errorMessage ? (
            <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: colors.danger }]}>
              <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Ô nhập Tài khoản */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Tên đăng nhập</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderRadius: borderRadius.input,
                },
              ]}
            >
              <Text style={styles.fieldIcon}>👤</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Nhập tên đăng nhập..."
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrorMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Ô nhập Mật khẩu */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Mật khẩu</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  borderRadius: borderRadius.input,
                },
              ]}
            >
              <Text style={styles.fieldIcon}>🔒</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Nhập mật khẩu..."
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMessage('');
                }}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </Pressable>
            </View>
          </View>

          {/* Nút Đăng nhập bo góc 24 */}
          <Pressable
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập tài khoản"
            disabled={isLoading}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.submitBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: borderRadius.button,
                opacity: pressed || isLoading ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              shadow,
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>Đăng Nhập Ngay</Text>
            )}
          </Pressable>

          {/* Link Quên mật khẩu & Đăng ký */}
          <View style={styles.linksRow}>
            <Pressable onPress={() => Alert.alert('Thông báo', 'Tính năng đặt lại mật khẩu đang được phát triển!')}>
              <Text style={[styles.linkText, { color: colors.muted }]}>Quên mật khẩu?</Text>
            </Pressable>
            <Text style={{ color: colors.muted }}>•</Text>
            <Pressable onPress={() => fillQuickAccount('khachhang', '123')}>
              <Text style={[styles.linkText, { color: colors.accent, fontWeight: '700' }]}>Đăng ký mới</Text>
            </Pressable>
          </View>

          {/* Tài khoản mẫu tiện lợi */}
          <View style={[styles.demoSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.demoTitle, { color: colors.muted }]}>
              Tài khoản dùng thử nhanh:
            </Text>
            <View style={styles.demoChipsRow}>
              <Pressable
                onPress={() => fillQuickAccount('admin', '123')}
                style={[
                  styles.demoChip,
                  {
                    backgroundColor: colors.accentLight,
                    borderColor: colors.accent,
                    borderRadius: borderRadius.pill,
                  },
                ]}
              >
                <Text style={[styles.demoChipText, { color: colors.accent }]}>
                  🛡️ Admin (admin/123)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => fillQuickAccount('user', '123')}
                style={[
                  styles.demoChip,
                  {
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    borderRadius: borderRadius.pill,
                  },
                ]}
              >
                <Text style={[styles.demoChipText, { color: colors.text }]}>
                  👤 Khách (user/123)
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 28,
    borderWidth: 1,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
  },
  logoIcon: {
    fontSize: 34,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandLumi: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandShop: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 48,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 13,
  },
  demoSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  demoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  demoChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
