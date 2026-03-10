// Shared utilities for pixel grid visualizations and mask overlays

import { easeOut } from '../../engine/animation/tween';
import { colors } from '../../engine/shared/design-tokens';

export interface GridCell {
  color: string;
  masked?: boolean;
}

/** Draw a pixel grid (low-res image representation) */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  grid: GridCell[][],
  x: number, y: number, cellSize: number,
  progress: number,
  opts: { gap?: number; maskColor?: string } = {},
): void {
  if (progress <= 0) return;
  const { gap = 1, maskColor = colors.bodyBg + '80' } = opts;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const cx = x + c * (cellSize + gap);
      const cy = y + r * (cellSize + gap);

      ctx.fillStyle = cell.color;
      ctx.fillRect(cx, cy, cellSize, cellSize);

      if (cell.masked) {
        ctx.fillStyle = maskColor;
        ctx.fillRect(cx, cy, cellSize, cellSize);
      }
    }
  }

  ctx.restore();
}

/** Generate a random colorful pixel grid using a seed */
export function generatePixelGrid(
  rows: number, cols: number, palette: string[], seed = 42,
): GridCell[][] {
  // Simple seeded random
  let s = seed;
  const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };

  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      const colorIdx = Math.floor(rng() * palette.length);
      row.push({ color: palette[colorIdx] });
    }
    grid.push(row);
  }
  return grid;
}

/** Apply a rectangular mask to a pixel grid */
export function applyMask(
  grid: GridCell[][],
  maskRow: number, maskCol: number,
  maskH: number, maskW: number,
): GridCell[][] {
  return grid.map((row, r) =>
    row.map((cell, c) => ({
      ...cell,
      masked: r >= maskRow && r < maskRow + maskH && c >= maskCol && c < maskCol + maskW,
    })),
  );
}

/** Draw a mask overlay with question marks for unknown pixels */
export function drawMaskOverlay(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, cellSize: number, gap: number,
  maskRow: number, maskCol: number, maskH: number, maskW: number,
  progress: number,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p;

  const mx = x + maskCol * (cellSize + gap);
  const my = y + maskRow * (cellSize + gap);
  const mw = maskW * (cellSize + gap) - gap;
  const mh = maskH * (cellSize + gap) - gap;

  // Dark overlay
  ctx.fillStyle = colors.bodyBg + 'cc';
  ctx.fillRect(mx, my, mw, mh);

  // Border
  ctx.strokeStyle = colors.error;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(mx, my, mw, mh);
  ctx.setLineDash([]);

  // Question mark
  ctx.fillStyle = colors.textMuted;
  ctx.font = `bold ${Math.min(mw, mh) * 0.4}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', mx + mw / 2, my + mh / 2);

  ctx.restore();
}
