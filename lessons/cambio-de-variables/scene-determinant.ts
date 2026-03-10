// Scene 4: Determinant = area change factor

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const cellSz = Math.min(W, H) * 0.16;
    const panelY = H * 0.32;
    const panelSpacing = W / 3;

    // Helper: draw a parallelogram from 2×2 matrix [[a,b],[c,d]]
    function drawShape(cx: number, cy: number, a: number, b: number, c: number, d: number, color: string, alpha: number, label: string) {
      ctx.save();
      ctx.globalAlpha = alpha;

      // The four corners of the unit square transformed by [[a,b],[c,d]]
      const s = cellSz * 0.5;
      const corners = [
        { x: cx + (-a - b) * s, y: cy + (-c - d) * s },
        { x: cx + (a - b) * s,  y: cy + (c - d) * s },
        { x: cx + (a + b) * s,  y: cy + (c + d) * s },
        { x: cx + (-a + b) * s, y: cy + (-c + d) * s },
      ];

      // Fill
      ctx.fillStyle = color + '30';
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.fill();

      // Outline
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label below
      ctx.fillStyle = color;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + cellSz + 15);

      ctx.restore();
    }

    // Example 1: Expansion (det = 2)
    const ex1P = easedSub(progress, 0.05, 0.35, easeInOut);
    if (ex1P > 0) {
      const t = ex1P;
      // Morph from identity to [[2, 0.3], [0.1, 1]]
      const a = 1 + t * 1, b = t * 0.3, c = t * 0.1, d = 1;
      const det = a * d - b * c;
      drawShape(panelSpacing * 0.5, panelY, a, b, c, d, series[1], ex1P,
        `${tx('scene4', 'expand')} (det=${det.toFixed(1)})`);
    }

    // Example 2: Compression (det ~0.4)
    const ex2P = easedSub(progress, 0.25, 0.55, easeInOut);
    if (ex2P > 0) {
      const t = ex2P;
      // Morph to [[0.5, 0.2], [-0.1, 0.8]]
      const a = 1 + t * (-0.5), b = t * 0.2, c = t * (-0.1), d = 1 + t * (-0.2);
      const det = a * d - b * c;
      drawShape(panelSpacing * 1.5, panelY, a, b, c, d, series[3], ex2P,
        `${tx('scene4', 'compress')} (det=${det.toFixed(2)})`);
    }

    // Example 3: Collapse (det → 0)
    const ex3P = easedSub(progress, 0.45, 0.75, easeInOut);
    if (ex3P > 0) {
      const t = ex3P;
      // Morph to [[1, 1], [0.5, 0.5]] which has det=0
      const a = 1, b = t * 1, c = t * 0.5, d = 1 + t * (-0.5);
      const det = a * d - b * c;
      drawShape(panelSpacing * 2.5, panelY, a, b, c, d, colors.error, ex3P,
        `${tx('scene4', 'collapse')} (det=${det.toFixed(2)})`);

      // "Not invertible!" warning
      if (t > 0.7) {
        const warnP = (t - 0.7) / 0.3;
        fadeInText(ctx, tx('scene4', 'notInvertible'), panelSpacing * 2.5, panelY + cellSz + 35, easeOut(warnP), {
          color: colors.error, font: `bold 12px ${fonts.body}`
        });
      }
    }

    // Formula
    const fP = easedSub(progress, 0.75, 0.9);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'det',
        'p(\\mathbf{x}) = p(\\mathbf{z})\\,\\cdot\\,|\\det J|^{-1}',
        50, 88, fP, { color: colors.textPrimary, fontSize: '1.1em' });
    }
  }
});
