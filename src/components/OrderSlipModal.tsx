import { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Receipt } from 'lucide-react';
import type { OrderLine } from '../types';
import { formatPkr, parsePkrToNumber, sumOrderLineAmount, withPraGst16 } from '../utils/orderMoney';

interface OrderSlipModalProps {
  open: boolean;
  onClose: () => void;
  lines: OrderLine[];
  subtotal: number;
}

function lineLabel(line: OrderLine) {
  const unit = parsePkrToNumber(line.item.price);
  if (unit == null) return { lineTotal: '—' as const, hasAmount: false };
  const t = sumOrderLineAmount(line);
  return { lineTotal: formatPkr(t), hasAmount: true };
}

export default function OrderSlipModal({ open, onClose, lines, subtotal }: OrderSlipModalProps) {
  const titleId = useId();
  const { gst, finalTotal } = withPraGst16(subtotal);
  const hasUnparseable = lines.some((l) => parsePkrToNumber(l.item.price) == null);
  const createdAt = new Date();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-white/12 bg-stone-950/98 shadow-2xl ring-1 ring-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)',
              }}
            />
            <div className="relative p-1">
              <div className="rounded-t-[0.9rem] border-b border-dashed border-white/15 bg-gradient-to-b from-white/8 to-transparent px-6 pb-4 pt-5 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-primary/30 bg-brand-primary/10 text-brand-primary">
                  <Receipt className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <p id={titleId} className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
                  Order slip
                </p>
                <p className="mt-0.5 font-display text-lg font-black tracking-tight text-white">
                  SmartMenu <span className="text-brand-primary">PK</span>
                </p>
                <p className="mt-1 text-[10px] text-white/45">Estimates · {createdAt.toLocaleString()}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close order slip"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative max-h-[min(55vh,22rem)] overflow-y-auto overscroll-contain px-5 py-4">
              {lines.length === 0 ? (
                <p className="text-center text-sm text-white/40">No items in this order.</p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((line) => {
                    const { lineTotal, hasAmount } = lineLabel(line);
                    return (
                      <li
                        key={line.item.id}
                        className="flex items-start justify-between gap-2 border-b border-dashed border-white/10 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-snug text-white/95 [overflow-wrap:anywhere]">
                            {line.item.name}
                          </p>
                          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-white/35">×{line.quantity}</p>
                        </div>
                        <p
                          className={`shrink-0 text-sm font-bold tabular-nums ${
                            hasAmount ? 'text-white/80' : 'text-white/35'
                          }`}
                        >
                          {lineTotal}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {hasUnparseable && (
              <p className="border-t border-white/5 px-5 py-2 text-center text-[10px] text-amber-400/80">
                Some line prices were not on the card; subtotal may be incomplete.
              </p>
            )}

            <div className="space-y-2.5 border-t border-white/10 bg-black/20 px-5 py-4">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Subtotal (est.)</span>
                <span className="font-mono font-semibold tabular-nums text-white/90">
                  {formatPkr(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Est. PRA GST (16%)</span>
                <span className="font-mono font-semibold tabular-nums text-white/90">{formatPkr(gst)}</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center justify-between text-base">
                <span className="font-display font-black text-white">Final total</span>
                <span className="font-mono text-lg font-bold tabular-nums text-brand-primary">
                  {formatPkr(finalTotal)}
                </span>
              </div>
            </div>

            <div className="border-t border-white/5 p-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-brand-primary py-3.5 font-display text-sm font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-brand-primary/25 transition hover:brightness-110 active:scale-[0.99]"
              >
                Show to Waiter
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
