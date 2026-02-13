import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useCountry, COUNTRY_LABELS, type Country } from '@/store';

const FLAGS: Record<Country, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  FR: '\u{1F1EB}\u{1F1F7}',
  UK: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  ES: '\u{1F1EA}\u{1F1F8}',
  IT: '\u{1F1EE}\u{1F1F9}',
};

const COUNTRIES: Country[] = ['US', 'FR', 'UK', 'DE', 'ES', 'IT'];

export default function CountryPicker() {
  const { country, setCountry } = useCountry();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
    >
      {COUNTRIES.map((c) => {
        const active = country === c;
        return (
          <Pressable
            key={c}
            style={[s.chip, active && s.chipActive]}
            onPress={() => setCountry(c)}
          >
            <Text style={s.flag}>{FLAGS[c]}</Text>
            <Text style={[s.label, active && s.labelActive]}>
              {COUNTRY_LABELS[c]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#F3F0F7',
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#1E1B3A',
  },
  flag: {
    fontSize: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B7FA3',
  },
  labelActive: {
    color: '#ffffff',
  },
});
