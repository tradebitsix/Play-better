import { useEffect, useState } from 'react'
import Intro from './components/Intro.jsx'
import Game from './pages/Game.jsx'
import Tournaments from './pages/Tournaments.jsx'
import LiveHall from './pages/LiveHall.jsx'
import Merch from './pages/Merch.jsx'
import { api } from './lib/api.js'

export default function App(){
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('game')
  const [health, setHealth] = useState(null)

  useEffect(()=>{ api.health().then(setHealth).catch(e=>setHealth({error:String(e.message||e)})) },[])

  if(!ready) return <div className="container"><Intro onDone={()=>setReady(true)} /></div>

  return (
    <div className="container">
      <div className="hdr">
        <div>
          <div className="logo">Play Better</div>
          <div className="small">Pool Locals — Tricksack Style</div>
          <div className="small">By: FanzofTheOne</div>
        </div>
        <div className="badge">
          <span className="small">API</span>
          <span className="small">{health?.status==='ok'?'online':(health?.error?'offline':'...')}</span>
        </div>
      </div>

      <div className="tabs">
        <div className={`tab ${tab==='game'?'active':''}`} onClick={()=>setTab('game')}>Digital Game</div>
        <div className={`tab ${tab==='tournaments'?'active':''}`} onClick={()=>setTab('tournaments')}>Digital Tournament</div>
        <div className={`tab ${tab==='live'?'active':''}`} onClick={()=>setTab('live')}>Live Pool Hall</div>
        <div className={`tab ${tab==='merch'?'active':''}`} onClick={()=>setTab('merch')}>Merch</div>
      </div>

      <div style={{height:12}} />
      {tab==='game' && <Game />}
      {tab==='tournaments' && <Tournaments />}
      {tab==='live' && <LiveHall />}
      {tab==='merch' && <Merch />}
    </div>
  )
}
