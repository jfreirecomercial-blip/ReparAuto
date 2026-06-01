'use client';

import { useApp } from '@/providers/AppProvider';
import useNativePush from '@/hooks/useNativePush';

/**
 * Headless component that initializes native push notifications for the
 * signed-in user. Renders nothing and is a no-op on the web.
 */
export default function NativePushInit() {
  const { auth } = useApp();
  useNativePush(auth.user?.uid);
  return null;
}
