import React, { useEffect, useMemo, useState } from 'react'
import { Users, Trophy, Plus, Loader2, RefreshCcw } from 'lucide-react'
import BannerAd from './BannerAd'
import { api } from '../lib/api'
import type { ViewState } from '../types'

function uniqueName(i: number) {
  const base = ['Ace', 'Bankshot', 'Cue', 'Diamond', 'English', 'Follow', 'Ghost', 'Hustle']
  return base[i] ? `${base[i]} ${i + 1}` : `Player ${i + 1}`
}

export default function Tournaments({ onViewChange, onOpenBracket }: { onViewChange: (v: ViewState) => void; onOpenBracket: (tournamentId: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [list, setList] = useState<{ id: string; mode: string; venueName?: string | null; created_at?: string }[]>([])

  const refresh = async () => {
    setErr(null)
    setLoading(true)
    try {
      const [p, t] = await Promise.all([api.players.list(), api.tournaments.list()])
      setPlayers(p)
      setList(t)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const canCreate = useMemo(() => players.length >= 8, [players.length])

  const ensureEightPlayers = async () => {
    // Ensure at least 8 players exist, create demo players if needed
    let p = await api.players.list()
    while (p.length < 8) {
      const created = await api.players.create(uniqueName(p.length))
      p = [created, ...p]
    }
    return p.slice(0, 8)
  }

  const createDigital = async () => {
    setErr(null)
    setCreating(true)
    try {
      const eight = canCreate ? players.slice(0, 8) : await ensureEightPlayers()
      const { id } = await api.tournaments.createDigital(eight.map((x) => x.id))
      onOpenBracket(id)
      await refresh()
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onViewChange('dashboard')} className="text-sm text-zinc-300 hover:text-white">← Back</button>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-red-500" />
          <div className="font-bold">Tournaments</div>
        </div>
      </div>

      <BannerAd />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Create a digital bracket</div>
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Users className="h-4 w-4" /> Requires 8 players (auto-creates demo players if needed)
            </div>
          </div>
          <button
            disabled={creating}
            onClick={createDigital}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create
          </button>
        </div>
        {err && <div className="mt-3 text-sm text-red-400">{err}</div>}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Recent</div>
        <button onClick={refresh} className="text-sm text-zinc-300 hover:text-white inline-flex items-center gap-2">
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      <div className="space-y-3">
        {list.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpenBracket(t.id)}
            className="w-full text-left rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 hover:border-zinc-700 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{t.mode === 'live' ? `Live @ ${t.venueName || 'Venue'}` : 'Digital'}</div>
                <div className="text-sm text-zinc-400">{t.id}</div>
              </div>
              <div className="text-xs text-zinc-500">{t.created_at ? new Date(t.created_at).toLocaleString() : ''}</div>
            </div>
          </button>
        ))}
        {!loading && list.length === 0 && <div className="text-sm text-zinc-400">No tournaments yet.</div>}
      </div>
    </div>
  )
}
