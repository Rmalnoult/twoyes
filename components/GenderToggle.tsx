import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useGenderPreference, type GenderPreference } from '@/store';

const OPTIONS: { label: string; value: GenderPreference; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '\u2728' },
  { label: 'Girl', value: 'female', emoji: '\uD83C\uDF38' },
  { label: 'Boy', value: 'male', emoji: '\uD83D\uDC99' },
  { label: 'Unisex', value: 'unisex', emoji: '\uD83C\uDF1F' },
];

const CHIP_COLORS: Record<GenderPreference, { bg: string; text: string }> = {
  all: { bg: '#7C3AED', text: '#ffffff' },
  female: { bg: '#F472B6', text: '#ffffff' },
  male: { bg: '#60A5FA', text: '#ffffff' },
  unisex: { bg: '#FBBF24', text: '#78350F' },
};

export default function GenderToggle() {
  const { genderPreference, setGenderPreference } = useGenderPreference();

  return (
    <View style={s.container}>
      {OPTIONS.map((opt) => {
        const active = genderPreference === opt.value;
        const colors = CHIP_COLORS[opt.value];
        return (
          <Pressable
            key={opt.value}
            style={[
              s.chip,
              active && { backgroundColor: colors.bg },
            ]}
            onPress={() => setGenderPreference(opt.value)}
          >
            <Text style={[s.chipText, active && { color: colors.text }]}>
              {active ? opt.emoji + ' ' : ''}{opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F3F0F7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7FA3',
  },
});
