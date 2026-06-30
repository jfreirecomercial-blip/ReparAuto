'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  UploadSimple,
  MagnifyingGlass,
  UsersThree,
  Phone,
  EnvelopeSimple,
  Car,
  PencilSimple,
  Trash,
  CircleNotch,
} from '@phosphor-icons/react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import useClients from '@/hooks/useClients';
import ClientFormModal from './ClientFormModal';
import ClientCsvImport from './ClientCsvImport';
import MatchedUserBadge from './MatchedUserBadge';
import { CLIENT_STAGE_LABELS } from '@/types/client';
import type { Client, ClientStage } from '@/types/client';

interface Props {
  ownerUid: string;
}

const STAGE_COR: Record<ClientStage, 'blue' | 'green' | 'gray'> = {
  lead: 'blue',
  ativo: 'green',
  inativo: 'gray',
};

const FILTERS: { value: ClientStage | 'todos'; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'lead', label: 'Leads' },
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
];

export default function ClientsTab({ ownerUid }: Props) {
  const toast = useToast();
  const { clients, loading, adicionar, importar, atualizar, remover } = useClients(ownerUid);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<ClientStage | 'todos'>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return clients.filter((c) => {
      if (filtro !== 'todos' && c.estado !== filtro) return false;
      if (!termo) return true;
      return (
        c.nome.toLowerCase().includes(termo) ||
        (c.email || '').toLowerCase().includes(termo) ||
        (c.telefone || '').includes(termo)
      );
    });
  }, [clients, busca, filtro]);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Client) => {
    setEditing(c);
    setFormOpen(true);
  };

  const handleSave = async (data: Parameters<typeof adicionar>[0], emailChanged: boolean) => {
    if (editing) await atualizar(editing.id, data, emailChanged);
    else await adicionar(data);
  };

  const handleDelete = async (c: Client) => {
    if (!window.confirm(`Apagar o cliente "${c.nome}"? Esta ação é irreversível.`)) return;
    try {
      await remover(c.id);
      toast?.sucesso('Cliente removido.');
    } catch {
      toast?.erro('Não foi possível remover.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar por nome, email ou telefone"
            className="w-full bg-white rounded-xl pl-9 pr-3 py-2.5 text-sm border border-neutral-300 focus:outline-none focus:ring-3 focus:ring-accent/25 focus:border-accent"
          />
        </div>
        <div className="flex gap-2">
          <Button tipo="secundario" tamanho="sm" icone={<UploadSimple />} onClick={() => setImportOpen(true)}>
            Importar CSV
          </Button>
          <Button tipo="primario" tamanho="sm" icone={<Plus />} onClick={openNew}>
            Novo cliente
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
              filtro === f.value
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-fg-muted border-neutral-200 hover:border-accent/40'
            }`}
            aria-pressed={filtro === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-fg-muted">
          <CircleNotch className="animate-spin" size={28} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col items-center justify-center text-center py-16 text-fg-muted">
          <UsersThree size={40} className="mb-3 text-neutral-300" />
          <p className="font-semibold text-fg">
            {clients.length === 0 ? 'Ainda não tem clientes.' : 'Nenhum cliente corresponde à procura.'}
          </p>
          <p className="text-sm">Adicione manualmente ou importe a sua carteira por CSV.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtrados.map((c) => {
            const v = c.veiculos?.[0];
            return (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-fg-heading truncate">{c.nome}</p>
                      <Badge cor={STAGE_COR[c.estado]} variante="soft">
                        {CLIENT_STAGE_LABELS[c.estado]}
                      </Badge>
                      {c.matchedUserUid && <MatchedUserBadge />}
                    </div>
                    <div className="mt-1.5 space-y-0.5 text-xs text-fg-muted">
                      {c.telefone && (
                        <p className="inline-flex items-center gap-1.5">
                          <Phone className="text-neutral-400" /> {c.telefone}
                        </p>
                      )}
                      {c.email && (
                        <p className="inline-flex items-center gap-1.5 ml-0 sm:ml-3">
                          <EnvelopeSimple className="text-neutral-400" /> {c.email}
                        </p>
                      )}
                      {v && (v.marca || v.modelo) && (
                        <p className="inline-flex items-center gap-1.5">
                          <Car className="text-neutral-400" /> {v.marca} {v.modelo}
                          {v.matricula ? ` · ${v.matricula}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-muted hover:text-accent hover:bg-accent/5 transition"
                      aria-label={`Editar ${c.nome}`}
                    >
                      <PencilSimple />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-fg-muted hover:text-danger-600 hover:bg-danger-50 transition"
                      aria-label={`Apagar ${c.nome}`}
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
                {c.notas && <p className="mt-2 text-xs text-fg leading-relaxed line-clamp-2">{c.notas}</p>}
              </div>
            );
          })}
        </div>
      )}

      <ClientFormModal show={formOpen} onClose={() => setFormOpen(false)} client={editing} onSave={handleSave} />
      <ClientCsvImport show={importOpen} onClose={() => setImportOpen(false)} onImport={importar} />
    </div>
  );
}
