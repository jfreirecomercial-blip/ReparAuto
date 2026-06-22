'use client';

import { useState } from 'react';
import type { Usuario, Role, TipoConta } from '@/types/usuario';
import { formatarData, formatarDataHora } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import GrantPlanModal from './GrantPlanModal';
import { 
  X, User, Envelope, Phone, Cardholder, 
  MapPin, Calendar, Crown, SealCheck, CheckCircle, Storefront
} from '@phosphor-icons/react';

interface UserTableProps {
  users: Usuario[];
  onRoleChange: (uid: string, role: Role) => Promise<void>;
  adminUid: string;
  adminNome: string;
  onGrantPlan: (uid: string, planoId: string, nome: string, categoria: 'anuncios' | 'oficinas' | 'leads', dias: number) => Promise<void>;
  onRevokePlan: (uid: string) => Promise<void>;
  onUpdateUserProfile: (uid: string, updates: Partial<Usuario>) => Promise<void>;
}

export default function UserTable({ users, onRoleChange, adminUid, adminNome, onGrantPlan, onRevokePlan, onUpdateUserProfile }: UserTableProps) {
  const [confirm, setConfirm] = useState<{ uid: string; nome: string; role: Role } | null>(null);
  const [loadingUid, setLoadingUid] = useState<string | null>(null);
  const [planUser, setPlanUser] = useState<Usuario | null>(null);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const handleRoleChange = async (uid: string, role: Role) => {
    setLoadingUid(uid);
    try {
      await onRoleChange(uid, role);
      if (selectedUser?.uid === uid) {
        setSelectedUser((prev) => prev ? { ...prev, role } : null);
      }
    } finally {
      setLoadingUid(null);
      setConfirm(null);
    }
  };

  const handleToggleVerified = async (u: Usuario) => {
    setLoadingUid(u.uid);
    try {
      const newVerified = !u.verificado;
      await onUpdateUserProfile(u.uid, { verificado: newVerified });
      if (selectedUser?.uid === u.uid) {
        setSelectedUser((prev) => prev ? { ...prev, verificado: newVerified } : null);
      }
    } finally {
      setLoadingUid(null);
    }
  };

  const handleToggleProfessional = async (u: Usuario) => {
    setLoadingUid(u.uid);
    try {
      const newTipoConta: TipoConta = u.tipoConta === 'profissional' ? 'particular' : 'profissional';
      const existingBadges = (u.badges || []).filter((b) => b !== 'profissional');
      const newBadges = newTipoConta === 'profissional' ? [...existingBadges, 'profissional'] : existingBadges;
      const updates = {
        tipoConta: newTipoConta,
        badges: newBadges,
      };
      await onUpdateUserProfile(u.uid, updates);
      if (selectedUser?.uid === u.uid) {
        setSelectedUser((prev) => prev ? { ...prev, ...updates } : null);
      }
    } finally {
      setLoadingUid(null);
    }
  };

  const planAtivoValido = (u: Usuario) => {
    if (!u.planoAtivo) return false;
    const exp = u.planoAtivo.dataExpiracao?.toMillis?.();
    return exp && exp > Date.now();
  };

  // Sync selected user state if user list updates
  const activeUserInList = selectedUser ? users.find(u => u.uid === selectedUser.uid) : null;
  const currentSelectedUser = activeUserInList || selectedUser;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-300">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-3">
              <th className="pb-3 pr-4">Utilizador</th>
              <th className="pb-3 pr-4">Contacto</th>
              <th className="pb-3 pr-4">Conta</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Distrito</th>
              <th className="pb-3 pr-4">Verificação</th>
              <th className="pb-3 pr-4">Plano</th>
              <th className="pb-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const hasPlan = planAtivoValido(u);
              return (
                <tr 
                  key={u.uid} 
                  onClick={() => setSelectedUser(u)}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition cursor-pointer"
                >
                  {/* Utilizador */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-extrabold border border-slate-700 uppercase shrink-0">
                        {u.nome ? u.nome.substring(0, 2) : 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-100 truncate max-w-[150px]">{u.nome || '—'}</p>
                        <p className="text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{u.uid}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="py-3.5 pr-4 text-xs">
                    <p className="text-slate-200">{u.email}</p>
                    {u.telefone && <p className="text-slate-450 mt-0.5">{u.telefone}</p>}
                  </td>

                  {/* Tipo de Conta */}
                  <td className="py-3.5 pr-4">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      u.tipoConta === 'profissional'
                        ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                        : 'bg-zinc-800/60 text-slate-400 border border-zinc-700/40'
                    }`}>
                      {u.tipoConta || 'Particular'}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="py-3.5 pr-4">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      u.role === 'admin' 
                        ? 'bg-purple-950/40 text-purple-400 border-purple-900/50' 
                        : 'bg-slate-900 text-slate-400 border-slate-850'
                    }`}>
                      {u.role}
                    </span>
                  </td>

                  {/* Distrito */}
                  <td className="py-3.5 pr-4 text-xs font-semibold text-slate-200">
                    {u.distrito || '—'}
                  </td>

                  {/* Verificação */}
                  <td className="py-3.5 pr-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {u.emailVerified ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-green-950/30 text-green-400 border border-green-900/30 rounded-full flex items-center gap-0.5">
                          <CheckCircle size={8} /> Email
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-red-950/30 text-red-400 border border-red-900/30 rounded-full">
                          Não Verif.
                        </span>
                      )}
                      {u.verificado && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-950/30 text-blue-400 border border-blue-900/30 rounded-full flex items-center gap-0.5">
                          <SealCheck size={8} /> ID
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Plano */}
                  <td className="py-3.5 pr-4">
                    {hasPlan ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 bg-amber-950/30 text-amber-400 border border-amber-900/30 rounded-full">
                        <Crown size={8} /> {u.planoAtivo!.nome}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={u.role}
                      disabled={loadingUid === u.uid}
                      onChange={(e) => {
                        const newRole = e.target.value as Role;
                        if (newRole !== u.role) {
                          setConfirm({ uid: u.uid, nome: u.nome || u.email, role: newRole });
                        }
                      }}
                      className="text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <Button
                      tipo="secundario"
                      tamanho="sm"
                      onClick={() => setPlanUser(u)}
                    >
                      Planos
                    </Button>
                    <button
                      disabled={loadingUid === u.uid}
                      onClick={() => handleToggleVerified(u)}
                      className={`p-1.5 rounded-lg border transition ${
                        u.verificado
                          ? 'border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                          : 'border-slate-800 text-slate-500 hover:border-blue-500/20 hover:text-blue-400'
                      }`}
                      title={u.verificado ? 'Remover Verificação' : 'Marcar como Verificado'}
                    >
                      <SealCheck size={16} weight={u.verificado ? 'fill' : 'regular'} />
                    </button>
                    <button
                      disabled={loadingUid === u.uid}
                      onClick={() => handleToggleProfessional(u)}
                      className={`p-1.5 rounded-lg border transition ${
                        u.tipoConta === 'profissional'
                          ? 'border-pink-500/20 bg-pink-500/10 text-pink-400 hover:bg-pink-500/20'
                          : 'border-slate-800 text-slate-500 hover:border-pink-500/20 hover:text-pink-400'
                      }`}
                      title={u.tipoConta === 'profissional' ? 'Tornar Particular' : 'Marcar como Profissional'}
                    >
                      <Storefront size={16} weight={u.tipoConta === 'profissional' ? 'fill' : 'regular'} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-sm">
                  Nenhum utilizador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over details drawer */}
      {currentSelectedUser && (
        <>
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-[110] transition-opacity" 
            onClick={() => setSelectedUser(null)} 
          />
          
          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 z-[120] overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-300 font-black text-xl border border-slate-700 uppercase">
                    {currentSelectedUser.nome ? currentSelectedUser.nome.substring(0, 2) : 'U'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-100">{currentSelectedUser.nome || 'Utilizador Sem Nome'}</h3>
                    <div className="flex gap-1.5 mt-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize border ${
                        currentSelectedUser.tipoConta === 'profissional'
                          ? 'bg-blue-950/40 text-blue-400 border-blue-900/40'
                          : 'bg-zinc-800/60 text-slate-400 border-zinc-750'
                      }`}>
                        {currentSelectedUser.tipoConta || 'particular'}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                        currentSelectedUser.role === 'admin' 
                          ? 'bg-purple-950/40 text-purple-400 border-purple-900/50' 
                          : 'bg-slate-850 text-slate-400 border-slate-800'
                      }`}>
                        {currentSelectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Personal details card */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={13} /> Dados Pessoais
                  </h4>
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">UID do Firebase</p>
                      <p className="text-xs font-mono text-slate-300 mt-0.5 select-all">{currentSelectedUser.uid}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">NIF / Contribuinte</p>
                        <p className="text-xs text-slate-200 mt-0.5">{currentSelectedUser.nif || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Contacto Telefone</p>
                        <p className="text-xs text-slate-200 mt-0.5">{currentSelectedUser.telefone || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Endereço de E-mail</p>
                      <p className="text-xs text-slate-200 mt-0.5 flex items-center gap-1.5">
                        {currentSelectedUser.email}
                        {currentSelectedUser.emailVerified && (
                          <span className="text-[9px] text-green-400 bg-green-950/30 px-2 py-0.5 rounded-full font-bold">Verificado</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin size={13} /> Morada e Localidade
                  </h4>
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Morada Completa</p>
                      <p className="text-xs text-slate-200 mt-0.5">{currentSelectedUser.morada || '—'}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Localidade</p>
                        <p className="text-xs text-slate-200 mt-0.5 truncate">{currentSelectedUser.localidade || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Distrito</p>
                        <p className="text-xs text-slate-200 mt-0.5">{currentSelectedUser.distrito || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Código Postal</p>
                      <p className="text-xs text-slate-200 mt-0.5">{currentSelectedUser.codigoPostal || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Card */}
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Crown size={13} /> Assinatura Premium
                  </h4>
                  <div className="bg-slate-950/50 border border-slate-850 rounded-2xl p-4">
                    {planAtivoValido(currentSelectedUser) ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-200 font-extrabold flex items-center gap-1">
                            <Crown size={14} className="text-amber-500" /> {currentSelectedUser.planoAtivo!.nome}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-green-950/30 text-green-400 border border-green-900/30 rounded-full">Ativo</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-900 pt-3">
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Categoria</p>
                            <p className="text-slate-350 mt-0.5 capitalize">{currentSelectedUser.planoAtivo!.categoria}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Expira a</p>
                            <p className="text-slate-350 mt-0.5">{formatarData(currentSelectedUser.planoAtivo!.dataExpiracao)}</p>
                          </div>
                        </div>
                        {currentSelectedUser.planoAtivo!.adminNome && (
                          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-900">
                            Atribuído por: <span className="font-semibold text-slate-400">{currentSelectedUser.planoAtivo!.adminNome}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-2 space-y-2">
                        <p className="text-xs text-slate-500">Este utilizador não tem nenhum plano premium ativo.</p>
                        <Button 
                          tipo="secundario" 
                          tamanho="sm" 
                          onClick={() => setPlanUser(currentSelectedUser)}
                        >
                          Conceder Plano Cortesia
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* System info */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> Registo: {currentSelectedUser.dataCriacao ? formatarDataHora(currentSelectedUser.dataCriacao) : '—'}
                  </span>
                  <span>
                    Identidade: {currentSelectedUser.verificado ? 'Verificada' : 'Não verificada'}
                  </span>
                </div>

              </div>
            </div>

            {/* Bottom drawer actions */}
            <div className="pt-6 border-t border-slate-800 mt-6 flex gap-3">
              <Button
                tipo="secundario"
                blocoCompleto
                onClick={() => setSelectedUser(null)}
              >
                Fechar Painel
              </Button>
              <Button
                tipo="primario"
                blocoCompleto
                onClick={() => {
                  setSelectedUser(null);
                  setPlanUser(currentSelectedUser);
                }}
              >
                Gerir Planos
              </Button>
            </div>
          </div>
        </>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/70 z-[130] flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-slate-100 mb-2">Confirmar alteração</h3>
            <p className="text-sm text-slate-400 mb-4">
              Pretende alterar o role de <strong>{confirm.nome}</strong> para <strong>{confirm.role}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                tipo="secundario"
                onClick={() => setConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                tipo="primario"
                onClick={() => handleRoleChange(confirm.uid, confirm.role)}
                disabled={loadingUid === confirm.uid}
                carregando={loadingUid === confirm.uid}
              >
                {loadingUid === confirm.uid ? 'A alterar...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <GrantPlanModal
        show={planUser !== null}
        user={planUser}
        adminUid={adminUid}
        adminNome={adminNome}
        onClose={() => setPlanUser(null)}
        onGrant={onGrantPlan}
        onRevoke={onRevokePlan}
      />
    </>
  );
}
