import express from 'express'
import { v4 as uuid } from 'uuid'

function nextSlot(round, slot) {
  return { round: round + 1, slot: Math.floor(slot / 2) }
}

export function tournamentsRouter(pool) {
  const r = express.Router()


  /* =======================================================
     LIST TOURNAMENTS
  ======================================================= */

  r.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT id, mode, venue_name AS "venueName", created_at
         FROM tournaments
         ORDER BY created_at DESC
         LIMIT 100`
      )
      res.json(rows)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* =======================================================
     CREATE DIGITAL / LIVE TOURNAMENT (8-player bracket)
  ======================================================= */

  async function createTournament({ mode, venueName, playerIds }) {
    if (!Array.isArray(playerIds)) throw new Error('playerIds must be an array')
    const ids = playerIds.map(String)
    const uniq = [...new Set(ids)]
    if (uniq.length !== ids.length) throw new Error('playerIds must be unique')
    if (ids.length !== 8) throw new Error('Exactly 8 playerIds required')

    const tournamentId = uuid()
    await pool.query(
      `INSERT INTO tournaments(id, mode, venue_name) VALUES ($1,$2,$3)`,
      [tournamentId, mode, venueName || null]
    )

    // Slots 0..7
    for (let slot = 0; slot < 8; slot++) {
      await pool.query(
        `INSERT INTO tournament_players(tournament_id, player_id, slot) VALUES ($1,$2,$3)`,
        [tournamentId, ids[slot], slot]
      )
    }

    // Round 1: 4 matches seeded from slots (0v1, 2v3, 4v5, 6v7)
    const round1 = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7]
    ]
    for (let slot = 0; slot < round1.length; slot++) {
      const [a, b] = round1[slot]
      await pool.query(
        `INSERT INTO matches(id, tournament_id, round, slot, player_a, player_b)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuid(), tournamentId, 1, slot, ids[a], ids[b]]
      )
    }

    // Round 2: 2 matches (empty until winners advance)
    for (let slot = 0; slot < 2; slot++) {
      await pool.query(
        `INSERT INTO matches(id, tournament_id, round, slot)
         VALUES ($1,$2,$3,$4)`,
        [uuid(), tournamentId, 2, slot]
      )
    }

    // Round 3: final (empty until winners advance)
    await pool.query(
      `INSERT INTO matches(id, tournament_id, round, slot)
       VALUES ($1,$2,$3,$4)`,
      [uuid(), tournamentId, 3, 0]
    )

    return tournamentId
  }

  r.post('/digital', async (req, res) => {
    try {
      const playerIds = req.body?.playerIds
      const id = await createTournament({ mode: 'digital', venueName: null, playerIds })
      res.json({ id })
    } catch (e) {
      const msg = String(e?.message || e)
      if (msg.includes('playerIds') || msg.includes('Exactly 8') || msg.includes('unique')) {
        return res.status(400).json({ error: msg })
      }
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  r.post('/live', async (req, res) => {
    try {
      const playerIds = req.body?.playerIds
      const venueName = req.body?.venueName ? String(req.body.venueName) : null
      const id = await createTournament({ mode: 'live', venueName, playerIds })
      res.json({ id })
    } catch (e) {
      const msg = String(e?.message || e)
      if (msg.includes('playerIds') || msg.includes('Exactly 8') || msg.includes('unique')) {
        return res.status(400).json({ error: msg })
      }
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })


  /* =======================================================
     GET TOURNAMENT VIEW
  ======================================================= */

  r.get('/:id', async (req, res) => {
    try {
      const { id } = req.params

      const t = await pool.query(
        `SELECT id, mode, venue_name AS "venueName", created_at
         FROM tournaments
         WHERE id=$1`,
        [id]
      )

      if (!t.rows.length) return res.status(404).json({ error: 'not found' })

      const players = await pool.query(
        `SELECT tp.slot, p.id, p.name
         FROM tournament_players tp
         JOIN players p ON p.id = tp.player_id
         WHERE tp.tournament_id = $1
         ORDER BY tp.slot ASC`,
        [id]
      )

      const matches = await pool.query(
        `SELECT id, round, slot,
                player_a AS "playerAId",
                player_b AS "playerBId",
                winner_player_id AS "winnerPlayerId",
                table_number AS "tableNumber"
         FROM matches
         WHERE tournament_id = $1
         ORDER BY round ASC, slot ASC`,
        [id]
      )

      const playerMap = new Map(players.rows.map(p => [p.id, { id: p.id, name: p.name }]))

      const outMatches = matches.rows.map(m => ({
        id: m.id,
        round: m.round,
        slot: m.slot,
        playerA: m.playerAId ? playerMap.get(m.playerAId) : null,
        playerB: m.playerBId ? playerMap.get(m.playerBId) : null,
        winnerPlayerId: m.winnerPlayerId || null,
        tableNumber: m.tableNumber ?? null
      }))

      res.json({
        ...t.rows[0],
        players: players.rows.map(r => ({ slot: r.slot, id: r.id, name: r.name })),
        matches: outMatches
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* =======================================================
     SET TABLE NUMBER
  ======================================================= */

  r.post('/:id/matches/:matchId/table', async (req, res) => {
    try {
      const { id, matchId } = req.params
      const tableNumber = Number(req.body?.tableNumber)

      if (!Number.isFinite(tableNumber) || tableNumber <= 0)
        return res.status(400).json({ error: 'tableNumber must be > 0' })

      await pool.query(
        `UPDATE matches
         SET table_number=$1
         WHERE id=$2 AND tournament_id=$3`,
        [tableNumber, matchId, id]
      )

      res.json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* =======================================================
     SET MATCH RESULT + ADVANCE BRACKET
  ======================================================= */

  r.post('/:id/matches/:matchId/result', async (req, res) => {
    try {
      const { id, matchId } = req.params
      const winnerPlayerId = req.body?.winnerPlayerId

      if (!winnerPlayerId) return res.status(400).json({ error: 'winnerPlayerId required' })

      const m = await pool.query(
        `SELECT id, round, slot, player_a, player_b
         FROM matches
         WHERE id=$1 AND tournament_id=$2`,
        [matchId, id]
      )

      if (!m.rows.length) return res.status(404).json({ error: 'match not found' })

      const row = m.rows[0]

      if (!row.player_a || !row.player_b)
        return res.status(400).json({ error: 'match not ready' })

      if (winnerPlayerId !== row.player_a && winnerPlayerId !== row.player_b)
        return res.status(400).json({ error: 'winner not in match' })

      await pool.query(
        `UPDATE matches
         SET winner_player_id=$1
         WHERE id=$2 AND tournament_id=$3`,
        [winnerPlayerId, matchId, id]
      )

      if (row.round < 3) {
        const nxt = nextSlot(row.round, row.slot)

        const nm = await pool.query(
          `SELECT id, player_a, player_b
           FROM matches
           WHERE tournament_id=$1
             AND round=$2
             AND slot=$3`,
          [id, nxt.round, nxt.slot]
        )

        if (nm.rows.length) {
          const nextMatch = nm.rows[0]
          if (!nextMatch.player_a) {
            await pool.query(`UPDATE matches SET player_a=$1 WHERE id=$2`, [winnerPlayerId, nextMatch.id])
          } else if (!nextMatch.player_b) {
            await pool.query(`UPDATE matches SET player_b=$1 WHERE id=$2`, [winnerPlayerId, nextMatch.id])
          }
        }
      }

      res.json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  return r
}