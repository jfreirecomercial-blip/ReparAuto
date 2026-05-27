import { formatarDataHora } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Review, StatusReview } from '@/types/review';

interface ReviewsQueueProps {
  reviews: Review[];
  loading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function StarRating({ nota }: { nota: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-star text-[10px] ${star <= nota ? 'fa-solid text-yellow-400' : 'fa-regular text-slate-300'}`}
        ></i>
      ))}
    </span>
  );
}

const statusColors: Record<StatusReview, string> = {
  pendente: 'yellow',
  aprovado: 'green',
  rejeitado: 'red',
};

const statusLabels: Record<StatusReview, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovada',
  rejeitado: 'Rejeitada',
};

export default function ReviewsQueue({ reviews, loading, onApprove, onReject, onDelete }: ReviewsQueueProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <i className="fa-solid fa-spinner fa-spin text-2xl text-accent"></i>
      </div>
    );
  }

  const pendentes = reviews.filter((r) => r.status === 'pendente');
  const outras = reviews.filter((r) => r.status !== 'pendente');
  const sorted = [...pendentes, ...outras];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-brand-900 flex items-center gap-2">
          <i className="fa-solid fa-star-half-stroke text-yellow-400"></i> Avaliações
          {pendentes.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendentes.length}</span>
          )}
        </h3>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-xl">
          Nenhuma avaliação submetida.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge cor={statusColors[review.status] as any}>{statusLabels[review.status]}</Badge>
                    <StarRating nota={review.nota} />
                    <span className="text-[10px] text-slate-400">{formatarDataHora(review.dataCriacao)}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    <strong>De:</strong> {review.autorNome} ({review.autorUid.slice(0, 8)}...)
                  </p>
                  <p className="text-xs text-slate-500">
                    <strong>Para:</strong> {review.vendedorEmail}
                  </p>
                  {review.comentario && (
                    <p className="text-sm text-slate-700 mt-2 bg-slate-50 rounded-lg p-2">{review.comentario}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                {review.status === 'pendente' && (
                  <>
                    <button
                      onClick={() => onApprove(review.id)}
                      className="text-xs font-bold bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      <i className="fa-solid fa-check mr-1"></i> Aprovar
                    </button>
                    <button
                      onClick={() => onReject(review.id)}
                      className="text-xs font-bold bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
                    >
                      <i className="fa-solid fa-xmark mr-1"></i> Rejeitar
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDelete(review.id)}
                  className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition ml-auto"
                >
                  <i className="fa-solid fa-trash-can mr-1"></i> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
