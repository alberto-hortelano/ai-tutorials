// Scene 4: Noise Level Matching — clean paste vs proper noise matching

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/** Draw a simple image block with noise level */
function drawImageBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number,
  noiseLevel: number, color: string, progress: number, seed: number) {
  if (progress <= 0) return;
  const rng = seededRng(seed);

  ctx.save();
  ctx.globalAlpha = progress;

  // Background
  ctx.fillStyle = color + '30';
  ctx.fillRect(x, y, w, h);

  // Noise dots
  const nDots = Math.floor(noiseLevel * 30);
  for (let i = 0; i < nDots; i++) {
    const dx = x + rng() * w;
    const dy = y + rng() * h;
    ctx.beginPath();
    ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = colors.textDimmed + '80';
    ctx.fill();
  }

  // Border
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);

  ctx.restore();
}

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

    const blockW = W * 0.35;
    const blockH = H * 0.28;
    const leftX = W * 0.06;
    const rightX = W * 0.56;

    // LEFT: Wrong approach — clean pixels pasted into noisy image
    const wrongY = H * 0.2;

    const wrongLabelP = easedSub(progress, 0.06, 0.16);
    fadeInText(ctx, tx('scene4', 'wrongLabel'), leftX + blockW / 2, wrongY - 8, wrongLabelP, {
      color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });

    const wrongP = easedSub(progress, 0.1, 0.35);
    if (wrongP > 0) {
      // Noisy surrounding (lots of noise)
      drawImageBlock(ctx, leftX, wrongY, blockW, blockH, 0.7, colors.textDimmed, wrongP, 42);

      // Clean patch in center (NO noise)
      const patchW = blockW * 0.35;
      const patchH = blockH * 0.45;
      const patchX = leftX + blockW / 2 - patchW / 2;
      const patchY = wrongY + blockH / 2 - patchH / 2;

      ctx.save();
      ctx.globalAlpha = wrongP;

      // Clean patch
      ctx.fillStyle = colors.insight + '50';
      ctx.fillRect(patchX, patchY, patchW, patchH);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.strokeRect(patchX, patchY, patchW, patchH);

      // Visible seam indicator (red border around patch)
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.strokeRect(patchX - 2, patchY - 2, patchW + 4, patchH + 4);
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Seam label
    const seamP = easedSub(progress, 0.3, 0.45);
    fadeInText(ctx, tx('scene4', 'seamLabel'), leftX + blockW / 2, wrongY + blockH + 14, seamP, {
      color: colors.error, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // X mark
    if (seamP > 0) {
      ctx.save();
      ctx.globalAlpha = seamP;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      const xc = leftX + blockW + 8;
      const yc = wrongY + blockH / 2;
      ctx.beginPath();
      ctx.moveTo(xc - 8, yc - 8);
      ctx.lineTo(xc + 8, yc + 8);
      ctx.moveTo(xc + 8, yc - 8);
      ctx.lineTo(xc - 8, yc + 8);
      ctx.stroke();
      ctx.restore();
    }

    // RIGHT: Correct approach — properly noised pixels
    const rightLabelP = easedSub(progress, 0.35, 0.48);
    fadeInText(ctx, tx('scene4', 'rightLabel'), rightX + blockW / 2, wrongY - 8, rightLabelP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });

    const rightP = easedSub(progress, 0.4, 0.65);
    if (rightP > 0) {
      // Noisy surrounding (lots of noise)
      drawImageBlock(ctx, rightX, wrongY, blockW, blockH, 0.7, colors.textDimmed, rightP, 42);

      // Properly noised patch (SAME noise level)
      const patchW = blockW * 0.35;
      const patchH = blockH * 0.45;
      const patchX = rightX + blockW / 2 - patchW / 2;
      const patchY = wrongY + blockH / 2 - patchH / 2;

      ctx.save();
      ctx.globalAlpha = rightP;

      // Noised known patch (same noise level as surroundings)
      drawImageBlock(ctx, patchX, patchY, patchW, patchH, 0.65, colors.insight, rightP, 77);

      // Smooth blend border (no harsh line)
      ctx.strokeStyle = colors.insight + '40';
      ctx.lineWidth = 1;
      ctx.strokeRect(patchX, patchY, patchW, patchH);

      ctx.restore();
    }

    // Seamless label
    const seamlessP = easedSub(progress, 0.6, 0.75);
    fadeInText(ctx, tx('scene4', 'seamlessLabel'), rightX + blockW / 2, wrongY + blockH + 14, seamlessP, {
      color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // Checkmark
    if (seamlessP > 0) {
      ctx.save();
      ctx.globalAlpha = seamlessP;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      const xc = rightX - 10;
      const yc = wrongY + blockH / 2;
      ctx.beginPath();
      ctx.moveTo(xc - 6, yc);
      ctx.lineTo(xc, yc + 6);
      ctx.lineTo(xc + 10, yc - 8);
      ctx.stroke();
      ctx.restore();
    }

    // Key insight at the bottom
    const insightP = easedSub(progress, 0.78, 0.93);
    if (insightP > 0) {
      ctx.save();
      ctx.globalAlpha = insightP;
      const boxW = W * 0.85;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 55;
      const boxH = 36;

      ctx.fillStyle = colors.warning + '15';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = colors.warning + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = colors.warning;
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('x_known^t = sqrt(alpha_bar_t) * x_known + sqrt(1-alpha_bar_t) * epsilon', W / 2, boxY + boxH / 2);

      ctx.restore();
    }
  },
});
