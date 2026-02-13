import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSignIn } from '@/hooks/useAuth';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useSignIn();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn.mutateAsync({ email, password });
      // Navigation is handled by AuthProvider in _layout.tsx
      // when onAuthStateChange fires with the new session.
      // Reset loading after a short delay as a safety net in case navigation doesn't fire.
      setTimeout(() => setIsLoading(false), 3000);
    } catch (error: any) {
      const msg = error.message || 'Please check your credentials and try again';
      Alert.alert('Sign In Failed', msg);
      setIsLoading(false);
    }
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
          <Text style={s.title}>Welcome back!</Text>
          <Text style={s.subtitle}>Sign in to continue your name discovery</Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6" style={{ gap: 16 }}>
          {/* Email Input */}
          <View>
            <Text style={s.label}>Email</Text>
            <View style={s.inputWrap}>
              <Mail size={18} color="#9CA3AF" />
              <TextInput
                style={s.input}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View>
            <Text style={s.label}>Password</Text>
            <View style={s.inputWrap}>
              <Lock size={18} color="#9CA3AF" />
              <TextInput
                style={s.input}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.6}>
                {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity className="self-end" activeOpacity={0.6}>
            <Text className="text-primary-600 font-semibold text-sm">Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isLoading ? ['#f7aab2', '#f7aab2'] : ['#ea546c', '#d5294d']}
              style={s.primaryBtn}
            >
              <Text style={s.primaryBtnText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Auth Buttons */}
          <TouchableOpacity style={s.appleBtn} activeOpacity={0.8}>
            <Text style={s.appleBtnText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.googleBtn} activeOpacity={0.7}>
            <Text style={s.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center py-6">
          <Text className="text-gray-500">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-primary-600 font-bold">Sign Up</Text>
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
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
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
    marginVertical: 8,
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
