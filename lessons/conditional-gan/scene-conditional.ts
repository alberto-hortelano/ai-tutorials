// Scene 1: Conditional Generation — noise + label => class-specific output

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Top section: unconditional GAN
    const unconP = easedSub(progress, 0.05, 0.35);
    if (unconP > 0) {
      const topY = 60;
      ctx.save();
      ctx.globalAlpha = unconP;

      fadeInText(ctx, tx('scene1', 'unconditional'), W / 2, topY, 1, {
        color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif',
      });

      // Noise box
      const nBoxX = W * 0.15, nBoxY = topY + 20, nBoxW = 60, nBoxH = 35;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(nBoxX, nBoxY, nBoxW, nBoxH);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('z ~ N(0,I)', nBoxX + nBoxW / 2, nBoxY + nBoxH / 2 + 4);

      // G box
      const gBoxX = W * 0.4, gBoxY = topY + 20, gBoxW = 60, gBoxH = 35;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent + '20';
      ctx.fillRect(gBoxX, gBoxY, gBoxW, gBoxH);
      ctx.strokeRect(gBoxX, gBoxY, gBoxW, gBoxH);
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('G', gBoxX + gBoxW / 2, gBoxY + gBoxH / 2 + 5);

      // Arrow z -> G
      animateArrow(ctx, nBoxX + nBoxW + 5, nBoxY + nBoxH / 2, gBoxX - 5, gBoxY + nBoxH / 2, 1, {
        color: colors.textDimmed,
      });

      // Output: random images (represented as colored squares)
      const outX = W * 0.65;
      animateArrow(ctx, gBoxX + gBoxW + 5, gBoxY + gBoxH / 2, outX - 10, gBoxY + gBoxH / 2, 1, {
        color: colors.textDimmed,
      });

      // Random colored squares
      const sqSize = 22;
      const sqY = gBoxY + 5;
      const sqColors = [series[0], series[2], series[3], series[1]];
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = sqColors[i] + '60';
        ctx.fillRect(outX + i * (sqSize + 4), sqY, sqSize, sqSize);
        ctx.strokeStyle = sqColors[i];
        ctx.lineWidth = 1;
        ctx.strokeRect(outX + i * (sqSize + 4), sqY, sqSize, sqSize);
      }
      ctx.fillStyle = colors.textMuted;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('?', outX + 50, sqY + sqSize + 12);

      ctx.restore();
    }

    // Divider
    const divP = easedSub(progress, 0.3, 0.4);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, H * 0.42);
      ctx.lineTo(W - 20, H * 0.42);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Bottom section: conditional GAN
    const condP = easedSub(progress, 0.35, 0.75);
    if (condP > 0) {
      const botY = H * 0.48;
      ctx.save();
      ctx.globalAlpha = condP;

      fadeInText(ctx, tx('scene1', 'conditional'), W / 2, botY, 1, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });

      // Noise box
      const nBoxX = W * 0.08, nBoxY = botY + 25, nBoxW = 60, nBoxH = 35;
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(nBoxX, nBoxY, nBoxW, nBoxH);
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene1', 'noiseLabel'), nBoxX + nBoxW / 2, nBoxY + nBoxH / 2 + 4);

      // Label tag
      const tagX = W * 0.08, tagY = botY + 70, tagW = 60, tagH = 30;
      ctx.fillStyle = colors.warning + '30';
      ctx.fillRect(tagX, tagY, tagW, tagH);
      ctx.strokeStyle = colors.warning;
      ctx.strokeRect(tagX, tagY, tagW, tagH);
      ctx.fillStyle = colors.warning;
      ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(tx('scene1', 'labelTag'), tagX + tagW / 2, tagY + tagH / 2 + 4);

      // G box
      const gBoxX = W * 0.38, gBoxY = botY + 35, gBoxW = 70, gBoxH = 55;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent + '20';
      ctx.fillRect(gBoxX, gBoxY, gBoxW, gBoxH);
      ctx.strokeRect(gBoxX, gBoxY, gBoxW, gBoxH);
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('G', gBoxX + gBoxW / 2, gBoxY + gBoxH / 2 + 5);

      // Arrows
      animateArrow(ctx, nBoxX + nBoxW + 5, nBoxY + nBoxH / 2, gBoxX - 5, gBoxY + gBoxH * 0.35, 1, {
        color: colors.textDimmed,
      });
      animateArrow(ctx, tagX + tagW + 5, tagY + tagH / 2, gBoxX - 5, gBoxY + gBoxH * 0.7, 1, {
        color: colors.warning,
      });

      // Output: all 7s
      const outX = W * 0.65;
      animateArrow(ctx, gBoxX + gBoxW + 5, gBoxY + gBoxH / 2, outX - 10, gBoxY + gBoxH / 2, 1, {
        color: colors.textDimmed,
      });

      const sqSize = 28;
      const sqY = gBoxY + 12;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = series[0] + '40';
        ctx.fillRect(outX + i * (sqSize + 5), sqY, sqSize, sqSize);
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1;
        ctx.strokeRect(outX + i * (sqSize + 5), sqY, sqSize, sqSize);
        // Draw "7" inside each
        ctx.fillStyle = colors.textPrimary;
        ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('7', outX + i * (sqSize + 5) + sqSize / 2, sqY + sqSize / 2 + 5);
      }

      fadeInText(ctx, tx('scene1', 'outputLabel'), outX + 50, sqY + sqSize + 16, condP, {
        color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      ctx.restore();
    }
  },
});
