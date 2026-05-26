import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useApp } from '@/providers/AppProvider';

export default function LoginModal({ show, onClose }) {
  const { auth } = useApp();
  const { login } = auth;

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!nome.trim() || !email.trim()) return;
    login(nome.trim(), email.trim());
    setNome('');
    setEmail('');
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} titulo="Entrar na Plataforma" tamanho="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
          <input
            type="text"
            placeholder="Ex: Carlos Santos"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço de E-mail</label>
          <input
            type="email"
            placeholder="Ex: carlos@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={!nome.trim() || !email.trim()}
          className={`w-full font-bold py-3 rounded-xl transition ${
            !nome.trim() || !email.trim()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-accent hover:bg-accent-hover text-white'
          }`}
        >
          Entrar Agora (Simulação Segura)
        </button>
        <p className="text-xs text-gray-400 text-center">Ao entrar, concorda com os Termos da ReparAuto.</p>
      </div>
    </Modal>
  );
}
