import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language; 
  onLanguageToggle: () => void;
}

export default function Header({ language, onLanguageToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-deep-black/60 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 rotate-3">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <div className="flex flex-col -gap-1">
            <h1 className="font-display font-bold text-xl text-white tracking-tight leading-none">
              SmartMenu <span className="text-brand-primary">PK</span>
            </h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-primary/60 font-semibold">
              Premium Dining
            </span>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onLanguageToggle}
          className="relative flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm transition-all overflow-hidden group"
        >
          <motion.div
            animate={{ rotate: language === 'en' ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Globe className="w-4 h-4 text-brand-primary group-hover:text-white transition-colors" />
          </motion.div>
          
          <div className="relative h-5 w-20 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={language}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "backOut" }}
                className="absolute inset-0 text-xs font-bold text-white/90 whitespace-nowrap flex items-center justify-center"
              >
                {language === 'en' ? 'English' : 'Roman Urdu'}
              </motion.span>
            </AnimatePresence>
          </div>
          
          <motion.div 
            className="absolute inset-0 bg-brand-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
            layoutId="hover-bg"
          />
        </motion.button>
      </div>
    </header>
  );
}
