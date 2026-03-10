// Scene 6: Latent Interpolation — smooth transitions via DDIM

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG for consistent noise visualization */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/** Draw a noise blob (small random dots in a circle) */
function drawNoiseBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, seed: number, color: string, alpha: number) {
  const rng = seededRng(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 20; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * radius;
    const dx = cx + Math.cos(angle) * dist;
    const dy = cy + Math.sin(angle) * dist;
    ctx.beginPath();
    ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  ctx.restore();
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Top row: noise vectors z_1 and z_2
    const topY = H * 0.2;
    const z1X = W * 0.12;
    const z2X = W * 0.78;
    const blobR = 22;

    // z_1
    const z1P = easedSub(progress, 0.08, 0.2);
    if (z1P > 0) {
      // Circle outline
      ctx.save();
      ctx.globalAlpha = z1P;
      ctx.beginPath();
      ctx.arc(z1X, topY, blobR, 0, Math.PI * 2);
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      drawNoiseBlob(ctx, z1X, topY, blobR * 0.8, 42, series[0], z1P);

      fadeInText(ctx, tx('scene6', 'noise1'), z1X, topY + blobR + 14, z1P, {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    // z_2
    const z2P = easedSub(progress, 0.12, 0.24);
    if (z2P > 0) {
      ctx.save();
      ctx.globalAlpha = z2P;
      ctx.beginPath();
      ctx.arc(z2X, topY, blobR, 0, Math.PI * 2);
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      drawNoiseBlob(ctx, z2X, topY, blobR * 0.8, 99, series[2], z2P);

      fadeInText(ctx, tx('scene6', 'noise2'), z2X, topY + blobR + 14, z2P, {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Interpolation bar (middle row)
    const interpY = H * 0.48;
    const interpX = W * 0.1;
    const interpW = W * 0.8;

    const interpP = easedSub(progress, 0.25, 0.7);
    if (interpP > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(interpP * 2, 1);

      // Track
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(interpX, interpY);
      ctx.lineTo(interpX + interpW, interpY);
      ctx.stroke();

      // Gradient fill on the track
      const grad = ctx.createLinearGradient(interpX, 0, interpX + interpW, 0);
      grad.addColorStop(0, series[0] + '60');
      grad.addColorStop(0.5, colors.accent + '60');
      grad.addColorStop(1, series[2] + '60');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(interpX, interpY);
      ctx.lineTo(interpX + interpW * interpP, interpY);
      ctx.stroke();

      // Interpolation points (5 evenly spaced)
      const nInterp = 7;
      for (let i = 0; i < nInterp; i++) {
        const frac = i / (nInterp - 1);
        const px = interpX + frac * interpW;
        if (frac > interpP) break;

        // Mix color from z1 to z2
        const mixSeed = Math.floor(42 + (99 - 42) * frac);
        const dotR = 14;

        ctx.beginPath();
        ctx.arc(px, interpY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = colors.panelBg;
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Noise inside (mixed)
        drawNoiseBlob(ctx, px, interpY, dotR * 0.7, mixSeed, colors.accent, Math.min(interpP * 2, 1));

        // Alpha label
        if (interpP > 0.8) {
          ctx.fillStyle = colors.textDimmed;
          ctx.font = '8px "Segoe UI", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`a=${frac.toFixed(1)}`, px, interpY + dotR + 10);
        }
      }

      ctx.restore();
    }

    // slerp label
    const slerpP = easedSub(progress, 0.4, 0.55);
    fadeInText(ctx, tx('scene6', 'interpLabel'), W / 2, interpY - 22, slerpP, {
      color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // DDIM decoder arrows + result row
    const resultY = H * 0.72;
    const decoderP = easedSub(progress, 0.6, 0.8);

    if (decoderP > 0) {
      ctx.save();
      ctx.globalAlpha = decoderP;

      // Vertical arrows from interpolation to results
      ctx.strokeStyle = colors.accent + '50';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      const nInterp = 7;
      for (let i = 0; i < nInterp; i++) {
        const frac = i / (nInterp - 1);
        const px = interpX + frac * interpW;
        ctx.beginPath();
        ctx.moveTo(px, interpY + 18);
        ctx.lineTo(px, resultY - 14);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // DDIM label in the middle
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DDIM', W / 2, (interpY + resultY) / 2 + 4);

      // Result colored blocks
      for (let i = 0; i < nInterp; i++) {
        const frac = i / (nInterp - 1);
        const px = interpX + frac * interpW;

        // Gradient box representing generated output
        const boxSize = 20;
        const hue = 230 + frac * 120; // shift hue across interpolation
        ctx.fillStyle = `hsla(${hue}, 60%, 55%, 0.7)`;
        ctx.fillRect(px - boxSize / 2, resultY - boxSize / 2, boxSize, boxSize);
        ctx.strokeStyle = colors.textMuted;
        ctx.lineWidth = 1;
        ctx.strokeRect(px - boxSize / 2, resultY - boxSize / 2, boxSize, boxSize);
      }

      ctx.restore();
    }

    // Result label
    const resultLabelP = easedSub(progress, 0.75, 0.88);
    fadeInText(ctx, tx('scene6', 'resultLabel'), W / 2, resultY + 24, resultLabelP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
