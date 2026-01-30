import { useEffect, useRef, useState } from 'react'

const POCKETS = [
  {x:0,y:0},{x:50,y:0},{x:100,y:0},
  {x:0,y:100},{x:50,y:100},{x:100,y:100},
]
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n))

export default function PoolTable({ onEvent }){
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [power, setPower] = useState(0.45)
  const aimRef = useRef({active:false, ax:0, ay:0})

  useEffect(()=>{
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    let raf=0, last=performance.now()

    const balls = [
      {id:'cue', x:25, y:50, vx:0, vy:0, r:2.2, c:'#fff', cue:true},
      {id:'1', x:70, y:50, vx:0, vy:0, r:2.2, c:'#f7d54a'},
      {id:'2', x:74, y:47, vx:0, vy:0, r:2.2, c:'#2e7dff'},
      {id:'3', x:74, y:53, vx:0, vy:0, r:2.2, c:'#ff3b3b'},
      {id:'8', x:78, y:50, vx:0, vy:0, r:2.2, c:'#111'}
    ]
    const pocketed = new Set()

    function feltRect(W,H){
      const px=W*0.08, py=H*0.14
      return {x:px,y:py,w:W-2*px,h:H-2*py}
    }
    function pctToPx(pX,pY,f){ return {x:f.x+f.w*(pX/100), y:f.y+f.h*(pY/100)} }

    function resize(){
      const r=wrap.getBoundingClientRect()
      canvas.style.width=r.width+'px'
      canvas.style.height=r.height+'px'
      canvas.width=Math.floor(r.width*DPR)
      canvas.height=Math.floor(r.height*DPR)
      ctx.setTransform(DPR,0,0,DPR,0,0)
    }
    resize()
    const ro=new ResizeObserver(resize); ro.observe(wrap)

    function step(now){
      const dt=Math.min(0.033,(now-last)/1000); last=now
      const W=canvas.clientWidth, H=canvas.clientHeight
      const felt=feltRect(W,H)

      // physics
      const friction=Math.pow(0.20,dt)
      const rest=6
      for(const b of balls){
        if(pocketed.has(b.id)) continue
        b.x+=b.vx*dt; b.y+=b.vy*dt
        b.vx*=friction; b.vy*=friction
        if(Math.hypot(b.vx,b.vy)<rest){ b.vx=0; b.vy=0 }
        const r=b.r
        if(b.x<r){ b.x=r; b.vx*=-0.9 }
        if(b.x>100-r){ b.x=100-r; b.vx*=-0.9 }
        if(b.y<r){ b.y=r; b.vy*=-0.9 }
        if(b.y>100-r){ b.y=100-r; b.vy*=-0.9 }
      }
      // collisions
      for(let i=0;i<balls.length;i++){
        for(let j=i+1;j<balls.length;j++){
          const a=balls[i], b=balls[j]
          if(pocketed.has(a.id)||pocketed.has(b.id)) continue
          const dx=b.x-a.x, dy=b.y-a.y
          const d=Math.hypot(dx,dy)
          const min=a.r+b.r
          if(d>0 && d<min){
            const nx=dx/d, ny=dy/d
            const overlap=(min-d)+0.02
            a.x-=nx*overlap*0.5; a.y-=ny*overlap*0.5
            b.x+=nx*overlap*0.5; b.y+=ny*overlap*0.5
            const av=a.vx*nx+a.vy*ny
            const bv=b.vx*nx+b.vy*ny
            const imp=(bv-av)
            a.vx+=imp*nx; a.vy+=imp*ny
            b.vx-=imp*nx; b.vy-=imp*ny
          }
        }
      }
      // pockets
      const pocketR=4.2
      for(const p of POCKETS){
        for(const b of balls){
          if(b.cue||pocketed.has(b.id)) continue
          if(Math.hypot(b.x-p.x,b.y-p.y)<pocketR){
            pocketed.add(b.id); b.vx=0; b.vy=0
            onEvent?.({type:'pocket', ballId:b.id})
          }
        }
      }

      // draw
      ctx.clearRect(0,0,W,H)
      // outer frame
      fillRound(ctx,0,0,W,H,18,'rgba(0,0,0,0.35)')
      strokeRound(ctx,6,6,W-12,H-12,16,'rgba(255,26,26,0.45)',2,18)
      // felt
      const g=ctx.createLinearGradient(felt.x,felt.y,felt.x,felt.y+felt.h)
      g.addColorStop(0,'#0b0b0f'); g.addColorStop(1,'#050507')
      fillRound(ctx,felt.x,felt.y,felt.w,felt.h,14,g)
      strokeRound(ctx,felt.x,felt.y,felt.w,felt.h,14,'rgba(255,255,255,0.06)',1,0)

      // pockets glow (white neon)
      for(const p of POCKETS){
        const pos=pctToPx(p.x,p.y,felt)
        ctx.save()
        ctx.shadowColor='rgba(255,255,255,0.95)'
        ctx.shadowBlur=16
        ctx.beginPath(); ctx.arc(pos.x,pos.y,10,0,Math.PI*2)
        ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fill()
        ctx.shadowBlur=0
        ctx.strokeStyle='rgba(255,255,255,0.65)'; ctx.lineWidth=2; ctx.stroke()
        ctx.restore()
      }

      // aim line
      const aim=aimRef.current
      const cue=balls.find(b=>b.id==='cue')
      const cuePx=pctToPx(cue.x,cue.y,felt)
      if(aim.active && cue.vx===0 && cue.vy===0){
        ctx.strokeStyle='rgba(255,26,26,0.65)'; ctx.lineWidth=2
        ctx.beginPath(); ctx.moveTo(cuePx.x,cuePx.y); ctx.lineTo(aim.ax,aim.ay); ctx.stroke()
      }

      // balls
      for(const b of balls){
        if(pocketed.has(b.id)) continue
        const pos=pctToPx(b.x,b.y,felt)
        ball(ctx,pos.x,pos.y,(felt.w*b.r)/100,b.c)
      }

      // HUD
      ctx.fillStyle='rgba(242,242,245,0.9)'
      ctx.font='12px system-ui'
      ctx.fillText('Tap/drag to aim. Release to shoot.',14,18)
      ctx.fillText('Pocketed: '+(Array.from(pocketed).join(', ')||'none'),14,34)

      raf=requestAnimationFrame(step)
    }
    raf=requestAnimationFrame(step)

    function ptr(e, type){
      const rect=canvas.getBoundingClientRect()
      const x=e.clientX-rect.left
      const y=e.clientY-rect.top
      const aim=aimRef.current
      if(type==='down'){ aim.active=true; aim.ax=x; aim.ay=y }
      if(type==='move' && aim.active){ aim.ax=x; aim.ay=y }
      if(type==='up'){
        const cue=balls.find(b=>b.id==='cue')
        aim.active=false
        if(cue.vx!==0||cue.vy!==0) return
        const W=canvas.clientWidth,H=canvas.clientHeight
        const felt=feltRect(W,H)
        const cuePx=pctToPx(cue.x,cue.y,felt)
        const dx=x-cuePx.x, dy=y-cuePx.y
        const len=Math.hypot(dx,dy)||1
        const nx=dx/len, ny=dy/len
        const speed=220*(0.25+power)
        cue.vx=nx*speed; cue.vy=ny*speed
        onEvent?.({type:'shot', power})
      }
    }

    canvas.addEventListener('pointerdown', e=>ptr(e,'down'))
    canvas.addEventListener('pointermove', e=>ptr(e,'move'))
    window.addEventListener('pointerup', e=>ptr(e,'up'))

    return ()=>{
      cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('pointerup', e=>ptr(e,'up'))
    }
  }, [power, onEvent])

  return (
    <div className="card">
      <div className="badge" style={{justifyContent:'space-between', width:'100%'}}>
        <span className="small">Power</span>
        <input type="range" min="0" max="1" step="0.01" value={power} onChange={e=>setPower(Number(e.target.value))} />
      </div>
      <div style={{height:10}} />
      <div ref={wrapRef} className="tableWrap"><canvas ref={canvasRef} style={{display:'block'}} /></div>
    </div>
  )
}

function ball(ctx,x,y,r,c){
  ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2)
  ctx.fillStyle=c; ctx.fill()
  ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.lineWidth=1; ctx.stroke()
}
function roundPath(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y)
  ctx.arcTo(x+w,y,x+w,y+h,r)
  ctx.arcTo(x+w,y+h,x,y+h,r)
  ctx.arcTo(x,y+h,x,y,r)
  ctx.arcTo(x,y,x+w,y,r)
  ctx.closePath()
}
function fillRound(ctx,x,y,w,h,r,fill){
  roundPath(ctx,x,y,w,h,r)
  ctx.fillStyle=fill; ctx.fill()
}
function strokeRound(ctx,x,y,w,h,r,stroke,lw,blur){
  roundPath(ctx,x,y,w,h,r)
  ctx.save()
  ctx.strokeStyle=stroke; ctx.lineWidth=lw
  ctx.shadowColor=stroke; ctx.shadowBlur=blur
  ctx.stroke()
  ctx.restore()
}
