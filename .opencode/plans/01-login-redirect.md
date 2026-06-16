# Fase 1 — LoginModal Global + Redirect pós-login

## Problema
- Links "Faça login para enviar mensagem" navegam para `/perfil` (e perdem o anúncio atual)
- `LoginModal` só existe na página `/perfil`, não é global
- Após login, utilizador fica no `/perfil` sem voltar ao anúncio

## Solução
Adicionar `loginModal` ao `AppContextValue`, gerir estado no `AppProvider`, renderizar `LoginModal` globalmente no `LayoutShell`, e substituir todos os `<a href="/perfil">` por `openLoginModal(currentPath)`.

---

## Ficheiro 1: `src/types/app.ts`

Adicionar interface `LoginModalContextValue` e incluí-la no `AppContextValue`:

```typescript
export interface LoginModalContextValue {
  isOpen: boolean;
  openLoginModal: (redirectTo?: string) => void;
  closeLoginModal: () => void;
}

export interface AppContextValue {
  dbReady: boolean;
  auth: AuthContextValue;
  carros: CarrosContextValue;
  pecas: PecasContextValue;
  favoritos: FavoritosContextValue;
  chat: ChatContextValue;
  intencoes: IntencaoContextValue;
  loginModal: LoginModalContextValue;  // <-- NOVO
}
```

---

## Ficheiro 2: `src/providers/AppProvider.tsx`

Adicionar estado para controlar o modal de login + redirect, e expor via context:

```typescript
'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { initDatabase } from '@/lib/db';
import useAuth from '@/hooks/useAuth';
import useCarros from '@/hooks/useCarros';
import usePecas from '@/hooks/usePecas';
import useFavoritos from '@/hooks/useFavoritos';
import { useChat } from '@/hooks/useChat';
import { useIntencoes } from '@/hooks/useIntencoes';
import LoginModal from '@/components/auth/LoginModal';
import type { AppContextValue } from '@/types/app';

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return ctx;
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // --- Login modal global state ---
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState<string | undefined>();
  // Track whether user was logged in before modal opened
  const [wasLoggedIn, setWasLoggedIn] = useState(false);

  const openLoginModal = useCallback((redirectTo?: string) => {
    setLoginRedirectTo(redirectTo);
    setWasLoggedIn(false);
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setLoginRedirectTo(undefined);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setLoginModalOpen(false);
    // If there was a redirect path, navigate there
    if (loginRedirectTo) {
      router.push(loginRedirectTo);
      setLoginRedirectTo(undefined);
    }
  }, [loginRedirectTo, router]);

  // --- End login modal state ---

  useEffect(() => {
    initDatabase().then(() => {
      setDbReady(true);
    });
  }, []);

  const auth = useAuth();
  const carros = useCarros();
  const pecas = usePecas();
  const favoritos = useFavoritos(auth.user);
  const chat = useChat(auth.user?.uid || null, auth.user?.nome || '');
  const intencoes = useIntencoes(auth.user?.uid || null);

  const { isLoggedIn, loading, profileCompleted } = auth;

  useEffect(() => {
    if (loading) return;
    if (isLoggedIn && !profileCompleted && pathname !== '/setup-perfil') {
      router.replace('/setup-perfil');
    }
  }, [isLoggedIn, loading, profileCompleted, router, pathname]);

  const value: AppContextValue = {
    dbReady,
    auth,
    carros,
    pecas,
    favoritos,
    chat,
    intencoes,
    loginModal: {
      isOpen: loginModalOpen,
      openLoginModal,
      closeLoginModal,
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <LoginModal
        show={loginModalOpen}
        onClose={closeLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </AppContext.Provider>
  );
}
```

---

## Ficheiro 3: `src/components/auth/LoginModal.tsx`

Adicionar `onSuccess` opcional à interface:

```typescript
interface LoginModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Chamar onSuccess() depois de onClose() em ambos handleSubmit e handleGoogle:
// handleSubmit:
      setNome('');
      setEmail('');
      setPassword('');
      onClose();
      onSuccess?.();

// handleGoogle:
      toast?.sucesso('Login com Google efetuado!');
      onClose();
      onSuccess?.();
```

---

## Ficheiro 4: `src/screens/Perfil.tsx`

Em vez de estado local, usar o contexto global `loginModal`:

```typescript
'use client';

import { useApp } from '@/providers/AppProvider';
import ProfileLoggedOut from '@/components/perfil/ProfileLoggedOut';
import ProfileLoggedIn from '@/components/perfil/ProfileLoggedIn';

export default function Perfil() {
  const { auth, loginModal } = useApp();
  const { isLoggedIn } = auth;

  return (
    <div className="page-enter">
      {isLoggedIn ? (
        <ProfileLoggedIn />
      ) : (
        <ProfileLoggedOut onLogin={() => loginModal.openLoginModal('/perfil')} />
      )}
    </div>
  );
}
```

---

## Ficheiro 5: `src/components/detalhes/ContactSection.tsx`

Substituir `<a href="#/perfil">` por `openLoginModal()`:

```typescript
// NOVA importação no topo:
import { useRouter } from 'next/navigation';

// NO hook, adicionar:
const router = useRouter();
const { loginModal } = useApp();

// Substituir bloco "Faça login para enviar mensagem" (linhas 136-144):
          {!temChat && !user && (
            <button
              onClick={() => loginModal.openLoginModal(router.current ? undefined : `/detalhes/${carro.id}`)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-3 px-4 rounded-xl transition text-sm"
            >
              <SignIn />
              Faça login para enviar mensagem
            </button>
          )}
```

---

## Ficheiro 6: `src/components/pecas/DetalhesPecaModal.tsx`

Substituir `<a href="#/perfil">`:

```typescript
// NO hook, adicionar:
const { loginModal } = useApp();
const router = useRouter();

// Substituir bloco "Faça login para enviar mensagem" (linhas 158-166):
          {!temChat && !user && (
            <button
              onClick={() => loginModal.openLoginModal(window.location.pathname)}
              className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-2.5 px-4 rounded-xl transition text-sm"
            >
              <SignIn />
              Faça login para enviar mensagem
            </button>
          )}
```

---

## Ficheiro 7: `src/components/home/CarGrid.tsx`

Substituir `<Link href="/perfil">` no bloco de intenções:

```typescript
// NO hook, adicionar (já existe useApp, adicionar loginModal):
const { carros, auth, chat, loginModal } = useApp();

// Substituir bloco "Faça login para contactar" (linhas 392-399):
                      {!user && (
                        <button
                          onClick={() => loginModal.openLoginModal('/')}
                          className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-1.5 px-3 rounded-xl transition text-xs"
                        >
                          <SignIn size={14} />
                          Faça login para contactar
                        </button>
                      )}
```
