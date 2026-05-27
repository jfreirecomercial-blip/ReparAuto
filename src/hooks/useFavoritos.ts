import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { incrementCampo, decrementCampo } from '@/lib/db';
import { enqueue, dequeueAll } from '@/lib/offlineQueue';
import type { Usuario } from '@/types/usuario';

const STORAGE_KEY = 'favs_reparauto';

function carregarLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function salvarLocal(lista: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

export default function useFavoritos(user: Usuario | null) {
  const [favoritos, setFavoritosState] = useState<string[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const carregarFavs = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().favoritos) {
            setFavoritosState(userDoc.data().favoritos as string[]);
          } else {
            setFavoritosState([]);
          }
        } catch {
          setFavoritosState(carregarLocal());
        }
      };
      carregarFavs();
    } else {
      setFavoritosState(carregarLocal());
    }
  }, [user?.uid]);

  useEffect(() => {
    function replayQueue() {
      if (!user?.uid || !navigator.onLine) return;
      const actions = dequeueAll();
      for (const action of actions) {
        if (action.type === 'favorito_add') {
          incrementCampo('cars', action.payload.carId as string, 'contagemFavoritos');
        } else if (action.type === 'favorito_remove') {
          decrementCampo('cars', action.payload.carId as string, 'contagemFavoritos');
        }
      }
    }
    window.addEventListener('online', replayQueue);
    replayQueue();
    return () => window.removeEventListener('online', replayQueue);
  }, [user?.uid]);

  const salvar = useCallback(
    async (lista: string[]) => {
      setFavoritosState(lista);

      if (user?.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await setDoc(userRef, { favoritos: lista }, { merge: true });
        } catch (err) {
          console.error('[Favoritos] Erro ao salvar no Firestore:', err);
          salvarLocal(lista);
        }
      } else {
        salvarLocal(lista);
      }
    },
    [user?.uid]
  );

  const toggleFavorito = useCallback(
    (id: string | number) => {
      const idStr = String(id);
      const idx = favoritos.indexOf(idStr);
      let nova: string[];
      if (idx > -1) {
        nova = [...favoritos];
        nova.splice(idx, 1);
        if (navigator.onLine) {
          decrementCampo('cars', idStr, 'contagemFavoritos');
        } else {
          enqueue({ type: 'favorito_remove', payload: { carId: idStr } });
        }
      } else {
        nova = [...favoritos, idStr];
        if (navigator.onLine) {
          incrementCampo('cars', idStr, 'contagemFavoritos');
        } else {
          enqueue({ type: 'favorito_add', payload: { carId: idStr } });
        }
      }
      salvar(nova);
    },
    [favoritos, salvar]
  );

  const isFavorito = useCallback(
    (id: string | number): boolean => favoritos.includes(String(id)),
    [favoritos]
  );

  return {
    favoritos,
    toggleFavorito,
    isFavorito,
    count: favoritos.length,
  };
}
