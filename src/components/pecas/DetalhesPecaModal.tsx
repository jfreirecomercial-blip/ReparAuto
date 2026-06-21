'use client';

import { useState, useEffect } from 'react';
import { GearSix, Car, MagnifyingGlass, User, WhatsappLogo, Phone, Envelope, ChatCircleDots, SignIn, PencilSimpleLine, Trash, type Icon } from '@phosphor-icons/react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatarPreco, obterWhatsApp } from '@/lib/utils';
import { getUserByEmail, incrementCampo, updatePeca, deletePeca } from '@/lib/db';
import { useApp } from '@/providers/AppProvider';
import type { Peca, TipoPeca } from '@/types/peca';
import EditarPecaModal from '@/components/admin/EditarPecaModal';

const tipoConfig: Record<TipoPeca, { cor: 'blue' | 'yellow' | 'gray'; Icon: Icon; label: string }> = {
  venda: { cor: 'blue', Icon: GearSix, label: 'Venda' },
  desmonte: { cor: 'yellow', Icon: Car, label: 'Desmonte' },
  procura: { cor: 'gray', Icon: MagnifyingGlass, label: 'Procura-se' },
};

interface DetalhesPecaModalProps {
  show: boolean;
  onClose: () => void;
  peca: Peca | null;
}

export default function DetalhesPecaModal({ show, onClose, peca }: DetalhesPecaModalProps) {
  const [currentPeca, setCurrentPeca] = useState<Peca | null>(peca);
  const [mostrarTelefone, setMostrarTelefone] = useState(false);
  const [vendedorUid, setVendedorUid] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { auth, chat, loginModal } = useApp();
  const { user, isAdmin } = auth;
  const { abrirChat } = chat;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    setCurrentPeca(peca);
  }, [peca]);

  useEffect(() => {
    if (!currentPeca) return;
    if (currentPeca.criadorUid) {
      setVendedorUid(currentPeca.criadorUid);
    } else {
      getUserByEmail(currentPeca.criador).then((u) => {
        if (u) setVendedorUid(u.uid);
      });
    }
    const key = `viewed_part_${currentPeca.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      incrementCampo('parts', currentPeca.id, 'visualizacoes');
    }
  }, [currentPeca?.id]);

  if (!currentPeca) return null;

  const config = tipoConfig[currentPeca.tipo] || tipoConfig.venda;
  const telefone = currentPeca.vendedorTelefone || currentPeca.contacto;
  const email = currentPeca.vendedorEmail || currentPeca.criador;
  const whatsapp = obterWhatsApp(currentPeca.vendedorWhatsApp, telefone);
  const temWhatsApp = !!whatsapp;
  const temTelefone = !!telefone;
  const temEmail = !!email;
  const temChat = !!user && !!vendedorUid && user.email !== currentPeca.criador;

  const handleSavePeca = async (id: string, dados: Record<string, unknown>) => {
    await updatePeca(id, { ...dados, status: 'pendente' });
    setEditModalOpen(false);
    setCurrentPeca((prev) => prev ? { ...prev, ...dados } as Peca : null);
    onClose();
  };

  const handleDelete = async () => {
    if (!currentPeca) return;
    setDeleting(true);
    try {
      await deletePeca(currentPeca.id);
      setConfirmDelete(false);
      onClose();
    } catch (err) {
      console.error('[DetalhesPeca] Erro ao eliminar:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Modal show={show} onClose={onClose} titulo="Detalhes do Anúncio" tamanho="md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge cor={config.cor}>
              <config.Icon className="mr-1" /> {config.label}
            </Badge>
            {currentPeca.preco && (
              <span className="text-2xl font-extrabold text-accent">
                {formatarPreco(currentPeca.preco)}
              </span>
            )}
          </div>

          {(currentPeca.criador === user?.email || isAdmin) && (
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 text-blue-600 hover:bg-blue-50 transition flex items-center gap-1 cursor-pointer"
              >
                <PencilSimpleLine size={14} /> Editar Anúncio
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash size={14} /> Eliminar Anúncio
              </button>
            </div>
          )}

          <h3 className="text-xl font-extrabold text-fg-heading">{currentPeca.titulo}</h3>

          <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Categoria</span>
              <p className="font-semibold text-fg-heading">{currentPeca.categoria}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Estado</span>
              <p className="font-semibold text-fg-heading">{currentPeca.estado}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Marca Compatível</span>
              <p className="font-semibold text-fg-heading">{currentPeca.marcaCarro}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Localização</span>
              <p className="font-semibold text-fg-heading">{currentPeca.local || 'Portugal'}</p>
            </div>
          </div>

          {currentPeca.descricao && (
            <div>
              <span className="text-xs font-semibold text-fg-subtle block mb-1">Descrição</span>
              <p className="text-sm text-fg whitespace-pre-wrap">{currentPeca.descricao}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-fg-subtle flex items-center gap-1">
              <User className="text-slate-400" />
              {currentPeca.vendedorNome || currentPeca.criador || 'Anónimo'}
            </p>

            {user ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {temWhatsApp && (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      <WhatsappLogo size={18} />
                      WhatsApp
                    </a>
                  )}

                  {temTelefone && !mostrarTelefone && (
                    <Button tipo="primario" icone={<Phone />} onClick={() => setMostrarTelefone(true)}>
                      Ver Telefone
                    </Button>
                  )}

                  {temTelefone && mostrarTelefone && (
                    <a
                      href={`tel:${telefone}`}
                      className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2.5 px-4 rounded-xl transition text-sm"
                    >
                      <Phone />
                      {telefone}
                    </a>
                  )}

                  {temEmail && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-fg font-semibold py-2.5 px-4 rounded-xl transition border border-slate-300 text-sm"
                    >
                      <Envelope />
                      Email
                    </a>
                  )}
                </div>

                {temChat && (
                  <Button
                    tipo="azul"
                    blocoCompleto
                    onClick={() => abrirChat(currentPeca.id, 'peca', currentPeca.titulo, vendedorUid!, currentPeca.vendedorNome || currentPeca.criador || 'Vendedor')}
                    icone={<ChatCircleDots />}
                  >
                    Enviar Mensagem (Chat Interno)
                  </Button>
                )}
              </>
            ) : (
              <button
                onClick={() => loginModal.openLoginModal(currentPath)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-3 px-4 rounded-xl transition text-sm"
              >
                <SignIn />
                Faça login para ver os contactos
              </button>
            )}
          </div>
        </div>
      </Modal>

      {editModalOpen && currentPeca && (
        <EditarPecaModal
          show
          peca={currentPeca}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSavePeca}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-scaleUp">
            <h4 className="font-extrabold text-fg-heading text-lg mb-2">Eliminar Anúncio</h4>
            <p className="text-sm text-fg-muted mb-4">
              Tem certeza que deseja eliminar <strong>{currentPeca.titulo}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                tipo="secundario"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                tipo="perigo"
                icone={<Trash />}
                onClick={handleDelete}
                disabled={deleting}
                carregando={deleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
