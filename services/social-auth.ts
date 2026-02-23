import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/**
 * Apple Sign-In
 * Uses expo-apple-authentication for native Apple Sign-In
 * with proper nonce generation for Supabase ID token verification
 */
export async function signInWithApple() {
  try {
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Generate nonce: raw for Supabase, SHA-256 hash for Apple
    const rawNonce = Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawNonce
    );

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('No identity token received from Apple');
    }

    // Sign in with Supabase using ID token + raw nonce
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    // Update profile with full name if available (Apple only provides this on first sign-in)
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
    const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'twoyes' });

    // Get Google OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('No OAuth URL received from Supabase');

    // Open browser for OAuth flow
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type !== 'success') {
      return { data: null, error: null }; // User canceled
    }

    // Parse callback URL — custom scheme URLs (twoyes://...) don't parse
    // reliably with new URL(), so extract params manually
    const params = extractUrlParams(result.url);

    // PKCE flow: Supabase returns a code in query params
    if (params.code) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(params.code);
      if (sessionError) throw sessionError;
      return { data: sessionData, error: null };
    }

    // Implicit flow fallback: tokens in hash fragment
    if (params.access_token && params.refresh_token) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      if (sessionError) throw sessionError;
      return { data: sessionData, error: null };
    }

    // Check for error in callback
    if (params.error_description) {
      throw new Error(decodeURIComponent(params.error_description));
    }
    if (params.error) {
      throw new Error(params.error);
    }

    throw new Error('No authentication code or tokens received from Google');
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return { data: null, error };
  }
}

/**
 * Extract query and hash fragment parameters from a URL string.
 * Works reliably with custom scheme URLs (e.g. twoyes://...?code=xxx)
 * where new URL() would throw.
 */
function extractUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  // Query params
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = url.substring(queryIndex + 1).split('#')[0];
    for (const pair of queryString.split('&')) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex !== -1) {
        params[pair.substring(0, eqIndex)] = decodeURIComponent(pair.substring(eqIndex + 1));
      }
    }
  }

  // Hash fragment params
  const hashIndex = url.indexOf('#');
  if (hashIndex !== -1) {
    const hashString = url.substring(hashIndex + 1);
    for (const pair of hashString.split('&')) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex !== -1) {
        params[pair.substring(0, eqIndex)] = decodeURIComponent(pair.substring(eqIndex + 1));
      }
    }
  }

  return params;
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
