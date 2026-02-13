import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';

// Simple web demo showcasing TwoYes features
export default function App() {
  const [likedNames, setLikedNames] = useState<string[]>([]);

  const sampleNames = [
    { name: 'Emma', origin: 'Germanic', meaning: 'Universal', syllables: 2 },
    { name: 'Oliver', origin: 'Latin', meaning: 'Olive tree', syllables: 3 },
    { name: 'Sophia', origin: 'Greek', meaning: 'Wisdom', syllables: 3 },
    { name: 'Liam', origin: 'Irish', meaning: 'Strong-willed warrior', syllables: 2 },
    { name: 'Ava', origin: 'Latin', meaning: 'Like a bird', syllables: 2 },
  ];

  const handleLike = (name: string) => {
    setLikedNames(prev => [...prev, name]);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>TwoYes</Text>
        <Text style={styles.subtitle}>Find the Perfect Baby Name Together</Text>
        <Text style={styles.notice}>
          📱 Web Demo - Full app available on iOS & Android
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Features Built</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>✅ Professional animations & transitions</Text>
          <Text style={styles.feature}>✅ Advanced filtering (syllables, length, origin)</Text>
          <Text style={styles.feature}>✅ Apple & Google Sign-In ready</Text>
          <Text style={styles.feature}>✅ Partner matching & invitations</Text>
          <Text style={styles.feature}>✅ AI-powered recommendations</Text>
          <Text style={styles.feature}>✅ Robust error handling & offline mode</Text>
          <Text style={styles.feature}>✅ Analytics infrastructure</Text>
          <Text style={styles.feature}>✅ Premium subscription support</Text>
        </View>
      </View>

      {/* Sample Names */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💝 Sample Names</Text>
        <Text style={styles.hint}>Tap a name to "like" it</Text>

        {sampleNames.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.nameCard,
              likedNames.includes(item.name) && styles.nameCardLiked
            ]}
            onPress={() => handleLike(item.name)}
          >
            <View style={styles.nameHeader}>
              <Text style={styles.nameName}>{item.name}</Text>
              {likedNames.includes(item.name) && (
                <Text style={styles.likedBadge}>❤️ Liked</Text>
              )}
            </View>
            <Text style={styles.nameDetail}>Origin: {item.origin}</Text>
            <Text style={styles.nameDetail}>Meaning: {item.meaning}</Text>
            <Text style={styles.nameDetail}>Syllables: {item.syllables}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Development Status</Text>
        <View style={styles.statusBar}>
          <View style={[styles.statusFill, { width: '95%' }]} />
          <Text style={styles.statusText}>95% Complete</Text>
        </View>
        <Text style={styles.statusNote}>✅ Database: 30 names with AI embeddings</Text>
        <Text style={styles.statusNote}>✅ All migrations applied</Text>
        <Text style={styles.statusNote}>✅ Authentication system ready</Text>
        <Text style={styles.statusNote}>✅ Premium features implemented</Text>
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 Ready for Launch</Text>
        <Text style={styles.nextStep}>1. Create app icon & screenshots</Text>
        <Text style={styles.nextStep}>2. Set up Stripe payments</Text>
        <Text style={styles.nextStep}>3. TestFlight beta testing</Text>
        <Text style={styles.nextStep}>4. App Store submission</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Full app testing requires iOS simulator or Android emulator
        </Text>
        <Text style={styles.footerText}>
          Native features (animations, gestures, auth) not available on web
        </Text>
        <Text style={styles.footerText}>
          Check START_HERE.md for testing instructions
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 30,
    backgroundColor: '#ea546c',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
  notice: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 4,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  nameCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  nameCardLiked: {
    backgroundColor: '#fff5f7',
    borderColor: '#ea546c',
  },
  nameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ea546c',
  },
  likedBadge: {
    fontSize: 14,
    color: '#ea546c',
    fontWeight: '600',
  },
  nameDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBar: {
    height: 40,
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 15,
  },
  statusFill: {
    height: '100%',
    backgroundColor: '#ea546c',
  },
  statusText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    lineHeight: 40,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusNote: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 6,
  },
  nextStep: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});
