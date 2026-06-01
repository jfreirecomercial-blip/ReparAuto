// Thin wrapper around Capacitor platform detection so the rest of the codebase
// can branch between native (Android/iOS app shell) and web at runtime while
// sharing a single UI/codebase. On the web, `isNativePlatform()` returns false
// and the existing web implementations are used.
import { Capacitor } from '@capacitor/core';

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/** 'ios' | 'android' on devices, 'web' in the browser. */
export function getPlatform(): string {
  return Capacitor.getPlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === 'ios';
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === 'android';
}
