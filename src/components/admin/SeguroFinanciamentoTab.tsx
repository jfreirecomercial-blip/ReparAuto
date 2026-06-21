'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/providers/AppProvider';
import { updatePremiumConfig, getLeadsParceriaAdmin } from '@/lib/db';
import { useToast } from '@/components/ui/Toast';
import { Coins, ShieldCheck, Handshake, CircleNotch, Power, Calendar, User, Phone, Envelope } from '@phosphor-icons/react';
import { formatarDataHora } from '@/lib/utils';
import type { LeadParceria } from '@/types/lead';
import Button from '@/components/ui/Button';

export default function SeguroFinanciamentoTab() {
  const { premiumConfig, auth } = useApp();
  const toast = useToast();
  const [loadingFeature, setLoadingFeature] = useState<string | null>(null);
  const [leads, setLeads] = useState<LeadParceria[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadFilter, setLeadFilter] = useState<'todas' | 'financiamento' | 'seguro'>('todas');

  const isMasterActive = premiumConfig.masterActive !== false;
  const isParceriasActive = premiumConfig.parceriasActive !== false;
  const isFinanciamentoActive = premiumConfig.financiamento !== false;
  const isSeguroActive = premiumConfig.seguro !== false;

  useEffect(() => {
    async function carregarLeads() {
      setLoadingLeads(true);
      try {
        const data = await getLeadsParceriaAdmin();
        setLeads(data);
      } catch (err) {
        console.error(err);
        toast?.erro('Erro ao carregar leads de parcerias.');
      } finally {
        setLoadingLeads(false);
      }
    }
    carregarLeads();
  }, [toast]);

  const handleToggle = async (
    feature: 'parceriasActive' | 'financiamento' | 'seguro',
    currentValue: boolean
  ) => {
    if (!auth.user) return;
    setLoadingFeature(feature);
    try {
      await updatePremiumConfig({ [feature]: !currentValue }, auth.user.uid);
      const featureLabels = {
        parceriasActive: 'Chave Geral de Adicionais',
        financiamento: 'Simulador de Financiamento',
        seguro: 'Simulador de Seguro Auto',
      };
      toast?.sucesso(`Módulo "${featureLabels[feature]}" atualizado com sucesso!`);
    } catch (err) {
      console.error(err);
      toast?.erro(`Erro ao atualizar o módulo "${feature}".`);
    } finally {
      setLoadingFeature(null);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (leadFilter === 'todas') return true;
    return l.tipo === leadFilter;
  });

  return (
    <div className="space-y-8 text-slate-300">
      
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Master Toggle Card */}
        <div className={`p-6 rounded-2xl border transition-all duration-300 lg:col-span-3 ${
          isParceriasActive && isMasterActive
            ? 'border-emerald-900 bg-emerald-950/20 shadow-sm'
            : 'border-slate-800 bg-slate-900/30 opacity-70'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-xl shrink-0 transition-all duration-300 ${
                isParceriasActive && isMasterActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30' : 'bg-slate-800 text-slate-500'
              }`}>
                <Handshake className="text-2xl shrink-0" weight="bold" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-100">Chave Geral de Adicionais (Financiamento e Seguro)</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                  Ativa ou desativa simultaneamente todos os adicionais e simuladores de parcerias (Seguro Auto e Financiamento) exibidos nas páginas de detalhes dos veículos de forma imediata.
                </p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 ${
                  isParceriasActive && isMasterActive ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/50 text-red-400 border border-red-900/40'
                }`}>
                  {isParceriasActive && isMasterActive ? 'Simuladores Ativos na Plataforma' : 'Todos os Simuladores Desativados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-400">
                {isParceriasActive && isMasterActive ? 'Ativo' : 'Inativo'}
              </span>
              <button
                disabled={!isMasterActive || loadingFeature === 'parceriasActive'}
                onClick={() => handleToggle('parceriasActive', isParceriasActive)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
                  isParceriasActive && isMasterActive ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                {loadingFeature === 'parceriasActive' ? (
                  <span className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isParceriasActive ? 'translate-x-5' : 'translate-x-0'
                  }`}>
                    <CircleNotch className="animate-spin text-[10px] text-slate-500" />
                  </span>
                ) : (
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isParceriasActive ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Individual Toggles */}
        <div className={`p-5 bg-slate-900/50 border rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between ${
          isFinanciamentoActive && isParceriasActive && isMasterActive ? 'border-slate-800' : 'border-slate-900 opacity-55'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                isMasterActive && isParceriasActive ? 'bg-amber-600/10 text-amber-500' : 'text-slate-500 bg-slate-800/40'
              }`}>
                <Coins className="text-xl shrink-0" weight="fill" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Simulador de Financiamento</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isFinanciamentoActive && isParceriasActive && isMasterActive 
                    ? 'bg-green-950/40 text-green-400 border border-green-900/40'
                    : 'bg-red-950/40 text-red-400 border border-red-900/40'
                }`}>
                  {isFinanciamentoActive && isParceriasActive && isMasterActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disponibiliza o simulador de crédito na ficha dos carros e recolhe as intenções de crédito.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400">Estado</span>
            <button
              disabled={!isMasterActive || !isParceriasActive || loadingFeature === 'financiamento'}
              onClick={() => handleToggle('financiamento', isFinanciamentoActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
                isFinanciamentoActive && isParceriasActive && isMasterActive ? 'bg-amber-600' : 'bg-slate-800'
              }`}
            >
              {loadingFeature === 'financiamento' ? (
                <span className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isFinanciamentoActive ? 'translate-x-5' : 'translate-x-0'
                }`}>
                  <CircleNotch className="animate-spin text-[10px] text-slate-500" />
                </span>
              ) : (
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isFinanciamentoActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              )}
            </button>
          </div>
        </div>

        <div className={`p-5 bg-slate-900/50 border rounded-2xl shadow-sm transition-all duration-300 flex flex-col justify-between ${
          isSeguroActive && isParceriasActive && isMasterActive ? 'border-slate-800' : 'border-slate-900 opacity-55'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                isMasterActive && isParceriasActive ? 'bg-blue-600/10 text-blue-500' : 'text-slate-500 bg-slate-800/40'
              }`}>
                <ShieldCheck className="text-xl shrink-0" weight="fill" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-100">Simulador de Seguro Auto</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isSeguroActive && isParceriasActive && isMasterActive 
                    ? 'bg-green-950/40 text-green-400 border border-green-900/40'
                    : 'bg-red-950/40 text-red-400 border border-red-900/40'
                }`}>
                  {isSeguroActive && isParceriasActive && isMasterActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disponibiliza o simulador de seguro automóvel na ficha dos carros e recolhe propostas de cotação.
            </p>
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400">Estado</span>
            <button
              disabled={!isMasterActive || !isParceriasActive || loadingFeature === 'seguro'}
              onClick={() => handleToggle('seguro', isSeguroActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 ${
                isSeguroActive && isParceriasActive && isMasterActive ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              {loadingFeature === 'seguro' ? (
                <span className={`pointer-events-none flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSeguroActive ? 'translate-x-5' : 'translate-x-0'
                }`}>
                  <CircleNotch className="animate-spin text-[10px] text-slate-500" />
                </span>
              ) : (
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isSeguroActive ? 'translate-x-5' : 'translate-x-0'
                }`} />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Leads Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <Coins className="text-pink-500" /> Leads de Parcerias Registadas
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Leads qualificadas geradas a partir dos simuladores de Seguro e Crédito.</p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 gap-1 self-start sm:self-center">
            {(['todas', 'financiamento', 'seguro'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLeadFilter(filter)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
                  leadFilter === filter
                    ? 'bg-slate-800 text-pink-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter === 'todas' ? 'Todas' : filter === 'financiamento' ? 'Financiamentos' : 'Seguros'}
              </button>
            ))}
          </div>
        </div>

        {loadingLeads ? (
          <div className="flex justify-center items-center py-12">
            <CircleNotch className="animate-spin text-2xl text-pink-500" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <p className="text-sm text-slate-500 py-10 text-center">Nenhuma lead registada para o filtro selecionado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-800 pb-3">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Contactos</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Veículo Associado</th>
                  <th className="pb-3 pr-4">Simulação Detalhada</th>
                  <th className="pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-800/60 hover:bg-slate-800/20 transition-all">
                    {/* User info */}
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <User size={14} className="text-slate-500" /> {lead.nome}
                      </div>
                    </td>
                    
                    {/* Contact info */}
                    <td className="py-3.5 pr-4 text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-350">
                        <Phone size={12} className="text-slate-500" /> {lead.telefone}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-450">
                        <Envelope size={12} className="text-slate-500" /> {lead.email}
                      </div>
                    </td>
                    
                    {/* Type badge */}
                    <td className="py-3.5 pr-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        lead.tipo === 'financiamento'
                          ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                          : 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                      }`}>
                        {lead.tipo === 'financiamento' ? <Coins size={10} /> : <ShieldCheck size={10} />}
                        {lead.tipo === 'financiamento' ? 'Financiamento' : 'Seguro Auto'}
                      </span>
                    </td>

                    {/* Listing context */}
                    <td className="py-3.5 pr-4 text-xs max-w-[200px] truncate">
                      {lead.carroTitulo ? (
                        <div>
                          <p className="font-semibold text-slate-200 truncate">{lead.carroTitulo}</p>
                          <p className="text-[10px] text-slate-450">{lead.carroPreco?.toLocaleString('pt-PT')}€</p>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Simulation details */}
                    <td className="py-3.5 pr-4 text-xs">
                      {lead.tipo === 'financiamento' ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-amber-500">
                            Prestação: {lead.prestacaoEstimada}€ <span className="text-[10px] text-slate-500">/mês</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Entrada: {lead.entrada?.toLocaleString('pt-PT')}€ • Prazo: {lead.meses} meses
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="font-bold text-blue-500">
                            Prémio Est.: ~{lead.premioEstimado}€ <span className="text-[10px] text-slate-500">/ano</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Idade: {lead.idadeCondutor} anos • Cobertura: {lead.cobertura === 'danos' ? 'Danos Próprios' : 'Terceiros'}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        {lead.criadaEm ? formatarDataHora(lead.criadaEm) : '—'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
