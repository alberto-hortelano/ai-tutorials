// Scene 2: The Speed Problem — timer animation

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 20,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // DDPM timer section (top half)
    const ddpmY = H * 0.2;

    // DDPM label
    const ddpmLabelP = easedSub(progress, 0.08, 0.16);
    fadeInText(ctx, tx('scene2', 'ddpmTime'), W * 0.15, ddpmY, ddpmLabelP, {
      color: colors.accent, font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // DDPM progress bar (slowly filling)
    const ddpmBarP = easedSub(progress, 0.12, 0.7);
    if (ddpmBarP > 0) {
      const barX = W * 0.15;
      const barW = W * 0.65;
      const barH = 18;
      const barY = ddpmY + 14;

      // Background
      ctx.fillStyle = colors.border + '50';
      ctx.fillRect(barX, barY, barW, barH);

      // Fill
      ctx.fillStyle = colors.accent + '80';
      ctx.fillRect(barX, barY, barW * ddpmBarP, barH);

      // Border
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Step count
      const step = Math.floor(ddpmBarP * 1000);
      ctx.fillStyle = colors.textPrimary;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${step} / 1000`, barX + barW + 40, barY + barH / 2 + 4);

      // Timer
      const elapsed = (ddpmBarP * 50).toFixed(1);
      ctx.fillStyle = colors.warning;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`${elapsed}s`, barX + barW + 85, barY + barH / 2 + 4);
    }

    // DDPM result time
    const ddpmResultP = easedSub(progress, 0.65, 0.78);
    fadeInText(ctx, tx('scene2', 'ddpmSeconds'), W * 0.85, ddpmY, ddpmResultP, {
      color: colors.error, font: 'bold 14px "Segoe UI", system-ui, sans-serif', align: 'right',
    });

    // GAN timer section (bottom half, appears faster)
    const ganY = H * 0.48;

    // GAN label
    const ganLabelP = easedSub(progress, 0.5, 0.58);
    fadeInText(ctx, tx('scene2', 'ganTime'), W * 0.15, ganY, ganLabelP, {
      color: colors.insight, font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // GAN progress bar (fills instantly)
    const ganBarP = easedSub(progress, 0.55, 0.62);
    if (ganBarP > 0) {
      const barX = W * 0.15;
      const barW = W * 0.65;
      const barH = 18;
      const barY = ganY + 14;

      // Background + fill (instant)
      ctx.fillStyle = colors.insight + '80';
      ctx.fillRect(barX, barY, barW * Math.min(ganBarP * 5, 1), barH);

      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Step count
      ctx.fillStyle = colors.textPrimary;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('1 / 1', barX + barW + 40, barY + barH / 2 + 4);
    }

    // GAN result time
    const ganResultP = easedSub(progress, 0.6, 0.72);
    fadeInText(ctx, tx('scene2', 'ganSeconds'), W * 0.85, ganY, ganResultP, {
      color: colors.insight, font: 'bold 14px "Segoe UI", system-ui, sans-serif', align: 'right',
    });

    // Ratio comparison
    const ratioP = easedSub(progress, 0.75, 0.88);
    if (ratioP > 0) {
      ctx.save();
      ctx.globalAlpha = ratioP;

      const ratioY = H * 0.7;
      const boxW = W * 0.5;
      const boxX = W / 2 - boxW / 2;
      const boxH = 40;

      ctx.fillStyle = colors.error + '15';
      ctx.fillRect(boxX, ratioY, boxW, boxH);
      ctx.strokeStyle = colors.error + '50';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(boxX, ratioY, boxW, boxH);

      ctx.fillStyle = colors.error;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene2', 'ratio'), W / 2, ratioY + boxH / 2);

      ctx.restore();
    }

    // Animated clock icon
    const clockP = easedSub(progress, 0.12, 0.7);
    if (clockP > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(clockP * 3, 0.6);

      const cx = W * 0.08;
      const cy = ddpmY + 22;
      const cr = 14;

      // Clock face
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Clock hand (rotating)
      const angle = -Math.PI / 2 + clockP * Math.PI * 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * cr * 0.7, cy + Math.sin(angle) * cr * 0.7);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    }
  },
});
