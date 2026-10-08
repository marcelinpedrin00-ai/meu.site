import React, { useState } from 'react';
import { X, Search, PackageCheck } from 'lucide-react';
import { OrderStatus } from '../types';
import { formatKz } from './PurchaseModal';

interface OrderTrackModalProps {
  initialQuery?: string;
  onClose: () => void;
}

export function getStatusMeta(status: OrderStatus): {
  label: string;
  textClass: string;
  dotColor: string;
} {
  switch (status) {
    case 'Pendente':
      return { label: '🟡 Pendente', textClass: 'text-amber-400', dotColor: 'bg-amber-400' };
    case 'Em análise':
      return { label: '🔵 Em análise', textClass: 'text-sky-400', dotColor: 'bg-sky-400' };
    case 'Pago':
      return { label: '🟢 Pago', textClass: 'text-emerald-400', dotColor: 'bg-emerald-400' };
    case 'Em processamento':
      return {
        label: '🟣 Em processamento',
        textClass: 'text-purple-400',
        dotColor: 'bg-purple-400',
      };
    case 'Concluído':
      return { label: '✅ Concluído', textClass: 'text-emerald-300', dotColor: 'bg-emerald-400' };
    case 'Cancelado':
      return { label: '🔴 Cancelado', textClass: 'text-red-400', dotColor: 'bg-red-400' };
    default:
      return { label: status, textClass: 'text-slate-300', dotColor: 'bg-slate-400' };
  }
}

export const OrderTrackModal: React.FC<OrderTrackModalProps> = ({ initialQuery = '', onClose }) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao consultar pedido.');
        setResults([]);
      } else {
        setResults(data.orders || []);
      }
      setSearched(true);
    } catch {
      setError('Falha ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0A0E17] border border-[#0066FF]/40 shadow-[0_0_40px_rgba(0,102,255,0.2)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050811]">
          <div className="flex items-center gap-2.5">
            <PackageCheck className="w-5 h-5 text-[#00A8FF]" />
            <h3 className="text-base font-bold text-white font-display">
              Consultar Estado do Pedido
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: #VCY-000001, Telefone ou ID Free Fire"
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#050811] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00A8FF] font-mono-tabular"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#00A8FF] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Buscando...' : 'Consultar'}</span>
            </button>
          </form>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {searched && results.length === 0 && !error && (
            <div className="p-6 rounded-xl bg-[#050811] border border-white/10 text-center">
              <p className="text-sm text-slate-300 font-medium">Nenhum pedido encontrado.</p>
              <p className="text-xs text-slate-500 mt-1">
                Verifique se digitou corretamente o código (ex: #VCY-000001) ou o número de
                telefone usado na compra.
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {results.map((ord) => {
                const st = getStatusMeta(ord.status);
                return (
                  <div
                    key={ord.orderNumber}
                    className="p-4 rounded-xl bg-[#050811] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-sm font-bold text-[#00A8FF] font-mono-tabular">
                        {ord.orderNumber}
                      </span>
                      <span className={`text-xs font-semibold ${st.textClass}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Produto</span>
                      <span className="text-white font-medium">
                        {ord.quantity}x {ord.productName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Conta / Nickname</span>
                      <span className="text-slate-200 font-mono-tabular">
                        {ord.freeFireId} · {ord.nickname}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Total / Pagamento</span>
                      <span className="text-white font-mono-tabular">
                        {formatKz(ord.totalPriceKz)} · {ord.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Data e Hora</span>
                      <span className="text-slate-400 font-mono-tabular">
                        {ord.date} às {ord.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
