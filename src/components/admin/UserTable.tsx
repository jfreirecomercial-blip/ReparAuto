'use client';

import { useState } from 'react';
import type { Usuario, Role } from '@/types/usuario';
import { formatarData } from '@/lib/utils';

interface UserTableProps {
  users: Usuario[];
  onRoleChange: (uid: string, role: Role) => Promise<void>;
}

export default function UserTable({ users, onRoleChange }: UserTableProps) {
  const [confirm, setConfirm] = useState<{ uid: string; nome: string; role: Role } | null>(null);
  const [loadingUid, setLoadingUid] = useState<string | null>(null);

  const handleRoleChange = async (uid: string, role: Role) => {
    setLoadingUid(uid);
    try {
      await onRoleChange(uid, role);
    } finally {
      setLoadingUid(null);
      setConfirm(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="pb-3 pr-4">UID</th>
              <th className="pb-3 pr-4">Nome</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3 pr-4">Data de Registo</th>
              <th className="pb-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.uid} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 pr-4 font-mono text-xs text-slate-400 max-w-[100px] truncate">{u.uid}</td>
                <td className="py-3 pr-4 font-medium text-brand-900">{u.nome || '—'}</td>
                <td className="py-3 pr-4 text-slate-600">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-500 text-xs">
                  {u.dataCriacao ? formatarData(u.dataCriacao) : '—'}
                </td>
                <td className="py-3">
                  <select
                    value={u.role}
                    disabled={loadingUid === u.uid}
                    onChange={(e) => {
                      const newRole = e.target.value as Role;
                      if (newRole !== u.role) {
                        setConfirm({ uid: u.uid, nome: u.nome || u.email, role: newRole });
                      }
                    }}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                  Nenhum utilizador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-extrabold text-brand-900 mb-2">Confirmar alteração</h3>
            <p className="text-sm text-slate-600 mb-4">
              Pretende alterar o role de <strong>{confirm.nome}</strong> para <strong>{confirm.role}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm font-bold rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRoleChange(confirm.uid, confirm.role)}
                disabled={loadingUid === confirm.uid}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-accent text-white hover:bg-accent-hover transition disabled:opacity-50"
              >
                {loadingUid === confirm.uid ? 'A alterar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
