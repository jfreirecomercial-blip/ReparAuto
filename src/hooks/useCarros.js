import { useState, useEffect, useCallback } from 'react';
import { getCarros, setCarros } from '@/lib/db';
import { gerarId } from '@/lib/utils';

/**
 * Hook para gerenciar carros com filtros
 */
export default function useCarros() {
  const [carros, setCarrosState] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState('lowcost');
  const [searchQuery, setSearchQuery] = useState('');
  const [advPriceMin, setAdvPriceMin] = useState(null);
  const [advPriceMax, setAdvPriceMax] = useState(null);
  const [advLocation, setAdvLocation] = useState('');
  const [sortOrdem, setSortOrdem] = useState(null);

  // Carregar carros do localStorage
  const carregar = useCallback(() => {
    setCarrosState(getCarros());
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Carros filtrados
  const carrosFiltrados = useCallback(() => {
    let cs = [...carros];

    // Filtro por chip
    if (filtroAtivo === 'lowcost') {
      cs = cs.filter((c) => c.preco <= 2000);
    } else if (filtroAtivo === '500') {
      cs = cs.filter((c) => c.preco <= 500);
    } else if (filtroAtivo === '1000') {
      cs = cs.filter((c) => c.preco <= 1000);
    } else if (filtroAtivo === 'reparar') {
      cs = cs.filter((c) => c.estadoVeiculo === 'manutencao');
    }
    // 'qualquer' = sem filtro de preço

    // Pesquisa textual
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      cs = cs.filter(
        (c) =>
          c.marca.toLowerCase().includes(q) ||
          c.modelo.toLowerCase().includes(q) ||
          c.local.toLowerCase().includes(q)
      );
    }

    // Filtros avançados
    if (advPriceMin !== null && !isNaN(advPriceMin)) {
      cs = cs.filter((c) => c.preco >= advPriceMin);
    }
    if (advPriceMax !== null && !isNaN(advPriceMax)) {
      cs = cs.filter((c) => c.preco <= advPriceMax);
    }
    if (advLocation.trim()) {
      const loc = advLocation.toLowerCase().trim();
      cs = cs.filter((c) => c.local.toLowerCase().includes(loc));
    }

    // Ordenação
    if (sortOrdem === 'crescente') {
      cs.sort((a, b) => a.preco - b.preco);
    } else if (sortOrdem === 'decrescente') {
      cs.sort((a, b) => b.preco - a.preco);
    }

    return cs;
  }, [carros, filtroAtivo, searchQuery, advPriceMin, advPriceMax, advLocation, sortOrdem]);

  // Publicar novo carro
  const publicarCarro = useCallback(
    (dados) => {
      const novo = {
        ...dados,
        id: gerarId(),
        criador: JSON.parse(localStorage.getItem('loggedUser_reparauto') || '{}').email || 'anonimo',
      };
      const lista = getCarros();
      lista.unshift(novo);
      setCarros(lista);
      carregar();
      return novo;
    },
    [carregar]
  );

  // Eliminar carro
  const eliminarCarro = useCallback(
    (id) => {
      const lista = getCarros().filter((c) => c.id !== id);
      setCarros(lista);
      carregar();
    },
    [carregar]
  );

  // Obter carro por ID
  const getCarroPorId = useCallback(
    (id) => carros.find((c) => c.id === Number(id)) || null,
    [carros]
  );

  return {
    carros,
    carrosFiltrados: carrosFiltrados(),
    filtroAtivo,
    setFiltroAtivo,
    searchQuery,
    setSearchQuery,
    advPriceMin,
    setAdvPriceMin,
    advPriceMax,
    setAdvPriceMax,
    advLocation,
    setAdvLocation,
    sortOrdem,
    setSortOrdem,
    publicarCarro,
    eliminarCarro,
    getCarroPorId,
    recarregar: carregar,
  };
}
