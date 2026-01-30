import { useEffect, useRef } from 'react'

export default function Intro({ onDone }){
  const canvasRef = useRef(null)

  useEffect(() => {
    let raf = 0
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let t0 = performance.now()

    function resize(){
      const w = Math.min(900, window.innerWidth - 32)
      const h = Math.min(520, Math.floor(w * 9/16))
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.width = Math.floor(w * DPR)
      canvas.height = Math.floor(h * DPR)
      ctx.setTransform(DPR,0,0,DPR,0,0)
    }
    resize()
    window.addEventListener('resize', resize)

    const balls = []
    const colors = ['#f7d54a','#2e7dff','#ff3b3b','#a64dff','#ff8a2e','#2ef3b4','#ffffff','#111111']
    const center = { x: 290, y: 210 }
    function rack(){
      balls.length = 0
      let idx = 0
      const r = 10
      const gap = 2
      const rows = 5
      for(let row=0; row<rows; row++){
        for(let col=0; col<=row; col++){
          const x = center.x + row*(r*2+gap)
          const y = center.y + (col - row/2)*(r*2+gap)
          balls.push({ x, y, vx:0, vy:0, r, c: colors[idx++ % colors.length] })
        }
      }
    }
    rack()

    const cue = { x: 120, y: 210, vx: 0, vy: 0, r: 11, c: '#ffffff' }
    let phase = 0

    const start = performance.now()
    function step(now){
      const dt = Math.min(0.033, (now - t0)/1000)
      t0 = now

      const W = canvas.clientWidth
      const H = canvas.clientHeight

      ctx.clearRect(0,0,W,H)
      const g = ctx.createRadialGradient(W*0.5, H*0.2, 10, W*0.5, H*0.2, Math.max(W,H))
      g.addColorStop(0, '#151521')
      g.addColorStop(1, '#07070a')
      ctx.fillStyle = g
      ctx.fillRect(0,0,W,H)

      // table silhouette + glow border
      fillRound(ctx, 40, 70, W-80, H-140, 18, 'rgba(0,0,0,0.35)')
      strokeRound(ctx, 40, 70, W-80, H-140, 18, 'rgba(255,26,26,0.45)', 2, 18)

      if(phase === 0){
        cue.vx = (center.x - 40 - cue.x) * 0.6
        cue.x += cue.vx*dt
        if(Math.abs(cue.x - (center.x-40)) < 2) phase = 1
      } else if(phase === 1){
        cue.vx = 820
        phase = 2
      }

      if(phase >= 2){
        cue.x += cue.vx*dt
        for(const b of balls){
          const dx = b.x - cue.x
          const dy = b.y - cue.y
          const dist = Math.hypot(dx,dy)
          const minD = b.r + cue.r
          if(dist < minD){
            const nx = dx/(dist||1)
            const ny = dy/(dist||1)
            const push = (minD - dist) + 0.1
            b.x += nx*push
            b.y += ny*push
            b.vx += nx*520
            b.vy += ny*260
            cue.vx *= 0.15
          }
        }
        for(const b of balls){
          b.x += b.vx*dt; b.y += b.vy*dt
          b.vx *= Math.pow(0.12, dt); b.vy *= Math.pow(0.12, dt)
        }
        const energy = balls.reduce((s,b)=> s + Math.hypot(b.vx,b.vy), 0)
        if(energy < 25 && cue.vx < 40) phase = 3
      }

      for(const b of balls) ball(ctx, b.x,b.y,b.r,b.c)
      ball(ctx, cue.x,cue.y,cue.r,cue.c)

      if(phase === 3){
        ctx.font = "64px Lobster"
        ctx.fillStyle = "#fff"
        ctx.lineWidth = 2
        ctx.strokeStyle = "#000"
        ctx.shadowColor = "rgba(255,26,26,0.9)"
        ctx.shadowBlur = 22
        ctx.textAlign = 'center'
        ctx.strokeText("Play Better", W/2, 86)
        ctx.fillText("Play Better", W/2, 86)
        ctx.shadowBlur = 0
        ctx.font = "14px system-ui"
        ctx.fillStyle = "rgba(242,242,245,0.85)"
        ctx.fillText("Pool Locals — Tricksack Style", W/2, 112)
        ctx.fillStyle = "rgba(167,167,179,0.85)"
        ctx.fillText("By: FanzofTheOne", W/2, 132)
      }

      if((now - start) > 2600){
        cleanup(); onDone?.(); return
      }
      raf = requestAnimationFrame(step)
    }

    function cleanup(){
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
    raf = requestAnimationFrame(step)
    return cleanup
  }, [onDone])

  return (
    <div className="card" style={{display:'grid', placeItems:'center', minHeight:'70vh'}}>
      <div style={{display:'grid', placeItems:'center', gap:12}}>
        <canvas ref={canvasRef} />
        <button className="btn primary" onClick={()=>onDone?.()}>Enter</button>
        <div className="small">Digital + Live tournaments. In-app ping. Merch ready.</div>
      </div>
    </div>
  )
}

function ball(ctx,x,y,r,c){
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2)
  ctx.fillStyle=c; ctx.fill()
  ctx.strokeStyle='rgba(0,0,0,0.55)'; ctx.lineWidth=1; ctx.stroke()
}
function roundPath(ctx,x,y,w,h,r){
  ctx.beginPath()
  ctx.moveTo(x+r,y)
  ctx.arcTo(x+w,y,x+w,y+h,r)
  ctx.arcTo(x+w,y+h,x,y+h,r)
  ctx.arcTo(x,y+h,x,y,r)
  ctx.arcTo(x,y,x+w,y,r)
  ctx.closePath()
}
function fillRound(ctx,x,y,w,h,r,fill){
  roundPath(ctx,x,y,w,h,r); ctx.fillStyle=fill; ctx.fill()
}
function strokeRound(ctx,x,y,w,h,r,stroke,lw,blur){
  roundPath(ctx,x,y,w,h,r)
  ctx.save()
  ctx.strokeStyle=stroke; ctx.lineWidth=lw
  ctx.shadowColor=stroke; ctx.shadowBlur=blur
  ctx.stroke()
  ctx.restore()
}
