import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Loader2, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { compressImageForScan } from '@/utils/compressImageForScan';

const LOADING_SUBLINES = [
  'Scanning physical menu...',
  'Translating items to Roman Urdu...',
  'Estimating calories & spice levels...',
  'Curating your digital experience...',
];

interface ScannerProps {
  onScan: (file: File) => void;
  isScanning: boolean;
}

export default function Scanner({ onScan, isScanning }: ScannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);

  const revokePreview = () => {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }
  };

  useEffect(() => {
    return () => revokePreview();
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    revokePreview();
    const url = URL.createObjectURL(file);
    previewObjectUrl.current = url;
    setPreview(url);
    try {
      const compressed = await compressImageForScan(file);
      onScan(compressed);
    } catch (err) {
      console.error('Image compression failed, sending original:', err);
      onScan(file);
    }
  };

  const clear = () => {
    revokePreview();
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="relative px-6 pt-10 pb-16 overflow-hidden max-w-7xl mx-auto">
      {/* Decorative background elements */}
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
            Magical Menu <br/><span className="text-brand-primary">Transformation</span>
          </h2>
          <p className="text-white/40 text-base md:text-lg max-w-[400px] lg:mx-0 mx-auto leading-relaxed">
            Snap a photo of any physical menu and let our AI curate your digital dining experience instantly.
          </p>
        </div>

        <motion.div 
          layout
          onClick={() => !isScanning && fileInputRef.current?.click()}
          className={`
            relative aspect-[4/5] md:aspect-video lg:aspect-[4/5] rounded-[3rem] border border-white/10 
            transition-all duration-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden
            shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)]
            ${preview ? 'bg-deep-black border-brand-primary/20' : 'bg-surface-dark/40 hover:bg-surface-dark/60 hover:border-brand-primary/30'}
            ${isScanning ? 'pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
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
            ) : preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
              >
                <img src={preview} alt="Menu preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-black/30" />
                
                <div className="absolute bottom-8 inset-x-8 flex flex-col items-center">
                  <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-4">Photo Captured</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); clear(); }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white text-sm font-bold hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                  >
                    <X className="w-4 h-4" />
                    Discard Image
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center px-10"
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
