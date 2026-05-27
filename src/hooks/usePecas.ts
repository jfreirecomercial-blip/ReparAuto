import { useState, useEffect, useCallback } from 'react';
import { subscribePecas, addPeca, deletePeca } from '@/lib/db';
import type { Peca, FiltroTipoPeca } from '@/types/peca';

export default function usePecas() {
  const [pecas, setPecasState] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipoPeca>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    const unsub = subscribePecas(
      (data) => {
        setPecasState(data);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, []);

  const pecasFiltradas = useCallback(() => {
    let lista = [...pecas];

    if (filtroTipo !== 'todos') {
      lista = lista.filter((p) => p.tipo === filtroTipo);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          p.descricao.toLowerCase().includes(term) ||
          p.marcaCarro.toLowerCase().includes(term) ||
          (p.modeloCarro?.toLowerCase().includes(term) ?? false) ||
          p.categoria.toLowerCase().includes(term)
      );
    }

    if (filtroCategoria) {
      lista = lista.filter((p) => p.categoria === filtroCategoria);
    }

    if (filtroEstado) {
      lista = lista.filter((p) => p.estado === filtroEstado);
    }

    return lista;
  }, [pecas, filtroTipo, searchTerm, filtroCategoria, filtroEstado]);

  const publicarPeca = useCallback(
    async (dados: Record<string, unknown>) => {
      const nova = await addPeca(dados);
      return nova;
    },
    []
  );

  const eliminarPeca = useCallback(
    async (id: string) => {
      await deletePeca(id);
    },
    []
  );

  const getPecaPorId = useCallback(
    (id: string): Peca | null => pecas.find((p) => p.id === id) || null,
    [pecas]
  );

  return {
    pecas,
    pecasFiltradas: pecasFiltradas(),
    loading,
    filtroTipo,
    setFiltroTipo,
    searchTerm,
    setSearchTerm,
    filtroCategoria,
    setFiltroCategoria,
    filtroEstado,
    setFiltroEstado,
    publicarPeca,
    eliminarPeca,
    getPecaPorId,
    recarregar: async () => {},
  };
}
