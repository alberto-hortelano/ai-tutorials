// Scene 6: Latent Interpolation — z controls "how", y controls "what"

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 20,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Top panel: Fix y, interpolate z => smooth
    const topP = easedSub(progress, 0.08, 0.5);
    if (topP > 0) {
      const panelY = 50;
      const panelH = (H - 80) * 0.45;

      fadeInText(ctx, tx('scene6', 'fixYLabel'), W / 2, panelY + 5, topP, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      // Row of interpolated squares (same class, varying z)
      const nSteps = 7;
      const sqSize = Math.min(38, (W - 60) / nSteps - 6);
      const startX = (W - nSteps * (sqSize + 6)) / 2;
      const rowY = panelY + 22;

      for (let i = 0; i < nSteps; i++) {
        const stepP = easedSub(progress, 0.12 + i * 0.04, 0.2 + i * 0.04 + 0.08);
        if (stepP > 0) {
          const sx = startX + i * (sqSize + 6);

          ctx.save();
          ctx.globalAlpha = stepP;

          // Gradient color to show smooth transition
          const t = i / (nSteps - 1);
          const hue = 220 + t * 40; // slight hue shift
          const sat = 50 + t * 20;
          ctx.fillStyle = `hsla(${hue}, ${sat}%, 50%, 0.4)`;
          ctx.fillRect(sx, rowY, sqSize, sqSize);

          ctx.strokeStyle = series[0];
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, rowY, sqSize, sqSize);

          // Label "7" in each (same class)
          ctx.fillStyle = colors.textPrimary;
          ctx.font = `bold ${sqSize * 0.5}px "Segoe UI", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('7', sx + sqSize / 2, rowY + sqSize / 2 + sqSize * 0.15);

          ctx.restore();

          // Connecting arrow between squares
          if (i < nSteps - 1 && stepP > 0.5) {
            ctx.save();
            ctx.globalAlpha = (stepP - 0.5) * 2 * 0.4;
            ctx.strokeStyle = colors.insight;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx + sqSize + 2, rowY + sqSize / 2);
            ctx.lineTo(sx + sqSize + 4, rowY + sqSize / 2);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // "Smooth" label
      const smoothP = easedSub(progress, 0.35, 0.48);
      if (smoothP > 0) {
        fadeInText(ctx, tx('scene6', 'smoothLabel'), W / 2, rowY + sqSize + 18, smoothP, {
          color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
      }
    }

    // Divider
    const divP = easedSub(progress, 0.4, 0.5);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP * 0.5;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, H * 0.48);
      ctx.lineTo(W - 20, H * 0.48);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Bottom panel: Fix z, change y => abrupt
    const botP = easedSub(progress, 0.45, 0.85);
    if (botP > 0) {
      const panelY = H * 0.52;

      fadeInText(ctx, tx('scene6', 'fixZLabel'), W / 2, panelY + 5, botP, {
        color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });

      // Row of squares with different classes (abrupt jumps)
      const classes = ['0', '3', '5', '7', '9'];
      const classColors = [series[0], series[1], series[2], series[3], series[4]];
      const sqSize = Math.min(42, (W - 60) / classes.length - 8);
      const startX = (W - classes.length * (sqSize + 10)) / 2;
      const rowY = panelY + 22;

      for (let i = 0; i < classes.length; i++) {
        const stepP = easedSub(progress, 0.5 + i * 0.05, 0.58 + i * 0.05 + 0.08);
        if (stepP > 0) {
          const sx = startX + i * (sqSize + 10);

          ctx.save();
          ctx.globalAlpha = stepP;

          ctx.fillStyle = classColors[i] + '30';
          ctx.fillRect(sx, rowY, sqSize, sqSize);
          ctx.strokeStyle = classColors[i];
          ctx.lineWidth = 1.5;
          ctx.strokeRect(sx, rowY, sqSize, sqSize);

          // Class digit
          ctx.fillStyle = classColors[i];
          ctx.font = `bold ${sqSize * 0.55}px "Segoe UI", system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(classes[i], sx + sqSize / 2, rowY + sqSize / 2 + sqSize * 0.17);

          ctx.restore();

          // Lightning bolt between (abrupt change)
          if (i < classes.length - 1 && stepP > 0.5) {
            ctx.save();
            ctx.globalAlpha = (stepP - 0.5) * 2 * 0.6;
            ctx.strokeStyle = colors.error;
            ctx.lineWidth = 2;
            const midX = sx + sqSize + 5;
            const midY2 = rowY + sqSize / 2;
            ctx.beginPath();
            ctx.moveTo(midX, midY2 - 4);
            ctx.lineTo(midX + 2, midY2);
            ctx.lineTo(midX - 1, midY2 + 1);
            ctx.lineTo(midX + 1, midY2 + 4);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // "Abrupt" label
      const abruptP = easedSub(progress, 0.72, 0.83);
      if (abruptP > 0) {
        fadeInText(ctx, tx('scene6', 'abruptLabel'), W / 2, rowY + sqSize + 18, abruptP, {
          color: colors.error, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
      }
    }

    // Bottom summary: z = how, y = what
    const sumP = easedSub(progress, 0.85, 1);
    if (sumP > 0) {
      fadeInText(ctx, tx('scene6', 'howLabel'), W * 0.3, H - 18, sumP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene6', 'whatLabel'), W * 0.7, H - 18, sumP, {
        color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
