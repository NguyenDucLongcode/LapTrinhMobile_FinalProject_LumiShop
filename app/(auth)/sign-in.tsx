// app/(auth)/sign-in.tsx
// Màn hình Đăng nhập Study Planner: Chống Chrome auto-fill triệt để

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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useLogin } from '../../hooks/useAuthQuery';
import { useTheme } from '../../theme/useTheme';

export default function SignInScreen() {
  const router = useRouter();
  const { colors, borderRadius, shadow } = useTheme();
  const persistSession = useAuthStore((state) => state.persistSession);
  const { mutateAsync: login, isPending: isLoading } = useLogin();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập!');
      return;
    }

    setErrorMessage('');
    try {
      const result = await login({ username: username.trim(), password });
      await persistSession(result.user, result.token);

      // Phân quyền điều hướng theo role
      if (result.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(app)');
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản!';
      setErrorMessage(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Đăng nhập thất bại', msg);
      }
    }
  };

  const formContent = (
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
      <Text style={[styles.welcomeText, { color: colors.text }]}>
        Đăng nhập tài khoản
      </Text>

      {/* Error Box */}
      {errorMessage ? (
        <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: colors.danger }]}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Username Input */}
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
          <Ionicons name="person-outline" size={18} color={colors.muted} style={styles.fieldIcon} />
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Nhập tên đăng nhập..."
            placeholderTextColor={colors.muted}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrorMessage('');
            }}
            autoComplete="new-password"
            textContentType="none"
            autoCapitalize="none"
            autoCorrect={false}
            {...({
              name: 'studyplanner-unique-user',
              id: 'studyplanner-unique-user',
              autoComplete: 'new-password',
            } as any)}
          />
        </View>
      </View>

      {/* Password Input */}
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
          <Ionicons name="lock-closed-outline" size={18} color={colors.muted} style={styles.fieldIcon} />
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
            autoComplete="new-password"
            textContentType="none"
            autoCapitalize="none"
            autoCorrect={false}
            {...({
              name: 'studyplanner-unique-pwd',
              id: 'studyplanner-unique-pwd',
              autoComplete: 'new-password',
            } as any)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        </View>
      </View>

      {/* Submit Button */}
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
          <View style={styles.submitContent}>
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Đăng Nhập</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Header Area */}
        <View style={[styles.gradientHeader, { backgroundColor: colors.accent }]}>
          <View style={styles.headerOverlay}>
            <View style={[styles.logoCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="school" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Study Planner</Text>
            <Text style={styles.brandSubtitle}>Quản lý lịch học & bài tập thông minh</Text>
          </View>
        </View>

        {/* Web wrap with <form autoComplete="off"> if web, otherwise render View */}
        {Platform.OS === 'web' ? (
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {formContent}
          </form>
        ) : (
          formContent
        )}
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
  },
  gradientHeader: {
    paddingTop: 60,
    paddingBottom: 50,
    alignItems: 'center',
  },
  headerOverlay: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
  },
  card: {
    marginHorizontal: 20,
    marginTop: -30,
    padding: 24,
    borderWidth: 1,
    width: Platform.OS === 'web' ? '100%' : undefined,
    maxWidth: 440,
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
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
    marginBottom: 16,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
