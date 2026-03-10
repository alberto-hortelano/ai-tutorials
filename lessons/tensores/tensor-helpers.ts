// Tensor drawing helpers — ported from apuntes/tensores_tutorial.html
// Heatmap coloring, cell rendering, and grid drawing for tensor visualizations.

import { colors, fonts } from '../../engine/shared/design-tokens';

/** Heatmap color: value in [-3, 3] -> blue to red through warm tones. */
export function valColor(v: number, alpha = 0.7): string {
  const t = Math.max(0, Math.min(1, (v + 3) / 6));
  const r = Math.round(t < 0.5 ? 30 + t * 2 * 180 : 210 + (t - 0.5) * 2 * 45);
  const g = Math.round(t < 0.5 ? 30 + t * 2 * 140 : 170 - (t - 0.5) * 2 * 140);
  const b = Math.round(t < 0.5 ? 180 - t * 2 * 80 : 100 - (t - 0.5) * 2 * 70);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Draw a single rounded-rect cell with heatmap fill and optional value text. */
export function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  val: number, showVal = true, alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = valColor(val, 0.55);
  const r = 4;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(148,163,184,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (showVal) {
    ctx.fillStyle = colors.textSecondary;
    ctx.font = `${Math.min(14, h * 0.4)}px ${fonts.mono}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(val.toFixed(1), x + w / 2, y + h / 2);
  }
  ctx.restore();
}

/** Draw a 2D grid of cells from a row-major matrix. */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  mat: number[][],
  ox: number, oy: number,
  cellW: number, cellH: number,
  showVals = true, alpha = 1,
): void {
  for (let i = 0; i < mat.length; i++) {
    for (let j = 0; j < mat[i].length; j++) {
      drawCell(ctx, ox + j * cellW, oy + i * cellH, cellW - 2, cellH - 2, mat[i][j], showVals, alpha);
    }
  }
}

/** Draw a colored cell with a specific fill color (for reshape color-coding). */
export function drawColorCell(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fillColor: string, label: string, alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillColor;
  const r = 4;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(148,163,184,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.min(13, h * 0.38)}px ${fonts.mono}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2);
  ctx.restore();
}

/** Draw a badge (rounded rect with text). */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  text: string, cx: number, cy: number,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold 13px ${fonts.mono}`;
  const m = ctx.measureText(text);
  const pw = 12, ph = 6;
  const bw = m.width + pw * 2;
  const bh = 24;
  const x = cx - bw / 2, y = cy - bh / 2;

  ctx.fillStyle = colors.panelBg;
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  const r = 6;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + bw, y, x + bw, y + bh, r);
  ctx.arcTo(x + bw, y + bh, x, y + bh, r);
  ctx.arcTo(x, y + bh, x, y, r);
  ctx.arcTo(x, y, x + bw, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.textSecondary;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

/** Draw isometric 3D tensor (stacked layers). */
export function drawIsometric3D(
  ctx: CanvasRenderingContext2D,
  data: number[][][],
  cx: number, cy: number,
  cellW: number, cellH: number,
  alpha = 1,
): void {
  const layers = data.length;
  const rows = data[0].length;
  const cols = data[0][0].length;
  const offX = 20, offY = -18;
  const tw = cols * cellW, th = rows * cellH;
  const baseX = cx - tw / 2 - offX * (layers - 1) / 2;
  const baseY = cy - th / 2 + 10;

  for (let l = layers - 1; l >= 0; l--) {
    const lx = baseX + l * offX;
    const ly = baseY + l * offY;

    ctx.save();
    ctx.globalAlpha = alpha * (l === 0 ? 1 : 0.6);
    ctx.fillStyle = `rgba(30,41,59,${l === 0 ? 0.9 : 0.5})`;
    ctx.fillRect(lx - 2, ly - 2, tw + 4, th + 4);
    ctx.strokeStyle = `rgba(129,140,248,${l === 0 ? 0.5 : 0.25})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(lx - 2, ly - 2, tw + 4, th + 4);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        drawCell(ctx, lx + j * cellW, ly + i * cellH, cellW - 2, cellH - 2, data[l][i][j], l === 0, alpha);
      }
    }
    ctx.restore();
  }
}

/** Generate a random matrix with values in [-2, 2]. */
export function genMatrix(rows: number, cols: number): number[][] {
  const mat: number[][] = [];
  for (let i = 0; i < rows; i++) {
    mat[i] = [];
    for (let j = 0; j < cols; j++) {
      mat[i][j] = +((Math.random() * 4 - 2).toFixed(1));
    }
  }
  return mat;
}

/** Generate a random 3D tensor. */
export function gen3DTensor(layers: number, rows: number, cols: number): number[][][] {
  const t: number[][][] = [];
  for (let l = 0; l < layers; l++) t[l] = genMatrix(rows, cols);
  return t;
}

/** 12 distinct colors for reshape color-coding. */
export const RESHAPE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#78716c',
];

/** Draw a small pixel-art grid (grayscale 0-1). */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  pixels: number[][],
  ox: number, oy: number,
  cellSize: number,
  alpha = 1,
  tint?: string,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < pixels.length; i++) {
    for (let j = 0; j < pixels[i].length; j++) {
      const v = pixels[i][j];
      if (tint) {
        ctx.fillStyle = tint;
        ctx.globalAlpha = alpha * v;
      } else {
        const g = Math.round(v * 255);
        ctx.fillStyle = `rgb(${g},${g},${g})`;
        ctx.globalAlpha = alpha;
      }
      ctx.fillRect(ox + j * cellSize, oy + i * cellSize, cellSize - 0.5, cellSize - 0.5);
    }
  }
  ctx.restore();
}

/** Generate a simple "7" digit pattern on an 8x8 grid. */
export function genDigit7(): number[][] {
  const p = Array.from({ length: 8 }, () => Array(8).fill(0));
  // top bar
  for (let j = 1; j < 7; j++) { p[1][j] = 0.9; p[0][j] = 0.3; }
  // diagonal stroke
  const pts = [[2,5],[3,4],[4,4],[5,3],[6,3],[7,2]];
  for (const [i,j] of pts) { if (i < 8 && j < 8) { p[i][j] = 0.9; if (j+1<8) p[i][j+1] = 0.4; } }
  return p;
}

/** Generate procedural MNIST-like digit (small 14x14). */
export function genMnistLike(seed: number): number[][] {
  const s = 14;
  const p = Array.from({ length: s }, () => Array(s).fill(0));
  // Simple procedural strokes based on seed
  const rng = (n: number) => ((seed * 9301 + 49297 + n * 233) % 233280) / 233280;
  const cx = 4 + Math.floor(rng(0) * 6);
  const cy = 3 + Math.floor(rng(1) * 4);
  for (let k = 0; k < 20; k++) {
    const x = Math.floor(cx + (rng(k*2+2) - 0.5) * 8);
    const y = Math.floor(cy + rng(k*2+3) * 8);
    if (x >= 0 && x < s && y >= 0 && y < s) {
      p[y][x] = Math.min(1, p[y][x] + 0.5 + rng(k+50) * 0.5);
      if (x+1 < s) p[y][x+1] = Math.min(1, p[y][x+1] + 0.3);
      if (y+1 < s) p[y+1][x] = Math.min(1, p[y+1][x] + 0.3);
    }
  }
  return p;
}

/** Draw a rounded box (useful for network layers). */
export function drawBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fillColor: string, strokeColor: string,
  alpha = 1,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  const r = 8;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
