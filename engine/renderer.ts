// Renderer — Canvas 2D drawing API with viewport/coordinate system
import { colors, fonts } from './shared/design-tokens';
import { setupCanvas, drawCurve, drawCurvePartial, fillCurve, fillCurvePartial, fillBetween, roundRect } from './shared/canvas-utils';
import type { MathFn, RendererPadding, AxesOptions, LabelOptions as LabelOpts, VerticalLineOptions, ArrowOptions, BoxOptions } from './types';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  pad: Required<RendererPadding>;
  w!: number;
  h!: number;
  plotW!: number;
  plotH!: number;
  xMin!: number;
  xMax!: number;
  yMin!: number;
  yMax!: number;

  constructor(canvas: HTMLCanvasElement, padding?: Partial<RendererPadding>) {
    this.canvas = canvas;
    this.pad = { left: 55, right: 25, top: 25, bottom: 35, ...padding };
    this.resize();
  }

  resize(): void {
    const { ctx, w, h } = setupCanvas(this.canvas);
    this.ctx = ctx;
    this.w = w;
    this.h = h;
    this.plotW = w - this.pad.left - this.pad.right;
    this.plotH = h - this.pad.top - this.pad.bottom;
  }

  /** Set the data-space viewport. */
  setViewport(xMin: number, xMax: number, yMin: number, yMax: number): void {
    this.xMin = xMin;
    this.xMax = xMax;
    this.yMin = yMin;
    this.yMax = yMax;
  }

  /** Data x → pixel x */
  toX(x: number): number {
    return this.pad.left + ((x - this.xMin) / (this.xMax - this.xMin)) * this.plotW;
  }

  /** Data y → pixel y */
  toY(y: number): number {
    return (this.h - this.pad.bottom) - ((y - this.yMin) / (this.yMax - this.yMin)) * this.plotH;
  }

  /** Clear the canvas with background color. */
  clear(bg: string = colors.bodyBg): void {
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.w, this.h);
  }

  /** Draw axes with ticks. */
  drawAxes(opts: AxesOptions = {}): void {
    const { ctx } = this;
    const { xLabel, yLabel, xTicks, yTicks } = opts;
    const baseY = this.h - this.pad.bottom;
    const leftX = this.pad.left;
    const rightX = this.w - this.pad.right;
    const topY = this.pad.top;

    // Axis lines
    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(rightX, baseY);
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX, baseY);
    ctx.stroke();

    // X ticks
    ctx.fillStyle = colors.textDimmed;
    ctx.font = `10px ${fonts.body}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const nxTicks = xTicks ?? 6;
    for (let i = 0; i <= nxTicks; i++) {
      const x = this.xMin + (i / nxTicks) * (this.xMax - this.xMin);
      const px = this.toX(x);
      ctx.fillText(x.toFixed(1), px, baseY + 4);
    }

    // Y ticks
    if (yTicks) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= yTicks; i++) {
        const y = this.yMin + (i / yTicks) * (this.yMax - this.yMin);
        const py = this.toY(y);
        ctx.fillText(y.toFixed(2), leftX - 6, py);
      }
    }

    // Labels
    if (xLabel) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xLabel, leftX + this.plotW / 2, this.h - 4);
    }
    if (yLabel) {
      ctx.save();
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.translate(12, topY + this.plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(yLabel, 0, 0);
      ctx.restore();
    }
  }

  /** Draw zero line (horizontal at y=0 if in viewport). */
  drawZeroLine(): void {
    if (this.yMin > 0 || this.yMax < 0) return;
    const py = this.toY(0);
    this.ctx.strokeStyle = colors.axis;
    this.ctx.lineWidth = 0.5;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.pad.left, py);
    this.ctx.lineTo(this.w - this.pad.right, py);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  // --- Curve drawing delegated to canvas-utils with bound toX/toY ---

  drawCurve(fn: MathFn, color: string, lineWidth: number): void {
    drawCurve(this.ctx, (x: number) => this.toX(x), (y: number) => this.toY(y), this.xMin, this.xMax, fn, color, lineWidth);
  }

  drawCurvePartial(xEnd: number, fn: MathFn, color: string, lineWidth: number): void {
    drawCurvePartial(this.ctx, (x: number) => this.toX(x), (y: number) => this.toY(y), this.xMin, xEnd, fn, color, lineWidth);
  }

  fillCurve(fn: MathFn, color: string): void {
    fillCurve(this.ctx, (x: number) => this.toX(x), (y: number) => this.toY(y), this.xMin, this.xMax, fn, color);
  }

  fillCurvePartial(xEnd: number, fn: MathFn, color: string): void {
    fillCurvePartial(this.ctx, (x: number) => this.toX(x), (y: number) => this.toY(y), this.xMin, xEnd, fn, color);
  }

  fillBetween(fnTop: MathFn, fnBottom: MathFn, color: string): void {
    fillBetween(this.ctx, (x: number) => this.toX(x), (y: number) => this.toY(y), this.xMin, this.xMax, fnTop, fnBottom, color);
  }

  /** Draw text label at data coordinates. */
  label(text: string, x: number, y: number, opts: LabelOpts = {}): void {
    const { ctx } = this;
    const { color = colors.textSecondary, align = 'left', font = `11px ${fonts.body}`, baseline = 'middle' } = opts;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, this.toX(x), this.toY(y));
  }

  /** Draw a vertical dashed line at data x. */
  verticalLine(x: number, color: string, opts: VerticalLineOptions = {}): void {
    const { ctx } = this;
    const { dash = [6, 4], lineWidth = 1.5 } = opts;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(this.toX(x), this.toY(this.yMin));
    ctx.lineTo(this.toX(x), this.toY(this.yMax));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /** Draw an arrow from (x1,y1) to (x2,y2) in data coordinates. */
  arrow(x1: number, y1: number, x2: number, y2: number, color: string, opts: ArrowOptions = {}): void {
    const { ctx } = this;
    const { lineWidth = 2, headSize = 8 } = opts;
    const px1 = this.toX(x1), py1 = this.toY(y1);
    const px2 = this.toX(x2), py2 = this.toY(y2);
    const angle = Math.atan2(py2 - py1, px2 - px1);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px2, py2);
    ctx.lineTo(px2 - headSize * Math.cos(angle - 0.4), py2 - headSize * Math.sin(angle - 0.4));
    ctx.lineTo(px2 - headSize * Math.cos(angle + 0.4), py2 - headSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  /** Draw a dot at data coordinates. */
  dot(x: number, y: number, radius: number, color: string): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(this.toX(x), this.toY(y), radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  /** Draw a horizontal bar (for bar charts). px coordinates. */
  barH(px: number, py: number, width: number, height: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, width, height);
  }

  /** Draw a rounded rect box in pixel coordinates. */
  box(px: number, py: number, w: number, h: number, opts: BoxOptions = {}): void {
    const { fill = colors.panelBg, stroke = colors.border, radius = 8, lineWidth = 1.5 } = opts;
    const { ctx } = this;
    roundRect(ctx, px, py, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }
}
