// Scene 4: Skipping Steps — smooth trajectory with checkpoints

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Generate smooth deterministic trajectory */
function smoothTrajectory(nPoints: number): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  for (let i = 0; i < nPoints; i++) {
    const t = i / (nPoints - 1);
    path.push({
      x: t,
      y: 0.5 + 0.2 * Math.sin(t * Math.PI * 2) * Math.exp(-t * 0.8),
    });
  }
  return path;
}

const fullPath = smoothTrajectory(100);
const checkpointEvery = 20;

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const areaX = W * 0.08;
    const areaY = 55;
    const areaW = W * 0.84;
    const areaH = H * 0.35;

    // Full trajectory (thin, dimmed)
    const fullP = easedSub(progress, 0.08, 0.35);
    if (fullP > 0) {
      ctx.save();
      ctx.globalAlpha = fullP * 0.4;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;

      const nDraw = Math.floor(fullPath.length * fullP);
      ctx.beginPath();
      for (let i = 0; i < nDraw; i++) {
        const px = areaX + areaW - fullPath[i].x * areaW;
        const py = areaY + fullPath[i].y * areaH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();

      // Full path label
      fadeInText(ctx, tx('scene4', 'fullPath'), areaX + areaW / 2, areaY + areaH + 12, fullP, {
        color: colors.textDimmed, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Checkpoints highlighted
    const checkP = easedSub(progress, 0.3, 0.65);
    if (checkP > 0) {
      ctx.save();

      // Draw checkpoint connections (thick, bright)
      const checkpoints: { px: number; py: number }[] = [];
      for (let i = 0; i < fullPath.length; i += checkpointEvery) {
        const px = areaX + areaW - fullPath[i].x * areaW;
        const py = areaY + fullPath[i].y * areaH;
        checkpoints.push({ px, py });
      }
      // Ensure last point
      const lastFull = fullPath[fullPath.length - 1];
      const lastCp = { px: areaX + areaW - lastFull.x * areaW, py: areaY + lastFull.y * areaH };
      if (checkpoints[checkpoints.length - 1].px !== lastCp.px) {
        checkpoints.push(lastCp);
      }

      // Draw segments between checkpoints
      const nDrawCp = Math.floor(checkpoints.length * checkP);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < nDrawCp; i++) {
        if (i === 0) ctx.moveTo(checkpoints[i].px, checkpoints[i].py);
        else ctx.lineTo(checkpoints[i].px, checkpoints[i].py);
      }
      ctx.stroke();

      // Draw checkpoint dots
      ctx.globalAlpha = checkP;
      for (let i = 0; i < nDrawCp; i++) {
        ctx.beginPath();
        ctx.arc(checkpoints[i].px, checkpoints[i].py, 5, 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.fill();
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Skipped path label
    const skipLabelP = easedSub(progress, 0.55, 0.68);
    fadeInText(ctx, tx('scene4', 'skippedPath'), areaX + areaW / 2, areaY + areaH + 28, skipLabelP, {
      color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
    });

    // Step count comparison below
    const compY = areaY + areaH + 55;

    // Visual: 1000 tiny dots vs 50 larger dots
    const compP = easedSub(progress, 0.6, 0.8);
    if (compP > 0) {
      ctx.save();
      ctx.globalAlpha = compP;

      // 1000 steps (tiny dots, faded)
      const manyDotsX = W * 0.08;
      const manyDotsW = W * 0.35;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('1000 steps', manyDotsX + manyDotsW / 2, compY - 5);

      for (let i = 0; i < 50; i++) {
        const dx = manyDotsX + (i / 49) * manyDotsW;
        ctx.beginPath();
        ctx.arc(dx, compY + 12, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = colors.textDimmed + '60';
        ctx.fill();
      }

      // Arrow
      ctx.fillStyle = colors.textMuted;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('=>', W / 2, compY + 12);

      // 50 steps (larger dots, bright)
      const fewDotsX = W * 0.58;
      const fewDotsW = W * 0.35;
      ctx.fillStyle = colors.insight;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('50 steps', fewDotsX + fewDotsW / 2, compY - 5);

      for (let i = 0; i < 10; i++) {
        const dx = fewDotsX + (i / 9) * fewDotsW;
        ctx.beginPath();
        ctx.arc(dx, compY + 12, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.insight;
        ctx.fill();
      }

      ctx.restore();
    }

    // Speedup badge
    const speedP = easedSub(progress, 0.82, 0.95);
    if (speedP > 0) {
      ctx.save();
      ctx.globalAlpha = speedP;
      const badgeW = W * 0.35;
      const badgeX = W / 2 - badgeW / 2;
      const badgeY = H - 50;

      ctx.fillStyle = colors.insight + '20';
      ctx.fillRect(badgeX, badgeY, badgeW, 32);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(badgeX, badgeY, badgeW, 32);

      ctx.fillStyle = colors.insight;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene4', 'speedup'), W / 2, badgeY + 16);

      ctx.restore();
    }
  },
});
