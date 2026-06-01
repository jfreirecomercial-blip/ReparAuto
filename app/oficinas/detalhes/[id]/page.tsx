import type { Metadata } from 'next';
import { getOficinasServer } from '@/lib/db.server';
import DetalhesOficina from '@/screens/DetalhesOficina';

type PageProps = { params: Promise<{ id: string }> };

// Pre-render known workshops for the static export; web keeps rendering new ones
// on-demand (`dynamicParams`). Placeholder guards against an empty collection.
export async function generateStaticParams() {
  try {
    const oficinas = await getOficinasServer();
    const params = oficinas.filter((o) => o.id).map((o) => ({ id: o.id }));
    return params.length > 0 ? params : [{ id: '_' }];
  } catch {
    return [{ id: '_' }];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Detalhes da Oficina · ReparAuto',
    alternates: { canonical: `/oficinas/detalhes/${id}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DetalhesOficina id={id} />;
}
