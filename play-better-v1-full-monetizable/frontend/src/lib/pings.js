const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
export function subscribePings(playerId, onPing){
  if(!playerId) return () => {};
  const es = new EventSource(`${API_BASE}/api/pings/stream?playerId=${encodeURIComponent(playerId)}`);
  es.onmessage = (evt)=>{ try{ onPing(JSON.parse(evt.data)); } catch {} };
  es.onerror = ()=>{};
  return ()=>{ try{ es.close(); } catch {} };
}
