import type { Timestamp } from 'firebase/firestore';

export type TipoNotificacao = 'aprovado' | 'rejeitado' | 'info' | 'mensagem';

export interface Notificacao {
  id: string;
  uid: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link?: string;
  lida: boolean;
  dataCriacao: Timestamp;
}
