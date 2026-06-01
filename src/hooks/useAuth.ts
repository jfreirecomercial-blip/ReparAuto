'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import {
  loginComEmail,
  criarConta,
  loginComGoogle,
  loginComApple,
  logoutFirebase,
  eliminarContaAuth,
  onAuthChange,
} from '@/lib/auth';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserData,
} from '@/lib/db';
import type { Usuario, Role, TipoConta } from '@/types/usuario';

const DEFAULT_ROLE: Role = 'user';
const DEFAULT_TIPO_CONTA: TipoConta = 'particular';

function criarUsuarioBase(firebaseUser: User): Usuario {
  return {
    uid: firebaseUser.uid,
    nome: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilizador',
    email: firebaseUser.email!,
    telefone: '',
    localidade: '',
    codigoPostal: '',
    morada: '',
    nif: '',
    tipoConta: DEFAULT_TIPO_CONTA,
    role: DEFAULT_ROLE,
    bio: '',
    notificacoes: true,
    foto: firebaseUser.photoURL || null,
    profileCompleted: false,
  };
}

export default function useAuth() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUser((prev) => prev ? { ...prev, ...profile } : null);
      }
    } catch {
      // fallback: keep current user
    }
  }, [user?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const base = criarUsuarioBase(firebaseUser);
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            await createUserProfile(firebaseUser.uid, base as unknown as Record<string, unknown>);
            profile = base;
          }
          setUser({ ...base, ...profile });
        } catch {
          setUser(base);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<Usuario> => {
    const fbUser = await loginComEmail(email, password);
    const base = criarUsuarioBase(fbUser);
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        const merged = { ...base, ...profile };
        setUser(merged);
        return merged;
      }
    } catch {
      // fallback
    }
    setUser(base);
    return base;
  }, []);

  const registar = useCallback(async (nome: string, email: string, password: string): Promise<Usuario> => {
    const fbUser = await criarConta(email, password, nome);
    const base = criarUsuarioBase(fbUser);
    base.nome = nome;
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        const merged = { ...base, ...profile };
        setUser(merged);
        return merged;
      }
    } catch {
      // fallback
    }
    setUser(base);
    return base;
  }, []);

  const loginGoogle = useCallback(async (): Promise<Usuario> => {
    const fbUser = await loginComGoogle();
    const base = criarUsuarioBase(fbUser);
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        const merged = { ...base, ...profile };
        setUser(merged);
        return merged;
      }
    } catch {
      // fallback
    }
    setUser(base);
    return base;
  }, []);

  const loginApple = useCallback(async (): Promise<Usuario> => {
    const fbUser = await loginComApple();
    const base = criarUsuarioBase(fbUser);
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        const merged = { ...base, ...profile };
        setUser(merged);
        return merged;
      }
    } catch {
      // fallback
    }
    setUser(base);
    return base;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutFirebase();
    setUser(null);
  }, []);

  /**
   * Permanently delete the account: all Firestore/Storage data first, then the
   * Firebase Auth account. May throw `auth/requires-recent-login` — the caller
   * should ask the user to sign in again and retry.
   */
  const eliminarConta = useCallback(async (): Promise<void> => {
    if (!user?.uid || !user.email) return;
    await deleteUserData(user.uid, user.email);
    await eliminarContaAuth();
    setUser(null);
  }, [user?.uid, user?.email]);

  const updateProfile = useCallback(async (data: Partial<Usuario>): Promise<void> => {
    if (!user?.uid) return;
    await updateUserProfile(user.uid, data);
    setUser((prev) => prev ? { ...prev, ...data } : null);
  }, [user?.uid]);

  return {
    user,
    loading,
    login,
    registar,
    loginGoogle,
    loginApple,
    logout,
    eliminarConta,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    profileCompleted: user?.profileCompleted ?? false,
    updateProfile,
    refreshProfile,
  };
}
