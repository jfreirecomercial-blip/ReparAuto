'use client';

import type { ReactNode } from 'react';
import AppProvider from '@/providers/AppProvider';
import { ToastProvider } from '@/components/ui/Toast';
import NativePushInit from '@/components/native/NativePushInit';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>
        <NativePushInit />
        {children}
      </ToastProvider>
    </AppProvider>
  );
}
