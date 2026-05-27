import type { Timestamp } from 'firebase/firestore';

export type StatusVerificacao = 'pendente' | 'aprovado' | 'rejeitado';
export type TipoVerificacao = 'identidade' | 'profissional';
export type TipoDocumento = 'cc' | 'passaporte' | 'residencia';

export interface Verification {
  id: string;
  uid: string;
  email: string;
  nome: string;
  tipo: TipoVerificacao;
  tipoDocumento: TipoDocumento;
  documentoUrl: string;
  selfieUrl: string;
  nif?: string;
  status: StatusVerificacao;
  dataPedido: Timestamp;
  dataResolucao?: Timestamp;
  resolvidoPor?: string;
  notasAdmin?: string;
}

export type VerificationInput = Omit<Verification, 'id' | 'dataPedido' | 'dataResolucao' | 'resolvidoPor' | 'notasAdmin'>;
