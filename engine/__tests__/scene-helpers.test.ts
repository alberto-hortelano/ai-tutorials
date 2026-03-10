import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sceneBase, drawTitle, drawAxesPhased, drawCurvePhased, drawFormulaPhased } from '../animation/scene-helpers';
import type { Renderer } from '../renderer';
import type { TimelineState } from '../types';
import type { FormulaManager } from '../animation/formula';

function mockRenderer(): Renderer {
  return {
    resize: vi.fn(),
    clear: vi.fn(),
    w: 800,
    h: 600,
    drawAxes: vi.fn(),
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 1,
    drawCurvePartial: vi.fn(),
  } as unknown as Renderer;
}

function mockCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

function mockFormulaManager(): FormulaManager {
  return {
    show: vi.fn(),
    hide: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn(),
  } as unknown as FormulaManager;
}

describe('sceneBase', () => {
  it('calls resize and clear on renderer', () => {
    const r = mockRenderer();
    const result = sceneBase(r);
    expect(r.resize).toHaveBeenCalledOnce();
    expect(r.clear).toHaveBeenCalledOnce();
    expect(result).toEqual({ W: 800, H: 600 });
  });
});

describe('drawTitle', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = mockCtx();
  });

  it('does not draw if progress is 0', () => {
    drawTitle(ctx, 'Test Title', 800, 0);
    expect(ctx.fillText).not.toHaveBeenCalled();
  });

  it('draws text when progress > 0', () => {
    drawTitle(ctx, 'Test Title', 800, 0.1);
    expect(ctx.fillText).toHaveBeenCalled();
  });
});

describe('drawAxesPhased', () => {
  it('does not draw axes before start phase', () => {
    const ctx = mockCtx();
    const r = mockRenderer();
    drawAxesPhased(ctx, r, 0, 0.2, 0.5);
    expect(r.drawAxes).not.toHaveBeenCalled();
  });

  it('draws axes when in range', () => {
    const ctx = mockCtx();
    const r = mockRenderer();
    drawAxesPhased(ctx, r, 0.35, 0.2, 0.5);
    expect(r.drawAxes).toHaveBeenCalledOnce();
  });

  it('restores globalAlpha to 1 after drawing', () => {
    const ctx = mockCtx();
    const r = mockRenderer();
    drawAxesPhased(ctx, r, 0.35, 0.2, 0.5);
    expect(ctx.globalAlpha).toBe(1);
  });
});

describe('drawCurvePhased', () => {
  it('does not draw before start', () => {
    const r = mockRenderer();
    drawCurvePhased(r, (x) => x, '#fff', 0, 0.2, 0.5);
    expect(r.drawCurvePartial).not.toHaveBeenCalled();
  });

  it('draws curve when in range', () => {
    const r = mockRenderer();
    drawCurvePhased(r, (x) => x, '#fff', 0.35, 0.2, 0.5);
    expect(r.drawCurvePartial).toHaveBeenCalled();
  });
});

describe('drawFormulaPhased', () => {
  it('does not call formulaAppear before start', () => {
    const fm = mockFormulaManager();
    const state = { formulaManager: fm } as TimelineState;
    drawFormulaPhased(state, 'eq1', 'x^2', 50, 50, 0, 0.2, 0.5);
    expect(fm.show).not.toHaveBeenCalled();
    expect(fm.hide).not.toHaveBeenCalled();
  });

  it('hides formula when progress > 0.95', () => {
    const fm = mockFormulaManager();
    const state = { formulaManager: fm } as TimelineState;
    drawFormulaPhased(state, 'eq1', 'x^2', 50, 50, 0.96, 0.2, 0.5);
    expect(fm.hide).toHaveBeenCalledWith('eq1');
  });

  it('shows formula when in range', () => {
    const fm = mockFormulaManager();
    const state = { formulaManager: fm } as TimelineState;
    drawFormulaPhased(state, 'eq1', 'x^2', 50, 50, 0.35, 0.2, 0.5);
    expect(fm.show).toHaveBeenCalled();
  });
});
