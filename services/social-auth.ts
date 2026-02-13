import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * Apple Sign-In
 * Uses expo-apple-authentication for native Apple Sign-In
 */
export async function signInWithApple() {
  try {
    // Check if Apple Auth is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Request Apple ID credential
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Sign in with Supabase using ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken!,
      nonce: credential.nonce,
    });

    if (error) throw error;

    // Update profile with full name if available
    if (credential.fullName) {
      const displayName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ');

      if (displayName && data.user) {
        await supabase
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', data.user.id);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User canceled the sign-in flow
      return { data: null, error: null };
    }
    console.error('Apple Sign-In error:', error);
    return { data: null, error };
  }
}

/**
 * Google Sign-In
 * Uses OAuth 2.0 with PKCE flow via expo-auth-session
 */
export async function signInWithGoogle() {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'com.twoyes.app',
    });

    // Get Google OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;

    // Open browser for OAuth flow
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    if (result.type === 'success') {
      // Extract tokens from callback URL
      const { url } = result;
      const params = new URL(url).searchParams;
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set session in Supabase
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

        if (sessionError) throw sessionError;

        return { data: sessionData, error: null };
      }
    }

    return { data: null, error: null }; // User canceled
  } catch (error) {
    console.error('Google Sign-In error:', error);
    return { data: null, error };
  }
}

/**
 * Check if Apple Sign-In is available on this device
 */
export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}
