// Scene 2: Planar flow — simple but limited

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateDots } from '../../engine/animation/particles';
import { sampleGaussian2D } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Planar flow: f(z) = z + u * tanh(w^T z + b)
function planarFlow(pts: { x: number; y: number }[], layers: number): { x: number; y: number }[] {
  const params = [
    { ux: 0.6, uy: 0.3, wx: 1.2, wy: 0.5, b: 0 },
    { ux: -0.3, uy: 0.7, wx: 0.4, wy: -1.0, b: 0.5 },
    { ux: 0.4, uy: -0.5, wx: -0.8, wy: 0.6, b: -0.3 },
    { ux: -0.5, uy: 0.4, wx: 0.9, wy: 0.3, b: 0.2 },
    { ux: 0.3, uy: 0.6, wx: -0.5, wy: 1.1, b: -0.1 },
    { ux: -0.4, uy: -0.3, wx: 0.7, wy: -0.8, b: 0.4 },
    { ux: 0.5, uy: -0.2, wx: -0.3, wy: 0.9, b: 0.1 },
    { ux: -0.2, uy: 0.5, wx: 1.0, wy: 0.4, b: -0.2 },
  ];
  let result = pts.map(p => ({ ...p }));
  for (let l = 0; l < Math.min(layers, params.length); l++) {
    const { ux, uy, wx, wy, b } = params[l];
    result = result.map(p => {
      const h = Math.tanh(wx * p.x + wy * p.y + b);
      return { x: p.x + ux * h, y: p.y + uy * h };
    });
  }
  return result;
}

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const nPts = 180;
    const basePts = sampleGaussian2D(nPts, 55);
    const scale = Math.min(W, H) * 0.08;

    // Three mini-panels: K=1, K=2, K=8
    const configs = [
      { layers: 1, label: tx('scene2', 'layer1'), start: 0.08, end: 0.4 },
      { layers: 2, label: tx('scene2', 'layer2'), start: 0.3, end: 0.6 },
      { layers: 8, label: tx('scene2', 'layerK'), start: 0.5, end: 0.8 },
    ];

    const panelW = W * 0.28;
    const panelH = H - 100;
    const gap = (W - 3 * panelW) / 4;

    configs.forEach((cfg, i) => {
      const pP = easedSub(progress, cfg.start, cfg.end);
      if (pP <= 0) return;

      const px = gap + i * (panelW + gap);
      const cx = px + panelW / 2;
      const cy = 75 + panelH / 2;

      ctx.save();
      ctx.globalAlpha = pP;

      // Panel border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, 60, panelW, panelH, 6);
      ctx.stroke();

      // Label
      fadeInText(ctx, cfg.label, cx, 58, 1, {
        color: series[i], font: `bold 12px ${fonts.body}`
      });

      // Transform points
      const morphT = easedSub(progress, cfg.start + 0.05, cfg.end, easeInOut);
      const transformed = planarFlow(basePts, cfg.layers);

      // Lerp between base and transformed
      const pts = basePts.map((p, j) => ({
        x: cx + (p.x + morphT * (transformed[j].x - p.x)) * scale,
        y: cy - (p.y + morphT * (transformed[j].y - p.y)) * scale,
      }));

      animateDots(ctx, pts, Math.min(pP * 2, 1), {
        color: series[i], radius: 2.5, sequential: false,
      });

      ctx.restore();
    });

    // Formula
    const fP = easedSub(progress, 0.8, 0.95);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'planar',
        'f(\\mathbf{z}) = \\mathbf{z} + \\mathbf{u}\\,h(\\mathbf{w}^\\top\\mathbf{z} + b)',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1.1em' });
    }
  }
});
