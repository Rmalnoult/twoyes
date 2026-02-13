import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Users, Check } from 'lucide-react-native';
import { useAuth } from '@/store';
import { supabase } from '@/services/supabase';

export default function AcceptPartnerScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState(code || '');
  const [loading, setLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  useEffect(() => {
    if (code) {
      // Auto-load invite details if code is in URL
      loadInviteDetails(code);
    }
  }, [code]);

  const loadInviteDetails = async (inputCode: string) => {
    try {
      setLoading(true);

      // Get invite details
      const { data: invite, error } = await supabase
        .from('partner_invites')
        .select('*, profiles!partner_invites_inviter_id_fkey(display_name, email)')
        .eq('invite_code', inputCode)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !invite) {
        Alert.alert('Invalid Code', 'This invite code is invalid or has expired.');
        return;
      }

      setInviteDetails(invite);
    } catch (error) {
      console.error('Failed to load invite:', error);
      Alert.alert('Error', 'Failed to load invite details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to accept this invite', [
        {
          text: 'Sign In',
          onPress: () => router.push('/(auth)/sign-in'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!inviteCode) {
      Alert.alert('Missing Code', 'Please enter an invite code');
      return;
    }

    try {
      setLoading(true);

      // Call stored procedure to accept invite
      const { data, error } = await supabase.rpc('accept_partner_invite', {
        p_invite_code: inviteCode,
      });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        Alert.alert('Failed', result.error || 'Failed to accept invite');
        return;
      }

      // Success!
      Alert.alert(
        'Success! 🎉',
        'You are now connected with your partner. Start swiping to find matches!',
        [
          {
            text: 'Start Swiping',
            onPress: () => router.replace('/(tabs)/swipe'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to accept invite:', error);
      Alert.alert('Error', error.message || 'Failed to accept invite. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 pt-12">
      {/* Header */}
      <View className="items-center py-8">
        <View className="w-24 h-24 bg-primary-50 rounded-full items-center justify-center mb-6">
          <Users size={48} color="#ea546c" />
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Partner Invitation
        </Text>
        <Text className="text-base text-gray-600 text-center leading-relaxed">
          Enter the invite code from your partner to connect your accounts
        </Text>
      </View>

      {/* Invite Code Input */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Invite Code</Text>
        <TextInput
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-lg text-center tracking-wider"
          placeholder="XXXX-XXXX-XXXX"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      {/* Load Button */}
      {!inviteDetails && (
        <TouchableOpacity
          className="bg-gray-100 rounded-2xl py-3 mb-4"
          onPress={() => loadInviteDetails(inviteCode)}
          disabled={loading || !inviteCode}
        >
          <Text className="text-gray-900 font-semibold text-center">
            {loading ? 'Loading...' : 'Verify Code'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Invite Details */}
      {inviteDetails && (
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Check size={20} color="#10b981" />
            <Text className="text-green-800 font-semibold ml-2">Valid Invite</Text>
          </View>
          <Text className="text-sm text-green-700">
            From: {inviteDetails.profiles?.display_name || inviteDetails.profiles?.email}
          </Text>
        </View>
      )}

      {/* Accept Button */}
      <TouchableOpacity
        className={`rounded-2xl py-4 ${
          inviteDetails && !loading ? 'bg-primary-600' : 'bg-gray-300'
        }`}
        onPress={handleAcceptInvite}
        disabled={!inviteDetails || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg text-center">
            Accept & Connect
          </Text>
        )}
      </TouchableOpacity>

      {/* Info */}
      <View className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-4">
        <Text className="text-sm text-gray-700 leading-relaxed">
          💡 <Text className="font-semibold">Tip:</Text> Once connected, you'll both see when you
          match on names you both love! Start swiping independently and watch for matches.
        </Text>
      </View>

      {/* Don't have code? */}
      <TouchableOpacity
        className="mt-6"
        onPress={() => router.push('/partner/invite')}
      >
        <Text className="text-center text-primary-600 font-medium">
          Don't have a code? Invite your partner
        </Text>
      </TouchableOpacity>
    </View>
  );
}
