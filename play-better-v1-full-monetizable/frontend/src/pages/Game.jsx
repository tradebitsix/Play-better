import { useEffect, useState } from 'react'
import PoolTable from '../components/PoolTable.jsx'
import { api } from '../lib/api.js'
import { subscribePings } from '../lib/pings.js'

export default function Game(){
  const [me, setMe] = useState(null)
  const [players, setPlayers] = useState([])
  const [name, setName] = useState('')
  const [log, setLog] = useState([])
  const [sound] = useState(() => new Audio('/assets/ping.mp3'))

  useEffect(()=>{ api.players.list().then(setPlayers).catch(()=>{}) },[])

  useEffect(()=>{
    if(!me?.id) return
    return subscribePings(me.id, (evt)=>{
      setLog(l=>[{t:Date.now(), msg:`PING received (${evt.sound})`}, ...l].slice(0,12))
      try{ sound.currentTime=0; sound.play(); }catch{}
    })
  },[me?.id])

  async function createMe(){
    const p = await api.players.create(name.trim())
    setMe(p); setPlayers(prev=>[p, ...prev]); setName('')
  }
  async function ping(toId){
    await api.ping.send(toId, 'default')
    setLog(l=>[{t:Date.now(), msg:`PING sent to ${toId.slice(0,8)}`}, ...l].slice(0,12))
  }

  return (
    <div className="row">
      <div className="col">
        <PoolTable onEvent={(e)=>setLog(l=>[{t:Date.now(), msg:`${e.type}${e.ballId?`(${e.ballId})`:''}`}, ...l].slice(0,12))} />
      </div>
      <div className="col">
        <div className="card">
          <div className="badge" style={{justifyContent:'space-between', width:'100%'}}>
            <div>
              <div className="small">Session Player</div>
              <div style={{fontWeight:800}}>{me?me.name:'Not set'}</div>
            </div>
            {!me && (
              <div style={{display:'flex', gap:8}}>
                <input className="input" style={{width:180}} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
                <button className="btn primary" onClick={createMe} disabled={!name.trim()}>Set</button>
              </div>
            )}
          </div>

          <div style={{height:12}} />
          <div className="small">Players (tap to ping)</div>
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8, maxHeight:220, overflow:'auto'}}>
            {players.map(p=>(
              <div key={p.id} className="badge" style={{justifyContent:'space-between'}}>
                <span>{p.name}</span>
                <button className="btn" onClick={()=>ping(p.id)} disabled={!me || me.id===p.id}>Where you at?</button>
              </div>
            ))}
            {players.length===0 && <div className="small">No players yet.</div>}
          </div>

          <div style={{height:12}} />
          <div className="small">Event Log</div>
          <div style={{display:'flex', flexDirection:'column', gap:6, marginTop:6}}>
            {log.map(e=><div key={e.t} className="small">{new Date(e.t).toLocaleTimeString()} — {e.msg}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}
