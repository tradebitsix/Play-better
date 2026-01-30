import express from 'express'
import cors from 'cors'
import { getPool } from './db/db.js'
import { migrate } from './db/migrate.js'
import { playersRouter } from './routes/players.js'
import { tournamentsRouter } from './routes/tournaments.js'
import { pingsRouter } from './routes/pings.js'
import { merchRouter } from './routes/merch.js'

const app = express()
app.use(express.json())

const corsOrigins = (process.env.CORS_ORIGINS || 'https://play-better.buildhub.live,http://localhost:5173')
  .split(',').map(s=>s.trim()).filter(Boolean)

app.use(cors({
  origin: function(origin, cb){
    if(!origin) return cb(null, true)
    if(corsOrigins.includes(origin)) return cb(null, true)
    return cb(new Error('CORS blocked'))
  }
}))

const pool = getPool()
await migrate(pool)

app.get('/api/health', (req,res) => res.json({ status:'ok' }))
app.use('/api/players', playersRouter(pool))
app.use('/api/tournaments', tournamentsRouter(pool))
app.use('/api/pings', pingsRouter(pool))
app.use('/api/merch', merchRouter())

const port = Number(process.env.PORT || 3000)
app.listen(port, '0.0.0.0', () => console.log(`Play Better API listening on ${port}`))
