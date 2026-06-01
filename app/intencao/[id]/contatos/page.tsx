import { getIntencoesServer } from '@/lib/db.server';
import ContatosIntencao from '@/screens/ContatosIntencao';

// Server wrapper so this dynamic route can be statically exported for the
// native app. The screen reads the `id` from the route client-side via
// `useParams`. We pre-render the known intent ids (same set as /intencao/[id]);
// web renders new ones on-demand. Placeholder guards against an empty set.
export async function generateStaticParams() {
  try {
    const intencoes = await getIntencoesServer();
    const params = intencoes.filter((i) => i.id).map((i) => ({ id: i.id }));
    return params.length > 0 ? params : [{ id: '_' }];
  } catch {
    return [{ id: '_' }];
  }
}

export default function Page() {
  return <ContatosIntencao />;
}
