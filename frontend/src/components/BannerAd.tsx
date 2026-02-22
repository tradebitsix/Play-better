import React, { useState } from 'react';
import { X, Sparkles, ExternalLink, Ticket } from 'lucide-react';

interface BannerAdProps {
  type?: 'inline' | 'sticky-bottom';
  className?: string;
}

export default function BannerAd({ type = 'inline', className = '' }: BannerAdProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (type === 'sticky-bottom') {
    return (
      <div className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-3 max-w-md mx-auto animate-in slide-in-from-bottom-10 fade-in duration-700 ${className}`}>
        <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800/50 rounded-xl shadow-2xl p-2.5 flex items-center justify-between relative overflow-hidden group">
          
          {/* Close Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }} 
            className="absolute top-1 right-1 p-1 text-zinc-600 hover:text-zinc-300 z-20 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X size={12} />
          </button>

          <div className="flex items-center gap-3">
             <div className="h-9 w-9 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center shrink-0 shadow-inner border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Sparkles className="h-4 w-4 text-white" />
             </div>
             <div className="pr-6">
                <div className="flex items-center gap-1.5 mb-0.5">
                   <span className="bg-zinc-800 text-[9px] font-bold text-zinc-400 px-1 rounded uppercase tracking-wider border border-zinc-700">Ad</span>
                   <p className="text-xs font-bold text-white">Pro Cues 50% Off</p>
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">Upgrade your game today.</p>
             </div>
          </div>

          <button className="bg-white text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors shadow-lg active:scale-95 flex items-center gap-1">
             Shop <ExternalLink size={10} />
          </button>
        </div>
      </div>
    );
  }

  // Inline Variant
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 group cursor-pointer hover:bg-zinc-900/50 transition-colors ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center shrink-0">
               <Ticket className="h-5 w-5 text-amber-500" />
            </div>
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded">Sponsored</span>
               </div>
               <h4 className="text-sm font-bold text-white">Weekly 8-Ball League</h4>
               <p className="text-[10px] text-zinc-500">Registration closing soon • $500 Pot</p>
            </div>
         </div>
         <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors border border-zinc-700 group-hover:scale-110 duration-200">
            <ExternalLink className="h-4 w-4 text-zinc-400" />
         </div>
      </div>
    </div>
  );
}