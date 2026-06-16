'use client';

import { useState } from 'react';
import { Coins, ShieldCheck, Calculator, ArrowRight, CheckCircle } from '@phosphor-icons/react';
import Button from '@/components/ui/Button';

interface FinanciamentoSeguroWidgetProps {
  carroPreco: number;
}

export default function FinanciamentoSeguroWidget({ carroPreco }: FinanciamentoSeguroWidgetProps) {
  const [activeTab, setActiveTab] = useState<'financiamento' | 'seguro'>('financiamento');
  
  // States for Credit Simulator
  const [entrada, setEntrada] = useState<number>(Math.round(carroPreco * 0.2));
  const [meses, setMeses] = useState<number>(48);
  const [leadEnviadaCredito, setLeadEnviadaCredito] = useState(false);
  const [loadingCredito, setLoadingCredito] = useState(false);

  // States for Insurance Simulator
  const [idade, setIdade] = useState<number>(30);
  const [cobertura, setCobertura] = useState<'civil' | 'danos'>('civil');
  const [leadEnviadaSeguro, setLeadEnviadaSeguro] = useState(false);
  const [loadingSeguro, setLoadingSeguro] = useState(false);

  const valorFinanciado = Math.max(0, carroPreco - entrada);
  const taxaAnual = 0.065; // 6.5% interest rate
  const taxaMensal = taxaAnual / 12;
  const prestacaoMensal = valorFinanciado > 0 
    ? Math.round((valorFinanciado * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -meses)))
    : 0;

  const handleSimularCredito = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingCredito(true);
    setTimeout(() => {
      setLoadingCredito(false);
      setLeadEnviadaCredito(true);
    }, 1200);
  };

  const handleSimularSeguro = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSeguro(true);
    setTimeout(() => {
      setLoadingSeguro(false);
      setLeadEnviadaSeguro(true);
    }, 1200);
  };

  const precoSeguroEstimado = cobertura === 'civil' ? 180 : 450;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm mt-4">
      {/* Tabs header */}
      <div className="flex border-b border-slate-100 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('financiamento')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'financiamento'
              ? 'border-accent text-accent'
              : 'border-transparent text-fg-subtle hover:text-fg'
          }`}
        >
          <Coins size={18} />
          Financiamento
        </button>
        <button
          onClick={() => setActiveTab('seguro')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-1 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'seguro'
              ? 'border-accent text-accent'
              : 'border-transparent text-fg-subtle hover:text-fg'
          }`}
        >
          <ShieldCheck size={18} />
          Seguro Auto
        </button>
      </div>

      {/* Financiamento Tab */}
      {activeTab === 'financiamento' && (
        <div>
          {leadEnviadaCredito ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" weight="fill" />
              <h4 className="font-extrabold text-fg-heading text-base">Pedido de Simulação Enviado!</h4>
              <p className="text-xs text-fg-subtle mt-1 px-4">
                Enviámos os dados para o Banco CTT e Credibom. Um gestor entrará em contacto nas próximas 2 horas.
              </p>
              <Button 
                tipo="terciario" 
                tamanho="sm" 
                className="mt-4"
                onClick={() => setLeadEnviadaCredito(false)}
              >
                Nova Simulação
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSimularCredito} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-fg-subtle block">Prestação Mensal Estimada</span>
                  <span className="text-2xl font-black text-accent">{prestacaoMensal}€ <span className="text-xs font-normal text-fg-muted">/mês</span></span>
                </div>
                <Calculator size={32} className="text-slate-300" />
              </div>

              <div>
                <label className="text-xs font-bold text-fg-muted block mb-1">
                  Valor de Entrada: {entrada.toLocaleString('pt-PT')}€
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.round(carroPreco * 0.8)}
                  step="100"
                  value={entrada}
                  onChange={(e) => setEntrada(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-fg-subtle mt-1">
                  <span>0€ (Sem entrada)</span>
                  <span>Max: {(Math.round(carroPreco * 0.8)).toLocaleString('pt-PT')}€</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-fg-muted block mb-1">
                  Prazo de Reembolso: {meses} meses
                </label>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="12"
                  value={meses}
                  onChange={(e) => setMeses(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-[10px] text-fg-subtle mt-1">
                  <span>12 meses</span>
                  <span>84 meses (7 anos)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-fg-subtle block mb-3 leading-relaxed">
                  * Taxa de juro indicativa (TAEG 6.5%). Valores estimados não vinculativos, sujeitos a análise de crédito.
                </span>
                <Button
                  type="submit"
                  tipo="primario"
                  blocoCompleto
                  carregando={loadingCredito}
                  iconeFim={<ArrowRight />}
                >
                  Pedir Pré-Aprovação de Crédito
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Seguro Tab */}
      {activeTab === 'seguro' && (
        <div>
          {leadEnviadaSeguro ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3" weight="fill" />
              <h4 className="font-extrabold text-fg-heading text-base">Pedido de Cotação Recebido!</h4>
              <p className="text-xs text-fg-subtle mt-1 px-4">
                Parceiros Allianz e Tranquilidade foram notificados. Receberá as propostas no seu e-mail em breve.
              </p>
              <Button 
                tipo="terciario" 
                tamanho="sm" 
                className="mt-4"
                onClick={() => setLeadEnviadaSeguro(false)}
              >
                Nova Simulação
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSimularSeguro} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-fg-subtle block">Seguro Estimado</span>
                  <span className="text-2xl font-black text-primary-600">~{precoSeguroEstimado}€ <span className="text-xs font-normal text-fg-muted">/ano</span></span>
                </div>
                <ShieldCheck size={32} className="text-slate-300" />
              </div>

              <div>
                <label className="text-xs font-bold text-fg-muted block mb-1">
                  Idade do Condutor: {idade} anos
                </label>
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={idade}
                  onChange={(e) => setIdade(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-fg-muted block mb-1">
                  Tipo de Cobertura
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCobertura('civil')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                      cobertura === 'civil'
                        ? 'bg-accent/10 text-accent border-accent'
                        : 'bg-white text-fg border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Terc. (Responsab. Civil)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCobertura('danos')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition ${
                      cobertura === 'danos'
                        ? 'bg-accent/10 text-accent border-accent'
                        : 'bg-white text-fg border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Danos Próprios (Contra Todos)
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-fg-subtle block mb-3 leading-relaxed">
                  * Estimativa baseada no perfil padrão do condutor sem sinistros nos últimos 5 anos.
                </span>
                <Button
                  type="submit"
                  tipo="primario"
                  blocoCompleto
                  carregando={loadingSeguro}
                  iconeFim={<ArrowRight />}
                >
                  Obter Cotações de Seguro Grátis
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
