import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Heart, User, Shuffle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBottom = Math.max(insets.bottom - 16, 4);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#F0598A',
        tabBarInactiveTintColor: '#C2B8C9',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: tabBottom,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 22,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: 8,
          shadowColor: '#8B5CF6',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 24,
          elevation: 16,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Search color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="swipe"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.swipeButtonOuter}>
              <LinearGradient
                colors={['#FF6B8A', '#E8456A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.swipeButton}
              >
                <Shuffle color="#ffffff" size={24} strokeWidth={2.5} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <Heart
                color={color}
                size={22}
                strokeWidth={focused ? 2.5 : 2}
                fill={focused ? color : 'transparent'}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIcon : undefined}>
              <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="filters"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIcon: {
    transform: [{ scale: 1.05 }],
  },
  swipeButtonOuter: {
    marginTop: -20,
    shadowColor: '#FF6B8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 20,
  },
  swipeButton: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
