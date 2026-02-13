import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { X, Check } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface FiltersProps {
  onApply: (filters: AdvancedFilters) => void;
  initialFilters?: AdvancedFilters;
}

export interface AdvancedFilters {
  syllables?: number[];
  nameLength?: [number, number];
  popularityRange?: [number, number];
  origins?: string[];
}

export default function FiltersScreen() {
  const [syllables, setSyllables] = useState<number[]>([]);
  const [nameLength, setNameLength] = useState<[number, number]>([3, 12]);
  const [popularityRange, setPopularityRange] = useState<[number, number]>([1, 1000]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);

  const origins = [
    'english',
    'french',
    'german',
    'italian',
    'spanish',
    'greek',
    'hebrew',
    'latin',
    'irish',
    'scottish',
    'welsh',
    'scandinavian',
  ];

  const syllableOptions = [1, 2, 3, 4, 5];

  const toggleSyllable = (count: number) => {
    if (syllables.includes(count)) {
      setSyllables(syllables.filter((s) => s !== count));
    } else {
      setSyllables([...syllables, count]);
    }
  };

  const toggleOrigin = (origin: string) => {
    if (selectedOrigins.includes(origin)) {
      setSelectedOrigins(selectedOrigins.filter((o) => o !== origin));
    } else {
      setSelectedOrigins([...selectedOrigins, origin]);
    }
  };

  const handleApply = () => {
    // TODO: Pass filters back to browse screen
    router.back();
  };

  const handleReset = () => {
    setSyllables([]);
    setNameLength([3, 12]);
    setPopularityRange([1, 1000]);
    setSelectedOrigins([]);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <X size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text className="text-primary-600 font-medium">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Syllables */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Syllables</Text>
          <View className="flex-row flex-wrap gap-2">
            {syllableOptions.map((count) => (
              <TouchableOpacity
                key={count}
                className={`px-4 py-2 rounded-full border ${
                  syllables.includes(count)
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => toggleSyllable(count)}
              >
                <View className="flex-row items-center">
                  {syllables.includes(count) && <Check size={16} color="white" className="mr-1" />}
                  <Text
                    className={`font-medium ${syllables.includes(count) ? 'text-white' : 'text-gray-700'}`}
                  >
                    {count} {count === 1 ? 'syllable' : 'syllables'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Name Length */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Name Length</Text>
            <Text className="text-sm text-gray-600">
              {nameLength[0]} - {nameLength[1]} letters
            </Text>
          </View>
          <Slider
            minimumValue={3}
            maximumValue={15}
            step={1}
            value={nameLength[1]}
            onValueChange={(value) => setNameLength([nameLength[0], value])}
            minimumTrackTintColor="#ea546c"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#ea546c"
          />
        </View>

        {/* Popularity Range */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Popularity</Text>
            <Text className="text-sm text-gray-600">
              Top {popularityRange[0]} - {popularityRange[1]}
            </Text>
          </View>
          <Slider
            minimumValue={1}
            maximumValue={1000}
            step={10}
            value={popularityRange[1]}
            onValueChange={(value) => setPopularityRange([popularityRange[0], value])}
            minimumTrackTintColor="#ea546c"
            maximumTrackTintColor="#e5e7eb"
            thumbTintColor="#ea546c"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-gray-500">Most Popular</Text>
            <Text className="text-xs text-gray-500">Least Popular</Text>
          </View>
        </View>

        {/* Origins */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Cultural Origins</Text>
          <View className="flex-row flex-wrap gap-2">
            {origins.map((origin) => (
              <TouchableOpacity
                key={origin}
                className={`px-4 py-2 rounded-full border ${
                  selectedOrigins.includes(origin)
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-gray-200'
                }`}
                onPress={() => toggleOrigin(origin)}
              >
                <Text
                  className={`font-medium capitalize ${selectedOrigins.includes(origin) ? 'text-white' : 'text-gray-700'}`}
                >
                  {origin}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View className="px-6 pb-8 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-primary-600 rounded-2xl py-4 items-center"
          onPress={handleApply}
        >
          <Text className="text-white font-semibold text-lg">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
