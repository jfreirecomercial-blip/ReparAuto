import { useSyncExternalStore } from 'react';

type ConnectionSpeed = 'fast' | 'slow' | 'offline';

interface NetworkStatus {
  online: boolean;
  speed: ConnectionSpeed;
  effectiveType: string | null;
  downlink: number | null;
}

interface NetworkInformation {
  effectiveType: string;
  downlink: number;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

function getConnection(): NetworkInformation | null {
  const nav = navigator as typeof navigator & { connection?: NetworkInformation };
  return nav.connection || null;
}

function getSnapshot(): NetworkStatus {
  if (!navigator.onLine) {
    return { online: false, speed: 'offline', effectiveType: null, downlink: null };
  }

  const conn = getConnection();
  if (!conn) {
    return { online: true, speed: 'fast', effectiveType: null, downlink: null };
  }

  const slow = conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.downlink < 0.5;
  return {
    online: true,
    speed: slow ? 'slow' : 'fast',
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
  };
}

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  const conn = getConnection();
  if (conn) conn.addEventListener('change', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
    if (conn) conn.removeEventListener('change', callback);
  };
}

function getServerSnapshot(): NetworkStatus {
  return { online: true, speed: 'fast', effectiveType: null, downlink: null };
}

export default function useNetworkStatus(): NetworkStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
