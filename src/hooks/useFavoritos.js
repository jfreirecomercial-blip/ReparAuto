import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY_FAVORITOS } from '@/lib/constants';

/**
 * Hook para gerenciar favoritos (localStorage)
 */
export default function useFavoritos() {
  const [favoritos, setFavoritosState] = useState([]);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITOS)) || [];
      setFavoritosState(stored);
    } catch {
      setFavoritosState([]);
    }
  }, []);

  // Salvar no localStorage
  const salvar = useCallback((lista) => {
    localStorage.setItem(STORAGE_KEY_FAVORITOS, JSON.stringify(lista));
    setFavoritosState(lista);
  }, []);

  // Toggle favorito
  const toggleFavorito = useCallback(
    (id) => {
      const idx = favoritos.indexOf(id);
      let nova;
      if (idx > -1) {
        nova = [...favoritos];
        nova.splice(idx, 1);
      } else {
        nova = [...favoritos, id];
      }
      salvar(nova);
    },
    [favoritos, salvar]
  );

  // Verificar se é favorito
  const isFavorito = useCallback(
    (id) => favoritos.includes(id),
    [favoritos]
  );

  return {
    favoritos,
    toggleFavorito,
    isFavorito,
    count: favoritos.length,
  };
}
