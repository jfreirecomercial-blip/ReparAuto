'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { isNativePlatform } from '@/lib/native/platform';
import {
  getNativePushTokenIfAuthorized,
  onNativeTokenRefresh,
  onNativeNotificationTap,
} from '@/lib/native/push';

/**
 * Wires native push notifications for a signed-in user (no-op on web).
 * - Persists the current FCM token on `users/{uid}.fcmToken` when notifications
 *   were already authorized (does not trigger the permission dialog — that
 *   happens via an explicit user action elsewhere).
 * - Keeps the stored token in sync when Firebase rotates it.
 * - Deep-links to a notification's `link` payload when the user taps it
 *   (handles cold-start taps too, since the listener is registered app-wide).
 */
export default function useNativePush(uid?: string | null): void {
  const router = useRouter();

  useEffect(() => {
    if (!isNativePlatform() || !uid) return;

    let active = true;
    const saveToken = async (token: string) => {
      try {
        await setDoc(doc(db, 'users', uid), { fcmToken: token }, { merge: true });
      } catch {
        // best-effort
      }
    };

    void (async () => {
      const token = await getNativePushTokenIfAuthorized();
      if (active && token) await saveToken(token);
    })();

    const offRefresh = onNativeTokenRefresh((token) => void saveToken(token));
    const offTap = onNativeNotificationTap((notification) => {
      const link = (notification.data as Record<string, string> | undefined)?.link;
      if (link) router.push(link);
    });

    return () => {
      active = false;
      offRefresh();
      offTap();
    };
  }, [uid, router]);
}
