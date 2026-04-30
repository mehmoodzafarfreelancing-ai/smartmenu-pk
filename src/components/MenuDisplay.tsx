import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MenuCategory, Language, type MenuItem } from '../types';

const CHILI = '🌶️';

function spiceLevelForDisplay(item: MenuItem): 1 | 2 | 3 | undefined {
  const s = item.spiceLevel;
  if (s === 1 || s === 2 || s === 3) return s;
  return undefined;
}
import { Sparkles, Plus, Flame, Clock, Star, Camera } from 'lucide-react';

interface MenuDisplayProps {
  categories: MenuCategory[];
  language: Language;
  onAddToOrder?: (item: MenuItem) => void;
}

function listForSafeMap(data: unknown): MenuCategory[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as MenuCategory[];
  if (typeof data === 'object' && data !== null && 'categories' in data) {
    const c = (data as { categories: unknown }).categories;
    if (Array.isArray(c)) return c as MenuCategory[];
  }
  return [];
}

export default function MenuDisplay({ categories, language, onAddToOrder }: MenuDisplayProps) {
  const list = useMemo(() => listForSafeMap(categories as unknown), [categories]);

  useEffect(() => {
    console.log('[MenuDisplay] parsed structure for mapping:', { categories, list, listLength: list.length });
  }, [categories, list]);

  if (list.length === 0) {
    return (
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="relative flex flex-col items-center justify-center min-h-[18rem] rounded-[3rem] border border-white/10 bg-surface-dark/30 backdrop-blur-xl p-10 md:p-16 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[28rem] h-40 bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-surface-dark/80 shadow-2xl shadow-black/50 mb-8">
            <Camera className="h-9 w-9 text-brand-primary" strokeWidth={1.75} aria-hidden />
          </div>

          <p className="relative z-10 font-display text-xl md:text-2xl font-bold text-white/95 tracking-tight max-w-md leading-snug">
            Ready to curate your digital menu. Snap a photo to begin!
          </p>
          <p className="relative z-10 mt-4 text-sm text-white/40 max-w-sm leading-relaxed">
            Your categories and dishes will appear here in rich cards as soon as the scan finishes.
          </p>

          <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-brand-primary/80">
            <Sparkles className="w-4 h-4" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scan to extract</span>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-32 space-y-24 max-w-7xl mx-auto">
      {list?.map((category, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
          className="space-y-12"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative group">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 premium-gradient rounded-full shadow-lg shadow-brand-primary/20" />
                <h3 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight group-hover:tracking-wide transition-all duration-500">
                  {category?.title?.[language] ?? category?.title?.en ?? 'Menu'}
                </h3>
              </div>
              <div className="flex items-center gap-4 ml-6">
                <p className="text-brand-primary text-xs md:text-sm uppercase tracking-[0.4em] font-black">
                  Signature Collection
                </p>
                <div className="h-px w-12 bg-white/10" />
                <span className="text-white/20 text-xs font-bold uppercase tracking-widest">
                  {category?.items?.length ?? 0} Delicacies
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {category?.items?.map((item, itemIdx) => (
              <motion.div
                key={item?.id ?? `item-${idx}-${itemIdx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: itemIdx * 0.05, duration: 0.5 }}
                whileHover={{ y: -12 }}
                className="group relative flex flex-col bg-surface-dark/40 border border-white/5 p-1 rounded-[3.5rem] shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Inner Card Container */}
                <div className="bg-surface-dark/60 backdrop-blur-3xl p-8 rounded-[3.25rem] h-full flex flex-col justify-between border border-white/5 relative z-10">
                  
                  {/* Top Row: Tags & Price */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-2">
                      {item.isBestseller ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl">
                          <Star className="w-3 h-3 text-brand-primary fill-brand-primary" />
                          <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">Bestseller</span>
                        </div>
                      ) : null}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                          {item.prepTime ?? '15-20 min'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 border border-white/10 px-5 py-3 rounded-[1.5rem] group-hover:bg-brand-primary group-hover:border-brand-primary transition-all duration-500 shadow-xl">
                      <span className="font-display font-black text-white group-hover:text-black text-base tracking-tight">
                        {item?.price ?? '—'}
                      </span>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="space-y-4 mb-10">
                    <div className="space-y-2">
                      <h4 className="font-display font-black text-2xl text-white group-hover:text-brand-primary transition-colors leading-tight">
                        {item?.name ?? 'Item'}
                      </h4>
                      <p className="text-white/30 text-sm leading-relaxed line-clamp-3 group-hover:text-white/50 transition-colors">
                        {item?.description?.[language] ?? item?.description?.en ?? ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 py-3 border-y border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[11px] font-bold text-white/40">
                          {item.calories != null ? `${item.calories} kcal` : '— kcal'}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[11px] font-bold text-white/40">Preservative Free</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="text-sm leading-none tracking-tight min-h-[1rem]">
                      {(() => {
                        const spiceLevel = spiceLevelForDisplay(item);
                        if (!spiceLevel) return null;
                        return (
                          <p aria-label={`Spice level ${spiceLevel} of 3`}>
                            {CHILI.repeat(spiceLevel)}
                          </p>
                        );
                      })()}
                    </div>

                    <motion.button
                      type="button"
                      onClick={() => {
                        if (onAddToOrder && item) onAddToOrder(item);
                      }}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-14 h-14 premium-gradient rounded-3xl flex items-center justify-center shadow-xl shadow-brand-primary/20 text-black transition-transform group-hover:shadow-brand-primary/40"
                      aria-label="Add to current order"
                    >
                      <Plus className="w-6 h-6 stroke-[3px]" />
                    </motion.button>
                  </div>
                </div>

                {/* Background Accent */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-primary/10 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </section>
  );
}
