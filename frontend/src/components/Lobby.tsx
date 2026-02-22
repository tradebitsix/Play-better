import React, { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  Search,
  Trophy,
  Radio,
  QrCode,
  DollarSign,
  Swords,
  Clock,
  Crown,
  ChevronRight,
} from 'lucide-react'
import { api } from '../lib/api'
import type { ApiPlayer, Tournament as UITournament } from '../types'
import PoolTableGame from './PoolTableGame'

type Props = {
  apiOnline: boolean
}

const GlassCard = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={
      `rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.45)] ${className}`
    }
  >
    {children}
  </div>
)

export default function Lobby({ apiOnline }: Props) {
  const [players, setPlayers] = useState<ApiPlayer[]>([])
  const [tournaments, setTournaments] = useState<UITournament[]>([])
  const [showTable, setShowTable] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [p, t] = await Promise.all([api.players.list(), api.tournaments.list()])
        setPlayers(p)
        setTournaments(t)
      } catch {
        // silent; UI still usable offline
      }
    })()
  }, [])

  const topPlayers = useMemo(() => players.slice(0, 2), [players])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-red-300" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold">Play Better</div>
            <div className="text-xs text-white/60">Pool Locals — By: FanzoftheOne</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <Search className="h-4 w-4 text-white/80" />
          </button>
          <button className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-white/80" />
          </button>
        </div>
      </div>

      {/* Live Now */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/20 border border-red-500/30 px-2 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              LIVE NOW
            </span>
            <span className="text-white/50">Table 4 · Race to 9</span>
          </div>
          <span
            className={
              `text-xs rounded-full px-3 py-1 border ${apiOnline ? 'border-emerald-500/30 bg-emerald-600/10 text-emerald-200' : 'border-yellow-500/30 bg-yellow-600/10 text-yellow-200'}`
            }
          >
            {apiOnline ? 'API online' : 'API offline'}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5" />
            <div>
              <div className="font-semibold">{topPlayers[0]?.name ?? 'The Rocket'}</div>
              <div className="text-xs text-white/50">Rank #1</div>
            </div>
          </div>
          <div className="text-white/30 font-semibold">VS</div>
          <div className="flex items-center gap-3">
            <div>
              <div className="font-semibold text-right">{topPlayers[1]?.name ?? 'Venom'}</div>
              <div className="text-xs text-white/50 text-right">Rank #4</div>
            </div>
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <GlassCard className="p-3">
            <div className="text-xs text-white/50">Prize Pot</div>
            <div className="text-xl font-semibold">$2,500.00</div>
          </GlassCard>
          <button className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-left">
            <div className="text-xs text-white/50">Stream</div>
            <div className="font-semibold">Watch Stream</div>
          </button>
        </div>
      </GlassCard>

      {/* Stats + Membership */}
      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="text-xs text-white/50">Win Rate</div>
          <div className="mt-1 text-2xl font-semibold">68%</div>
          <div className="mt-1 text-xs text-emerald-300">+12% this week</div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/50">Membership</div>
              <div className="mt-1 font-semibold">Free Tier</div>
            </div>
            <Crown className="h-5 w-5 text-yellow-300" />
          </div>
          <button className="mt-3 w-full rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 py-2 text-sm font-semibold">
            GO PRO $9/MO
          </button>
        </GlassCard>
      </div>

      {/* Table Actions */}
      <div>
        <div className="text-xs text-white/50 mb-2">TABLE ACTIONS</div>
        <div className="grid grid-cols-4 gap-2">
          <button className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 flex flex-col items-center gap-2">
            <QrCode className="h-4 w-4" />
            <span className="text-[11px] text-white/70">Check In</span>
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 flex flex-col items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-[11px] text-white/70">Pay Tab</span>
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 flex flex-col items-center gap-2">
            <Swords className="h-4 w-4" />
            <span className="text-[11px] text-white/70">Find Match</span>
          </button>
          <button className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-3 flex flex-col items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-[11px] text-white/70">Waitlist</span>
          </button>
        </div>
      </div>

      {/* Digital Table */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Digital Table</div>
            <div className="text-xs text-white/50">Tap/drag to aim. Release to shoot.</div>
          </div>
          <button
            onClick={() => setShowTable((v) => !v)}
            className="text-xs rounded-full px-3 py-1 border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {showTable ? 'Hide' : 'Show'}
          </button>
        </div>
        {showTable ? (
          <div className="mt-3">
            <PoolTableGame />
          </div>
        ) : null}
      </GlassCard>

      {/* Upcoming tournaments */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50">UPCOMING TOURNAMENTS</div>
            <div className="font-semibold">This Week</div>
          </div>
          <button className="text-xs text-white/70 hover:text-white inline-flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {(tournaments.length ? tournaments.slice(0, 3) : [
            { id: 't1', name: 'Friday Night 9-Ball', entryFee: 25, prizePool: 2500, startDate: 'Tonight, 8 PM', registeredCount: 12, maxPlayers: 16 },
            { id: 't2', name: 'Weekend Warrior Open', entryFee: 50, prizePool: 3500, startDate: 'Sat, 1 PM', registeredCount: 8, maxPlayers: 16 },
            { id: 't3', name: 'Amateur League Qualifiers', entryFee: 15, prizePool: 1200, startDate: 'Sun, 10 AM', registeredCount: 4, maxPlayers: 16 },
          ] as any).map((t: any, idx: number) => (
            <div key={t.id ?? idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-white/50">{t.startDate ?? 'Soon'} · {t.maxPlayers - t.registeredCount} left</div>
              </div>
              <button className="rounded-xl bg-white text-black px-3 py-2 text-xs font-semibold">
                Join ${t.entryFee}
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Sponsored */}
      <GlassCard className="p-4">
        <div className="text-xs text-white/50">SPONSORED</div>
        <div className="mt-1 font-semibold">Weekly 8‑Ball League</div>
        <div className="text-xs text-white/50">Registration closing soon · $500 Pot</div>
      </GlassCard>
    </div>
  )
}
