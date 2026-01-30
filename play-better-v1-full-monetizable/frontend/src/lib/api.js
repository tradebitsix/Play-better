const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  const ct = res.headers.get('content-type') || '';
  const body = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(body?.error || body?.message || `HTTP ${res.status}`);
  return body;
}
export const api = {
  health: () => req('/api/health'),
  merch: () => req('/api/merch'),
  players: { list: () => req('/api/players'), create: (name) => req('/api/players',{method:'POST',body:JSON.stringify({name})}) },
  tournaments: {
    createDigital: (playerIds) => req('/api/tournaments/digital',{method:'POST',body:JSON.stringify({playerIds})}),
    createLive: (playerIds, venueName) => req('/api/tournaments/live',{method:'POST',body:JSON.stringify({playerIds, venueName})}),
    get: (id) => req(`/api/tournaments/${id}`),
    report: (tournamentId, matchId, winnerPlayerId) => req(`/api/tournaments/${tournamentId}/matches/${matchId}/result`,{method:'POST',body:JSON.stringify({winnerPlayerId})}),
    assignTable: (tournamentId, matchId, tableNumber) => req(`/api/tournaments/${tournamentId}/matches/${matchId}/table`,{method:'POST',body:JSON.stringify({tableNumber})})
  },
  ping: { send: (toPlayerId, sound='default') => req('/api/pings',{method:'POST',body:JSON.stringify({toPlayerId, sound})}) }
};
