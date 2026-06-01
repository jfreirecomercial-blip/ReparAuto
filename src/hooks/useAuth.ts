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

  // Shared post-sign-in flow: build a base profile from the Firebase user, merge
  // the stored Firestore profile when present, and update local state.
  const aplicarPerfil = useCallback(async (fbUser: User, overrides?: Partial<Usuario>): Promise<Usuario> => {
    const base = { ...criarUsuarioBase(fbUser), ...overrides };
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        const merged = { ...base, ...profile };
        setUser(merged);
        return merged;
      }
    } catch {
      // fallback: use the base profile
    }
    setUser(base);
    return base;
  }, []);

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
    return aplicarPerfil(await loginComEmail(email, password));
  }, [aplicarPerfil]);

  const registar = useCallback(async (nome: string, email: string, password: string): Promise<Usuario> => {
    return aplicarPerfil(await criarConta(email, password, nome), { nome });
  }, [aplicarPerfil]);

  const loginGoogle = useCallback(async (): Promise<Usuario> => {
    return aplicarPerfil(await loginComGoogle());
  }, [aplicarPerfil]);

  const loginApple = useCallback(async (): Promise<Usuario> => {
    return aplicarPerfil(await loginComApple());
  }, [aplicarPerfil]);

  const logout = useCallback(async (): Promise<void> => {
    await logoutFirebase();
    setUser(null);
  }, []);

  /**
   * Permanently delete the account: all Firestore/Storage data first (security
   * rules require the user to be authenticated), then the Firebase Auth account.
   * May throw `auth/requires-recent-login` for stale sessions — the caller asks
   * the user to sign in again and retry. For atomic server-side cleanup and
   * Apple token revocation, move this to a callable Cloud Function in production
   * (see docs/app-nativa-setup.md).
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
