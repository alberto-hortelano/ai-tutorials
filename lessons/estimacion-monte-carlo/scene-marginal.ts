// Scene 4: The Marginal Likelihood Challenge
// p(x) = ∫ p(x,z)dz — 2D heatmap, thin strip of z, random z samples in "desert"

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian, clamp } from '../../engine/shared/math-utils';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 24,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula
    formulaAppear(state.formulaManager, 'marginal-formula',
      'p(x) = \\int p(x, z)\\, dz',
      50, 12, easedSub(progress, 0.05, 0.18), { color: colors.textPrimary, fontSize: '1em' });

    // --- 2D heatmap of p(x,z) ---
    // Model: p(x,z) = p(x|z) * p(z) where p(z)=N(0,1), p(x|z)=N(z, 0.3)
    // So p(x,z) is a joint Gaussian concentrated along x=z diagonal
    const heatLeft = 55;
    const heatTop = H * 0.22;
    const heatW = W - 80;
    const heatH = H * 0.55;

    // Data bounds
    const dataMin = -3, dataMax = 3;

    const heatP = easedSub(progress, 0.1, 0.35);
    if (heatP > 0) {
      ctx.globalAlpha = heatP;

      // Draw heatmap
      const resolution = 60;
      const cellW = heatW / resolution;
      const cellH = heatH / resolution;

      for (let ix = 0; ix < resolution; ix++) {
        for (let iz = 0; iz < resolution; iz++) {
          const x = dataMin + (ix / resolution) * (dataMax - dataMin);
          const z = dataMax - (iz / resolution) * (dataMax - dataMin); // flip y

          // p(x,z) = p(x|z) * p(z)
          const pz = gaussian(z, 0, 1);
          const pxGivenZ = gaussian(x, z, 0.3);
          const density = pz * pxGivenZ;

          // Map density to color intensity
          const intensity = clamp(density * 8, 0, 1);
          if (intensity < 0.01) continue;

          const r_c = Math.floor(129 * intensity);
          const g_c = Math.floor(140 * intensity);
          const b_c = Math.floor(248 * intensity);
          ctx.fillStyle = `rgb(${r_c}, ${g_c}, ${b_c})`;
          ctx.fillRect(heatLeft + ix * cellW, heatTop + iz * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // Axes labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('x', heatLeft + heatW / 2, heatTop + heatH + 18);
      ctx.save();
      ctx.translate(heatLeft - 15, heatTop + heatH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('z', 0, 0);
      ctx.restore();

      // Joint label
      fadeInText(ctx, tx('scene4', 'jointLabel'), heatLeft + heatW - 30, heatTop + 12, 1, {
        color: colors.accent, font: `bold 11px ${fonts.body}`, align: 'right'
      });

      ctx.globalAlpha = 1;
    }

    // --- Highlight x=1 slice (thin vertical strip) ---
    const xFixed = 1.0;
    const sliceP = easedSub(progress, 0.35, 0.5);
    if (sliceP > 0) {
      const xPx = heatLeft + ((xFixed - dataMin) / (dataMax - dataMin)) * heatW;

      // Vertical line at x=1
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.globalAlpha = sliceP;
      ctx.beginPath();
      ctx.moveTo(xPx, heatTop);
      ctx.lineTo(xPx, heatTop + heatH);
      ctx.stroke();

      // x fixed label
      fadeInText(ctx, tx('scene4', 'xFixed'), xPx + 8, heatTop + heatH + 5, sliceP, {
        color: colors.warning, font: `bold 10px ${fonts.body}`, align: 'left'
      });

      // Highlight the thin strip of z that actually contributes
      // For x=1, the significant z values are near z=1 (because p(x|z)=N(z,0.3))
      const zCenter = xFixed;
      const zWidth = 0.5; // roughly 2*sigma of p(x|z)
      const zTopPx = heatTop + ((dataMax - (zCenter + zWidth)) / (dataMax - dataMin)) * heatH;
      const zBotPx = heatTop + ((dataMax - (zCenter - zWidth)) / (dataMax - dataMin)) * heatH;

      ctx.fillStyle = colors.insight + '30';
      ctx.fillRect(xPx - 8, zTopPx, 16, zBotPx - zTopPx);

      // Slice label
      fadeInText(ctx, tx('scene4', 'sliceLabel'), xPx + 15, (zTopPx + zBotPx) / 2, easedSub(progress, 0.42, 0.52), {
        color: colors.insight, font: `10px ${fonts.body}`, align: 'left'
      });

      ctx.globalAlpha = 1;
    }

    // --- Random z samples (most in the "desert") ---
    const sampleP = easedSub(progress, 0.55, 0.85);
    if (sampleP > 0) {
      const rng = mulberry32(99);
      const nSamples = 25;
      const nVisible = Math.max(1, Math.floor(sampleP * nSamples));
      const xPx = heatLeft + ((xFixed - dataMin) / (dataMax - dataMin)) * heatW;

      for (let i = 0; i < nVisible; i++) {
        // Sample z from prior p(z) = N(0,1)
        const u1 = rng() + 1e-10;
        const u2 = rng();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

        const zPx = heatTop + ((dataMax - z) / (dataMax - dataMin)) * heatH;

        // Is this z in the useful strip?
        const isUseful = Math.abs(z - xFixed) < 0.6;
        const dotColor = isUseful ? colors.insight : colors.error;
        const radius = isUseful ? 5 : 3;

        const dotAge = Math.min(1, (nVisible - i) / 3 + 0.4);
        ctx.beginPath();
        ctx.arc(xPx, zPx, radius * easeOut(dotAge), 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Desert label
      fadeInText(ctx, tx('scene4', 'desertLabel'), heatLeft + heatW + 5, heatTop + 30, easedSub(progress, 0.7, 0.8), {
        color: colors.error, font: `10px ${fonts.body}`, align: 'left'
      });
    }
  }
});
