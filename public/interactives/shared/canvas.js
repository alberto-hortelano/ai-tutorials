// Canvas setup and drawing helpers for standalone interactives

import { COLORS } from './colors.js';

/**
 * Set up a canvas for HiDPI rendering.
 * Reads CSS dimensions from the element, scales by devicePixelRatio.
 * @param {HTMLCanvasElement} canvas
 * @returns {{ ctx: CanvasRenderingContext2D, w: number, h: number }}
 */
export function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

/**
 * Clear the canvas with a solid color.
 */
export function clearCanvas(ctx, w, h, color = COLORS.canvas) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Draw vertical grid lines at integer positions.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} toX - data-space x -> pixel x
 * @param {number} top - pixel y top of plot area
 * @param {number} plotH - pixel height of plot area
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} step
 */
export function drawGridV(ctx, toX, top, plotH, xMin, xMax, step, color = COLORS.grid) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let gx = Math.ceil(xMin / step) * step; gx <= xMax; gx += step) {
    ctx.beginPath();
    ctx.moveTo(toX(gx), top);
    ctx.lineTo(toX(gx), top + plotH);
    ctx.stroke();
  }
}

/**
 * Draw horizontal grid lines.
 */
export function drawGridH(ctx, toY, left, plotW, yMin, yMax, step, color = COLORS.grid) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let gy = Math.ceil(yMin / step) * step; gy <= yMax; gy += step) {
    ctx.beginPath();
    ctx.moveTo(left, toY(gy));
    ctx.lineTo(left + plotW, toY(gy));
    ctx.stroke();
  }
}

/**
 * Draw X and Y axis lines.
 */
export function drawAxes(ctx, pad, plotW, plotH, color = COLORS.axis) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.stroke();
}

/**
 * Draw X-axis tick labels.
 */
export function drawXLabels(ctx, toX, pad, plotH, xMin, xMax, step, color = COLORS.axisLabel) {
  ctx.fillStyle = color;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  for (let gx = Math.ceil(xMin / step) * step; gx <= xMax; gx += step) {
    ctx.fillText(gx.toString(), toX(gx), pad.top + plotH + 16);
  }
}

/**
 * Draw Y-axis tick labels.
 */
export function drawYLabels(ctx, toY, pad, values, color = COLORS.axisLabel) {
  ctx.fillStyle = color;
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'right';
  values.forEach(v => {
    const label = Number.isInteger(v) ? v.toString() : v.toFixed(2);
    ctx.fillText(label, pad.left - 6, toY(v) + 4);
  });
}

/**
 * Draw a dashed horizontal reference line.
 */
export function drawHRef(ctx, toY, pad, plotW, y, color = COLORS.textMuted) {
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, toY(y));
  ctx.lineTo(pad.left + plotW, toY(y));
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Draw a continuous curve from a function, evaluating fn(x) across [xMin, xMax].
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} fn - x => y
 * @param {Function} toX - data x => pixel x
 * @param {Function} toY - data y => pixel y
 * @param {number} xMin
 * @param {number} xMax
 * @param {string} color - stroke color
 * @param {number} lineWidth
 * @param {number} steps - sampling points (default 400)
 */
export function drawCurve(ctx, fn, toX, toY, xMin, xMax, color, lineWidth = 2.5, steps = 400) {
  const step = (xMax - xMin) / steps;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  let started = false;
  for (let x = xMin; x <= xMax; x += step) {
    const px = toX(x), py = toY(fn(x));
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

/**
 * Draw a filled Gaussian bell curve (fill + stroke).
 * @param {CanvasRenderingContext2D} ctx
 * @param {Function} gaussianFn - (x, mu, sigma) => pdf value
 * @param {number} mu
 * @param {number} sigma
 * @param {Function} toX
 * @param {Function} toY
 * @param {number} xMin
 * @param {number} xMax
 * @param {string} strokeColor
 * @param {string} fillColor
 * @param {number} steps
 */
export function drawGaussianCurve(ctx, gaussianFn, mu, sigma, toX, toY, xMin, xMax, strokeColor, fillColor, steps = 400) {
  const step = (xMax - xMin) / steps;

  // Fill
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.moveTo(toX(xMin), toY(0));
  for (let x = xMin; x <= xMax; x += step) {
    ctx.lineTo(toX(x), toY(gaussianFn(x, mu, sigma)));
  }
  ctx.lineTo(toX(xMax), toY(0));
  ctx.closePath();
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = xMin; x <= xMax; x += step) {
    const px = toX(x), py = toY(gaussianFn(x, mu, sigma));
    if (x === xMin) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

/**
 * Draw a rounded rectangle path (does not fill or stroke, just creates the path).
 */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Create coordinate transform functions for a plot area.
 * @param {{ left: number, right: number, top: number, bottom: number }} pad
 * @param {number} w - canvas CSS width
 * @param {number} h - canvas CSS height
 * @param {number} xMin - data x min
 * @param {number} xMax - data x max
 * @param {number} yMin - data y min
 * @param {number} yMax - data y max
 * @returns {{ toX: Function, toY: Function, plotW: number, plotH: number }}
 */
export function createCoords(pad, w, h, xMin, xMax, yMin, yMax) {
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;
  const toX = x => pad.left + (x - xMin) / (xMax - xMin) * plotW;
  const toY = y => pad.top + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
  return { toX, toY, plotW, plotH };
}
