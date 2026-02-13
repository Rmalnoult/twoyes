import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Heart, Sparkles, Users, BookOpen, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#fff5f6', '#ffffff', '#f0f9ff']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Hero Section */}
      <View style={styles.hero}>
        {/* Logo */}
        <View style={styles.logoOuter}>
          <View style={styles.logoGlow} />
          <View style={styles.logoInner}>
            <Heart size={36} color="#ffffff" fill="#ffffff" />
          </View>
        </View>

        <Text style={styles.title}>TwoYes</Text>
        <Text style={styles.subtitle}>
          Find the perfect name,{'\n'}together
        </Text>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#fef2f3' }]}>
              <Sparkles size={18} color="#ea546c" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Recommendations</Text>
              <Text style={styles.featureDesc}>AI learns your style</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#f0f9ff' }]}>
              <Users size={18} color="#0ba5e9" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Swipe Together</Text>
              <Text style={styles.featureDesc}>Match with your partner</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#fefce8' }]}>
              <BookOpen size={18} color="#ca8a04" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>50,000+ Names</Text>
              <Text style={styles.featureDesc}>Meanings, origins & trends</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/sign-up')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/sign-in')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.6}
        >
          <Text style={styles.guestButtonText}>Explore as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoOuter: {
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fce7eb',
    opacity: 0.6,
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#ea546c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 26,
  },
  features: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    marginLeft: 14,
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#9ca3af',
  },
  buttons: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#ea546c',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#9ca3af',
    fontSize: 15,
    fontWeight: '500',
  },
});
