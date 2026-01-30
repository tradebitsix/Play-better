import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import Bracket from '../components/Bracket.jsx'

export default function LiveHall(){
  const [players, setPlayers] = useState([])
  const [venueName, setVenueName] = useState('')
  const [tournament, setTournament] = useState(null)
  const [error, setError] = useState('')

  useEffect(()=>{ api.players.list().then(setPlayers).catch(e=>setError(String(e.message||e))) },[])

  async function create(){
    setError('')
    const ids = players.slice(0,8).map(p=>p.id)
    if(ids.length<8){ setError('Need at least 8 players created in Digital Game tab.'); return }
    const t = await api.tournaments.createLive(ids, venueName.trim() || 'Local Pool Hall')
    setTournament(await api.tournaments.get(t.id))
  }
  async function report(matchId, winnerId){
    await api.tournaments.report(tournament.id, matchId, winnerId)
    setTournament(await api.tournaments.get(tournament.id))
  }
  async function assignTable(matchId, tableNumber){
    await api.tournaments.assignTable(tournament.id, matchId, tableNumber)
    setTournament(await api.tournaments.get(tournament.id))
  }

  return (
    <div className="row">
      <div className="col">
        <div className="card">
          <div style={{fontWeight:800}}>Live Pool Hall Tournament</div>
          <div className="small">Manual results + optional table assignments.</div>
          <div style={{height:12}} />
          <input className="input" value={venueName} onChange={e=>setVenueName(e.target.value)} placeholder="Venue name (e.g., Tricksack Pool Hall)" />
          <div style={{height:10}} />
          <button className="btn primary" onClick={create}>Create live tournament from first 8 players</button>
          {error && <div className="small" style={{color:'#ff8080', marginTop:8}}>{error}</div>}
        </div>
      </div>
      <div className="col">
        {tournament ? <Bracket tournament={tournament} onReport={report} onAssignTable={assignTable} live={true} /> : <div className="card"><div className="small">No live tournament yet.</div></div>}
      </div>
    </div>
  )
}
