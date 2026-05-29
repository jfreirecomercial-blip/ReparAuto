'use client';

import { useState } from 'react';
import usePriceEstimate from '@/hooks/usePriceEstimate';
import { formatarPreco } from '@/lib/utils';
import { PRICE_DISCLAIMERS, PRICE_THRESHOLDS, TIPOS_CAMBIO, TIPOS_COMBUSTIVEL } from '@/lib/constants';
import BrandModelSelect from '@/components/preco/BrandModelSelect';

const ANO_ATUAL = new Date().getFullYear();

export default function PriceEstimator() {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState<string>('');
  const [km, setKm] = useState<string>('');
  const [combustivel, setCombustivel] = useState('');
  const [cambio, setCambio] = useState('');

  const input = marca && modelo && ano
    ? {
        marca,
        modelo,
        ano: Number(ano),
        km: km ? Number(km) : undefined,
        combustivel: combustivel || undefined,
        cambio: cambio || undefined,
      }
    : null;

  const estimate = usePriceEstimate(input);

  const confidenceColor = {
    alta: 'text-green-700 bg-green-50 border-green-200',
    media: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    baixa: 'text-slate-600 bg-slate-50 border-slate-200',
  }[estimate.confidence];

  const showLowConfidenceWarning =
    estimate.sampleSize > 0 && estimate.sampleSize < PRICE_THRESHOLDS.lowConfidenceSampleSize;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <BrandModelSelect
          marca={marca}
          modelo={modelo}
          onMarcaChange={setMarca}
          onModeloChange={setModelo}
          required
        />

        <div>
          <label htmlFor="ano-input" className="block text-xs font-bold text-slate-600 mb-1">Ano</label>
          <input
            id="ano-input"
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            min={1980}
            max={ANO_ATUAL + 1}
            placeholder={String(ANO_ATUAL - 5)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="km-input" className="block text-xs font-bold text-slate-600 mb-1">Quilómetros</label>
          <input
            id="km-input"
            type="number"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            min={0}
            placeholder="120000"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div>
          <label htmlFor="combustivel-select" className="block text-xs font-bold text-slate-600 mb-1">Combustível</label>
          <select
            id="combustivel-select"
            value={combustivel}
            onChange={(e) => setCombustivel(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Qualquer</option>
            {TIPOS_COMBUSTIVEL.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cambio-select" className="block text-xs font-bold text-slate-600 mb-1">Caixa</label>
          <select
            id="cambio-select"
            value={cambio}
            onChange={(e) => setCambio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Qualquer</option>
            {TIPOS_CAMBIO.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {!input ? (
        <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
          <i className="fa-solid fa-circle-info mr-2" aria-hidden="true"></i>
          Preencha marca, modelo e ano para receber uma estimativa.
        </div>
      ) : estimate.sampleSize === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
          <i className="fa-solid fa-magnifying-glass text-2xl mb-2 text-slate-300" aria-hidden="true"></i>
          <p>Não encontrámos anúncios suficientes para este modelo.</p>
          <p className="text-xs text-slate-400 mt-1">Tente um ano próximo ou outro modelo.</p>
        </div>
      ) : (
        <>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 text-center">
            <p className="text-xs text-slate-600 mb-2">Intervalo de mercado</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-accent leading-tight">
              {formatarPreco(estimate.rangeMin)} – {formatarPreco(estimate.rangeMax)}
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Estimativa central: <strong>{formatarPreco(estimate.estimate)}</strong>
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] flex-wrap">
              <span className={`px-2 py-1 rounded-full border ${confidenceColor}`}>
                Confiança {estimate.confidence}
              </span>
              <span className="text-slate-500">
                {estimate.sampleSize}{' '}
                {estimate.sampleSize === 1 ? 'anúncio similar' : 'anúncios similares'}
              </span>
            </div>
          </div>

          {estimate.stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center text-xs">
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Mínimo</p>
                <p className="font-bold text-slate-700">{formatarPreco(estimate.stats.min)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Mediana</p>
                <p className="font-bold text-slate-700">{formatarPreco(estimate.stats.median)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Média</p>
                <p className="font-bold text-slate-700">{formatarPreco(Math.round(estimate.stats.mean))}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2">
                <p className="text-[10px] text-slate-500">Máximo</p>
                <p className="font-bold text-slate-700">{formatarPreco(estimate.stats.max)}</p>
              </div>
            </div>
          )}

          {showLowConfidenceWarning && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-2 mt-3">
              <i className="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
              {PRICE_DISCLAIMERS.lowConfidence}
            </p>
          )}
        </>
      )}

      <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
        <i className="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
        {PRICE_DISCLAIMERS.estimator}
      </p>
    </div>
  );
}
