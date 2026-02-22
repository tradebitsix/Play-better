import React, { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Loader2, Trophy } from 'lucide-react'
import { api, TournamentView } from '../lib/api'
import type { ViewState } from '../types'
import BannerAd from './BannerAd'

function groupByRound(matches: TournamentView['matches']) {
  const map = new Map<number, TournamentView['matches']>()
  for (const m of matches) {
    if (!map.has(m.round)) map.set(m.round, [])
    map.get(m.round)!.push(m)
  }
  const rounds = [...map.keys()].sort((a, b) => a - b)
  return { map, rounds }
}

export default function TournamentBracket({
  onViewChange,
  tournamentId
}: {
  onViewChange: (v: ViewState) => void
  tournamentId: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [t, setT] = useState<TournamentView | null>(null)

  const refresh = async () => {
    if (!tournamentId) return
    setErr(null)
    setLoading(true)
    try {
      const data = await api.tournaments.get(tournamentId)
      setT(data)
    } catch (e: any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId])

  const { map, rounds } = useMemo(() => (t ? groupByRound(t.matches) : { map: new Map(), rounds: [] }), [t])

  const reportWinner = async (matchId: string, winnerPlayerId: string) => {
    if (!tournamentId) return
    setErr(null)
    try {
      await api.tournaments.report(tournamentId, matchId, winnerPlayerId)
      await refresh()
    } catch (e: any) {
      setErr(String(e.message || e))
    }
  }

  const assignTable = async (matchId: string, tableNumber: number) => {
    if (!tournamentId) return
    setErr(null)
    try {
      await api.tournaments.assignTable(tournamentId, matchId, tableNumber)
      await refresh()
    } catch (e: any) {
      setErr(String(e.message || e))
    }
  }

  if (!tournamentId) {
    return (
      <div className="px-4 py-8">
        <div className="text-sm text-zinc-400">No tournament selected.</div>
        <button onClick={() => onViewChange('tournaments')} className="mt-3 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500">
          Go to Tournaments
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => onViewChange('tournaments')} className="text-sm text-zinc-300 hover:text-white">← Back</button>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-red-500" />
          <div className="font-bold">{t?.mode === 'live' ? `Live @ ${t?.venueName || 'Venue'}` : 'Digital Bracket'}</div>
        </div>
      </div>

      <BannerAd />

      {loading && (
        <div className="flex items-center gap-2 text-zinc-300">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading bracket…
        </div>
      )}
      {err && <div className="text-red-400 text-sm">{err}</div>}

      {t && (
        <div className="space-y-6">
          {rounds.map((round) => (
            <div key={round} className="space-y-2">
              <div className="text-sm text-zinc-400">Round {round}</div>
              <div className="space-y-3">
                {(map.get(round) || []).map((m) => {
                  const a = m.playerA
                  const b = m.playerB
                  const winner = m.winnerPlayerId
                  const ready = !!a && !!b
                  return (
                    <div key={m.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <button
                            disabled={!ready}
                            onClick={() => a && reportWinner(m.id, a.id)}
                            className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                              winner === a?.id ? 'border-green-600 bg-green-600/10' : 'border-zinc-800 bg-black/30 hover:border-zinc-700'
                            } ${!ready ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{a?.name || 'TBD'}</div>
                              {winner === a?.id && <ChevronRight className="h-4 w-4 text-green-400" />}
                            </div>
                          </button>

                          <button
                            disabled={!ready}
                            onClick={() => b && reportWinner(m.id, b.id)}
                            className={`w-full text-left rounded-xl border px-3 py-2 transition ${
                              winner === b?.id ? 'border-green-600 bg-green-600/10' : 'border-zinc-800 bg-black/30 hover:border-zinc-700'
                            } ${!ready ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-semibold">{b?.name || 'TBD'}</div>
                              {winner === b?.id && <ChevronRight className="h-4 w-4 text-green-400" />}
                            </div>
                          </button>

                          {t.mode === 'live' && (
                            <div className="flex items-center gap-2 pt-1">
                              <div className="text-xs text-zinc-500">Table</div>
                              <input
                                type="number"
                                min={1}
                                defaultValue={m.tableNumber || undefined}
                                className="w-20 rounded-lg bg-black border border-zinc-800 px-2 py-1 text-sm"
                                onBlur={(e) => {
                                  const n = Number((e.target as HTMLInputElement).value)
                                  if (Number.isFinite(n) && n > 0) assignTable(m.id, n)
                                }}
                              />
                              <div className="text-xs text-zinc-500">(blur to save)</div>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-zinc-500">Match #{m.round}.{m.slot + 1}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
