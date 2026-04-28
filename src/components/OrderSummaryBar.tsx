import { motion } from 'motion/react';
import { ShoppingBag, ChevronUp } from 'lucide-react';

interface OrderSummaryBarProps {
  itemCount: number;
  subtotalLabel: string;
  onOpenSlip: () => void;
}

export default function OrderSummaryBar({
  itemCount,
  subtotalLabel,
  onOpenSlip,
}: OrderSummaryBarProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
    >
      <button
        type="button"
        onClick={onOpenSlip}
        className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-2xl border border-white/10 bg-surface-dark/95 py-3.5 pl-5 pr-4 shadow-2xl shadow-black/40 ring-1 ring-brand-primary/15 backdrop-blur-2xl transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50"
        aria-label="View order details"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-primary">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
              Current order
            </p>
            <p className="font-display text-lg font-black text-white">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Est. subtotal</p>
            <p className="font-display text-base font-black text-brand-primary tabular-nums">{subtotalLabel}</p>
          </div>
          <ChevronUp className="h-5 w-5 text-white/30" />
        </div>
      </button>
    </motion.div>
  );
}
