// Scene 3: The KL Problem — KL(q||mixture) has no closed form

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, gaussianMixturePdf } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const midY = H * 0.38;
    const boxW = W * 0.38;
    const boxH = H * 0.28;
    const gapX = W * 0.06;

    // ── Left box: KL(N || N) = analytic (green check) ──
    const leftP = easedSub(progress, 0.08, 0.35);
    if (leftP > 0) {
      const lx = W / 2 - gapX / 2 - boxW;
      ctx.globalAlpha = leftP;

      // Box background
      r.box(lx, midY, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.insight, radius: 8, lineWidth: 2,
      });

      // Title inside box
      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('KL(N || N)', lx + boxW / 2, midY + 12);

      // Checkmark
      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('\u2713', lx + boxW / 2, midY + 35);

      // Label
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene3', 'analyticLabel'), lx + boxW / 2, midY + boxH - 18);

      ctx.globalAlpha = 1;
    }

    // Small curve inside left box: two Gaussians
    if (leftP > 0) {
      const lx = W / 2 - gapX / 2 - boxW;
      const miniCx = lx + boxW / 2;
      const miniCy = midY + boxH * 0.55;
      const miniScale = boxW * 0.35;
      ctx.save();
      ctx.globalAlpha = leftP * 0.6;
      // q(z)
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let t = -3; t <= 3; t += 0.1) {
        const v = gaussian(t, 0.5, 0.8);
        const px = miniCx + t * miniScale / 3;
        const py = miniCy - v * miniScale * 1.5;
        if (t === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // p(z) single Gaussian
      ctx.strokeStyle = series[1];
      ctx.beginPath();
      for (let t = -3; t <= 3; t += 0.1) {
        const v = gaussian(t, 0, 1);
        const px = miniCx + t * miniScale / 3;
        const py = miniCy - v * miniScale * 1.5;
        if (t === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // ── Right box: KL(N || mixture) = intractable (red X) ──
    const rightP = easedSub(progress, 0.25, 0.5);
    if (rightP > 0) {
      const rx = W / 2 + gapX / 2;
      ctx.globalAlpha = rightP;

      r.box(rx, midY, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.error, radius: 8, lineWidth: 2,
      });

      ctx.fillStyle = colors.error;
      ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('KL(N || mixture)', rx + boxW / 2, midY + 12);

      // X mark
      ctx.fillStyle = colors.error;
      ctx.font = 'bold 22px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('\u2717', rx + boxW / 2, midY + 35);

      // Label
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene3', 'intractableLabel'), rx + boxW / 2, midY + boxH - 18);

      ctx.globalAlpha = 1;
    }

    // Small curve inside right box: Gaussian vs mixture
    if (rightP > 0) {
      const rx = W / 2 + gapX / 2;
      const miniCx = rx + boxW / 2;
      const miniCy = midY + boxH * 0.55;
      const miniScale = boxW * 0.35;
      const mixMeans = [-1.5, 0, 1.5];
      const mixStds = [0.5, 0.5, 0.5];
      const mixWeights = [0.33, 0.34, 0.33];
      ctx.save();
      ctx.globalAlpha = rightP * 0.6;
      // q(z)
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let t = -3; t <= 3; t += 0.1) {
        const v = gaussian(t, 0.5, 0.8);
        const px = miniCx + t * miniScale / 3;
        const py = miniCy - v * miniScale * 1.5;
        if (t === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // mixture
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      for (let t = -3; t <= 3; t += 0.1) {
        const v = gaussianMixturePdf(t, mixWeights, mixMeans, mixStds);
        const px = miniCx + t * miniScale / 3;
        const py = miniCy - v * miniScale * 1.5;
        if (t === -3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Arrow between boxes
    const arrowP = easedSub(progress, 0.4, 0.55);
    if (arrowP > 0) {
      const leftEnd = W / 2 - gapX / 2;
      const rightStart = W / 2 + gapX / 2;
      animateArrow(ctx, leftEnd + 4, midY + boxH / 2, rightStart - 4, midY + boxH / 2, arrowP, {
        color: colors.textDimmed, lineWidth: 1.5, headSize: 7,
      });
    }

    // The culprit: log(sum exp)
    const culpritP = easedSub(progress, 0.55, 0.75);
    formulaAppear(state.formulaManager, 'kl-culprit',
      '\\log p(z) = \\log \\sum_k \\pi_k\\, \\mathcal{N}(z;\\mu_k,\\Sigma_k)',
      50, 75, culpritP);

    // Label: log-sum is culprit
    const culpritLabelP = easedSub(progress, 0.7, 0.85);
    fadeInText(ctx, tx('scene3', 'culpritLabel'), W / 2, H * 0.83, culpritLabelP, {
      color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });

    // Insight
    const insP = easedSub(progress, 0.85, 0.98);
    fadeInText(ctx, tx('scene3', 'insight'), W / 2, H - 22, insP, {
      color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
