'use client';

import FotosEditor from '@/components/anunciar/FotosEditor';

interface StepFotosProps {
  fotos: string[];
  setFotos: (fotos: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function StepFotos({ fotos, setFotos, onNext, onBack }: StepFotosProps) {
  return (
    <div>
      <h3 className="font-bold text-lg mb-3">📸 Fotos do carro</h3>
      <p className="text-sm text-gray-500 mb-4">
        Carregue ou adicione fotos reais para mostrar o estado do veículo (máximo 6 fotos, mínimo 1).
      </p>

      <FotosEditor fotos={fotos} setFotos={setFotos} max={6} />

      {fotos.length === 0 && (
        <p className="text-xs text-red-500 mt-4 block">
          Por favor, adicione pelo menos 1 foto do veículo (ficheiro real ou emoji rápido).
        </p>
      )}

      <div className="flex gap-3 mt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex-1 bg-white hover:bg-slate-50 text-brand-700 font-bold py-3 rounded-xl transition border border-slate-300"
          >
            Voltar
          </button>
        )}
        <button
          onClick={onNext}
          disabled={fotos.length === 0}
          className={`flex-1 font-bold py-3 rounded-xl transition ${
            fotos.length === 0
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-white'
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
