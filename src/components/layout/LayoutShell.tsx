'use client';

import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';
import ChatModal from '@/components/chat/ChatModal';

export default function LayoutShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-5 w-full">{children}</main>
      <Footer />
      <BottomNav />
      <ChatModal />
    </div>
  );
}
