import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

let isOnline = true;

/**
 * Initialize network monitoring
 */
export function initializeNetworkMonitoring() {
  NetInfo.addEventListener((state) => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;

    if (wasOffline && isOnline) {
      // Back online
      console.log('Connection restored');
    } else if (!isOnline) {
      // Gone offline
      console.log('Connection lost');
    }
  });
}

/**
 * Check if device is online
 */
export async function checkConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}

/**
 * Wait for connection to be restored
 */
export async function waitForConnection(
  timeoutMs: number = 30000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await checkConnection()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Show offline alert
 */
export function showOfflineAlert() {
  Alert.alert(
    'No Connection',
    'Please check your internet connection and try again.',
    [{ text: 'OK' }]
  );
}

/**
 * Wrapper for operations that require network
 */
export async function requireConnection<T>(
  fn: () => Promise<T>,
  options: {
    showAlert?: boolean;
    waitForReconnect?: boolean;
  } = {}
): Promise<T | null> {
  const { showAlert = true, waitForReconnect = false } = options;

  const connected = await checkConnection();

  if (!connected) {
    if (waitForReconnect) {
      const reconnected = await waitForConnection();
      if (!reconnected) {
        if (showAlert) showOfflineAlert();
        return null;
      }
    } else {
      if (showAlert) showOfflineAlert();
      return null;
    }
  }

  return await fn();
}

export function isOnlineStatus() {
  return isOnline;
}
