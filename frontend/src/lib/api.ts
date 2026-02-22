const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000'

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  })

  const ct = res.headers.get('content-type') || ''
  const body: any = ct.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const msg = body?.error || body?.message || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return body as T
}

export type Player = { id: string; name: string; created_at?: string }
export type TournamentListItem = { id: string; mode: 'digital'|'live'; venueName?: string|null; created_at?: string }
export type TournamentView = {
  id: string
  mode: 'digital'|'live'
  venueName?: string|null
  created_at?: string
  players: { slot: number; id: string; name: string }[]
  matches: {
    id: string
    round: number
    slot: number
    playerA: { id: string; name: string } | null
    playerB: { id: string; name: string } | null
    winnerPlayerId: string | null
    tableNumber: number | null
  }[]
}

export const api = {
  health: () => req<{ status: string }>('/api/health'),
  merch: () => req<{ items: { id: string; title: string; price: string; url: string }[] }>('/api/merch'),
  players: {
    list: () => req<Player[]>('/api/players'),
    create: (name: string) => req<Player>('/api/players', { method: 'POST', body: JSON.stringify({ name }) })
  },
  tournaments: {
    list: () => req<TournamentListItem[]>('/api/tournaments'),
    createDigital: (playerIds: string[]) => req<{ id: string }>('/api/tournaments/digital', { method: 'POST', body: JSON.stringify({ playerIds }) }),
    createLive: (playerIds: string[], venueName: string) => req<{ id: string }>('/api/tournaments/live', { method: 'POST', body: JSON.stringify({ playerIds, venueName }) }),
    get: (id: string) => req<TournamentView>(`/api/tournaments/${id}`),
    report: (tournamentId: string, matchId: string, winnerPlayerId: string) =>
      req<{ ok: boolean }>(`/api/tournaments/${tournamentId}/matches/${matchId}/result`, { method: 'POST', body: JSON.stringify({ winnerPlayerId }) }),
    assignTable: (tournamentId: string, matchId: string, tableNumber: number) =>
      req<{ ok: boolean }>(`/api/tournaments/${tournamentId}/matches/${matchId}/table`, { method: 'POST', body: JSON.stringify({ tableNumber }) })
  },
  ping: {
    send: (toPlayerId: string, sound: string = 'default', fromPlayerId?: string) =>
      req<{ ok: boolean }>('/api/pings', { method: 'POST', body: JSON.stringify({ toPlayerId, sound, fromPlayerId }) }),
    stream: (playerId: string, onMessage: (payload: any) => void) => {
      const url = `${API_BASE}/api/pings/stream?playerId=${encodeURIComponent(playerId)}`
      const es = new EventSource(url)
      es.onmessage = (ev) => {
        try { onMessage(JSON.parse(ev.data)) } catch {}
      }
      return () => es.close()
    }
  }
}
