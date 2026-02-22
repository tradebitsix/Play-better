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

// ===== CORS CONFIG =====
const corsOrigins = (process.env.CORS_ORIGINS ||
  'https://playbetter.buildhub.live,http://localhost:5173'
)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const allowVercelWildcard = (origin) => {
  try {
    const host = new URL(origin).hostname
    return host.endsWith('.vercel.app')
  } catch {
    return false
  }
}

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true) // allow server-to-server

      if (corsOrigins.includes(origin)) return cb(null, true)

      if (allowVercelWildcard(origin)) return cb(null, true)

      return cb(new Error('CORS blocked'))
    },
    credentials: true
  })
)

// ===== SERVER BOOTSTRAP =====
const port = Number(process.env.PORT || 3000)

async function bootstrap() {
  const pool = getPool()

  await migrate(pool)

  // Health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  // API routes
  app.use('/api/players', playersRouter(pool))
  app.use('/api/tournaments', tournamentsRouter(pool))
  app.use('/api/pings', pingsRouter(pool))
  app.use('/api/merch', merchRouter())

  app.listen(port, '0.0.0.0', () => {
    console.log(`Play Better API listening on ${port}`)
  })
}

bootstrap().catch(err => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})