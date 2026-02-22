import React, { useEffect, useMemo, useRef, useState } from "react";

type Ball = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isStriped?: boolean;
  isCue?: boolean;
  isPocketed?: boolean;
};

type Table = {
  width: number;
  height: number;
  rail: number;
  pocketRadius: number;
};

const TABLE: Table = { width: 740, height: 370, rail: 24, pocketRadius: 22 };

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function makeRack(): Ball[] {
  const r = 10;
  const cue: Ball = {
    id: "cue",
    x: TABLE.rail + TABLE.width * 0.25,
    y: TABLE.rail + TABLE.height * 0.5,
    vx: 0,
    vy: 0,
    radius: r,
    color: "#f8f8f8",
    isCue: true,
  };

  const colors = [
    "#f6c343", // 1 yellow
    "#2a69ff", // 2 blue
    "#ff3b30", // 3 red
    "#7c3aed", // 4 purple
    "#f97316", // 5 orange
    "#16a34a", // 6 green
    "#7c2d12", // 7 maroon
    "#111827", // 8 black
    "#f6c343",
    "#2a69ff",
    "#ff3b30",
    "#7c3aed",
    "#f97316",
    "#16a34a",
    "#7c2d12",
  ];

  const balls: Ball[] = [cue];
  const startX = TABLE.rail + TABLE.width * 0.72;
  const startY = TABLE.rail + TABLE.height * 0.5;
  let idx = 0;

  const rowSpacing = r * 2 * 0.98;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const x = startX + row * (r * 2 * 0.86);
      const y = startY + (col - row / 2) * rowSpacing;
      const id = `b${idx + 1}`;
      const isStriped = idx >= 8;
      balls.push({
        id,
        x,
        y,
        vx: 0,
        vy: 0,
        radius: r,
        color: colors[idx] ?? "#ffffff",
        isStriped,
      });
      idx++;
    }
  }

  return balls;
}

