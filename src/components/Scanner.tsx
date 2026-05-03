import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Loader2, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { compressImageForScan } from '@/utils/compressImageForScan';

const LOADING_SUBLINES = [
  'Scanning physical menu...',
  'Translating items to Roman Urdu...',
  'Estimating calories & spice levels...',
  'Curating your digital experience...',
];

type StagedSlot = { file: File; previewUrl: string };

interface ScannerProps {
  onScan: (imageBase64Strings: string[]) => void;
  isScanning: boolean;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error('read failed'));
    r.readAsDataURL(file);
  });
}

export default function Scanner({ onScan, isScanning }: ScannerProps) {
  const [staged, setStaged] = useState<StagedSlot[]>([]);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);
  const stagedRef = useRef(staged);
  stagedRef.current = staged;

  const revokeUrls = useCallback((slots: StagedSlot[]) => {
    for (const s of slots) {
      URL.revokeObjectURL(s.previewUrl);
    }
  }, []);

  useEffect(() => {
    return () => {
      revokeUrls(stagedRef.current);
    };
  }, [revokeUrls]);

  useEffect(() => {
    if (!isScanning) {
      setLoadingLineIndex(0);
      return;
    }
    setLoadingLineIndex(0);
    const id = window.setInterval(() => {
      setLoadingLineIndex((i) => (i + 1) % LOADING_SUBLINES.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [isScanning]);

  const clearAll = () => {
    setStaged((prev) => {
      revokeUrls(prev);
      return [];
    });
    if (firstInputRef.current) firstInputRef.current.value = '';
    if (secondInputRef.current) secondInputRef.current.value = '';
  };

  const handleFirstFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    let outFile = file;
    try {
      outFile = await compressImageForScan(file);
    } catch (err) {
      console.error('Image compression failed, using original:', err);
    }

    const previewUrl = URL.createObjectURL(outFile);
    setStaged((prev) => {
      revokeUrls(prev);
      return [{ file: outFile, previewUrl }];
    });
  };

  const handleSecondFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (stagedRef.current.length >= 2) return;

    let outFile = file;
    try {
      outFile = await compressImageForScan(file);
    } catch (err) {
      console.error('Image compression failed, using original:', err);
    }

    const previewUrl = URL.createObjectURL(outFile);
    setStaged((p) => {
      if (p.length >= 2) {
        URL.revokeObjectURL(previewUrl);
        return p;
      }
      return [...p, { file: outFile, previewUrl }];
    });
  };

  const processMenu = async () => {
    if (staged.length === 0 || isScanning) return;
    const images = await Promise.all(staged.map((s) => readFileAsDataURL(s.file)));
    onScan(images);
  };

  const hasStaged = staged.length > 0;
  const emptyCardClickable = !isScanning && !hasStaged;

  return (
    <section className="relative px-6 pt-10 pb-16 overflow-hidden max-w-7xl mx-auto">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-brand-accent/5 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="mb-10 lg:mb-0 text-center lg:text-left">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-6 lg:ml-0 mx-auto"
          >
            <Sparkles className="w-3 h-3" />
            AI Powered Scanner
          </motion.div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Magical Menu <br />
            <span className="text-brand-primary">Transformation</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[400px] lg:mx-0 mx-auto leading-relaxed">
            Snap a photo of any physical menu and let our AI curate your digital dining experience instantly.
          </p>
        </div>

        <motion.div
          layout
          onClick={() => emptyCardClickable && firstInputRef.current?.click()}
          className={`
            relative aspect-[4/5] md:aspect-video lg:aspect-[4/5] rounded-[3rem] border border-white/10 
            transition-all duration-700 flex flex-col items-center justify-center overflow-hidden
            shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]
            ${hasStaged || isScanning ? 'bg-deep-black border-brand-primary/20' : 'bg-surface-dark/40 hover:bg-surface-dark/60 hover:border-brand-primary/30'}
            ${emptyCardClickable ? 'cursor-pointer' : ''}
            ${isScanning ? 'pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            ref={firstInputRef}
            onChange={handleFirstFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={secondInputRef}
            onChange={handleSecondFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center z-10"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <Loader2 className="w-16 h-16 text-brand-primary animate-spin relative z-10" />
                </div>
                <div className="text-center min-h-[3.5rem] px-4">
                  <p className="text-white font-bold text-lg mb-1 tracking-tight">Perceiving Flavors</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingLineIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="text-white/50 text-xs"
                    >
                      {LOADING_SUBLINES[loadingLineIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : hasStaged ? (
              <motion.div
                key="staged"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 py-8 w-full h-full"
              >
                <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold">
                  {staged.length === 2 ? 'Front & back' : 'Photo captured'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {staged.map((slot, i) => (
                    <div
                      key={slot.previewUrl}
                      className="relative w-[min(44vw,11rem)] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-lg"
                    >
                      <img
                        src={slot.previewUrl}
                        alt={i === 0 ? 'Menu page 1' : 'Menu page 2'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap items-stretch justify-center gap-3 w-full max-w-md">
                  {staged.length < 2 && (
                    <button
                      type="button"
                      onClick={() => secondInputRef.current?.click()}
                      className="flex-1 min-h-[44px] px-4 py-3 rounded-2xl text-sm font-bold border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-brand-primary/40 transition-all"
                    >
                      Add Back Page (Optional)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={processMenu}
                    className="flex-1 min-h-[44px] px-4 py-3 rounded-2xl text-sm font-bold premium-gradient text-black hover:opacity-95 transition-opacity"
                  >
                    Process Menu
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-xs font-bold hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center px-10 pointer-events-none"
              >
                <div className="w-24 h-24 premium-gradient rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-brand-primary/20 -rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Camera className="w-10 h-10 text-black" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-bold tracking-tight">Ready for Magic?</h3>
                  <p className="text-white/30 text-xs leading-relaxed max-w-[200px]">
                    Tap here to capture a menu or upload from your gallery.
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-4 py-3 px-6 bg-white/5 rounded-2xl border border-white/10">
                  <ImageIcon className="w-4 h-4 text-brand-primary" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Library</span>
                  <div className="w-px h-4 bg-white/10" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Limit 10MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}
