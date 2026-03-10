// Scene 7: When to Use IWAE — sweet spot K=5-50, VAE vs IWAE comparison

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
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
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Comparison table layout
    const tableX = W * 0.1;
    const tableW = W * 0.8;
    const tableY = H * 0.16;
    const rowH = H * 0.09;
    const col1W = tableW * 0.3;
    const col2W = tableW * 0.35;
    const col3W = tableW * 0.35;

    // Phase 1: Table headers
    const hdP = easedSub(progress, 0.05, 0.18);
    if (hdP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(hdP);

      // Header row background
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(tableX, tableY, tableW, rowH);

      // Separator line
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tableX, tableY + rowH);
      ctx.lineTo(tableX + tableW, tableY + rowH);
      ctx.stroke();

      // Headers
      ctx.fillStyle = colors.textMuted;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('', tableX + col1W / 2, tableY + rowH / 2);
      ctx.fillText(tx('scene7', 'vaeLabel'), tableX + col1W + col2W / 2, tableY + rowH / 2);
      ctx.fillText(tx('scene7', 'iwaeLabel'), tableX + col1W + col2W + col3W / 2, tableY + rowH / 2);

      // Vertical dividers
      ctx.beginPath();
      ctx.moveTo(tableX + col1W, tableY);
      ctx.lineTo(tableX + col1W, tableY + rowH * 4);
      ctx.moveTo(tableX + col1W + col2W, tableY);
      ctx.lineTo(tableX + col1W + col2W, tableY + rowH * 4);
      ctx.stroke();

      ctx.restore();
    }

    // Comparison rows
    const rows = [
      { label: 'K', vae: '1', iwae: '5\u201350', color: colors.textPrimary },
      { label: tx('scene7', 'tightnessLabel'), vae: '\u2605', iwae: '\u2605\u2605\u2605', color: colors.insight },
      { label: tx('scene7', 'costLabel'), vae: '\u2605', iwae: '\u2605\u2605', color: colors.warning },
    ];

    for (let i = 0; i < rows.length; i++) {
      const rP = easedSub(progress, 0.15 + i * 0.1, 0.28 + i * 0.1);
      if (rP > 0) {
        const ry = tableY + rowH * (i + 1);

        ctx.save();
        ctx.globalAlpha = easeOut(rP);

        // Row background (alternating)
        if (i % 2 === 0) {
          ctx.fillStyle = colors.bodyBg;
          ctx.fillRect(tableX, ry, tableW, rowH);
        }

        // Separator
        ctx.strokeStyle = colors.border + '60';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(tableX, ry + rowH);
        ctx.lineTo(tableX + tableW, ry + rowH);
        ctx.stroke();

        // Row label
        ctx.fillStyle = colors.textMuted;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rows[i].label, tableX + col1W / 2, ry + rowH / 2);

        // VAE value
        ctx.fillStyle = series[0];
        ctx.font = `bold 12px ${fonts.body}`;
        ctx.fillText(rows[i].vae, tableX + col1W + col2W / 2, ry + rowH / 2);

        // IWAE value
        ctx.fillStyle = rows[i].color;
        ctx.fillText(rows[i].iwae, tableX + col1W + col2W + col3W / 2, ry + rowH / 2);

        ctx.restore();
      }
    }

    // Phase 2: Sweet spot highlight bar
    const sweetP = easedSub(progress, 0.5, 0.7);
    if (sweetP > 0) {
      const barY = H * 0.6;
      const barH = H * 0.12;
      const barLeft = W * 0.1;
      const barRight = W * 0.9;
      const barW = barRight - barLeft;

      // Full bar background (K range 1 to 200)
      ctx.save();
      ctx.globalAlpha = easeOut(sweetP) * 0.3;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(barLeft, barY, barW, barH);
      ctx.restore();

      // Sweet spot region (K=5 to K=50, roughly 2.5% to 25% of range)
      const sweetLeft = barLeft + barW * 0.025;
      const sweetRight = barLeft + barW * 0.25;
      ctx.save();
      ctx.globalAlpha = easeOut(sweetP) * 0.4;
      ctx.fillStyle = colors.insight;
      ctx.fillRect(sweetLeft, barY, (sweetRight - sweetLeft) * easeOut(sweetP), barH);
      ctx.restore();

      // Border
      ctx.save();
      ctx.globalAlpha = easeOut(sweetP) * 0.8;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.strokeRect(sweetLeft, barY, sweetRight - sweetLeft, barH);
      ctx.restore();

      // Labels
      fadeInText(ctx, tx('scene7', 'sweetSpotLabel'), (sweetLeft + sweetRight) / 2, barY + barH / 2, sweetP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`,
      });

      // K=1 and K=200 end labels
      fadeInText(ctx, 'K=1', barLeft, barY + barH + 14, sweetP, {
        color: colors.textDimmed, font: `10px ${fonts.body}`, align: 'left' as CanvasTextAlign,
      });
      fadeInText(ctx, 'K=200', barRight, barY + barH + 14, sweetP, {
        color: colors.textDimmed, font: `10px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });

      // K=5 and K=50 tick marks
      fadeInText(ctx, 'K=5', sweetLeft, barY - 6, sweetP, {
        color: colors.textMuted, font: `10px ${fonts.body}`,
      });
      fadeInText(ctx, 'K=50', sweetRight, barY - 6, sweetP, {
        color: colors.textMuted, font: `10px ${fonts.body}`,
      });
    }

    // Phase 3: Cost vs benefit curve sketch
    const costP = easedSub(progress, 0.72, 0.9);
    if (costP > 0) {
      const miniLeft = W * 0.15;
      const miniRight = W * 0.85;
      const miniTop = H * 0.8;
      const miniBottom = H * 0.94;
      const miniW = miniRight - miniLeft;
      const miniH = miniBottom - miniTop;

      // Benefit curve (diminishing returns)
      ctx.save();
      ctx.globalAlpha = easeOut(costP);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 60;
      const drawSteps = Math.floor(steps * easeOut(costP));
      for (let i = 0; i <= drawSteps; i++) {
        const t = i / steps;
        const benefit = Math.sqrt(t); // diminishing returns
        const x = miniLeft + t * miniW;
        const y = miniBottom - benefit * miniH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Cost curve (linear)
      ctx.strokeStyle = colors.error;
      ctx.beginPath();
      for (let i = 0; i <= drawSteps; i++) {
        const t = i / steps;
        const cost = t; // linear
        const x = miniLeft + t * miniW;
        const y = miniBottom - cost * miniH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Mini labels
      if (costP > 0.5) {
        fadeInText(ctx, tx('scene7', 'tightnessLabel'), miniRight + 5, miniTop + 5, (costP - 0.5) * 2, {
          color: colors.insight, font: `9px ${fonts.body}`, align: 'left' as CanvasTextAlign,
        });
        fadeInText(ctx, tx('scene7', 'costLabel'), miniRight + 5, miniTop + miniH * 0.3, (costP - 0.5) * 2, {
          color: colors.error, font: `9px ${fonts.body}`, align: 'left' as CanvasTextAlign,
        });
      }
    }

    // Insight
    const insightP = easedSub(progress, 0.93, 1.0);
    fadeInText(ctx, tx('scene7', 'topic').split('.')[0], W / 2, H - 10, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