export default function PoolTableGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [balls, setBalls] = useState<Ball[]>(() => makeRack());
  const [power, setPower] = useState(0.6);
  const [aiming, setAiming] = useState(false);
  const [aimPoint, setAimPoint] = useState<{ x: number; y: number } | null>(null);
  const lastTs = useRef<number | null>(null);

  const pockets = useMemo(() => {
    const x0 = TABLE.rail;
    const y0 = TABLE.rail;
    const x1 = TABLE.rail + TABLE.width;
    const y1 = TABLE.rail + TABLE.height;
    const xm = (x0 + x1) / 2;
    return [
      { x: x0, y: y0 },
      { x: xm, y: y0 },
      { x: x1, y: y0 },
      { x: x0, y: y1 },
      { x: xm, y: y1 },
      { x: x1, y: y1 },
    ];
  }, []);

  const cueBall = useMemo(() => balls.find((b) => b.isCue), [balls]);

  function anyMoving(list: Ball[]) {
    return list.some((b) => !b.isPocketed && (Math.abs(b.vx) > 0.02 || Math.abs(b.vy) > 0.02));
  }

  // Physics tick
  useEffect(() => {
    const friction = 0.992;
    const bounce = 0.92;
    const dtMax = 20;

    let raf = 0;
    const step = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = Math.min(dtMax, ts - lastTs.current);
      lastTs.current = ts;

      setBalls((prev) => {
        // Avoid state churn if nothing is moving
        const moving = anyMoving(prev);
        if (!moving) return prev;

        const next = prev.map((b) => ({ ...b }));

        // Integrate
        for (const b of next) {
          if (b.isPocketed) continue;
          b.x += b.vx * (dt / 16);
          b.y += b.vy * (dt / 16);
          b.vx *= friction;
          b.vy *= friction;

          // Rails
          const minX = TABLE.rail + b.radius;
          const maxX = TABLE.rail + TABLE.width - b.radius;
          const minY = TABLE.rail + b.radius;
          const maxY = TABLE.rail + TABLE.height - b.radius;

          if (b.x < minX) {
            b.x = minX;
            b.vx = Math.abs(b.vx) * bounce;
          }
          if (b.x > maxX) {
            b.x = maxX;
            b.vx = -Math.abs(b.vx) * bounce;
          }
          if (b.y < minY) {
            b.y = minY;
            b.vy = Math.abs(b.vy) * bounce;
          }
          if (b.y > maxY) {
            b.y = maxY;
            b.vy = -Math.abs(b.vy) * bounce;
          }

          // Pocketing
          for (const p of pockets) {
            if (dist(b.x, b.y, p.x, p.y) < TABLE.pocketRadius - 2) {
              if (b.isCue) {
                // Scratch: respot cue
                b.x = TABLE.rail + TABLE.width * 0.25;
                b.y = TABLE.rail + TABLE.height * 0.5;
                b.vx = 0;
                b.vy = 0;
              } else {
                b.isPocketed = true;
                b.vx = 0;
                b.vy = 0;
              }
            }
          }
        }

        // Collisions (naive O(n^2))
        for (let i = 0; i < next.length; i++) {
          const a = next[i];
          if (a.isPocketed) continue;
          for (let j = i + 1; j < next.length; j++) {
            const b = next[j];
            if (b.isPocketed) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            const minD = a.radius + b.radius;
            if (d > 0 && d < minD) {
              const nx = dx / d;
              const ny = dy / d;
              // Separate
              const overlap = minD - d;
              a.x -= nx * (overlap / 2);
              a.y -= ny * (overlap / 2);
              b.x += nx * (overlap / 2);
              b.y += ny * (overlap / 2);

              // Swap velocity along normal (simple elastic)
              const dvx = b.vx - a.vx;
              const dvy = b.vy - a.vy;
              const vn = dvx * nx + dvy * ny;
              if (vn < 0) {
                const impulse = -vn;
                a.vx -= impulse * nx;
                a.vy -= impulse * ny;
                b.vx += impulse * nx;
                b.vy += impulse * ny;
              }
            }
          }
        }

        return next;
      });

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pockets]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 860;
    const h = 480;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.clearRect(0, 0, w, h);

    // Card
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, 10, 10, w - 20, h - 20, 24);
    ctx.fill();

    // Table felt
    const tx = 60;
    const ty = 80;
    const tw = 740;
    const th = 370;

    // Rails
    ctx.fillStyle = "rgba(60,20,10,0.9)";
    roundRect(ctx, tx - 16, ty - 16, tw + 32, th + 32, 20);
    ctx.fill();

    // Felt
    ctx.fillStyle = "rgba(16, 88, 58, 0.95)";
    roundRect(ctx, tx, ty, tw, th, 14);
    ctx.fill();

    // Pockets
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    for (const p of pockets) {
      ctx.beginPath();
      ctx.arc(mapX(p.x), mapY(p.y), TABLE.pocketRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Balls
    for (const b of balls) {
      if (b.isPocketed) continue;
      drawBall(ctx, mapX(b.x), mapY(b.y), b.radius, b.color, !!b.isStriped, !!b.isCue);
    }

    // Aim line
    if (aimPoint && cueBall && !anyMoving(balls)) {
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(mapX(cueBall.x), mapY(cueBall.y));
      ctx.lineTo(aimPoint.x, aimPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Cue indicator
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(aimPoint.x, aimPoint.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Helpers
    function mapX(x: number) {
      // TABLE coordinates are already in px with rail offset
      return x + (tx - TABLE.rail);
    }
    function mapY(y: number) {
      return y + (ty - TABLE.rail);
    }
  }, [balls, aimPoint, cueBall, pockets]);

  function shootTo(px: number, py: number) {
    if (!cueBall) return;
    setBalls((prev) => {
      const next = prev.map((b) => ({ ...b }));
      const cue = next.find((b) => b.isCue);
      if (!cue || anyMoving(next)) return prev;

      // Convert px/py from canvas coords back to table coords
      const tx = 60;
      const ty = 80;
      const localX = px - (tx - TABLE.rail);
      const localY = py - (ty - TABLE.rail);

      const dx = localX - cue.x;
      const dy = localY - cue.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const nx = dx / d;
      const ny = dy / d;

      // Shoot opposite direction (pull back to aim)
      const speed = 16 * clamp(power, 0.05, 1);
      cue.vx = -nx * speed;
      cue.vy = -ny * speed;

      return next;
    });
  }

  function reset() {
    setBalls(makeRack());
    setAimPoint(null);
  }

  function onPointer(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!cueBall || anyMoving(balls)) return;

    if (e.type === "pointerdown") {
      setAiming(true);
      setAimPoint({ x, y });
    } else if (e.type === "pointermove") {
      if (!aiming) return;
      setAimPoint({ x, y });
    } else if (e.type === "pointerup" || e.type === "pointercancel") {
      if (!aiming) return;
      setAiming(false);
      setAimPoint({ x, y });
      shootTo(x, y);
    }
  }

  const pocketed = balls.filter((b) => b.isPocketed && !b.isCue).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Tap/drag to aim. Release to shoot.</div>
          <div className="text-xs text-white/50">Pocketed: {pocketed}</div>
        </div>
        <button
          onClick={reset}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          Reset rack
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3 pb-3">
          <div className="text-sm text-white/70">Power</div>
          <input
            className="w-full"
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={power}
            onChange={(e) => setPower(parseFloat(e.target.value))}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointer}
            onPointerMove={onPointer}
            onPointerUp={onPointer}
            onPointerCancel={onPointer}
          />
        </div>
      </div>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  striped: boolean,
  cue: boolean
) {
  // Shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = cue ? "#f8f8f8" : color;
  ctx.fill();
  ctx.restore();

  // Stripe
  if (striped && !cue) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = r * 0.55;
    ctx.stroke();
  }

  // Shine
  const grad = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
  grad.addColorStop(0, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.18)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}
