// Native push notifications for the Capacitor app shell, via Firebase Cloud
// Messaging (FCM token on both Android and iOS). The token is stored on the
// same `users/{uid}.fcmToken` field used by the web flow, so the existing
// server-side sending logic works unchanged across web and native.
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import type { Notification } from '@capacitor-firebase/messaging';

/**
 * Request notification permission and return the FCM registration token,
 * or null if permission was denied / unavailable.
 */
export async function requestNativePushToken(): Promise<string | null> {
  try {
    const perm = await FirebaseMessaging.requestPermissions();
    if (perm.receive !== 'granted') return null;
    const { token } = await FirebaseMessaging.getToken();
    return token || null;
  } catch {
    return null;
  }
}

/** Foreground messages received while the app is open. */
export function onNativeMessage(
  callback: (notification: Notification) => void,
): () => void {
  const handle = FirebaseMessaging.addListener('notificationReceived', (event) => {
    callback(event.notification);
  });
  return () => {
    void handle.then((h) => h.remove());
  };
}

/** User tapped a notification (foreground or background). Use to deep-link. */
export function onNativeNotificationTap(
  callback: (notification: Notification) => void,
): () => void {
  const handle = FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
    callback(event.notification);
  });
  return () => {
    void handle.then((h) => h.remove());
  };
}
