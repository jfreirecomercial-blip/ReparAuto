# Fase 3 — Página Pública de Detalhes da Intenção

## Problema
- Não existe uma página pública `/intencao/[id]` para ver detalhes completos de uma intenção de compra
- As intenções só aparecem como cards inline no `CarGrid` (homepage) e na lista `Minhas Intenções`
- Vendedores não conseguem ver perfil completo do comprador, reviews, badges, etc.
- Falta SEO para intenções de compra

## Solução
Criar:
1. Rota `app/intencao/[id]/page.tsx` (server component com metadata)
2. Screen `src/screens/DetalhesIntencao.tsx` (client component com UI completa)
3. Atualizar `CarGrid.tsx` para ligar os cards à nova página

---

## Ficheiro 1: `app/intencao/[id]/page.tsx` (NOVO)

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIntencaoCompra } from '@/lib/db';
import DetalhesIntencao from '@/screens/DetalhesIntencao';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recargarage.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const intencao = await getIntencaoCompra(id);
  if (!intencao || intencao.status !== 'ativa') {
    return { title: 'Intenção não encontrada', robots: { index: false, follow: false } };
  }
  const title = intencao.titulo;
  const description = `${intencao.criterios.marca} ${intencao.criterios.modelo} • Ano ${intencao.criterios.anoMinimo}${intencao.criterios.anoMaximo ? `–${intencao.criterios.anoMaximo}` : '+'} • Orçamento até ${intencao.criterios.precoMaximo.toLocaleString('pt-PT')}€ • ${intencao.criterios.combustivel.join(', ')} • ${intencao.criterios.localizacao.distrito}`;

  return {
    title,
    description,
    alternates: { canonical: `/intencao/${id}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/intencao/${id}`,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const intencao = await getIntencaoCompra(id);
  if (!intencao || (intencao.status !== 'ativa' && intencao.status !== 'pausada')) notFound();

  return <DetalhesIntencao intencao={intencao} />;
}
```

---

## Ficheiro 2: `src/screens/DetalhesIntencao.tsx` (NOVO)

```typescript
'use client';

import { ArrowLeft, Calendar, ChatCircleDots, Envelope, GasCan, Gear, IdentificationCard, MapPin, Money, Phone, SignIn, Speedometer, Star, User, WhatsappLogo } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/providers/AppProvider';
import { getUserByEmail } from '@/lib/db';
import { formatarPreco, formatarData, obterWhatsApp, gerarLinkWhatsApp } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SellerBadges from '@/components/trust/SellerBadges';
import type { IntencaoCompra } from '@/types/intencao';
import type { Usuario } from '@/types/usuario';

export default function DetalhesIntencao({ intencao }: { intencao: IntencaoCompra }) {
  const router = useRouter();
  const { auth, chat, loginModal } = useApp();
  const { user } = auth;
  const { abrirChat } = chat;
  const [mostrarTelefone, setMostrarTelefone] = useState(false);
  const [compradorProfile, setCompradorProfile] = useState<Usuario | null>(null);

  useEffect(() => {
    if (!intencao.vendedorEmail) return;
    let stale = false;
    getUserByEmail(intencao.vendedorEmail).then((found) => {
      if (!stale && found) setCompradorProfile(found);
    });
    return () => { stale = true; };
  }, [intencao.vendedorEmail]);

  const whatsapp = obterWhatsApp(intencao.vendedorWhatsApp, intencao.vendedorTelefone);
  const telefone = intencao.vendedorTelefone;
  const email = intencao.vendedorEmail || '';
  const temWhatsApp = !!whatsapp && (intencao.contatoPreferido === 'whatsapp' || intencao.contatoPreferido === 'ambos');
  const temTelefone = !!telefone && intencao.mostrarTelefone;
  const temEmail = !!email && (intencao.contatoPreferido === 'whatsapp' || intencao.contatoPreferido === 'ambos');
  const isOwn = user?.uid === intencao.userId;
  const temChat = !!user && !!intencao.userId && !isOwn;

  const c = intencao.criterios;
  const p = intencao.preferencias;

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <Button tipo="terciario" tamanho="sm" icone={<ArrowLeft />} onClick={() => router.back()} className="mb-3">
        Voltar
      </Button>

      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Título + Status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-fg-heading">{intencao.titulo}</h1>
            <p className="text-fg-subtle text-sm mt-1 flex items-center gap-1">
              <Calendar /> Publicado em {formatarData(intencao.criadaEm)}
            </p>
          </div>
          <Badge cor={intencao.status === 'ativa' ? 'green' : 'yellow'}>
            {intencao.status === 'ativa' ? 'Ativa' : 'Pausada'}
          </Badge>
        </div>

        {/* Critérios de busca */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-6">
          <h3 className="font-extrabold text-fg-heading mb-4 flex items-center gap-2">
            <IdentificationCard className="text-accent" /> Critérios de Busca
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Marca</span>
              <p className="font-semibold text-fg-heading">{c.marca}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Modelo</span>
              <p className="font-semibold text-fg-heading">{c.modelo}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle">Ano</span>
              <p className="font-semibold text-fg-heading">{c.anoMinimo}{c.anoMaximo ? ` – ${c.anoMaximo}` : '+'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle flex items-center gap-1"><Money /> Orçamento</span>
              <p className="font-semibold text-accent">
                {c.precoMinimo ? `${formatarPreco(c.precoMinimo)} – ` : 'Até '}{formatarPreco(c.precoMaximo)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle flex items-center gap-1"><GasCan /> Combustível</span>
              <p className="font-semibold text-fg-heading">{c.combustivel.join(', ')}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle flex items-center gap-1"><Gear /> Transmissão</span>
              <p className="font-semibold text-fg-heading">{c.tipoTransmissao.join(', ')}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle flex items-center gap-1"><Speedometer /> Km máx</span>
              <p className="font-semibold text-fg-heading">{c.quilometragemMaxima.toLocaleString('pt-PT')} km</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-fg-subtle flex items-center gap-1"><MapPin /> Localização</span>
              <p className="font-semibold text-fg-heading">{c.localizacao.distrito} ({c.localizacao.raio} km)</p>
            </div>
          </div>
        </div>

        {/* Preferências */}
        {p && (p.cores || p.tipoCarroceria || p.itensDesejados || p.aceitaFinanciamento !== undefined || p.aceitaTroca !== undefined) && (
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 mb-6">
            <h3 className="font-extrabold text-fg-heading mb-4">Preferências</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
              {p.cores && p.cores.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-fg-subtle">Cores</span>
                  <p className="font-semibold text-fg-heading">{p.cores.join(', ')}</p>
                </div>
              )}
              {p.tipoCarroceria && p.tipoCarroceria.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-fg-subtle">Carroceria</span>
                  <p className="font-semibold text-fg-heading">{p.tipoCarroceria.join(', ')}</p>
                </div>
              )}
              {p.itensDesejados && p.itensDesejados.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-fg-subtle">Itens desejados</span>
                  <p className="font-semibold text-fg-heading">{p.itensDesejados.join(', ')}</p>
                </div>
              )}
              {p.aceitaFinanciamento !== undefined && (
                <div>
                  <span className="text-xs font-semibold text-fg-subtle">Financiamento</span>
                  <p className="font-semibold text-fg-heading">{p.aceitaFinanciamento ? 'Aceita' : 'Não aceita'}</p>
                </div>
              )}
              {p.aceitaTroca !== undefined && (
                <div>
                  <span className="text-xs font-semibold text-fg-subtle">Troca</span>
                  <p className="font-semibold text-fg-heading">{p.aceitaTroca ? 'Aceita' : 'Não aceita'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Descrição adicional */}
        {intencao.descricao && (
          <div className="mb-6">
            <h3 className="font-extrabold text-fg-heading mb-2">Descrição</h3>
            <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">{intencao.descricao}</p>
          </div>
        )}

        {/* Contactar Comprador */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm mt-6">
          <h3 className="font-extrabold text-fg-heading mb-4 flex items-center gap-2">
            <IdentificationCard className="text-accent" /> Contactar Comprador
          </h3>

          <div className="flex items-center gap-2 text-sm text-brand-700 mb-2">
            <User className="text-slate-400" />
            <span className="font-semibold">{intencao.vendedorNome || 'Comprador'}</span>
          </div>

          {compradorProfile && (
            <div className="mb-4">
              <SellerBadges
                verificado={compradorProfile.verificado}
                badges={compradorProfile.badges}
                mediaAvaliacoes={compradorProfile.mediaAvaliacoes}
                totalAvaliacoes={compradorProfile.totalAvaliacoes}
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {temWhatsApp && (
              <a
                href={gerarLinkWhatsApp(whatsapp!, intencao.titulo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition text-sm"
              >
                <WhatsappLogo className="text-lg" />
                WhatsApp
              </a>
            )}
            {temEmail && (
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-fg font-semibold py-3 px-4 rounded-xl transition border border-slate-300 text-sm"
              >
                <Envelope />
                Enviar Email
              </a>
            )}
          </div>

          <div className="mt-3">
            {temTelefone && !mostrarTelefone && (
              <Button tipo="primario" tamanho="lg" blocoCompleto onClick={() => setMostrarTelefone(true)} icone={<Phone />}>
                Ver Telefone
              </Button>
            )}
            {temTelefone && mostrarTelefone && (
              <a
                href={`tel:${telefone}`}
                className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-xl transition text-sm"
              >
                <Phone />
                {telefone}
              </a>
            )}
          </div>

          <div className="mt-3">
            {temChat && (
              <Button
                tipo="azul"
                tamanho="lg"
                blocoCompleto
                onClick={() => abrirChat(intencao.id, 'intencao', intencao.titulo, intencao.userId, intencao.vendedorNome || 'Comprador')}
                icone={<ChatCircleDots />}
              >
                Enviar Mensagem (Chat Interno)
              </Button>
            )}
            {!temChat && !user && (
              <button
                onClick={() => loginModal.openLoginModal(window.location.pathname)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-fg-muted font-semibold py-3 px-4 rounded-xl transition text-sm"
              >
                <SignIn />
                Faça login para enviar mensagem
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-4 text-xs text-fg-subtle">
          <span>{intencao.stats.visualizacoes} visualizações</span>
          <span>{intencao.stats.contatos} contactos</span>
        </div>
      </div>
    </div>
  );
}
```

---

## Ficheiro 3: `src/components/home/CarGrid.tsx`

Tornar os cards de intenção clicáveis para navegar para `/intencao/[id]`:

```typescript
// ADICIONAR import de Link no topo (já existe, mas verificar)
import Link from 'next/link';

// No bloco de renderização de cada intenção (linha 322-403):
// Envolver o card num Link para /intencao/[id]
                  return (
                  <Link
                    key={intencao.id}
                    href={`/intencao/${intencao.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-slate-200 p-4 hover:border-accent/40 hover:shadow-md transition-all"
                  >
                    {/* ... conteúdo existente do card ... */}
                  </Link>
                  );
```

Nota: O card atual não está num Link. Envolver todo o conteúdo do card (dentro do `map`) num `<Link>` para `/intencao/${intencao.id}`. Os botões de contacto internos (WhatsApp, Email, Telefone, Chat) devem ter `e.preventDefault()` no onClick para não navegar quando se clica neles.

Ou melhor: em vez de envolver tudo num Link, manter o card como `div` e ADICIONAR um "Ver detalhes" ou tornar o título clicável. Isto evita conflitos com os botões de contacto.

Abordagem recomendada:

```typescript
// No título do card, tornar clicável:
<h3 className="font-bold text-fg-heading text-sm mb-2">
  <Link href={`/intencao/${intencao.id}`} className="hover:text-accent transition-colors">
    {intencao.titulo}
  </Link>
</h3>

// E adicionar um botão "Ver detalhes" no fundo:
<div className="mt-2 pt-2 border-t border-slate-100">
  <Link
    href={`/intencao/${intencao.id}`}
    className="flex items-center justify-center gap-1.5 w-full bg-accent/10 hover:bg-accent/20 text-accent font-semibold py-1.5 px-3 rounded-xl transition text-xs"
  >
    Ver detalhes completos
  </Link>
</div>
```

Os botões de contacto (WhatsApp, Email, Telefone, Chat) mantêm-se como `<a>`, `<button>` ou `<Link>` independentes — não precisam de `preventDefault` porque não estão dentro de um Link ancestral.
