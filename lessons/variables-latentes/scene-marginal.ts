// Scene 3: Marginalizing Out z — collapse 2D heatmap to 1D marginal p(x)

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Same joint density as scene-joint
function jointDensity(x: number, z: number): number {
  const c1 = gaussian(x, 2, 0.8) * gaussian(z, 1, 0.6);
  const c2 = gaussian(x, 5, 1.0) * gaussian(z, 3, 0.7);
  const c3 = gaussian(x, 7, 0.6) * gaussian(z, 2, 0.5);
  return 0.35 * c1 + 0.4 * c2 + 0.25 * c3;
}

// Marginal p(x) = integral over z
function marginalPx(x: number): number {
  let sum = 0;
  const steps = 80;
  const zMin = 0, zMax = 4.5;
  const dz = (zMax - zMin) / steps;
  for (let i = 0; i <= steps; i++) {
    const z = zMin + i * dz;
    sum += jointDensity(x, z) * dz;
  }
  return sum;
}

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
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Layout
    const hmLeft = W * 0.12;
    const hmW = W * 0.55;
    const xMin = 0, xMax = 9;
    const zMin = 0, zMax = 4.5;
    const res = 50;

    // Heatmap collapses: initially full height, then compresses downward
    const collapseT = easedSub(progress, 0.35, 0.75);
    const fullHmH = H * 0.45;
    const hmTop = H * 0.15;
    const currentHmH = fullHmH * (1 - collapseT * 0.85); // compresses to 15% of original
    const hmBottom = hmTop + fullHmH; // bottom stays fixed

    // Phase 1: Show full heatmap
    const hmP = easedSub(progress, 0.05, 0.2);
    if (hmP > 0) {
      ctx.save();
      ctx.globalAlpha = hmP * (1 - collapseT * 0.6);

      const cellW = hmW / res;

      // Find max for normalization
      let maxVal = 0;
      for (let ix = 0; ix < res; ix++) {
        for (let iz = 0; iz < res; iz++) {
          const x = xMin + (ix / res) * (xMax - xMin);
          const z = zMin + (iz / res) * (zMax - zMin);
          const val = jointDensity(x, z);
          if (val > maxVal) maxVal = val;
        }
      }

      // Draw heatmap with compression
      for (let ix = 0; ix < res; ix++) {
        for (let iz = 0; iz < res; iz++) {
          const x = xMin + (ix / res) * (xMax - xMin);
          const z = zMin + (iz / res) * (zMax - zMin);
          const val = jointDensity(x, z) / maxVal;
          if (val > 0.02) {
            const intensity = Math.min(val, 1);
            const rv = Math.floor(30 + intensity * 99);
            const gv = Math.floor(23 + intensity * 117);
            const bv = Math.floor(42 + intensity * 206);
            ctx.fillStyle = `rgba(${rv}, ${gv}, ${bv}, ${intensity * 0.85})`;
            const px = hmLeft + (ix / res) * hmW;
            // Compress vertically: map z to compressed range
            const zFrac = (iz + 1) / res;
            const py = hmBottom - zFrac * currentHmH;
            const cellH = currentHmH / res;
            ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
          }
        }
      }

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hmLeft, hmBottom - currentHmH);
      ctx.lineTo(hmLeft, hmBottom);
      ctx.lineTo(hmLeft + hmW, hmBottom);
      ctx.stroke();

      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('x', hmLeft + hmW / 2, hmBottom + 16);

      if (collapseT < 0.5) {
        ctx.save();
        ctx.translate(hmLeft - 16, hmBottom - currentHmH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('z', 0, 0);
        ctx.restore();
      }

      ctx.restore();
    }

    // Phase 2: Downward arrows showing compression
    const arrowPhase = easedSub(progress, 0.3, 0.5);
    if (arrowPhase > 0 && collapseT < 0.9) {
      ctx.save();
      ctx.globalAlpha = arrowPhase * (1 - collapseT);
      ctx.strokeStyle = colors.warning + 'aa';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);

      const numArrows = 5;
      for (let i = 0; i < numArrows; i++) {
        const ax = hmLeft + hmW * (i + 1) / (numArrows + 1);
        const ay1 = hmBottom - currentHmH * 0.8;
        const ay2 = hmBottom - 5;

        ctx.beginPath();
        ctx.moveTo(ax, ay1);
        ctx.lineTo(ax, ay1 + (ay2 - ay1) * arrowPhase);
        ctx.stroke();

        // Small arrowhead
        if (arrowPhase > 0.5) {
          const tipY = ay1 + (ay2 - ay1) * arrowPhase;
          ctx.fillStyle = colors.warning + 'aa';
          ctx.beginPath();
          ctx.moveTo(ax, tipY);
          ctx.lineTo(ax - 4, tipY - 6);
          ctx.lineTo(ax + 4, tipY - 6);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Phase 3: Marginal curve p(x) appears at the bottom
    const marginalP = easedSub(progress, 0.55, 0.85);
    if (marginalP > 0) {
      ctx.save();
      ctx.globalAlpha = marginalP;

      // Compute marginal values
      const marginalArea = { top: hmBottom + 5, h: H * 0.2 };
      let maxMarg = 0;
      const margVals: number[] = [];
      for (let i = 0; i <= res; i++) {
        const x = xMin + (i / res) * (xMax - xMin);
        const val = marginalPx(x);
        margVals.push(val);
        if (val > maxMarg) maxMarg = val;
      }

      // Fill under curve
      ctx.fillStyle = series[0] + '30';
      ctx.beginPath();
      ctx.moveTo(hmLeft, marginalArea.top + marginalArea.h);
      for (let i = 0; i <= res; i++) {
        const px = hmLeft + (i / res) * hmW;
        const py = marginalArea.top + marginalArea.h - (margVals[i] / maxMarg) * marginalArea.h * easeOut(Math.min(marginalP * 1.5, 1));
        if (i === 0) ctx.lineTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.lineTo(hmLeft + hmW, marginalArea.top + marginalArea.h);
      ctx.closePath();
      ctx.fill();

      // Curve outline
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= res; i++) {
        const px = hmLeft + (i / res) * hmW;
        const py = marginalArea.top + marginalArea.h - (margVals[i] / maxMarg) * marginalArea.h * easeOut(Math.min(marginalP * 1.5, 1));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // p(x) label
      fadeInText(ctx, 'p(x)', hmLeft + hmW + 15, marginalArea.top + marginalArea.h / 2, marginalP, {
        color: series[0], font: `bold 13px ${fonts.body}`, align: 'left'
      });

      // Shadow label
      fadeInText(ctx, tx('scene3', 'shadowLabel'), hmLeft + hmW / 2, marginalArea.top + marginalArea.h + 18, easedSub(progress, 0.7, 0.85), {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 4: Formula
    const fP = easedSub(progress, 0.75, 0.92);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'marginal',
        'p(\\mathbf{x}) = \\int p(\\mathbf{x}, \\mathbf{z}) \\, d\\mathbf{z}',
        80, 15, fP, { color: colors.textPrimary, fontSize: '1.1em' });
    }
  }
});
