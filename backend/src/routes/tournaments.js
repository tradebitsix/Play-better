r.post('/:id/matches/:matchId/result', async (req,res) => {
  try {
    const { id, matchId } = req.params
    const winnerPlayerId = req.body?.winnerPlayerId
    if(!winnerPlayerId)
      return res.status(400).json({ error:'winnerPlayerId required' })

    const m = await pool.query(
      'SELECT id, round, slot, player_a, player_b FROM matches WHERE id=$1 AND tournament_id=$2',
      [matchId, id]
    )

    if(m.rows.length===0)
      return res.status(404).json({ error:'match not found' })

    const row = m.rows[0]

    if(!row.player_a || !row.player_b)
      return res.status(400).json({ error:'match not ready (missing players)' })

    if(winnerPlayerId !== row.player_a && winnerPlayerId !== row.player_b)
      return res.status(400).json({ error:'winner not in match' })

    await pool.query(
      'UPDATE matches SET winner_player_id=$1 WHERE id=$2',
      [winnerPlayerId, matchId]
    )

    if(row.round < 3){
      const nxt = nextSlot(row.round, row.slot)

      const nm = await pool.query(
        'SELECT id, player_a, player_b FROM matches WHERE tournament_id=$1 AND round=$2 AND slot=$3',
        [id, nxt.round, nxt.slot]
      )

      if(nm.rows.length === 1){
        const nrow = nm.rows[0]

        if(!nrow.player_a){
          await pool.query(
            'UPDATE matches SET player_a=$1 WHERE id=$2',
            [winnerPlayerId, nrow.id]
          )
        } else if(!nrow.player_b){
          await pool.query(
            'UPDATE matches SET player_b=$1 WHERE id=$2',
            [winnerPlayerId, nrow.id]
          )
        }
      }
    }

    res.json({ ok:true })

  } catch(e) {
    console.error(e)
    res.status(500).json({ error:'internal error' })
  }
})