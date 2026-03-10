// Scene 6: Connection to Score Matching

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Data distribution curve
    const curveCenterX = W / 2;
    const curveBaseY = H * 0.55;
    const curveW = W * 0.7;
    const curveH = H * 0.25;

    const curveP = easedSub(progress, 0.08, 0.25);
    if (curveP > 0) {
      ctx.save();
      ctx.globalAlpha = curveP;

      // Draw Gaussian-like distribution
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = -3 + 6 * (i / 100);
        const y = gaussian(x, 0, 1);
        const px = curveCenterX - curveW / 2 + (i / 100) * curveW;
        const py = curveBaseY - y * curveH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Fill under
      ctx.fillStyle = colors.insight + '15';
      ctx.lineTo(curveCenterX + curveW / 2, curveBaseY);
      ctx.lineTo(curveCenterX - curveW / 2, curveBaseY);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // Score arrows (pointing toward the mode / uphill)
    const scoreP = easedSub(progress, 0.25, 0.5);
    if (scoreP > 0) {
      ctx.save();
      ctx.globalAlpha = scoreP;

      const arrowPoints = [-2.2, -1.6, -1.0, -0.4, 0.4, 1.0, 1.6, 2.2];
      for (const xVal of arrowPoints) {
        const px = curveCenterX + (xVal / 3) * (curveW / 2);
        const py = curveBaseY + 20;

        // Score direction: toward the mode (x=0)
        const scoreDir = -xVal; // nabla log p(x) ~ -x for Gaussian
        const arrowLen = Math.abs(scoreDir) * 18 * scoreP;

        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.sign(scoreDir) * arrowLen, py);
        ctx.stroke();

        // Arrowhead
        if (arrowLen > 5) {
          const tipX = px + Math.sign(scoreDir) * arrowLen;
          ctx.fillStyle = colors.insight;
          ctx.beginPath();
          ctx.moveTo(tipX, py);
          ctx.lineTo(tipX - Math.sign(scoreDir) * 5, py - 3);
          ctx.lineTo(tipX - Math.sign(scoreDir) * 5, py + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Score label
      ctx.fillStyle = colors.insight;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'scoreLabel'), curveCenterX, curveBaseY + 44);

      ctx.restore();
    }

    // Noise arrows (pointing AWAY from the mode)
    const noiseP = easedSub(progress, 0.4, 0.65);
    if (noiseP > 0) {
      ctx.save();
      ctx.globalAlpha = noiseP;

      const arrowPoints = [-2.2, -1.6, -1.0, -0.4, 0.4, 1.0, 1.6, 2.2];
      const noiseY = curveBaseY + 60;

      for (const xVal of arrowPoints) {
        const px = curveCenterX + (xVal / 3) * (curveW / 2);

        // Noise direction: AWAY from the mode (opposite of score)
        const noiseDir = xVal; // epsilon points away
        const arrowLen = Math.abs(noiseDir) * 18 * noiseP;

        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, noiseY);
        ctx.lineTo(px + Math.sign(noiseDir) * arrowLen, noiseY);
        ctx.stroke();

        // Arrowhead
        if (arrowLen > 5) {
          const tipX = px + Math.sign(noiseDir) * arrowLen;
          ctx.fillStyle = colors.error;
          ctx.beginPath();
          ctx.moveTo(tipX, noiseY);
          ctx.lineTo(tipX - Math.sign(noiseDir) * 5, noiseY - 3);
          ctx.lineTo(tipX - Math.sign(noiseDir) * 5, noiseY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Noise label
      ctx.fillStyle = colors.error;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'noiseLabel'), curveCenterX, noiseY + 24);

      ctx.restore();
    }

    // "Opposite directions" visual cue
    const oppP = easedSub(progress, 0.6, 0.75);
    if (oppP > 0) {
      ctx.save();
      ctx.globalAlpha = oppP;

      // Draw "opposite" brackets or indicator
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(W * 0.15, curveBaseY + 30);
      ctx.lineTo(W * 0.15, curveBaseY + 70);
      ctx.stroke();
      ctx.moveTo(W * 0.85, curveBaseY + 30);
      ctx.lineTo(W * 0.85, curveBaseY + 70);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Key insight formula
    const formulaP = easedSub(progress, 0.7, 0.85);
    formulaAppear(state.formulaManager, 'score-eps',
      '\\varepsilon_\\theta(x_t, t) \\approx -\\sigma_t \\, \\nabla_x \\log p_t(x)',
      50, 18, formulaP, { color: colors.accent, fontSize: '1.1em' });

    // Insight text
    const insightP = easedSub(progress, 0.85, 0.96);
    if (insightP > 0) {
      // Box
      ctx.save();
      ctx.globalAlpha = insightP;
      const boxW = W * 0.7;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 50;
      ctx.fillStyle = colors.warning + '15';
      ctx.fillRect(boxX, boxY, boxW, 30);
      ctx.strokeStyle = colors.warning + '60';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, 30);
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'insightLabel'), W / 2, H - 35, insightP, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
