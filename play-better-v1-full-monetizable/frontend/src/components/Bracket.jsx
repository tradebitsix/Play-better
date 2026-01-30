export default function Bracket({ tournament, onReport, onAssignTable, live=false }){
  if(!tournament) return null
  const matchesByRound = tournament.matches.reduce((acc,m)=>{ (acc[m.round] ||= []).push(m); return acc }, {})
  const rounds = Object.keys(matchesByRound).map(Number).sort((a,b)=>a-b)

  return (
    <div className="card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10}}>
        <div>
          <div style={{fontWeight:800}}>Tournament</div>
          <div className="small">{live ? `Live @ ${tournament.venueName || 'Venue'}` : 'Digital'}</div>
        </div>
        <div className="badge"><span className="small">ID</span><span className="small">{tournament.id}</span></div>
      </div>
      <div style={{height:10}} />
      <div className="row">
        {rounds.map(r => (
          <div className="col" key={r}>
            <div className="small" style={{marginBottom:6}}>Round {r}</div>
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {matchesByRound[r].map(m => (
                <MatchCard key={m.id} match={m} onReport={onReport} onAssignTable={onAssignTable} live={live} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchCard({ match, onReport, onAssignTable, live }){
  const a = match.playerA
  const b = match.playerB
  const winner = match.winnerPlayerId
  return (
    <div className="card" style={{padding:10}}>
      <div className="small" style={{display:'flex', justifyContent:'space-between'}}>
        <span>Match</span>
        {live && <span>Table: {match.tableNumber ?? '—'}</span>}
      </div>
      <div style={{display:'grid', gap:8, marginTop:6}}>
        <button className={`btn ${winner===a?.id?'primary':''}`} onClick={()=>onReport(match.id, a?.id)} disabled={!a?.id || !b?.id}>{a?.name || 'TBD'}</button>
        <button className={`btn ${winner===b?.id?'primary':''}`} onClick={()=>onReport(match.id, b?.id)} disabled={!a?.id || !b?.id}>{b?.name || 'TBD'}</button>
        {live && (
          <div style={{display:'flex', gap:8}}>
            <input className="input" style={{flex:1}} placeholder="Table # (Enter)" onKeyDown={(e)=>{
              if(e.key==='Enter'){
                const n = Number(e.currentTarget.value)
                if(Number.isFinite(n) && n>0) onAssignTable?.(match.id, n)
                e.currentTarget.value=''
              }
            }} />
            <div className="small" style={{alignSelf:'center'}}>Assign</div>
          </div>
        )}
      </div>
    </div>
  )
}
