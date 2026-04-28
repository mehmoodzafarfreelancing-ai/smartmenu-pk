'use client';

import { useCallback, useMemo, useState } from 'react';
import Header from './components/Header';
import Scanner from './components/Scanner';
import MenuDisplay from './components/MenuDisplay';
import OrderSummaryBar from './components/OrderSummaryBar';
import OrderSlipModal from './components/OrderSlipModal';
import { Language, MenuCategory, MenuItem, OrderLine } from './types';
import { scanMenuImage, ScanMenuError } from './lib/scanMenu';
import { motion, AnimatePresence } from 'motion/react';
import { X, CloudOff } from 'lucide-react';
import { countItemsInOrder, formatPkr, subtotalFromOrder } from './utils/orderMoney';

const HIGH_TRAFFIC_MSG =
  'AI is experiencing high traffic. Please try scanning again!';

function isServiceUnavailableError(error: unknown): boolean {
  if (error instanceof ScanMenuError && error.status === 503) {
    return true;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    const s = (error as { status?: number }).status;
    if (s === 503) return true;
  }
  return false;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [parsedData, setParsedData] = useState<MenuCategory[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderLine[]>([]);
  const [orderSlipOpen, setOrderSlipOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const addToOrder = useCallback((item: MenuItem) => {
    setCurrentOrder((prev) => {
      const idx = prev.findIndex((l) => l.item.id === item.id);
      if (idx >= 0) {
        return prev.map((l, i) => (i === idx ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const orderItemCount = useMemo(() => countItemsInOrder(currentOrder), [currentOrder]);
  const subtotal = useMemo(() => subtotalFromOrder(currentOrder), [currentOrder]);
  const hasOrder = orderItemCount > 0;

  const handleScan = async (file: File) => {
    setToastMessage(null);
    setIsScanning(true);
    try {
      const next = await scanMenuImage(file);
      console.log('[App] menu data after parse (ready for state):', next);
      setParsedData(next ?? []);
    } catch (error) {
      console.error('Failed to parse menu:', error);
      if (isServiceUnavailableError(error)) {
        setToastMessage(HIGH_TRAFFIC_MSG);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black overflow-x-hidden selection:bg-brand-primary selection:text-black">
      <Header language={language} onLanguageToggle={toggleLanguage} />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="alert"
            key="ai-traffic-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={`pointer-events-auto fixed left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 ${hasOrder ? 'bottom-28' : 'bottom-6'}`}
          >
            <div className="flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-2xl border border-brand-primary/25 bg-surface-dark/95 backdrop-blur-xl shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <div className="mt-0.5 p-1.5 rounded-lg bg-brand-primary/15 text-brand-primary shrink-0">
                <CloudOff className="w-4 h-4" aria-hidden />
              </div>
              <p className="text-sm text-white/95 leading-snug pr-1 pt-0.5">
                {toastMessage}
              </p>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors -mr-1 -mt-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main
        className={`relative px-4 sm:px-6 lg:px-8 ${hasOrder ? 'pb-32' : ''}`}
      >
        <Scanner onScan={handleScan} isScanning={isScanning} />
        
        <AnimatePresence mode="wait">
          {!isScanning && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <MenuDisplay
                categories={parsedData}
                language={language}
                onAddToOrder={addToOrder}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {hasOrder && (
          <OrderSummaryBar
            itemCount={orderItemCount}
            subtotalLabel={formatPkr(subtotal)}
            onOpenSlip={() => setOrderSlipOpen(true)}
          />
        )}
      </AnimatePresence>

      <OrderSlipModal
        open={orderSlipOpen}
        onClose={() => setOrderSlipOpen(false)}
        lines={currentOrder}
        subtotal={subtotal}
      />

      {/* Footer Branding */}
      <footer className="py-24 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-brand-primary/5 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 items-center relative z-10">
          <div className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
             <nav className="flex gap-8 mb-4">
              <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/30 hover:text-brand-primary transition-colors">Privacy</a>
              <a href="#" className="text-[11px] uppercase tracking-[0.2em] font-bold text-white/30 hover:text-brand-primary transition-colors">Terms</a>
            </nav>
            <p className="text-[11px] text-white/10 font-sans leading-relaxed">
              &copy; 2024 SmartMenu PK &bull; All Rights Reserved
            </p>
          </div>

          <div className="flex flex-col items-center order-1 md:order-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center -rotate-6 shadow-2xl shadow-brand-primary/20">
                <span className="text-xs text-black font-black">SM</span>
              </div>
              <p className="text-xl font-display font-black uppercase tracking-[0.3em] text-white">
                SmartMenu <span className="text-brand-primary">PK</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end text-center md:text-right order-3">
            <p className="text-[11px] text-white/20 font-bold uppercase tracking-[0.1em] mb-3">Powered by</p>
            <div className="flex items-center gap-4 py-2 px-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[10px] text-white font-bold tracking-widest">GEMINI AI VISION</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

