import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging';
import app from '@/lib/firebase';
import { isNativePlatform } from '@/lib/native/platform';
import { requestNativePushToken, onNativeMessage } from '@/lib/native/push';

let messaging: ReturnType<typeof getMessaging> | null = null;

function getMessagingInstance() {
  if (!messaging) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      throw new Error('FCM requires a browser with service worker support');
    }
    messaging = getMessaging(app);
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<string | null> {
  // Native app shell: use the Capacitor FCM plugin (returns an FCM token on
  // both Android and iOS) instead of the web push / VAPID flow.
  if (isNativePlatform()) {
    return requestNativePushToken();
  }

  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  try {
    const m = getMessagingInstance();
    const token = await getToken(m, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '',
    });
    return token;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
  // On native, bridge the Capacitor notification into the web MessagePayload
  // shape so existing callers keep working without platform-specific code.
  if (isNativePlatform()) {
    return onNativeMessage((notification) => {
      callback({
        notification: {
          title: notification.title ?? undefined,
          body: notification.body ?? undefined,
        },
        data: (notification.data as Record<string, string>) ?? {},
        from: '',
        collapseKey: '',
      } as MessagePayload);
    });
  }

  try {
    const m = getMessagingInstance();
    return onMessage(m, callback);
  } catch {
    return null;
  }
}
