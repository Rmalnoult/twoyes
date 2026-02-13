import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Crown, Check, Sparkles, Heart, Filter, Volume2, Zap } from 'lucide-react-native';
import { useAuth } from '@/store';

const premiumFeatures = [
  {
    icon: Sparkles,
    title: 'Unlimited AI Recommendations',
    description: 'Get personalized name suggestions powered by AI, unlimited daily',
    free: '10 per day',
    premium: 'Unlimited',
  },
  {
    icon: Heart,
    title: 'Unlimited Favorites',
    description: 'Save as many names as you want without any restrictions',
    free: '50 names',
    premium: 'Unlimited',
  },
  {
    icon: Filter,
    title: 'Advanced Filters',
    description: 'Filter by syllables, name length, popularity ranges, and more',
    free: 'Basic',
    premium: 'All filters',
  },
  {
    icon: Volume2,
    title: 'Name Pronunciation Audio',
    description: 'Listen to professional pronunciations for every name',
    free: '✗',
    premium: '✓',
  },
  {
    icon: Zap,
    title: 'Custom Lists',
    description: 'Create unlimited custom lists to organize your favorite names',
    free: '1 list',
    premium: 'Unlimited',
  },
];

export default function PremiumScreen() {
  const { user } = useAuth();
  const isPremium = !!user && user.premium_tier !== 'free';

  const handleSubscribe = (period: 'monthly' | 'yearly') => {
    // TODO: Implement Stripe/RevenueCat subscription flow
    console.log('Subscribe:', period);
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="bg-gradient-to-br from-primary-500 to-primary-600 px-6 pt-16 pb-12" style={{ backgroundColor: '#ea546c' }}>
        <View className="items-center">
          <View className="w-20 h-20 bg-white bg-opacity-20 rounded-full items-center justify-center mb-4">
            <Crown size={40} color="white" />
          </View>
          <Text className="text-4xl font-bold text-white mb-3 text-center">
            Upgrade to Premium
          </Text>
          <Text className="text-white text-opacity-90 text-center text-lg">
            Unlock all features and find the perfect name faster
          </Text>
        </View>
      </View>

      {/* Features List */}
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6">What's Included</Text>
        <View className="gap-4">
          {premiumFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <View key={idx} className="bg-white border border-gray-200 rounded-2xl p-4">
                <View className="flex-row items-start mb-3">
                  <View className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center mr-3">
                    <Icon size={20} color="#ea546c" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between pl-13 pt-2 border-t border-gray-100">
                  <View>
                    <Text className="text-xs text-gray-500 mb-1">Free</Text>
                    <Text className="text-sm font-semibold text-gray-700">{feature.free}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-primary-600 mb-1">Premium</Text>
                    <Text className="text-sm font-bold text-primary-600">{feature.premium}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Pricing */}
      {!isPremium && (
        <View className="px-6 pb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</Text>

          {/* Yearly Plan (Recommended) */}
          <TouchableOpacity
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-6 mb-4 border-4 border-secondary-400"
            style={{ backgroundColor: '#ea546c' }}
            onPress={() => handleSubscribe('yearly')}
          >
            <View className="absolute -top-3 right-4 bg-secondary-500 px-3 py-1 rounded-full">
              <Text className="text-white font-bold text-xs">SAVE 17%</Text>
            </View>
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-white mb-1">Yearly</Text>
                <Text className="text-white text-opacity-90">Best Value</Text>
              </View>
              <View className="items-end">
                <Text className="text-4xl font-bold text-white">$49.99</Text>
                <Text className="text-white text-opacity-90">/year</Text>
              </View>
            </View>
            <View className="bg-white bg-opacity-20 rounded-2xl p-3">
              <Text className="text-white text-center font-semibold">
                Just $4.17/month • Save $10
              </Text>
            </View>
          </TouchableOpacity>

          {/* Monthly Plan */}
          <TouchableOpacity
            className="bg-white border-2 border-gray-200 rounded-3xl p-6"
            onPress={() => handleSubscribe('monthly')}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">Monthly</Text>
                <Text className="text-gray-600">Flexible</Text>
              </View>
              <View className="items-end">
                <Text className="text-4xl font-bold text-gray-900">$4.99</Text>
                <Text className="text-gray-600">/month</Text>
              </View>
            </View>
            <View className="bg-gray-100 rounded-2xl p-3">
              <Text className="text-gray-700 text-center font-semibold">
                Cancel anytime
              </Text>
            </View>
          </TouchableOpacity>

          {/* Trust Signals */}
          <View className="mt-6 gap-2">
            <View className="flex-row items-center">
              <Check size={16} color="#10b981" />
              <Text className="text-sm text-gray-600 ml-2">7-day free trial</Text>
            </View>
            <View className="flex-row items-center">
              <Check size={16} color="#10b981" />
              <Text className="text-sm text-gray-600 ml-2">Cancel anytime, no questions asked</Text>
            </View>
            <View className="flex-row items-center">
              <Check size={16} color="#10b981" />
              <Text className="text-sm text-gray-600 ml-2">Secure payment via Apple/Google</Text>
            </View>
          </View>

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            Subscription automatically renews unless canceled at least 24 hours before the end of
            the current period. Manage subscriptions in App Store settings.
          </Text>
        </View>
      )}

      {/* Already Premium */}
      {isPremium && (
        <View className="px-6 pb-8">
          <View className="bg-green-50 border border-green-200 rounded-3xl p-6 items-center">
            <Crown size={48} color="#10b981" />
            <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              You're Premium!
            </Text>
            <Text className="text-center text-gray-600 mb-6">
              Enjoy all premium features. Your subscription is active.
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-2xl py-3 px-6"
              onPress={() => router.back()}
            >
              <Text className="text-gray-900 font-semibold">Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
