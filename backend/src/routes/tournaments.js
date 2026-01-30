import { Router } from 'express'
import { uuid } from '../util.js'

function nextSlot(round, slot) {
  return { round: round + 1, slot: Math.floor(slot / 2) }
}

export function tournamentsRouter(pool) {
  const r = Router()

  /* ------------------------------------------------------------------
     CREATE TOURNAMENT
  ------------------------------------------------------------------ */

  async function createTournament(mode, playerIds, venueName) {
    if (!Array.isArray(playerIds) || playerIds.length !== 8) {
      throw new Error('Exactly 8 playerIds required')
    }

    const id = uuid()

    await pool.query(
      'INSERT INTO tournaments(id, mode, venue_name) VALUES($1,$2,$3)',
      [id, mode, venueName || null]
    )

    for (let i = 0; i < 8; i++) {
      await pool.query(
        'INSERT INTO tournament_players(tournament_id, player_id, slot) VALUES($1,$2,$3)',
        [id, playerIds[i], i]
      )
    }

    const matches = [
      { round: 1, slot: 0, a: playerIds[0], b: playerIds[1] },
      { round: 1, slot: 1, a: playerIds[2], b: playerIds[3] },
      { round: 1, slot: 2, a: playerIds[4], b: playerIds[5] },
      { round: 1, slot: 3, a: playerIds[6], b: playerIds[7] },
      { round: 2, slot: 0, a: null, b: null },
      { round: 2, slot: 1, a: null, b: null },
      { round: 3, slot: 0, a: null, b: null }
    ]

    for (const m of matches) {
      await pool.query(
        'INSERT INTO matches(id, tournament_id, round, slot, player_a, player_b) VALUES($1,$2,$3,$4,$5,$6)',
        [uuid(), id, m.round, m.slot, m.a, m.b]
      )
    }

    return { id }
  }

  r.post('/digital', async (req, res) => {
    try {
      const { playerIds } = req.body || {}
      res.json(await createTournament('digital', playerIds, null))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  r.post('/live', async (req, res) => {
    try {
      const { playerIds, venueName } = req.body || {}
      res.json(await createTournament('live', playerIds, venueName || 'Local Pool Hall'))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  /* ------------------------------------------------------------------
     GET FULL TOURNAMENT VIEW
  ------------------------------------------------------------------ */

  r.get('/:id', async (req, res) => {
    try {
      const { id } = req.params

      const t = await pool.query(
        'SELECT id, mode, venue_name AS "venueName", created_at FROM tournaments WHERE id=$1',
        [id]
      )

      if (t.rows.length === 0) {
        return res.status(404).json({ error: 'not found' })
      }

      const players = await pool.query(
        `
        SELECT tp.slot, p.id, p.name
        FROM tournament_players tp
        JOIN players p ON p.id = tp.player_id
        WHERE tp.tournament_id = $1
        ORDER BY tp.slot ASC
        `,
        [id]
      )

      const matches = await pool.query(
        `
        SELECT
          id,
          round,
          slot,
          player_a AS "playerAId",
          player_b AS "playerBId",
          winner_player_id AS "winnerPlayerId",
          table_number AS "tableNumber"
        FROM matches
        WHERE tournament_id = $1
        ORDER BY round ASC, slot ASC
        `,
        [id]
      )

      const playerMap = new Map(
        players.rows.map(p => [p.id, { id: p.id, name: p.name }])
      )

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
        players: players.rows.map(p => ({
          slot: p.slot,
          id: p.id,
          name: p.name
        })),
        matches: outMatches
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* ------------------------------------------------------------------
     CANONICAL MATCH LIST (FLAT)
  ------------------------------------------------------------------ */

  r.get('/:id/matches', async (req, res) => {
    try {
      const { id } = req.params
      const q = await pool.query(
        `
        SELECT
          id,
          tournament_id,
          round,
          slot,
          player_a,
          player_b,
          winner_player_id,
          table_number
        FROM matches
        WHERE tournament_id = $1
        ORDER BY round ASC, slot ASC
        `,
        [id]
      )

      res.json(q.rows)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* ------------------------------------------------------------------
     SET TABLE NUMBER
  ------------------------------------------------------------------ */

  r.post('/:id/matches/:matchId/table', async (req, res) => {
    try {
      const { id, matchId } = req.params
      const tableNumber = Number(req.body?.tableNumber)

      if (!Number.isFinite(tableNumber) || tableNumber <= 0) {
        return res.status(400).json({ error: 'tableNumber must be > 0' })
      }

      await pool.query(
        'UPDATE matches SET table_number=$1 WHERE id=$2 AND tournament_id=$3',
        [tableNumber, matchId, id]
      )

      res.json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'internal error' })
    }
  })

  /* ------------------------------------------------------------------
     SET MATCH RESULT + ADVANCE BRACKET
  ------------------------------------------------------------------ */

  r.post('/:id/matches/:matchId/result', async (req, res) => {
    try {
      const { id, matchId } = req.params
      const winnerPlayerId = req.body?.winnerPlayerId

      if (!winnerPlayerId) {
        return res.status(400).json({ error: 'winnerPlayerId required' })
      }

      const m = await pool.query(
        'SELECT id, round, slot, player_a, player_b FROM matches WHERE id=$1 AND tournament_id=$2',
        [matchId, id]
      )

      if (m.rows.length === 0) {
        return res.status(404).json({ error: 'match not found' })
      }

      const row = m.rows[0]

      if (!row.player_a || !row.player_b) {
        return res.status(400).json({ error: 'match not ready' })
      }

      if (winnerPlayerId !== row.player_a && winnerPlayerId !== row.player_b) {
        return res.status(400).json({ error: 'winner not in match' })
      }

      await pool.query(
        'UPDATE matches SET winner_player_id=$1 WHERE id=$2 AND tournament_id=$3',
        [winnerPlayerId, matchId, id]
      )

      if (row.round < 3) {
        const nxt = nextSlot(row.round, row.slot)

        const nm = await pool.query(
          'SELECT id, player_a, player_b FROM matches WHERE tournament_id=$1 AND round=$2 AND slot=$3',
          [id, nxt.round, nxt.slot]
        )

        if (nm.rows.length) {
          const nextMatch = nm.rows[0]

          if (!nextMatch.player_a) {
            await pool.query(
              'UPDATE matches SET player_a=$1 WHERE id=$2',
              [winnerPlayerId, nextMatch.id]
            )
          } else if (!nextMatch.player_b) {
            await pool.query(
              'UPDATE matches SET player_b=$1 WHERE id=$2',
              [winnerPlayerId, nextMatch.id]
            )
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