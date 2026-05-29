'use client';

import { useRef } from 'react';
import { EMOJIS_CARRO } from '@/lib/constants';

interface FotosEditorProps {
  fotos: string[];
  setFotos: (fotos: string[]) => void;
  max?: number;
  mostrarEmoji?: boolean;
}

export default function FotosEditor({
  fotos,
  setFotos,
  max = 6,
  mostrarEmoji = true,
}: FotosEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processarFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const novasFotos: string[] = [];
    files.forEach((file) => {
      if (novasFotos.length + fotos.length >= max) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        novasFotos.push(ev.target?.result as string);
        if (novasFotos.length === files.length || novasFotos.length + fotos.length >= max) {
          setFotos([...fotos, ...novasFotos].slice(0, max));
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const adicionarEmoji = () => {
    const emoji = EMOJIS_CARRO[Math.floor(Math.random() * EMOJIS_CARRO.length)];
    setFotos([...fotos, emoji].slice(0, max));
  };

  const removerFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const podeAdicionar = fotos.length < max;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label
          className={`flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border-dashed ${
            podeAdicionar ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <i className="fa-solid fa-upload"></i> Carregar Imagens Reais
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple={max > 1}
            disabled={!podeAdicionar}
            onChange={processarFotos}
          />
        </label>
        {mostrarEmoji && (
          <button
            type="button"
            onClick={adicionarEmoji}
            disabled={!podeAdicionar}
            className="bg-white hover:bg-slate-50 text-slate-600 font-medium px-4 py-3 rounded-xl text-xs transition border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🎲 Adicionar Emoji Rápido
          </button>
        )}
      </div>

      <div className={`grid gap-3 ${max === 1 ? 'grid-cols-1' : 'grid-cols-3 sm:grid-cols-6'}`}>
        {fotos.map((foto, i) => (
          <div key={i} className="relative group">
            {foto.startsWith('data:') || foto.startsWith('http') ? (
              <img
                src={foto}
                alt={`Foto ${i + 1}`}
                className={`w-full object-cover rounded-lg border border-slate-200 ${
                  max === 1 ? 'h-40' : 'h-20'
                }`}
              />
            ) : (
              <div
                className={`w-full flex items-center justify-center text-3xl bg-slate-50 rounded-lg border border-slate-200 ${
                  max === 1 ? 'h-40' : 'h-20'
                }`}
              >
                {foto}
              </div>
            )}
            <button
              type="button"
              onClick={() => removerFoto(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ))}
        {Array.from({ length: Math.max(0, max - fotos.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs cursor-pointer hover:bg-slate-50 transition ${
              max === 1 ? 'h-40' : 'h-20'
            }`}
          >
            {fotos.length + i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}
