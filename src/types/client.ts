import type { Timestamp } from 'firebase/firestore';

export type ClientStage = 'lead' | 'ativo' | 'inativo';
export type ClientSource = 'manual' | 'csv' | 'recargarage_lead';

export interface ClientVehicle {
  marca: string;
  modelo: string;
  ano?: number;
  matricula?: string;
  km?: number;
  notas?: string;
}

export interface ClientInteraction {
  id: string;
  data: Timestamp;
  tipo: 'servico' | 'contacto' | 'nota';
  descricao: string;
  valor?: number;
}

/**
 * A client record owned by a professional (the data controller). Clients do not
 * need a RecarGarage account; when their email matches an existing user, the
 * match is surfaced as a soft, public-only link (see `matchedUserUid`).
 */
export interface Client {
  id: string;
  ownerUid: string;
  nome: string;
  email?: string;
  telefone?: string;
  morada?: string;
  distrito?: string;
  veiculos?: ClientVehicle[];
  estado: ClientStage;
  origem: ClientSource;
  tags?: string[];
  notas?: string;
  interacoes?: ClientInteraction[];
  // Filled from a server-side lookup against the public `users` collection.
  matchedUserUid?: string | null;
  matchedAt?: Timestamp | null;
  consentimento?: boolean;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

export type ClientInput = Omit<
  Client,
  'id' | 'ownerUid' | 'matchedUserUid' | 'matchedAt' | 'criadoEm' | 'atualizadoEm'
>;

export const CLIENT_STAGE_LABELS: Record<ClientStage, string> = {
  lead: 'Lead',
  ativo: 'Cliente ativo',
  inativo: 'Inativo',
};

export const CLIENT_SOURCE_LABELS: Record<ClientSource, string> = {
  manual: 'Manual',
  csv: 'Importação CSV',
  recargarage_lead: 'Lead RecarGarage',
};
