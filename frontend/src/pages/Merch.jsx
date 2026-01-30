import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export default function Merch(){
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')

  useEffect(()=>{ api.merch().then(r=>setItems(r.items||[])).catch(e=>setErr(String(e.message||e))) },[])
  return (
    <div className="card">
      <div style={{fontWeight:800}}>Merch</div>
      <div className="small">Backend-driven JSON + external checkout links (v1).</div>
      {err && <div className="small" style={{color:'#ff8080', marginTop:8}}>{err}</div>}
      <div style={{height:12}} />
      <div className="row">
        {items.map(it=>(
          <div className="col" key={it.id} style={{minWidth:260}}>
            <div className="card">
              <div style={{fontWeight:800}}>{it.title}</div>
              <div className="small">{it.price}</div>
              <div style={{height:10}} />
              <a className="btn primary" href={it.url} target="_blank" rel="noreferrer" style={{display:'inline-block', textDecoration:'none'}}>Buy</a>
            </div>
          </div>
        ))}
        {items.length===0 && <div className="small">No items configured yet.</div>}
      </div>
    </div>
  )
}
