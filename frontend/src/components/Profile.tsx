import React, { useEffect, useState } from 'react'
import { User, Plus, Loader2 } from 'lucide-react'
import BannerAd from './BannerAd'
import { api } from '../lib/api'
import type { ViewState } from '../types'

export default function Profile({ onViewChange }: { onViewChange: (v: ViewState) => void }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [name, setName] = useState('')

  const refresh = async () => {
    setErr(null)
    setLoading(true)
    try {
      const p = await api.players.list()
      setPlayers(p)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const add = async () => {
    setErr(null)
    const n = name.trim()
    if (!n) return
    setSaving(true)
    try {
      await api.players.create(n)
      setName('')
      await refresh()
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onViewChange('dashboard')} className="text-sm text-zinc-300 hover:text-white">← Back</button>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-red-500" />
          <div className="font-bold">Players</div>
        </div>
      </div>

      <BannerAd />

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
        <div className="text-sm text-zinc-400">Create a player</div>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 rounded-xl bg-black border border-zinc-800 p-2"
          />
          <button
            disabled={saving}
            onClick={add}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </div>
        {err && <div className="text-sm text-red-400">{err}</div>}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      )}

      <div className="space-y-2">
        {players.map((p) => (
          <div key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-zinc-500">{p.id}</div>
          </div>
        ))}
        {!loading && players.length === 0 && <div className="text-sm text-zinc-500">No players yet.</div>}
      </div>
    </div>
  )
}
