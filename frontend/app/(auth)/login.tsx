import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/useAuthStore';
import { getApiUrl } from '../../src/services/api';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginFormData {
  email: string;
  password: string;
}

const REMEMBER_EMAIL_KEY = 'smartprice_remember_email';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Pre-populate email if "Remember Login" was checked
  useEffect(() => {
    const checkRememberedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
        if (savedEmail) {
          setValue('email', savedEmail);
        }
      } catch (e) {
        console.error('Failed to load remembered email', e);
      }
    };
    checkRememberedEmail();
  }, [setValue]);

  // If already authenticated, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(admin)/dashboard');
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Handle remember me state
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      // Save credentials in SecureStore and Zustand store
      await login(result.token, result.user);
      
      router.replace('/(admin)/dashboard');
    } catch (e: any) {
      Alert.alert('Login Failed', e.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Logo Header */}
        <View style={styles.headerSection}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={40} color={Colors.accent} />
          </View>
          <Text style={styles.title}>SmartPrice Admin</Text>
          <Text style={styles.subtitle}>Log in as store owner to modify prices and manage catalog.</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
              <Mail size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <Controller
                control={control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Enter a valid email address',
                  },
                }}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="owner@smartprice.com"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <Lock size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <Controller
                control={control}
                rules={{ required: 'Password is required' }}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Password"
                    placeholderTextColor={Colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.textSecondary} />
                ) : (
                  <Eye size={18} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Remember Me Checkbox */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.rememberRow}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.rememberText}>Remember my email</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            disabled={loading}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Text style={styles.submitBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Back to lookup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  formSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputWrapperError: {
    borderColor: Colors.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    height: '100%',
  },
  eyeBtn: {
    padding: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: Colors.accent,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  rememberText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  submitBtn: {
    height: 48,
    backgroundColor: Colors.text, // White button
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: Colors.background, // Black text
    fontSize: 15,
    fontWeight: 'bold',
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
