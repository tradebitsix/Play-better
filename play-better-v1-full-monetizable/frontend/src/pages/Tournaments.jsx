import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import Bracket from '../components/Bracket.jsx'

export default function Tournaments(){
  const [players, setPlayers] = useState([])
  const [tournament, setTournament] = useState(null)
  const [error, setError] = useState('')

  useEffect(()=>{ api.players.list().then(setPlayers).catch(e=>setError(String(e.message||e))) },[])

  async function create(){
    setError('')
    const ids = players.slice(0,8).map(p=>p.id)
    if(ids.length<8){ setError('Need at least 8 players created in Digital Game tab.'); return }
    const t = await api.tournaments.createDigital(ids)
    setTournament(await api.tournaments.get(t.id))
  }
  async function report(matchId, winnerId){
    await api.tournaments.report(tournament.id, matchId, winnerId)
    setTournament(await api.tournaments.get(tournament.id))
  }

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <div style={{fontWeight:800}}>Digital Tournament</div>
          <div className="small">8 players / 7 matches. Winners auto-advance.</div>
          <div style={{height:12}} />
          <button className="btn primary" onClick={create}>Create tournament from first 8 players</button>
          {error && <div className="small" style={{color:'#ff8080', marginTop:8}}>{error}</div>}
          <div style={{height:12}} />
          <div className="small">Players</div>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8, maxHeight:260, overflow:'auto'}}>
            {players.map(p=><div key={p.id} className="badge"><span>{p.name}</span><span className="small">{p.id.slice(0,8)}</span></div>)}
          </div>
        </div>
      </div>
      <div className="col">
        {tournament ? <Bracket tournament={tournament} onReport={report} live={false} /> : <div className="card"><div className="small">No tournament yet.</div></div>}
      </div>
    </div>
  )
}
