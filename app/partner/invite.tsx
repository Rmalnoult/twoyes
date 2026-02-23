import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Users, Copy, Mail, MessageCircle } from 'lucide-react-native';
import { useAuth } from '@/store';
import { supabase } from '@/services/supabase';
import * as Clipboard from 'expo-clipboard';

export default function InvitePartnerScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const generateInviteCode = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Generate a unique invite code
      const code = `${user.id.substring(0, 8)}-${Date.now().toString(36)}`;

      // Store invite in database
      const { error } = await supabase.from('partner_invites').insert({
        inviter_id: user.id,
        invite_code: code,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      if (error) throw error;

      setInviteCode(code);
    } catch (error) {
      console.error('Failed to generate invite:', error);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailInvite = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    await generateInviteCode();

    // TODO: Implement email sending via Supabase Edge Function
    Alert.alert(
      'Invite Sent!',
      `An invitation email will be sent to ${email}`,
      [{ text: 'OK' }]
    );
  };

  const copyInviteLink = async () => {
    if (!inviteCode) {
      await generateInviteCode();
      return;
    }

    const link = `twoyes://partner/join?code=${inviteCode}`;
    await Clipboard.setStringAsync(link);
    Alert.alert('Copied!', 'Invite link copied to clipboard');
  };

  const shareInvite = async () => {
    if (!inviteCode) {
      await generateInviteCode();
      return;
    }

    try {
      await Share.share({
        message: `Join me on TwoYes to find the perfect baby name together! Install the app from TestFlight, then go to Profile → Partner and enter this code:\n\n${inviteCode}`,
        title: 'TwoYes Partner Invite',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-12 pb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">Invite Partner</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 px-6">
        {/* Hero */}
        <View className="items-center py-8">
          <View className="w-24 h-24 bg-primary-50 rounded-full items-center justify-center mb-4">
            <Users size={48} color="#ea546c" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
            Find Names Together
          </Text>
          <Text className="text-base text-gray-600 text-center leading-relaxed">
            Invite your partner to swipe on names. When you both like a name, it's a match!
          </Text>
        </View>

        {/* Email Invite */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Invite by Email
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
              placeholder="partner@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              className="bg-primary-600 rounded-xl px-6 items-center justify-center"
              onPress={sendEmailInvite}
              disabled={loading}
            >
              <Mail size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="text-sm text-gray-500 mx-4">OR</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Share Options */}
        <View className="gap-3">
          <TouchableOpacity
            className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-4"
            onPress={copyInviteLink}
            disabled={loading}
          >
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
              <Copy size={24} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Copy Invite Link</Text>
              <Text className="text-sm text-gray-600">Share via text or messaging app</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-4"
            onPress={shareInvite}
            disabled={loading}
          >
            <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
              <MessageCircle size={24} color="#10b981" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">Share Invite</Text>
              <Text className="text-sm text-gray-600">Send via any app</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Invite Code Display */}
        {inviteCode && (
          <View className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2 text-center">
              Your Invite Code
            </Text>
            <Text className="text-2xl font-bold text-primary-600 text-center tracking-wider">
              {inviteCode}
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-2">
              Expires in 7 days
            </Text>
          </View>
        )}

        {/* Info */}
        <View className="mt-8 bg-primary-50 border border-primary-100 rounded-2xl p-4">
          <Text className="text-sm text-gray-700 leading-relaxed">
            💡 <Text className="font-semibold">Tip:</Text> Once your partner joins with your invite
            code, you'll both see when you match on names you both love!
          </Text>
        </View>

        {/* Have a code? */}
        <TouchableOpacity
          className="mt-6"
          onPress={() => router.push('/partner/accept')}
        >
          <Text className="text-center text-primary-600 font-medium">
            Already have an invite code? Enter it here
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
