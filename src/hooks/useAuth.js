import { useState, useEffect, useCallback } from 'react';
import { loginSimulado, logoutSimulado, getUsuarioLocal } from '@/lib/auth';

/**
 * Hook de autenticação - gerencia estado do usuário
 * Usa localStorage como fallback (simulado)
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getUsuarioLocal();
    if (stored) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback((nome, email) => {
    const userData = loginSimulado(nome, email);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    logoutSimulado();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    isLoggedIn: !!user,
  };
}
