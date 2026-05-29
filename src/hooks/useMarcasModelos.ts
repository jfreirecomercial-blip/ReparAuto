'use client';

import { useMemo } from 'react';
import dados from '@/data/marcas-modelos.json';

export interface MarcaModelos {
  marca: string;
  modelos: string[];
}

export function useMarcasModelos() {
  const marcas = useMemo(() => {
    return (dados as MarcaModelos[]).map((d) => d.marca).sort((a, b) => a.localeCompare(b));
  }, []);

  const getModelos = (marca: string): string[] => {
    const entry = (dados as MarcaModelos[]).find(
      (d) => d.marca.toLowerCase() === marca.toLowerCase()
    );
    return entry?.modelos ?? [];
  };

  return { marcas, getModelos };
}
