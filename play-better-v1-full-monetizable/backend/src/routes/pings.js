import { Router } from 'express'
import { uuid } from '../util.js'

export function pingsRouter(pool){
  const r = Router()
  const streams = new Map() // playerId -> Set(res)

  r.get('/stream', (req,res) => {
    const playerId = String(req.query.playerId || '').trim()
    if(!playerId) return res.status(400).end('playerId required')

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })
    res.write('\n')

    if(!streams.has(playerId)) streams.set(playerId, new Set())
    streams.get(playerId).add(res)

    req.on('close', () => {
      const set = streams.get(playerId)
      if(set){ set.delete(res); if(set.size===0) streams.delete(playerId) }
    })
  })

  r.post('/', async (req,res) => {
    const toPlayerId = String(req.body?.toPlayerId || '').trim()
    const sound = String(req.body?.sound || 'default').trim() || 'default'
    const fromPlayerId = req.body?.fromPlayerId ? String(req.body.fromPlayerId) : null
    if(!toPlayerId) return res.status(400).json({ error:'toPlayerId required' })

    const id = uuid()
    await pool.query('INSERT INTO pings(id,to_player_id,from_player_id,sound) VALUES($1,$2,$3,$4)', [id, toPlayerId, fromPlayerId, sound])

    const payload = { id, toPlayerId, fromPlayerId, sound, createdAt: new Date().toISOString() }
    const set = streams.get(toPlayerId)
    if(set){
      const msg = `data: ${JSON.stringify(payload)}\n\n`
      for(const s of set){ try{ s.write(msg) } catch {} }
    }
    res.json({ ok:true })
  })

  return r
}
