// Shared utilities for Normalizing Flows lessons
// Seeded PRNG, 2D transform helpers, Newton's method inverse

import type { Point } from '../../engine/animation/particles';

// ── Seeded PRNG (mulberry32) ──

export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Sample generators ──

/** Generate N 2D samples from a standard normal (Box-Muller). */
export function sampleGaussian2D(n: number, seed = 42): Point[] {
  const rng = mulberry32(seed);
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = rng(), u2 = rng();
    const r = Math.sqrt(-2 * Math.log(u1 + 1e-10));
    pts.push({ x: r * Math.cos(2 * Math.PI * u2), y: r * Math.sin(2 * Math.PI * u2) });
  }
  return pts;
}

/** Generate two-moons dataset. */
export function sampleTwoMoons(n: number, noise = 0.08, seed = 42): Point[] {
  const rng = mulberry32(seed);
  const pts: Point[] = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const angle = Math.PI * (i / half);
    const nx = (rng() - 0.5) * noise * 2, ny = (rng() - 0.5) * noise * 2;
    pts.push({ x: Math.cos(angle) + nx, y: Math.sin(angle) + ny });
  }
  for (let i = 0; i < n - half; i++) {
    const angle = Math.PI * (i / (n - half));
    const nx = (rng() - 0.5) * noise * 2, ny = (rng() - 0.5) * noise * 2;
    pts.push({ x: 1 - Math.cos(angle) + nx, y: 1 - Math.sin(angle) - 0.5 + ny });
  }
  return pts;
}

/** Uniform 1D samples. */
export function sampleUniform1D(n: number, lo: number, hi: number, seed = 42): number[] {
  const rng = mulberry32(seed);
  const pts: number[] = [];
  for (let i = 0; i < n; i++) pts.push(lo + rng() * (hi - lo));
  return pts;
}

// ── 2D Transforms ──

/** Apply a 2D function to a point cloud. */
export function transformPoints(pts: Point[], f: (p: Point) => Point): Point[] {
  return pts.map(f);
}

/** Linear interpolation between two point clouds (for morphing). */
export function lerpPoints(a: Point[], b: Point[], t: number): Point[] {
  return a.map((p, i) => ({
    x: p.x + (b[i].x - p.x) * t,
    y: p.y + (b[i].y - p.y) * t,
  }));
}

// ── Newton's method for 1D inverse ──

/** Find x such that f(x) ≈ target, starting from x0. */
export function newtonInverse(f: (x: number) => number, df: (x: number) => number, target: number, x0: number, iters = 20): number {
  let x = x0;
  for (let i = 0; i < iters; i++) {
    const fx = f(x) - target;
    const dfx = df(x);
    if (Math.abs(dfx) < 1e-12) break;
    x -= fx / dfx;
  }
  return x;
}

// ── Grid generation ──

/** Generate a regular 2D grid of points. */
export function makeGrid(rows: number, cols: number, xMin: number, xMax: number, yMin: number, yMax: number): Point[] {
  const pts: Point[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      pts.push({
        x: xMin + (c / cols) * (xMax - xMin),
        y: yMin + (r / rows) * (yMax - yMin),
      });
    }
  }
  return pts;
}

/** Draw a warped grid on canvas. */
export function drawWarpedGrid(
  ctx: CanvasRenderingContext2D,
  rows: number, cols: number,
  xMin: number, xMax: number, yMin: number, yMax: number,
  transform: (p: Point) => Point,
  toScreenX: (x: number) => number,
  toScreenY: (y: number) => number,
  color: string,
  alpha: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.globalAlpha = alpha;

  const steps = 30;

  // Horizontal lines
  for (let r = 0; r <= rows; r++) {
    const y = yMin + (r / rows) * (yMax - yMin);
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const x = xMin + (s / steps) * (xMax - xMin);
      const tp = transform({ x, y });
      const sx = toScreenX(tp.x), sy = toScreenY(tp.y);
      if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // Vertical lines
  for (let c = 0; c <= cols; c++) {
    const x = xMin + (c / cols) * (xMax - xMin);
    ctx.beginPath();
    for (let s = 0; s <= steps; s++) {
      const y = yMin + (s / steps) * (yMax - yMin);
      const tp = transform({ x, y });
      const sx = toScreenX(tp.x), sy = toScreenY(tp.y);
      if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  ctx.restore();
}

// ── Common math for flows ──

/** Standard normal PDF. */
export function stdNormalPdf(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/** 2D standard normal PDF. */
export function stdNormal2dPdf(x: number, y: number): number {
  return Math.exp(-0.5 * (x * x + y * y)) / (2 * Math.PI);
}

/** Logistic sigmoid. */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}
