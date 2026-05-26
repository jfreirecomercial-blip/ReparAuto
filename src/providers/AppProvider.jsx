import React, { createContext, useContext, useEffect, useState } from 'react';
import { initDatabase } from '@/lib/db';
import useAuth from '@/hooks/useAuth';
import useCarros from '@/hooks/useCarros';
import usePecas from '@/hooks/usePecas';
import useFavoritos from '@/hooks/useFavoritos';

// ============ CONTEXT ============
const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return ctx;
}

// ============ PROVIDER ============
export default function AppProvider({ children }) {
  const [dbReady, setDbReady] = useState(false);

  // Inicializar database
  useEffect(() => {
    initDatabase();
    setDbReady(true);
  }, []);

  // Hooks
  const auth = useAuth();
  const carros = useCarros();
  const pecas = usePecas();
  const favoritos = useFavoritos();

  const value = {
    dbReady,
    auth,
    carros,
    pecas,
    favoritos,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
