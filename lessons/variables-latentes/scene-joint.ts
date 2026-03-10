// Scene 2: The Joint Distribution — p(x,z) = p(x|z)·p(z), 2D heatmap with formula build-up

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Joint distribution: mixture of 3 Gaussian blobs
function jointDensity(x: number, z: number): number {
  // Three cluster centers representing different z settings
  const c1 = gaussian(x, 2, 0.8) * gaussian(z, 1, 0.6);
  const c2 = gaussian(x, 5, 1.0) * gaussian(z, 3, 0.7);
  const c3 = gaussian(x, 7, 0.6) * gaussian(z, 2, 0.5);
  return 0.35 * c1 + 0.4 * c2 + 0.25 * c3;
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

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Heatmap area
    const hmLeft = W * 0.12;
    const hmTop = H * 0.18;
    const hmW = W * 0.5;
    const hmH = H * 0.55;

    // Data ranges
    const xMin = 0, xMax = 9;
    const zMin = 0, zMax = 4.5;

    // Phase 1: Prior p(z) — vertical bar on the right of heatmap
    const priorP = easedSub(progress, 0.05, 0.25);
    if (priorP > 0) {
      ctx.save();
      ctx.globalAlpha = priorP;

      const priorBarX = hmLeft + hmW + 15;
      const priorBarW = 40;

      // Draw p(z) as vertical curve
      const steps = 60;
      ctx.fillStyle = series[1] + '40';
      ctx.beginPath();
      ctx.moveTo(priorBarX, hmTop + hmH);
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const pz = 0.35 * gaussian(z, 1, 0.6) + 0.4 * gaussian(z, 3, 0.7) + 0.25 * gaussian(z, 2, 0.5);
        const barW = pz * priorBarW * 8;
        const py = hmTop + hmH - ((z - zMin) / (zMax - zMin)) * hmH;
        ctx.lineTo(priorBarX + barW * easeOut(Math.min(priorP * 2, 1)), py);
      }
      ctx.lineTo(priorBarX, hmTop);
      ctx.closePath();
      ctx.fill();

      // Outline
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const z = zMin + (i / steps) * (zMax - zMin);
        const pz = 0.35 * gaussian(z, 1, 0.6) + 0.4 * gaussian(z, 3, 0.7) + 0.25 * gaussian(z, 2, 0.5);
        const barW = pz * priorBarW * 8;
        const py = hmTop + hmH - ((z - zMin) / (zMax - zMin)) * hmH;
        if (i === 0) ctx.moveTo(priorBarX + barW * easeOut(Math.min(priorP * 2, 1)), py);
        else ctx.lineTo(priorBarX + barW * easeOut(Math.min(priorP * 2, 1)), py);
      }
      ctx.stroke();

      fadeInText(ctx, tx('scene2', 'priorLabel'), priorBarX + priorBarW / 2 + 5, hmTop - 8, priorP, {
        color: series[1], font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 2: Heatmap of p(x,z) appears
    const hmP = easedSub(progress, 0.15, 0.5);
    if (hmP > 0) {
      ctx.save();
      ctx.globalAlpha = hmP;

      // Draw heatmap
      const res = 50;
      const cellW = hmW / res;
      const cellH = hmH / res;

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

      for (let ix = 0; ix < res; ix++) {
        for (let iz = 0; iz < res; iz++) {
          const x = xMin + (ix / res) * (xMax - xMin);
          const z = zMin + (iz / res) * (zMax - zMin);
          const val = jointDensity(x, z) / maxVal;
          if (val > 0.02) {
            // Color map: dark blue to accent to white
            const intensity = Math.min(val, 1);
            const r2 = Math.floor(30 + intensity * 99);   // 30 → 129
            const g = Math.floor(23 + intensity * 117);    // 23 → 140
            const b = Math.floor(42 + intensity * 206);    // 42 → 248
            ctx.fillStyle = `rgba(${r2}, ${g}, ${b}, ${intensity * 0.85})`;
            const px = hmLeft + (ix / res) * hmW;
            const py = hmTop + hmH - ((iz + 1) / res) * hmH;
            ctx.fillRect(px, py, cellW + 0.5, cellH + 0.5);
          }
        }
      }

      // Axes
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(hmLeft, hmTop);
      ctx.lineTo(hmLeft, hmTop + hmH);
      ctx.lineTo(hmLeft + hmW, hmTop + hmH);
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('x', hmLeft + hmW / 2, hmTop + hmH + 18);
      ctx.save();
      ctx.translate(hmLeft - 18, hmTop + hmH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('z', 0, 0);
      ctx.restore();

      // X ticks
      ctx.textBaseline = 'top';
      for (let t = 0; t <= 3; t++) {
        const val = (xMax / 3) * t;
        const px = hmLeft + (val / xMax) * hmW;
        ctx.fillText(val.toFixed(0), px, hmTop + hmH + 3);
      }

      // Joint label
      fadeInText(ctx, tx('scene2', 'jointLabel'), hmLeft + hmW / 2, hmTop - 8, hmP, {
        color: colors.accent, font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 3: Likelihood label
    const likP = easedSub(progress, 0.4, 0.55);
    if (likP > 0) {
      fadeInText(ctx, tx('scene2', 'likelihoodLabel'), hmLeft + hmW * 0.6, hmTop + hmH + 35, likP, {
        color: series[2], font: `bold 11px ${fonts.body}`
      });
    }

    // Phase 4: Formula builds up
    const f1P = easedSub(progress, 0.55, 0.75);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'joint',
        'p(\\mathbf{x}, \\mathbf{z}) = p(\\mathbf{x} \\mid \\mathbf{z}) \\cdot p(\\mathbf{z})',
        50, 88, f1P, { color: colors.textPrimary, fontSize: '1.1em' });
    }

    // Phase 5: Highlight prior and likelihood terms
    const highlightP = easedSub(progress, 0.78, 0.95);
    if (highlightP > 0) {
      // Prior highlight box (right side)
      const boxX = W * 0.7;
      const boxY = H * 0.68;
      const boxW = W * 0.25;
      const boxH = 25;

      ctx.save();
      ctx.globalAlpha = highlightP * 0.8;
      ctx.fillStyle = series[1] + '20';
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 1.5;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = series[1];
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene2', 'priorLabel'), boxX + boxW / 2, boxY + boxH / 2);

      // Likelihood box
      ctx.fillStyle = series[2] + '20';
      ctx.strokeStyle = series[2];
      ctx.fillRect(boxX, boxY + boxH + 8, boxW, boxH);
      ctx.strokeRect(boxX, boxY + boxH + 8, boxW, boxH);

      ctx.fillStyle = series[2];
      ctx.fillText(tx('scene2', 'likelihoodLabel'), boxX + boxW / 2, boxY + boxH + 8 + boxH / 2);

      ctx.restore();
    }
  }
});
