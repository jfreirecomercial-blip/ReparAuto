import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PoliticaPage from '@/screens/PoliticaPage';

const VALID_TIPOS = ['termos', 'privacidade', 'cookies', 'seguranca'] as const;
type Tipo = (typeof VALID_TIPOS)[number];

const titulos: Record<Tipo, string> = {
  termos: 'Termos de Utilização',
  privacidade: 'Política de Privacidade',
  cookies: 'Política de Cookies',
  seguranca: 'Segurança',
};

type PageProps = { params: Promise<{ tipo: string }> };

export function generateStaticParams() {
  return VALID_TIPOS.map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tipo } = await params;
  if (!VALID_TIPOS.includes(tipo as Tipo)) {
    return { title: 'Página não encontrada', robots: { index: false, follow: false } };
  }
  return {
    title: titulos[tipo as Tipo],
    alternates: { canonical: `/${tipo}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { tipo } = await params;
  if (!VALID_TIPOS.includes(tipo as Tipo)) notFound();
  return <PoliticaPage tipo={tipo} />;
}
