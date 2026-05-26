import { useState, useEffect, useCallback } from 'react';
import { getPecas, setPecas } from '@/lib/db';
import { gerarId } from '@/lib/utils';

/**
 * Hook para gerenciar peças com filtros
 */
export default function usePecas() {
  const [pecas, setPecasState] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  const carregar = useCallback(() => {
    setPecasState(getPecas());
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const pecasFiltradas = useCallback(() => {
    let lista = [...pecas];

    if (filtroTipo !== 'todos') {
      lista = lista.filter((p) => p.tipo === filtroTipo);
    }

    return lista;
  }, [pecas, filtroTipo]);

  const publicarPeca = useCallback(
    (dados) => {
      const nova = {
        ...dados,
        id: gerarId(),
        criador:
          JSON.parse(localStorage.getItem('loggedUser_reparauto') || '{}').email || 'anonimo',
      };
      const lista = getPecas();
      lista.unshift(nova);
      setPecas(lista);
      carregar();
      return nova;
    },
    [carregar]
  );

  const eliminarPeca = useCallback(
    (id) => {
      const lista = getPecas().filter((p) => p.id !== id);
      setPecas(lista);
      carregar();
    },
    [carregar]
  );

  const getPecaPorId = useCallback(
    (id) => pecas.find((p) => p.id === Number(id)) || null,
    [pecas]
  );

  return {
    pecas,
    pecasFiltradas: pecasFiltradas(),
    filtroTipo,
    setFiltroTipo,
    publicarPeca,
    eliminarPeca,
    getPecaPorId,
    recarregar: carregar,
  };
}
