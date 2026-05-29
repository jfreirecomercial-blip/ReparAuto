import type { Metadata } from 'next';
import Anunciar from '@/screens/Anunciar';

export const metadata: Metadata = {
  title: 'Anunciar carro ou peça',
  description: 'Publique gratuitamente o seu carro usado, peça ou veículo para desmonte no ReparAuto.',
  alternates: { canonical: '/anunciar' },
};

export default function Page() {
  return <Anunciar />;
}
