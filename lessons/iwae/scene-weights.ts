// Scene 5: Importance Weights — dots with varying radius, ESS display

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// K=8 samples with pre-computed positions and weights
const SAMPLES = [
  { z: 0.5, w: 0.08 },
  { z: 1.2, w: 0.25 },
  { z: 1.8, w: 0.55 },
  { z: 2.3, w: 0.92 },
  { z: 2.8, w: 1.0 },
  { z: 3.4, w: 0.7 },
  { z: 4.0, w: 0.3 },
  { z: 4.8, w: 0.05 },
];

// Normalize weights for display
const wSum = SAMPLES.reduce((s, p) => s + p.w, 0);
const normalizedW = SAMPLES.map(p => p.w / wSum);

// ESS = (sum w_k)^2 / sum(w_k^2)
const sumW = SAMPLES.reduce((s, p) => s + p.w, 0);
const sumW2 = SAMPLES.reduce((s, p) => s + p.w * p.w, 0);
const ESS = (sumW * sumW) / sumW2;

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 20,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Formula
    const f1P = easedSub(progress, 0.06, 0.22);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'weight-def',
        'w_k = \\frac{p(\\mathbf{x}, z_k)}{q(z_k | \\mathbf{x})}',
        50, 20, f1P, { color: colors.textPrimary, fontSize: '1.0em' });
    }

    // Dot display area
    const areaLeft = W * 0.08;
    const areaRight = W * 0.92;
    const areaW = areaRight - areaLeft;
    const dotY = H * 0.52;

    const zMin = 0, zMax = 5.5;
    function zToX(z: number): number {
      return areaLeft + ((z - zMin) / (zMax - zMin)) * areaW;
    }

    // Phase 1: Baseline axis
    const axP = easedSub(progress, 0.1, 0.22);
    if (axP > 0) {
      ctx.save();
      ctx.globalAlpha = axP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(areaLeft, dotY + 35);
      ctx.lineTo(areaLeft + areaW * easeOut(axP), dotY + 35);
      ctx.stroke();

      // z label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('z', areaLeft + areaW / 2, dotY + 50);
      ctx.restore();
    }

    // Phase 2: Dots appearing with varying radius
    const dotsP = easedSub(progress, 0.2, 0.55);
    if (dotsP > 0) {
      const minR = 4;
      const maxR = 18;

      for (let k = 0; k < SAMPLES.length; k++) {
        const dp = easedSub(progress, 0.2 + k * 0.035, 0.3 + k * 0.035);
        if (dp > 0) {
          const s = SAMPLES[k];
          const cx = zToX(s.z);
          const radius = (minR + (maxR - minR) * s.w) * easeOut(dp);

          // Dot with radius proportional to weight
          ctx.save();
          ctx.globalAlpha = easeOut(dp) * 0.8;
          ctx.beginPath();
          ctx.arc(cx, dotY, radius, 0, Math.PI * 2);

          // Color: high weight = accent, low weight = dimmed
          const alpha = Math.floor(60 + 195 * s.w);
          ctx.fillStyle = series[0] + alpha.toString(16).padStart(2, '0');
          ctx.fill();

          // Border
          ctx.strokeStyle = series[0];
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();

          // Weight label below
          if (dp > 0.5) {
            const labelAlpha = (dp - 0.5) * 2;
            ctx.save();
            ctx.globalAlpha = labelAlpha;
            ctx.fillStyle = colors.textMuted;
            ctx.font = `9px ${fonts.body}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(`w=${s.w.toFixed(2)}`, cx, dotY + 35 + 6);
            ctx.restore();
          }
        }
      }
    }

    // Phase 3: High/Low weight annotations
    const annotP = easedSub(progress, 0.55, 0.7);
    if (annotP > 0) {
      // High weight annotation (sample 4, index 4)
      const highX = zToX(SAMPLES[4].z);
      fadeInText(ctx, tx('scene5', 'highLabel'), highX, dotY - 30, annotP, {
        color: colors.insight, font: `bold 11px ${fonts.body}`,
      });

      // Low weight annotation (sample 7, index 7)
      const lowX = zToX(SAMPLES[7].z);
      fadeInText(ctx, tx('scene5', 'lowLabel'), lowX, dotY - 20, annotP, {
        color: colors.error, font: `bold 11px ${fonts.body}`,
      });
    }

    // Phase 4: ESS display
    const essP = easedSub(progress, 0.72, 0.9);
    if (essP > 0) {
      const essBoxX = W * 0.25;
      const essBoxY = H * 0.8;
      const essBoxW = W * 0.5;
      const essBoxH = 36;

      ctx.save();
      ctx.globalAlpha = easeOut(essP) * 0.8;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.fillRect(essBoxX, essBoxY, essBoxW, essBoxH);
      ctx.strokeRect(essBoxX, essBoxY, essBoxW, essBoxH);
      ctx.restore();

      fadeInText(ctx, `${tx('scene5', 'essLabel')} = ${ESS.toFixed(1)} / ${SAMPLES.length}`, essBoxX + essBoxW / 2, essBoxY + essBoxH / 2, essP, {
        color: colors.accent, font: `bold 13px ${fonts.body}`,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.92, 1.0);
    fadeInText(ctx, tx('scene5', 'topic').split('.')[0], W / 2, H - 14, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
