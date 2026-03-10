// Scene 6: Practical Tricks — spectral norm, progressive growing, two-timescale LR

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const cardW = W * 0.85;
    const cardH = 70;
    const cardX = (W - cardW) / 2;
    const startY = 65;
    const gap = 15;

    // --- Trick 1: Spectral Normalization ---
    const t1P = easedSub(progress, 0.08, 0.3);
    if (t1P > 0) {
      const y = startY;
      ctx.save();
      ctx.globalAlpha = t1P;
      r.box(cardX, y, cardW, cardH, {
        fill: colors.panelBg, stroke: series[0], radius: 8, lineWidth: 2
      });
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'trick1'), cardX + 15, y + 22, t1P, {
        color: series[0], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
      fadeInText(ctx, tx('scene6', 'trick1Desc'), cardX + 15, y + 44, t1P, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });

      // Mini visual: weight matrix with spectral norm constraint
      const vizX = cardX + cardW - 60;
      const vizY = y + cardH / 2;
      if (t1P > 0.5) {
        ctx.save();
        ctx.globalAlpha = (t1P - 0.5) * 2;
        // Small matrix icon
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1.5;
        ctx.strokeRect(vizX - 15, vizY - 12, 30, 24);
        // Sigma symbol
        ctx.fillStyle = series[0];
        ctx.font = 'bold 14px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u03C3', vizX, vizY);
        // Constraint line through
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vizX - 18, vizY + 15);
        ctx.lineTo(vizX + 18, vizY - 15);
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- Trick 2: Progressive Growing ---
    const t2P = easedSub(progress, 0.28, 0.55);
    if (t2P > 0) {
      const y = startY + cardH + gap;
      ctx.save();
      ctx.globalAlpha = t2P;
      r.box(cardX, y, cardW, cardH, {
        fill: colors.panelBg, stroke: series[1], radius: 8, lineWidth: 2
      });
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'trick2'), cardX + 15, y + 22, t2P, {
        color: series[1], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
      fadeInText(ctx, tx('scene6', 'trick2Desc'), cardX + 15, y + 44, t2P, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });

      // Mini visual: resolution squares growing
      const vizX = cardX + cardW - 80;
      const vizY = y + cardH / 2;
      if (t2P > 0.5) {
        ctx.save();
        ctx.globalAlpha = (t2P - 0.5) * 2;
        const sizes = [8, 14, 22];
        for (let i = 0; i < 3; i++) {
          const s = sizes[i];
          const px = vizX + i * 28;
          ctx.strokeStyle = series[1];
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - s / 2, vizY - s / 2, s, s);
          // Pixel grid inside
          if (i > 0) {
            ctx.strokeStyle = series[1] + '44';
            ctx.lineWidth = 0.5;
            const step = s / (i + 1);
            for (let g = step; g < s; g += step) {
              ctx.beginPath();
              ctx.moveTo(px - s / 2 + g, vizY - s / 2);
              ctx.lineTo(px - s / 2 + g, vizY + s / 2);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(px - s / 2, vizY - s / 2 + g);
              ctx.lineTo(px + s / 2, vizY - s / 2 + g);
              ctx.stroke();
            }
          }
        }
        // Arrows between resolution boxes
        animateArrow(ctx, vizX + 8, vizY, vizX + 18, vizY, 1, {
          color: series[1], lineWidth: 1, headSize: 4
        });
        animateArrow(ctx, vizX + 36, vizY, vizX + 46, vizY, 1, {
          color: series[1], lineWidth: 1, headSize: 4
        });
        ctx.restore();
      }
    }

    // --- Trick 3: Two-Timescale LR ---
    const t3P = easedSub(progress, 0.5, 0.78);
    if (t3P > 0) {
      const y = startY + 2 * (cardH + gap);
      ctx.save();
      ctx.globalAlpha = t3P;
      r.box(cardX, y, cardW, cardH, {
        fill: colors.panelBg, stroke: series[3], radius: 8, lineWidth: 2
      });
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'trick3'), cardX + 15, y + 22, t3P, {
        color: series[3], font: 'bold 13px "Segoe UI", system-ui, sans-serif', align: 'left'
      });
      fadeInText(ctx, tx('scene6', 'trick3Desc'), cardX + 15, y + 44, t3P, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
      });

      // Mini visual: two bars with different lengths for lr_D > lr_G
      const vizX = cardX + cardW - 75;
      const vizY = y + cardH / 2;
      if (t3P > 0.5) {
        ctx.save();
        ctx.globalAlpha = (t3P - 0.5) * 2;

        // lr_D bar (longer)
        ctx.fillStyle = colors.insight;
        ctx.fillRect(vizX - 5, vizY - 12, 50, 8);
        ctx.fillStyle = colors.insight;
        ctx.font = '8px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('lr_D', vizX - 8, vizY - 8);

        // lr_G bar (shorter)
        ctx.fillStyle = colors.error;
        ctx.fillRect(vizX - 5, vizY + 4, 25, 8);
        ctx.fillStyle = colors.error;
        ctx.fillText('lr_G', vizX - 8, vizY + 8);

        ctx.restore();
      }
    }
  }
});
