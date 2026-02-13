import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { User, Heart, Users, Bell, HelpCircle, LogOut, Crown, ChevronRight, Globe } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useCountry, COUNTRY_LABELS } from '@/store';
import type { Country } from '@/store';
import { useSignOut } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { user, isAuthenticated } = useAuth();
  const { country, setCountry } = useCountry();
  const signOut = useSignOut();

  const handleChangeCountry = () => {
    const countries: Country[] = ['US', 'FR', 'UK', 'DE', 'ES', 'IT'];
    const flags: Record<Country, string> = {
      US: '\u{1F1FA}\u{1F1F8}', FR: '\u{1F1EB}\u{1F1F7}', UK: '\u{1F1EC}\u{1F1E7}',
      DE: '\u{1F1E9}\u{1F1EA}', ES: '\u{1F1EA}\u{1F1F8}', IT: '\u{1F1EE}\u{1F1F9}',
    };
    Alert.alert('Select Country', 'Choose your country for name rankings', [
      ...countries.map((c) => ({
        text: `${flags[c]} ${COUNTRY_LABELS[c]}`,
        onPress: () => setCountry(c),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut.mutateAsync();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View className="flex-1 bg-gray-50">
        <View style={s.headerBar}>
          <Text className="text-2xl font-bold text-gray-900" style={{ letterSpacing: -0.5 }}>
            Profile
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View style={s.emptyIcon}>
            <User size={32} color="#9ca3af" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">Not Signed In</Text>
          <Text className="text-center text-gray-500 mb-8 text-base leading-relaxed">
            Sign in to save your preferences{'\n'}and sync with your partner
          </Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/(auth)/sign-in')}>
            <LinearGradient colors={['#ea546c', '#d5294d']} style={s.ctaBtn}>
              <Text className="text-white font-bold text-lg">Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isPremium = user.premium_tier !== 'free';

  const menuItems = [
    {
      icon: <Users size={20} color="#ea546c" />,
      iconBg: '#fef2f3',
      title: 'Partner Connection',
      subtitle: user.partner_id ? 'Connected' : 'Invite your partner',
      onPress: () => router.push('/partner/invite'),
    },
    {
      icon: <Heart size={20} color="#ef4444" />,
      iconBg: '#fef2f2',
      title: 'My Favorites',
      subtitle: 'View saved names',
      onPress: () => router.push('/(tabs)/favorites'),
    },
    {
      icon: <Globe size={20} color="#8b5cf6" />,
      iconBg: '#f5f3ff',
      title: 'Country',
      subtitle: COUNTRY_LABELS[country],
      onPress: handleChangeCountry,
    },
    {
      icon: <Bell size={20} color="#3b82f6" />,
      iconBg: '#eff6ff',
      title: 'Notifications',
      subtitle: 'Manage alerts',
    },
    {
      icon: <HelpCircle size={20} color="#10b981" />,
      iconBg: '#ecfdf5',
      title: 'Help & Support',
      subtitle: 'FAQ and contact',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <View style={s.headerBar}>
        <Text className="text-2xl font-bold text-gray-900" style={{ letterSpacing: -0.5 }}>
          Profile
        </Text>
      </View>

      {/* User Card */}
      <View className="mx-5 mb-5">
        <LinearGradient
          colors={['#ea546c', '#d5294d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.userCard}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-white mb-1">
                {user.display_name || 'User'}
              </Text>
              <Text className="text-white text-sm" style={{ opacity: 0.75 }}>
                {user.email}
              </Text>
              <View className="flex-row items-center mt-2">
                {isPremium ? (
                  <View style={s.premiumBadge}>
                    <Crown size={12} color="#ca8a04" />
                    <Text style={s.premiumText}>Premium</Text>
                  </View>
                ) : (
                  <View style={s.freeBadge}>
                    <Text style={s.freeText}>Free Plan</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {(user.display_name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <TouchableOpacity
              style={s.upgradeBtn}
              onPress={() => router.push('/(tabs)/premium')}
              activeOpacity={0.8}
            >
              <Crown size={16} color="#ea546c" />
              <Text style={s.upgradeText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Menu Items */}
      <View className="mx-5 gap-2">
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={s.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[s.menuIcon, { backgroundColor: item.iconBg }]}>
              {item.icon}
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
              <Text className="text-sm text-gray-500">{item.subtitle}</Text>
            </View>
            <ChevronRight size={18} color="#d1d5db" />
          </TouchableOpacity>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={s.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <View style={s.signOutIcon}>
            <LogOut size={18} color="#ef4444" />
          </View>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="px-5 py-8">
        <Text className="text-center text-gray-400 text-xs">TwoYes v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  userCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 16,
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ca8a04',
  },
  freeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    marginTop: 4,
  },
  upgradeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ea546c',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  signOutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    shadowColor: '#ea546c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
});
