import type { Metadata } from 'next';
import Perfil from '@/screens/Perfil';

export const metadata: Metadata = {
  title: 'Perfil',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Perfil />;
}
