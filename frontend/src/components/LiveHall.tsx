import React, { useEffect, useMemo, useState } from 'react'
import { Bell, Loader2, Send, Users } from 'lucide-react'
import BannerAd from './BannerAd'
import { api } from '../lib/api'
import type { ViewState } from '../types'

export default function LiveHall({ onViewChange }: { onViewChange: (v: ViewState) => void }) {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([])
  const [me, setMe] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [events, setEvents] = useState<any[]>([])

  const meObj = useMemo(() => players.find((p) => p.id === me) || null, [players, me])

  useEffect(() => {
    (async () => {
      try {
        const p = await api.players.list()
        setPlayers(p)
        if (p[0]?.id) setMe(p[0].id)
        if (p[1]?.id) setTo(p[1].id)
      } catch (e: any) {
        setErr(String(e.message || e))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!me) return
    const stop = api.ping.stream(me, (payload) => setEvents((prev) => [payload, ...prev].slice(0, 50)))
    return stop
  }, [me])

  const sendPing = async () => {
    setErr(null)
    try {
      if (!to) return
      await api.ping.send(to, 'default', me || undefined)
    } catch (e: any) {
      setErr(String(e.message || e))
    }
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onViewChange('dashboard')} className="text-sm text-zinc-300 hover:text-white">← Back</button>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-500" />
          <div className="font-bold">Live Hall</div>
        </div>
      </div>

      <BannerAd />

      {loading && (
        <div className="flex items-center gap-2 text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading players…
        </div>
      )}
      {err && <div className="text-red-400 text-sm">{err}</div>}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
        <div className="text-sm text-zinc-400 flex items-center gap-2"><Users className="h-4 w-4" /> Pick who you are (to receive pings)</div>
        <select value={me} onChange={(e) => setMe(e.target.value)} className="w-full rounded-xl bg-black border border-zinc-800 p-2">
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="text-sm text-zinc-400">Send a ping to</div>
        <div className="flex gap-2">
          <select value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded-xl bg-black border border-zinc-800 p-2">
            {players.filter((p)=>p.id!==me).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={sendPing} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500">
            <Send className="h-4 w-4" /> Ping
          </button>
        </div>
      </div>

      <div className="text-sm text-zinc-400">Incoming for {meObj?.name || '…'}</div>
      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="text-sm">
              <span className="font-semibold">Ping</span> from <span className="text-zinc-200">{ev.fromPlayerId || 'anonymous'}</span>
            </div>
            <div className="text-xs text-zinc-500">{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ''}</div>
          </div>
        ))}
        {events.length === 0 && <div className="text-sm text-zinc-500">No pings yet.</div>}
      </div>
    </div>
  )
}
