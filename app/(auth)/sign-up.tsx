import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignUp } from '@/hooks/useAuth';
import { signInWithApple, signInWithGoogle } from '@/services/social-auth';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);

  const signUp = useSignUp();

  const handleAppleSignIn = async () => {
    setSocialLoading('apple');
    try {
      const { data, error } = await signInWithApple();
      if (error) {
        Alert.alert('Apple Sign-In Failed', String(error.message || error) || 'An unexpected error occurred. Please try again.');
      }
      // Navigation handled by AuthProvider when session changes
    } catch (e: any) {
      Alert.alert('Apple Sign-In Failed', String(e.message || e) || 'An unexpected error occurred. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Google Sign-In Failed', String(error.message || error) || 'An unexpected error occurred. Please try again.');
      }
      // Navigation handled by AuthProvider when session changes
    } catch (e: any) {
      Alert.alert('Google Sign-In Failed', String(e.message || e) || 'An unexpected error occurred. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSignUp = async () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await signUp.mutateAsync({
        email,
        password,
        displayName: name,
      });

      setSuccessMessage('We sent you a verification link. Please verify your email before signing in.');
      setTimeout(() => router.push('/(auth)/sign-in'), 3000);
    } catch (error: any) {
      setErrors({ form: error.message || 'Sign up failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field: string) => {
    setErrors((e) => { const { [field]: _, ...rest } = e; return rest; });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-14 pb-4">
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.6}>
            <ArrowLeft size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Join thousands of parents finding THE name</Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6" style={{ gap: 16 }}>
          {/* Form Error */}
          {errors.form && (
            <View style={s.errorBanner}>
              <Text className="text-sm text-red-600">{errors.form}</Text>
            </View>
          )}

          {/* Success Message */}
          {successMessage && (
            <View style={s.successBanner}>
              <Text className="text-sm text-green-700">{successMessage}</Text>
            </View>
          )}

          {/* Name Input */}
          <View>
            <Text style={s.label}>Your Name</Text>
            <View style={[s.inputWrap, errors.name && s.inputError]}>
              <User size={18} color={errors.name ? '#f87171' : '#9CA3AF'} />
              <TextInput
                style={s.input}
                placeholder="What should we call you?"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={(v) => { setName(v); clearError('name'); }}
                autoCapitalize="words"
              />
            </View>
            {errors.name && <Text style={s.errorText}>{errors.name}</Text>}
          </View>

          {/* Email Input */}
          <View>
            <Text style={s.label}>Email</Text>
            <View style={[s.inputWrap, errors.email && s.inputError]}>
              <Mail size={18} color={errors.email ? '#f87171' : '#9CA3AF'} />
              <TextInput
                style={s.input}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(v) => { setEmail(v); clearError('email'); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email && <Text style={s.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Input */}
          <View>
            <Text style={s.label}>Password</Text>
            <View style={[s.inputWrap, errors.password && s.inputError]}>
              <Lock size={18} color={errors.password ? '#f87171' : '#9CA3AF'} />
              <TextInput
                style={s.input}
                placeholder="At least 8 characters"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(v) => { setPassword(v); clearError('password'); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.6}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Input */}
          <View>
            <Text style={s.label}>Confirm Password</Text>
            <View style={[s.inputWrap, errors.confirmPassword && s.inputError]}>
              <Lock size={18} color={errors.confirmPassword ? '#f87171' : '#9CA3AF'} />
              <TextInput
                style={s.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearError('confirmPassword'); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.confirmPassword && <Text style={s.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.85}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={isLoading ? ['#f7aab2', '#f7aab2'] : ['#ea546c', '#d5294d']}
              style={s.primaryBtn}
            >
              <Text style={s.primaryBtnText}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-xs text-gray-400 text-center px-4 py-2">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or sign up with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Auth Buttons */}
          <TouchableOpacity style={s.appleBtn} activeOpacity={0.8} onPress={handleAppleSignIn} disabled={socialLoading === 'apple'}>
            <Text style={s.appleBtnText}>{socialLoading === 'apple' ? 'Signing in...' : 'Sign up with Apple'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.googleBtn} activeOpacity={0.7} onPress={handleGoogleSignIn} disabled={socialLoading === 'google'}>
            <Text style={s.googleBtnText}>{socialLoading === 'google' ? 'Signing in...' : 'Sign up with Google'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Link */}
        <View className="flex-row justify-center items-center py-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text className="text-primary-600 font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
    marginLeft: 4,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  successBanner: {
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  dividerText: {
    color: '#9ca3af',
    marginHorizontal: 16,
    fontSize: 13,
  },
  appleBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  appleBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  googleBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  googleBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
