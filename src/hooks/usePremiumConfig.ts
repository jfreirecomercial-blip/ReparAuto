'use client';

import { useApp } from '@/providers/AppProvider';

export default function usePremiumConfig() {
  const { premiumConfig } = useApp();
  const masterActive = premiumConfig?.masterActive !== false;

  return {
    masterActive,
    impulsionamento: masterActive && !!premiumConfig?.impulsionamento,
    oficinas: masterActive && !!premiumConfig?.oficinas,
    leads: masterActive && !!premiumConfig?.leads,
    atualizadoEm: premiumConfig?.atualizadoEm,
    atualizadoPor: premiumConfig?.atualizadoPor,
  };
}
