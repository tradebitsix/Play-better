import React, { useEffect, useMemo, useState } from 'react'
import {
  Crown,
  MapPin,
  Trophy,
  Shield,
  Flame,
  Gauge,
  ChevronRight,
} from 'lucide-react'
import { api } from '../lib/api'
import type { ApiPlayer } from '../types'

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.45)] ${className}`}>{children}</div>
)

export default function ProfilePro() {
  const [players, setPlayers] = useState<ApiPlayer[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    api.players.list()
      .then((p) => {
        if (!mounted) return
        setPlayers(p)
        if (!activeId && p[0]?.id) setActiveId(p[0].id)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const active = useMemo(() => players.find((p) => p.id === activeId) || players[0] || null, [players, activeId])

  const displayName = active?.name || 'The Rocket'
  const venue = 'Downtown Pool Hall'
  const rank = '#1'

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <div className="p-4">
          <div className="text-xs text-white/60">Profile</div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight">{displayName}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
              <MapPin className="h-3.5 w-3.5" /> {venue}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
              <Crown className="h-3.5 w-3.5" /> Grandmaster
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">Rank {rank}</span>
          </div>

          <div className="mt-3 text-xs italic text-white/60">
            “9‑Ball specialist. Always looking for a challenge.”
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-xs font-semibold text-white/70">PLAYER STATISTICS</div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-black/25 p-3 border border-white/10">
            <div className="text-xs text-white/60">Win Rate</div>
            <div className="mt-1 text-2xl font-extrabold">68%</div>
            <div className="mt-1 text-xs text-emerald-400">+12% this week</div>
          </div>
          <div className="rounded-2xl bg-black/25 p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">Runout %</div>
              <Gauge className="h-4 w-4 text-white/60" />
            </div>
            <div className="mt-1 text-2xl font-extrabold">45%</div>
            <div className="mt-1 text-xs text-white/50">Avg shot 12s</div>
          </div>
          <div className="rounded-2xl bg-black/25 p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">Defense</div>
              <Shield className="h-4 w-4 text-white/60" />
            </div>
            <div className="mt-1 text-2xl font-extrabold">88</div>
            <div className="mt-1 text-xs text-white/50">Pressure proof</div>
          </div>
          <div className="rounded-2xl bg-black/25 p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60">Titles</div>
              <Trophy className="h-4 w-4 text-white/60" />
            </div>
            <div className="mt-1 text-2xl font-extrabold">5</div>
            <div className="mt-1 text-xs text-white/50">Trophy cabinet</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-white/60">Total Matches</div>
            <div className="mt-0.5 font-semibold">142</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/60">Avg Break</div>
            <div className="mt-0.5 font-semibold">22 mph</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-white/70">TROPHY CABINET</div>
          <button className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="rounded-2xl bg-black/25 border border-white/10 p-2 text-center">
            <Trophy className="mx-auto h-5 w-5" />
            <div className="mt-2 text-[10px] text-white/70">City Champ</div>
            <div className="text-[10px] text-white/40">2024</div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-2 text-center">
            <div className="mx-auto h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">8</div>
            <div className="mt-2 text-[10px] text-white/70">8‑Ball King</div>
            <div className="text-[10px] text-white/40">2023</div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-2 text-center">
            <Flame className="mx-auto h-5 w-5" />
            <div className="mt-2 text-[10px] text-white/70">10 Streak</div>
            <div className="text-[10px] text-white/40">Dec</div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-2 text-center">
            <div className="mx-auto h-5 w-5 rounded-full bg-white/10 flex items-center justify-center">🦈</div>
            <div className="mt-2 text-[10px] text-white/70">Shark</div>
            <div className="text-[10px] text-white/40">Nov</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-xs font-semibold text-white/70">RECENT ACTIVITY</div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-3">
            <div>
              <div className="text-sm font-semibold">vs Venom <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">WIN</span></div>
              <div className="text-xs text-white/50">Yesterday • Friday Night 9‑Ball</div>
            </div>
            <div className="text-sm font-semibold">9 - 7</div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-3">
            <div>
              <div className="text-sm font-semibold">vs Cool Hand <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] text-red-300">LOSS</span></div>
              <div className="text-xs text-white/50">2 days ago • City League QF</div>
            </div>
            <div className="text-sm font-semibold">4 - 7</div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-3">
            <div>
              <div className="text-sm font-semibold">vs Dynamite <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">WIN</span></div>
              <div className="text-xs text-white/50">Last week • Casual Match</div>
            </div>
            <div className="text-sm font-semibold">9 - 2</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">Select Player</div>
            <div className="text-sm font-semibold">Local roster</div>
          </div>
          <div className="text-xs text-white/60">{players.length} total</div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`rounded-full px-3 py-1 text-xs border transition ${p.id === activeId ? 'bg-white/15 border-white/25' : 'bg-black/20 border-white/10 hover:border-white/20'}`}
            >
              {p.name}
            </button>
          ))}
          {!players.length && <div className="text-xs text-white/60">No players yet — add some on the Lobby.</div>}
        </div>
      </Card>
    </div>
  )
}
