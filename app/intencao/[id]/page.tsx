import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIntencaoPorIdServer, getIntencoesServer } from '@/lib/db.server';
import DetalhesIntencao from '@/screens/DetalhesIntencao';

// Note: previously `force-dynamic`, which is incompatible with the static
// export used for the native app. Web now renders on-demand by default
// (`dynamicParams`); the app pre-renders known intents and resolves the rest
// client-side. Placeholder guards against an empty collection.

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  try {
    const intencoes = await getIntencoesServer();
    const params = intencoes.filter((i) => i.id).map((i) => ({ id: i.id }));
    return params.length > 0 ? params : [{ id: '_' }];
  } catch {
    return [{ id: '_' }];
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recargarage.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const intencao = await getIntencaoPorIdServer(id);
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

export default async function Page() {
  return <DetalhesIntencao />;
}
