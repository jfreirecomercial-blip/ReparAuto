interface AdminStatsProps {
  totalUsers: number;
  totalCarros: number;
  totalPecas: number;
  carrosPendentes: number;
  pecasPendentes: number;
}

export default function AdminStats({ totalUsers, totalCarros, totalPecas, carrosPendentes, pecasPendentes }: AdminStatsProps) {
  const stats = [
    { label: 'Utilizadores', value: totalUsers, icon: 'fa-solid fa-users', cor: 'bg-blue-500' },
    { label: 'Carros', value: totalCarros, icon: 'fa-solid fa-car', cor: 'bg-accent' },
    { label: 'Peças', value: totalPecas, icon: 'fa-solid fa-gears', cor: 'bg-green-500' },
    { label: 'Total Anúncios', value: totalCarros + totalPecas, icon: 'fa-solid fa-list', cor: 'bg-purple-500' },
    { label: 'Pendentes', value: carrosPendentes + pecasPendentes, icon: 'fa-solid fa-clock', cor: 'bg-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className={`${s.cor} w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0`}>
            <i className={s.icon}></i>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-900">{s.value}</p>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
