import { Router } from 'express'
import { uuid } from '../util.js'

export function playersRouter(pool){
  const r = Router()

  r.get('/', async (req,res) => {
    const { rows } = await pool.query('SELECT id, name, created_at FROM players ORDER BY created_at DESC LIMIT 200')
    res.json(rows)
  })

  r.post('/', async (req,res) => {
    const name = String(req.body?.name || '').trim()
    if(!name) return res.status(400).json({ error:'name required' })
    const id = uuid()
    await pool.query('INSERT INTO players(id,name) VALUES($1,$2)', [id, name])
    const { rows } = await pool.query('SELECT id, name, created_at FROM players WHERE id=$1', [id])
    res.json(rows[0])
  })

  return r
}
