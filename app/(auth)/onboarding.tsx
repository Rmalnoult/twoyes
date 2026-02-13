import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth, useStore } from '@/store';
import { useUpdateProfile } from '@/hooks/useAuth';
import type { Country } from '@/store';

const COUNTRY_OPTIONS: { value: Country; label: string; flag: string }[] = [
  { value: 'US', label: 'United States', flag: '\u{1F1FA}\u{1F1F8}' },
  { value: 'FR', label: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { value: 'UK', label: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}' },
];

const GENDER_OPTIONS = [
  { value: 'girl', label: '\u{1F467} Girl', emoji: '\u{1F495}' },
  { value: 'boy', label: '\u{1F466} Boy', emoji: '\u{1F499}' },
  { value: 'surprise', label: '\u{1F381} Surprise!', emoji: '\u{2728}' },
];

const STYLE_OPTIONS = [
  { value: 'classic', label: 'Classic & Timeless' },
  { value: 'modern', label: 'Modern & Trendy' },
  { value: 'unique', label: 'Unique & Rare' },
  { value: 'vintage', label: 'Vintage & Retro' },
  { value: 'international', label: 'International' },
];

const ORIGIN_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'italian', label: 'Italian' },
  { value: 'greek', label: 'Greek' },
  { value: 'hebrew', label: 'Hebrew' },
  { value: 'irish', label: 'Irish' },
  { value: 'german', label: 'German' },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<Country | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [styles, setStyles] = useState<string[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();

  const handleComplete = async () => {
    if (!user) return;

    // Persist country in Zustand store
    if (country) {
      useStore.getState().setCountry(country);
    }

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          preferences: {
            country,
            gender,
            styles,
            origins,
            due_date: dueDate,
            onboarded: true,
          },
        },
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      router.replace('/(tabs)');
    }
  };

  const toggleStyle = (style: string) => {
    setStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleOrigin = (origin: string) => {
    setOrigins((prev) =>
      prev.includes(origin) ? prev.filter((o) => o !== origin) : [...prev, origin]
    );
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return country !== null;
      case 2:
        return gender !== null;
      case 3:
        return styles.length > 0;
      case 4:
        return true; // Optional
      default:
        return true;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Progress Bar */}
      <View className="px-6 pt-12 pb-4">
        <View className="flex-row gap-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-primary-600' : 'bg-gray-200'}`}
            />
          ))}
        </View>
        <Text className="text-sm text-gray-500 mt-2">Step {step} of {TOTAL_STEPS}</Text>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* Step 1: Country */}
        {step === 1 && (
          <View className="py-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Where are you based?
            </Text>
            <Text className="text-base text-gray-600 mb-8">
              We'll show you the most popular names in your country
            </Text>

            <View className="gap-3">
              {COUNTRY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`border-2 rounded-2xl p-4 ${country === option.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                  onPress={() => setCountry(option.value)}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Text className="text-2xl">{option.flag}</Text>
                      <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
                    </View>
                    {country === option.value && (
                      <View className="w-6 h-6 rounded-full bg-primary-600 items-center justify-center">
                        <Text className="text-white text-xs font-bold">{'\u2713'}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Gender */}
        {step === 2 && (
          <View className="py-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Are you having a...?
            </Text>
            <Text className="text-base text-gray-600 mb-8">
              This helps us personalize your recommendations
            </Text>

            <View className="gap-3">
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`border-2 rounded-2xl p-4 ${gender === option.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                  onPress={() => setGender(option.value)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
                    <Text className="text-2xl">{option.emoji}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Style Preferences */}
        {step === 3 && (
          <View className="py-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              What's your style?
            </Text>
            <Text className="text-base text-gray-600 mb-8">
              Select all that resonate with you
            </Text>

            <View className="gap-3">
              {STYLE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`border-2 rounded-2xl p-4 ${styles.includes(option.value) ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                  onPress={() => toggleStyle(option.value)}
                >
                  <Text className="text-lg font-semibold text-gray-900">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Cultural Origins (Optional) */}
        {step === 4 && (
          <View className="py-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              Cultural preferences?
            </Text>
            <Text className="text-base text-gray-600 mb-8">
              Optional - Select origins you'd like to explore
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {ORIGIN_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`border-2 rounded-full px-4 py-2 ${origins.includes(option.value) ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
                  onPress={() => toggleOrigin(option.value)}
                >
                  <Text
                    className={`text-base ${origins.includes(option.value) ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-8 gap-3">
        {step < TOTAL_STEPS ? (
          <>
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center ${canContinue() ? 'bg-primary-600' : 'bg-gray-300'}`}
              onPress={() => setStep(step + 1)}
              disabled={!canContinue()}
            >
              <Text className="text-white text-lg font-semibold">Continue</Text>
            </TouchableOpacity>
            {step > 1 && (
              <TouchableOpacity className="py-3 items-center" onPress={() => setStep(step - 1)}>
                <Text className="text-gray-600">Back</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              className="bg-primary-600 rounded-2xl py-4 items-center"
              onPress={handleComplete}
            >
              <Text className="text-white text-lg font-semibold">Get Started!</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 items-center" onPress={() => setStep(step - 1)}>
              <Text className="text-gray-600">Back</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity className="py-2 items-center" onPress={() => router.replace('/(tabs)')}>
          <Text className="text-gray-500 text-sm">Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
