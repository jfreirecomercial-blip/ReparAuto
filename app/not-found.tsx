import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center py-20 page-enter">
      <i className="fa-solid fa-triangle-exclamation text-4xl text-slate-300 mb-3"></i>
      <h1 className="text-2xl font-extrabold text-brand-900 mb-2">Página não encontrada</h1>
      <p className="text-sm text-slate-500 mb-4">A página que procura não existe ou foi removida.</p>
      <Link
        href="/"
        className="text-accent hover:text-accent-hover font-semibold text-sm inline-flex items-center gap-1"
      >
        <i className="fa-solid fa-arrow-left"></i> Voltar à página inicial
      </Link>
    </div>
  );
}
