// Scene helpers — composable functions to eliminate common render() boilerplate

import type { Renderer } from '../renderer';
import type { TimelineState, AxesOptions, MathFn } from '../types';
import type { FormulaShowOptions } from './formula';
import { colors, fonts } from '../shared/design-tokens';
import { easedSub } from './tween';
import { fadeInText } from './text';
import { animateCurve } from './graph';
import { formulaAppear } from './formula';
import { TIMING } from '../constants';

/**
 * Standard scene setup: resize canvas, clear background, return dimensions.
 * Replaces the 3-line boilerplate at the top of every scene render().
 */
export function sceneBase(r: Renderer): { W: number; H: number } {
  r.resize();
  r.clear();
  return { W: r.w, H: r.h };
}

export interface DrawTitleOptions {
  y?: number;
  color?: string;
  font?: string;
  start?: number;
  end?: number;
}

/**
 * Draw a standard title with fade-in at the top of the canvas.
 * Defaults match the most common pattern across scenes.
 */
export function drawTitle(
  ctx: CanvasRenderingContext2D,
  text: string,
  W: number,
  progress: number,
  opts: DrawTitleOptions = {},
): void {
  const {
    y = TIMING.TITLE_Y,
    color = colors.textPrimary,
    font = `bold ${TIMING.TITLE_FONT_SIZE}px "${fonts.body}"`,
    start = TIMING.TITLE_START,
    end = TIMING.TITLE_END,
  } = opts;
  fadeInText(ctx, text, W / 2, y, easedSub(progress, start, end), { color, font });
}

/**
 * Draw axes with phased alpha guard.
 * Skips drawing entirely if progress hasn't reached the start phase.
 */
export function drawAxesPhased(
  ctx: CanvasRenderingContext2D,
  r: Renderer,
  progress: number,
  start: number,
  end: number,
  axesOpts?: AxesOptions,
): void {
  const p = easedSub(progress, start, end);
  if (p <= 0) return;
  ctx.globalAlpha = p;
  r.drawAxes(axesOpts);
  ctx.globalAlpha = 1;
}

/**
 * Draw a curve with phased guard using animateCurve.
 */
export function drawCurvePhased(
  r: Renderer,
  fn: MathFn,
  color: string,
  progress: number,
  start: number,
  end: number,
  lineWidth: number = 2.5,
): void {
  const p = easedSub(progress, start, end);
  if (p <= 0) return;
  animateCurve(r, fn, color, p, lineWidth);
}

/**
 * Show a formula with phased guard, auto-hiding when progress > FORMULA_HIDE_AFTER.
 */
export function drawFormulaPhased(
  state: TimelineState,
  id: string,
  latex: string,
  x: number,
  y: number,
  progress: number,
  start: number,
  end: number,
  opts?: FormulaShowOptions,
): void {
  if (progress > TIMING.FORMULA_HIDE_AFTER) {
    state.formulaManager.hide(id);
    return;
  }
  const p = easedSub(progress, start, end);
  if (p <= 0) return;
  formulaAppear(state.formulaManager, id, latex, x, y, p, opts);
}
