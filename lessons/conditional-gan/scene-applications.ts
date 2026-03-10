// Scene 7: Applications — pix2pix, text-to-image, class-conditional

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { drawBlock } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 20,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const colW = (W - 30) / 3;
    const panelTop = 55;
    const panelH = H - panelTop - 30;

    // Helper: draw a mini-diagram for an application
    const drawAppPanel = (
      x: number, title: string, desc: string, titleColor: string,
      inputLabel: string, outputLabel: string, panelProgress: number,
    ) => {
      if (panelProgress <= 0) return;

      ctx.save();
      ctx.globalAlpha = panelProgress;

      // Panel border
      ctx.strokeStyle = colors.border + '80';
      ctx.lineWidth = 1;
      const rad = 6;
      ctx.beginPath();
      ctx.moveTo(x + rad, panelTop);
      ctx.lineTo(x + colW - 8 - rad, panelTop);
      ctx.quadraticCurveTo(x + colW - 8, panelTop, x + colW - 8, panelTop + rad);
      ctx.lineTo(x + colW - 8, panelTop + panelH - rad);
      ctx.quadraticCurveTo(x + colW - 8, panelTop + panelH, x + colW - 8 - rad, panelTop + panelH);
      ctx.lineTo(x + rad, panelTop + panelH);
      ctx.quadraticCurveTo(x, panelTop + panelH, x, panelTop + panelH - rad);
      ctx.lineTo(x, panelTop + rad);
      ctx.quadraticCurveTo(x, panelTop, x + rad, panelTop);
      ctx.closePath();
      ctx.fillStyle = colors.panelBg + '60';
      ctx.fill();
      ctx.stroke();

      // Title
      fadeInText(ctx, title, x + (colW - 8) / 2, panelTop + 20, 1, {
        color: titleColor, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
      });

      // Description
      fadeInText(ctx, desc, x + (colW - 8) / 2, panelTop + 40, 1, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });

      // Input box
      const boxW = colW * 0.55;
      const boxH = panelH * 0.2;
      const inY = panelTop + panelH * 0.3;
      const inX = x + (colW - 8 - boxW) / 2;

      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.bodyBg + '80';
      ctx.fillRect(inX, inY, boxW, boxH);
      ctx.strokeRect(inX, inY, boxW, boxH);
      ctx.fillStyle = colors.textSecondary;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(inputLabel, inX + boxW / 2, inY + boxH / 2 + 3);

      // Arrow down
      const arrowX = x + (colW - 8) / 2;
      animateArrow(ctx, arrowX, inY + boxH + 4, arrowX, inY + boxH + 28, 1, {
        color: titleColor, lineWidth: 1.5,
      });

      // cGAN block
      const gY = inY + boxH + 30;
      const gW = colW * 0.45;
      const gX = x + (colW - 8 - gW) / 2;
      drawBlock(ctx, gX, gY, gW, 25, 'cGAN', 1, titleColor);

      // Arrow down
      animateArrow(ctx, arrowX, gY + 29, arrowX, gY + 52, 1, {
        color: titleColor, lineWidth: 1.5,
      });

      // Output box
      const outY = gY + 55;
      ctx.fillStyle = titleColor + '20';
      ctx.fillRect(inX, outY, boxW, boxH);
      ctx.strokeStyle = titleColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(inX, outY, boxW, boxH);
      ctx.fillStyle = titleColor;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(outputLabel, inX + boxW / 2, outY + boxH / 2 + 3);

      ctx.restore();
    };

    // Panel 1: pix2pix
    const p1 = easedSub(progress, 0.08, 0.4);
    drawAppPanel(10, tx('scene7', 'pix2pixTitle'), tx('scene7', 'pix2pixDesc'), series[0],
      'Edges / Segmap', 'Photo', p1);

    // Panel 2: text-to-image
    const p2 = easedSub(progress, 0.3, 0.65);
    drawAppPanel(10 + colW, tx('scene7', 'textImgTitle'), tx('scene7', 'textImgDesc'), series[1],
      '"A red bird..."', 'Generated image', p2);

    // Panel 3: class-conditional
    const p3 = easedSub(progress, 0.5, 0.85);
    drawAppPanel(10 + colW * 2, tx('scene7', 'classCondTitle'), tx('scene7', 'classCondDesc'), series[3],
      'y = "dog"', 'Dog image', p3);

    // Common insight
    const insP = easedSub(progress, 0.88, 1);
    if (insP > 0) {
      fadeInText(ctx, 'Condition = control', W / 2, H - 12, insP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
