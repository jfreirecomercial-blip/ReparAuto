import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/providers/AppProvider';
import {
  getAllUsers,
  setUserRole,
  getAllCarrosAdmin,
  getAllPecasAdmin,
  deleteCarro,
  deletePeca,
  updateCarroStatus,
  updatePecaStatus,
} from '@/lib/db';
import AdminStats from '@/components/admin/AdminStats';
import UserTable from '@/components/admin/UserTable';
import ListingsTable from '@/components/admin/ListingsTable';
import type { Usuario, Role } from '@/types/usuario';
import type { Carro } from '@/types/carro';
import type { Peca } from '@/types/peca';
import type { StatusAnuncio } from '@/types/carro';

type TabAdmin = 'visao-geral' | 'utilizadores' | 'anuncios';

export default function Admin() {
  const { auth } = useApp();
  const { isAdmin, loading: authLoading } = auth;
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabAdmin>('visao-geral');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [carros, setCarros] = useState<Carro[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/', { replace: true });
      return;
    }
    carregarDados();
  }, [authLoading, isAdmin]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [u, c, p] = await Promise.all([
        getAllUsers(),
        getAllCarrosAdmin(),
        getAllPecasAdmin(),
      ]);
      setUsers(u);
      setCarros(c);
      setPecas(p);
    } catch (err) {
      console.error('[Admin] Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, role: Role) => {
    await setUserRole(uid, role);
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
  };

  const handleDeleteCarro = async (id: string) => {
    await deleteCarro(id);
    setCarros((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeletePeca = async (id: string) => {
    await deletePeca(id);
    setPecas((prev) => prev.filter((p) => p.id !== id));
  };

  const handleApproveCarro = async (id: string) => {
    await updateCarroStatus(id, 'aprovado');
    setCarros((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'aprovado' } : c)));
  };

  const handleRejectCarro = async (id: string) => {
    await updateCarroStatus(id, 'rejeitado');
    setCarros((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'rejeitado' } : c)));
  };

  const handleApprovePeca = async (id: string) => {
    await updatePecaStatus(id, 'aprovado');
    setPecas((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'aprovado' } : p)));
  };

  const handleRejectPeca = async (id: string) => {
    await updatePecaStatus(id, 'rejeitado');
    setPecas((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejeitado' } : p)));
  };

  const tabs = [
    { key: 'visao-geral' as TabAdmin, label: 'Visão Geral', icon: 'fa-solid fa-chart-simple' },
    { key: 'utilizadores' as TabAdmin, label: 'Utilizadores', icon: 'fa-solid fa-users' },
    { key: 'anuncios' as TabAdmin, label: 'Anúncios', icon: 'fa-solid fa-list' },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-accent"></i>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-900 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-accent"></i> Painel de Administração
        </h1>
        <button
          onClick={carregarDados}
          className="text-xs font-bold text-slate-500 hover:text-accent transition px-3 py-1.5 rounded-xl border border-slate-300 hover:border-accent"
        >
          <i className="fa-solid fa-rotate mr-1"></i> Atualizar
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition ${
              tab === t.key ? 'bg-white text-accent shadow-sm' : 'text-slate-500 hover:text-brand-900'
            }`}
          >
            <i className={t.icon}></i> {t.label}
          </button>
        ))}
      </div>

      {tab === 'visao-geral' && (
        <AdminStats
          totalUsers={users.length}
          totalCarros={carros.length}
          totalPecas={pecas.length}
          carrosPendentes={carros.filter((c) => c.status === 'pendente').length}
          pecasPendentes={pecas.filter((p) => p.status === 'pendente').length}
        />
      )}

      {tab === 'utilizadores' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-extrabold text-brand-900 mb-4">
            <i className="fa-solid fa-users mr-2 text-accent"></i> Gestão de Utilizadores
          </h2>
          <UserTable users={users} onRoleChange={handleRoleChange} />
        </div>
      )}

      {tab === 'anuncios' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <h2 className="text-lg font-extrabold text-brand-900 mb-4">
            <i className="fa-solid fa-list mr-2 text-accent"></i> Gestão de Anúncios
          </h2>
          <ListingsTable
            carros={carros}
            pecas={pecas}
            onDeleteCarro={handleDeleteCarro}
            onDeletePeca={handleDeletePeca}
            onApproveCarro={handleApproveCarro}
            onRejectCarro={handleRejectCarro}
            onApprovePeca={handleApprovePeca}
            onRejectPeca={handleRejectPeca}
          />
        </div>
      )}
    </div>
  );
}
