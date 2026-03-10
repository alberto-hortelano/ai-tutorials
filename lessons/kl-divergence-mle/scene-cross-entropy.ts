// Scene 3: Cross-entropy

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { entropy, crossEntropy, clamp } from '../../engine/shared/math-utils';
import { drawBarChart } from '../_shared/chart-helpers';
import { fairDie, loadedDie, dieLabels } from './scene-entropy';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // Show P and Q side by side
    const barsP = easedSub(progress, 0.08, 0.3);
    if (barsP > 0) {
      fadeInText(ctx, tx('scene3', 'pLabel'), W * 0.25, 55, barsP, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
      drawBarChart(ctx, fairDie, dieLabels, series[0],
        { x: W * 0.05, y: 68, w: W * 0.4, h: H * 0.2 }, barsP, { maxVal: 0.5 });

      fadeInText(ctx, tx('scene3', 'qLabel'), W * 0.75, 55, barsP, {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
      drawBarChart(ctx, loadedDie, dieLabels, series[2],
        { x: W * 0.55, y: 68, w: W * 0.4, h: H * 0.2 }, barsP, { maxVal: 0.5 });
    }

    // --- Visual proof: overlaid surprise bars ---
    // For each outcome x_i: show p(x_i)*(-log p(x_i)) vs p(x_i)*(-log q(x_i))
    const proofP = easedSub(progress, 0.3, 0.72);
    if (proofP > 0) {
      const n = fairDie.length;
      const areaX = W * 0.08;
      const areaY = H * 0.38;
      const areaW = W * 0.84;
      const areaH = H * 0.32;
      const barW = (areaW * 0.55) / n;
      const gapBetween = barW * 0.4;
      const totalW = n * barW + (n - 1) * gapBetween;
      const startX = areaX + (areaW - totalW) / 2;

      // Compute per-outcome contributions
      const hpTerms: number[] = []; // p(x)*(-log2 p(x))
      const hpqTerms: number[] = []; // p(x)*(-log2 q(x))
      for (let i = 0; i < n; i++) {
        hpTerms.push(fairDie[i] > 0 ? -fairDie[i] * Math.log2(fairDie[i]) : 0);
        hpqTerms.push(fairDie[i] > 0 && loadedDie[i] > 0 ? -fairDie[i] * Math.log2(loadedDie[i]) : 0);
      }
      const maxTerm = Math.max(...hpqTerms, ...hpTerms) * 1.2;

      // Section label
      fadeInText(ctx, tx('scene3', 'proofTitle'), W / 2, areaY - 6, proofP, {
        color: colors.textMuted, font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });

      const barPhase = easeOut(clamp(proofP, 0, 1));

      for (let i = 0; i < n; i++) {
        const x = startX + i * (barW + gapBetween);

        // H(P) contribution bar (entropy - correct model)
        const hpH = (hpTerms[i] / maxTerm) * areaH * barPhase;
        ctx.fillStyle = series[0] + '88';
        ctx.fillRect(x, areaY + areaH - hpH, barW * 0.45, hpH);

        // H(P,Q) contribution bar (cross-entropy - wrong model)
        const hpqH = (hpqTerms[i] / maxTerm) * areaH * barPhase;
        ctx.fillStyle = series[2] + '88';
        ctx.fillRect(x + barW * 0.48, areaY + areaH - hpqH, barW * 0.45, hpqH);

        // Extra cost highlight: the difference between H(P,Q) and H(P) per term
        const extraPhase = easedSub(progress, 0.5, 0.65);
        if (extraPhase > 0 && hpqH > hpH) {
          ctx.fillStyle = colors.error + Math.round(extraPhase * 96).toString(16).padStart(2, '0');
          ctx.fillRect(
            x + barW * 0.48,
            areaY + areaH - hpqH,
            barW * 0.45,
            (hpqH - hpH),
          );
        }

        // Label
        ctx.fillStyle = colors.textDimmed;
        ctx.font = '10px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(dieLabels[i], x + barW / 2, areaY + areaH + 3);
      }

      // Legend
      const legY = areaY + 8;
      const legX = W * 0.72;
      ctx.fillStyle = series[0] + '88';
      ctx.fillRect(legX, legY, 10, 10);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('p(x)\u00B7(-log p)', legX + 14, legY + 5);

      ctx.fillStyle = series[2] + '88';
      ctx.fillRect(legX, legY + 16, 10, 10);
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('p(x)\u00B7(-log q)', legX + 14, legY + 21);

      // Extra cost label
      const extraLabelP = easedSub(progress, 0.55, 0.68);
      if (extraLabelP > 0) {
        ctx.fillStyle = colors.error + '60';
        ctx.fillRect(legX, legY + 32, 10, 10);
        ctx.globalAlpha = extraLabelP;
        ctx.fillStyle = colors.error;
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(tx('scene3', 'extraCost'), legX + 14, legY + 37);
        ctx.globalAlpha = 1;
      }
    }

    // Comparison bars: H(P) vs H(P,Q)
    const compP = easedSub(progress, 0.68, 0.88);
    if (compP > 0) {
      const hP = entropy(fairDie);
      const hPQ = crossEntropy(fairDie, loadedDie);
      const barArea = { x: W * 0.15, y: H * 0.76, w: W * 0.7, h: H * 0.12 };
      const maxVal = Math.max(hPQ, hP) * 1.15;
      const barH = 20;
      const gap = 10;

      // H(P) bar
      const hPWidth = (hP / maxVal) * barArea.w * easeOut(clamp(compP, 0, 1));
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('H(P)', barArea.x - 8, barArea.y + barH / 2);
      ctx.fillStyle = series[0] + '99';
      ctx.fillRect(barArea.x, barArea.y, hPWidth, barH);
      ctx.fillStyle = series[0];
      ctx.textAlign = 'left';
      ctx.fillText(hP.toFixed(3), barArea.x + hPWidth + 6, barArea.y + barH / 2);

      // H(P,Q) bar
      const hPQWidth = (hPQ / maxVal) * barArea.w * easeOut(clamp(compP, 0, 1));
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'right';
      ctx.fillText('H(P,Q)', barArea.x - 8, barArea.y + barH + gap + barH / 2);
      ctx.fillStyle = series[2] + '99';
      ctx.fillRect(barArea.x, barArea.y + barH + gap, hPQWidth, barH);
      ctx.fillStyle = series[2];
      ctx.textAlign = 'left';
      ctx.fillText(hPQ.toFixed(3), barArea.x + hPQWidth + 6, barArea.y + barH + gap + barH / 2);

      // Gap highlight
      if (compP > 0.5) {
        const gapAlpha = easedSub(progress, 0.76, 0.86);
        ctx.globalAlpha = gapAlpha;
        const gapWidth = hPQWidth - hPWidth;
        if (gapWidth > 5) {
          ctx.fillStyle = colors.error + '50';
          ctx.fillRect(barArea.x + hPWidth, barArea.y + barH + gap, gapWidth, barH);
          ctx.fillStyle = colors.error;
          ctx.font = '10px "Segoe UI", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('D_KL', barArea.x + hPWidth + gapWidth / 2, barArea.y + barH + gap - 2);
        }
        ctx.globalAlpha = 1;
      }
    }

    // Key insight
    const insightP = easedSub(progress, 0.88, 0.98);
    fadeInText(ctx, tx('scene3', 'insight'), W / 2, H - 20, insightP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
    });
  }
});
