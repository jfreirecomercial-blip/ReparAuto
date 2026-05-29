import type { Metadata } from 'next';
import SetupPerfil from '@/screens/SetupPerfil';

export const metadata: Metadata = {
  title: 'Completar perfil',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SetupPerfil />;
}
