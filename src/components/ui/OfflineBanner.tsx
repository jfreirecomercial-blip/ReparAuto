import useOnlineStatus from '@/hooks/useOnlineStatus';

export default function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] bg-yellow-500 text-yellow-950 text-center text-xs font-semibold py-1.5 px-4 shadow-md">
      <i className="fa-solid fa-wifi mr-1.5"></i>
      Sem ligação à Internet — a mostrar dados em cache
    </div>
  );
}
