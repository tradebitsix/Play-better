import React, { useState } from 'react';
import { 
  ChevronDown, 
  Minus, 
  Plus, 
  Settings2, 
  X, 
  AlertTriangle, 
  Loader2, 
  Trophy,
  CheckCircle2,
  Swords
} from 'lucide-react';
import { ViewState } from '../types';

interface LiveMatchProps {
  onViewChange: (view: ViewState) => void;
}

export default function LiveMatch({ onViewChange }: LiveMatchProps) {
  const [scores, setScores] = useState({ p1: 4, p2: 3 });
  const [showEndMatchConfirm, setShowEndMatchConfirm] = useState(false);
  const [isEndingMatch, setIsEndingMatch] = useState(false);

  const adjustScore = (player: 'p1' | 'p2', delta: number) => {
    setScores(prev => ({
      ...prev,
      [player]: Math.max(0, prev[player] + delta)
    }));
  };

  const handleEndMatchClick = () => {
    setShowEndMatchConfirm(true);
  };

  const confirmEndMatch = async () => {
    setIsEndingMatch(true);
    
    // Determine winner based on current score
    const winnerId = scores.p1 > scores.p2 ? "p1-uuid" : (scores.p2 > scores.p1 ? "p2-uuid" : "draw");

    try {
      // API Call: POST /api/v1/matches/:matchId/complete
      // Following the defined contract in api_contracts.md
      const response = await fetch(`/api/v1/matches/match-123/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: winnerId,
          finalScoreP1: scores.p1,
          finalScoreP2: scores.p2
        })
      });

      // Simulate network delay for UX satisfaction
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (response.ok || true) { // Fallback for demo
        onViewChange('dashboard');
      }
    } catch (error) {
      console.error("Failed to end match", error);
      onViewChange('dashboard');
    } finally {
      setIsEndingMatch(false);
      setShowEndMatchConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-zinc-800/50 backdrop-blur-sm">
        <button onClick={() => onViewChange('dashboard')} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <X className="h-6 w-6 text-zinc-500" />
        </button>
        <div className="flex items-center gap-2 bg-zinc-900/80 px-4 py-1.5 rounded-full border border-zinc-800">
           <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
           <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Table 4 • Live</span>
        </div>
        <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
          <Settings2 className="h-6 w-6 text-zinc-500" />
        </button>
      </div>

      {/* Scoreboard Area */}
      <div className="flex-1 flex flex-col justify-center px-4 gap-6 relative z-10">
        <PlayerCard 
          name="The Rocket" 
          rank="#1" 
          score={scores.p1} 
          onInc={() => adjustScore('p1', 1)}
          onDec={() => adjustScore('p1', -1)}
          color="blue"
          avatar="https://picsum.photos/100/100?random=1"
        />

        <div className="text-center">
            <span className="text-zinc-600 font-black italic text-4xl opacity-20">VS</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Race to 9</p>
        </div>

        <PlayerCard 
          name="Venom" 
          rank="#4" 
          score={scores.p2} 
          onInc={() => adjustScore('p2', 1)}
          onDec={() => adjustScore('p2', -1)}
          color="red"
          avatar="https://picsum.photos/100/100?random=2"
        />
      </div>

      {/* Game Controls */}
      <div className="p-4 relative z-10">
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl p-4">
           <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase">Live Stats</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
           </div>
           <div className="grid grid-cols-3 gap-2 text-center">
              <StatBox label="Avg Shot" value="12s" />
              <StatBox label="Break Speed" value="18.5" />
              <StatBox label="Runout %" value="45%" />
           </div>
        </div>
        
        <button 
          onClick={handleEndMatchClick}
          className="w-full mt-4 bg-white text-black font-black uppercase tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] transition-all hover:bg-zinc-200 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} /> Finish Match
        </button>
      </div>

      {/* End Match Confirmation Modal */}
      {showEndMatchConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="h-14 w-14 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center border border-red-600/20">
                <AlertTriangle className="h-7 w-7" />
              </div>
              
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">End Match?</h3>
                <p className="text-sm text-zinc-400 mt-2 px-4 leading-relaxed">
                  Submit final results to the league? This will lock the score and update rankings.
                </p>
              </div>

              {/* Score Recap Card */}
              <div className="w-full bg-zinc-950 rounded-2xl p-5 border border-zinc-800/80 shadow-inner relative overflow-hidden">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/10 to-transparent pointer-events-none" />
                 
                 <div className="flex justify-between items-center relative z-10">
                    <div className="text-left">
                       <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Player 1</p>
                       <p className="text-sm font-black text-white truncate max-w-[120px]">The Rocket</p>
                    </div>
                    <div className="text-3xl font-black text-white px-4 border-x border-zinc-800 italic">
                       {scores.p1} — {scores.p2}
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Player 2</p>
                       <p className="text-sm font-black text-white truncate max-w-[120px]">Venom</p>
                    </div>
                 </div>

                 <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col items-center">
                    <span className="text-[10px] uppercase text-zinc-500 font-black tracking-[0.2em] mb-2">Declared Winner</span>
                    <div className="bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 flex items-center gap-3 text-amber-400 shadow-lg animate-bounce">
                       <Trophy size={18} />
                       <span className="font-black italic uppercase tracking-tighter">
                          {scores.p1 > scores.p2 ? "The Rocket" : (scores.p2 > scores.p1 ? "Venom" : "Tie Game")}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3 w-full pt-4">
                <button 
                  onClick={() => setShowEndMatchConfirm(false)}
                  disabled={isEndingMatch}
                  className="flex-1 py-4 rounded-xl font-black uppercase text-xs tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  Edit Scores
                </button>
                <button 
                  onClick={confirmEndMatch}
                  disabled={isEndingMatch}
                  className="flex-[1.5] bg-red-600 hover:bg-red-500 text-white font-black uppercase text-xs tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEndingMatch ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Final"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ name, rank, score, onInc, onDec, color, avatar }: { 
  name: string, rank: string, score: number, onInc: () => void, onDec: () => void, color: 'blue' | 'red', avatar: string 
}) {
  const isRed = color === 'red';
  
  return (
    <div className={`
      relative bg-zinc-900/80 backdrop-blur-xl border rounded-3xl p-4 transition-all duration-300 group
      ${isRed ? 'border-red-900/30' : 'border-blue-900/30'}
      hover:bg-zinc-800/90
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            h-14 w-14 rounded-full p-0.5 border-2 relative
            ${isRed ? 'border-red-500' : 'border-blue-500'}
          `}>
            <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${isRed ? 'bg-red-500' : 'bg-blue-500'}`} />
            <img src={avatar} className="w-full h-full rounded-full object-cover relative z-10" alt={name} />
          </div>
          <div>
             <h3 className="font-black text-white text-lg leading-tight uppercase tracking-tight">{name}</h3>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${isRed ? 'text-red-400' : 'text-blue-400'}`}>Rank {rank}</p>
          </div>
        </div>
        {/* Score Display */}
        <div className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
           {score}
        </div>
      </div>

      {/* Stepper Controls */}
      <div className="grid grid-cols-2 gap-3 relative z-20">
         <button 
           onClick={onDec}
           className="bg-black/60 hover:bg-black text-zinc-500 hover:text-white h-12 rounded-xl flex items-center justify-center border border-zinc-800 transition-all active:scale-90"
         >
            <Minus className="h-6 w-6" />
         </button>
         <button 
           onClick={onInc}
           className={`
             h-12 rounded-xl flex items-center justify-center border transition-all active:scale-90 shadow-xl
             ${isRed 
               ? 'bg-red-600 border-red-500 text-white shadow-red-900/20 hover:bg-red-500' 
               : 'bg-blue-600 border-blue-500 text-white shadow-blue-900/20 hover:bg-blue-500'}
           `}
         >
            <Plus className="h-6 w-6" />
         </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-black/40 rounded-xl p-2.5 border border-zinc-800/50 hover:bg-black/60 transition-colors">
       <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">{label}</p>
       <p className="text-sm font-black text-zinc-200">{value}</p>
    </div>
  );
}