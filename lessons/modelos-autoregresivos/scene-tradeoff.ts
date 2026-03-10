// Scene 6: The Fundamental Tradeoff — split-screen timer race, foreshadow MAF vs IAF

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Split screen divider
    const divP = easedSub(progress, 0.05, 0.15);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(divP);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 50);
      ctx.lineTo(W / 2, H - 40);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Left side: DENSITY
    const densP = easedSub(progress, 0.08, 0.5);
    if (densP > 0) {
      const cx = W * 0.25;

      // Section header
      fadeInText(ctx, tx('scene6', 'densityLabel'), cx, 58, easedSub(progress, 0.08, 0.15), {
        color: colors.insight, font: `bold 15px ${fonts.body}`
      });

      // Timer bar: fast (fills quickly)
      const barY = 80;
      const barW = W * 0.35;
      const barH = 20;
      const barX = cx - barW / 2;

      const timerP = easedSub(progress, 0.15, 0.3, easeOut);
      if (timerP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(timerP);

        // Bar background
        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barH / 2);
        ctx.fill();
        ctx.stroke();

        // Bar fill (completes quickly)
        const fillP = Math.min(timerP * 2, 1);
        ctx.fillStyle = colors.insight + '80';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * fillP, barH, barH / 2);
        ctx.fill();

        ctx.restore();
      }

      // O(1) badge
      const o1P = easedSub(progress, 0.25, 0.4);
      if (o1P > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(o1P);
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 13px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene6', 'densityTime'), cx, barY + barH + 18);
        ctx.restore();
      }

      // Parallel tag
      const parallelP = easedSub(progress, 0.3, 0.45);
      if (parallelP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(parallelP);
        ctx.fillStyle = colors.insight + '20';
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 45, barY + barH + 30, 90, 22, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene6', 'parallelTag'), cx, barY + barH + 44);
        ctx.restore();
      }

      // Parallel arrows diagram (all firing at once)
      const arrowsP = easedSub(progress, 0.2, 0.4);
      if (arrowsP > 0) {
        const arrowY = H * 0.45;
        const arrowCount = 5;
        const arrowSpacing = (barW - 20) / (arrowCount - 1);

        ctx.save();
        ctx.globalAlpha = Math.min(arrowsP * 2.5, 1);

        for (let i = 0; i < arrowCount; i++) {
          const ax = barX + 10 + i * arrowSpacing;

          // All arrows extend at the same time
          ctx.strokeStyle = colors.insight;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ax, arrowY);
          ctx.lineTo(ax, arrowY + 30 * easeOut(arrowsP));
          ctx.stroke();

          // Arrowheads
          if (arrowsP > 0.5) {
            ctx.fillStyle = colors.insight;
            ctx.beginPath();
            const tipY = arrowY + 30 * easeOut(arrowsP);
            ctx.moveTo(ax, tipY);
            ctx.lineTo(ax - 3, tipY - 5);
            ctx.lineTo(ax + 3, tipY - 5);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // Right side: SAMPLING
    const sampP = easedSub(progress, 0.3, 0.75);
    if (sampP > 0) {
      const cx = W * 0.75;

      // Section header
      fadeInText(ctx, tx('scene6', 'samplingLabel'), cx, 58, easedSub(progress, 0.3, 0.38), {
        color: colors.error, font: `bold 15px ${fonts.body}`
      });

      // Timer bar: slow (fills gradually)
      const barY = 80;
      const barW = W * 0.35;
      const barH = 20;
      const barX = cx - barW / 2;

      const timerP = easedSub(progress, 0.35, 0.7, easeInOut);
      if (timerP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(Math.min(timerP * 3, 1));

        // Bar background
        ctx.fillStyle = colors.panelBg;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, barH / 2);
        ctx.fill();
        ctx.stroke();

        // Bar fill (fills slowly, showing sequential nature)
        ctx.fillStyle = colors.error + '80';
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * timerP, barH, barH / 2);
        ctx.fill();

        ctx.restore();
      }

      // O(n) badge
      const onP = easedSub(progress, 0.55, 0.7);
      if (onP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(onP);
        ctx.fillStyle = colors.error;
        ctx.font = `bold 13px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene6', 'samplingTime'), cx, barY + barH + 18);
        ctx.restore();
      }

      // Sequential tag
      const seqP = easedSub(progress, 0.6, 0.75);
      if (seqP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(seqP);
        ctx.fillStyle = colors.error + '20';
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 50, barY + barH + 30, 100, 22, 11);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.error;
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene6', 'sequentialTag'), cx, barY + barH + 44);
        ctx.restore();
      }

      // Sequential arrows diagram (one at a time)
      const arrowsP = easedSub(progress, 0.4, 0.7);
      if (arrowsP > 0) {
        const arrowY = H * 0.45;
        const arrowCount = 5;
        const arrowSpacing = (barW - 20) / (arrowCount - 1);

        ctx.save();

        for (let i = 0; i < arrowCount; i++) {
          const ax = barX + 10 + i * arrowSpacing;
          const iP = easedSub(arrowsP, i / arrowCount, (i + 1) / arrowCount);
          if (iP <= 0) continue;

          ctx.globalAlpha = easeOut(iP);
          ctx.strokeStyle = colors.error;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ax, arrowY);
          ctx.lineTo(ax, arrowY + 30 * easeOut(iP));
          ctx.stroke();

          if (iP > 0.5) {
            ctx.fillStyle = colors.error;
            ctx.beginPath();
            const tipY = arrowY + 30 * easeOut(iP);
            ctx.moveTo(ax, tipY);
            ctx.lineTo(ax - 3, tipY - 5);
            ctx.lineTo(ax + 3, tipY - 5);
            ctx.closePath();
            ctx.fill();
          }
        }
        ctx.restore();
      }
    }

    // Foreshadow badge at bottom
    const foreP = easedSub(progress, 0.82, 0.96, easeOutBack);
    if (foreP > 0) {
      const fx = W / 2;
      const fy = H * 0.9;

      ctx.save();
      ctx.globalAlpha = foreP;
      ctx.fillStyle = colors.accent + '20';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(fx - 120, fy - 14, 240, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'foreshadow'), fx, fy + 4);
      ctx.restore();
    }
  }
});
