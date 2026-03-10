// Scene 7: Summary — decision table DDPM vs DDIM

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Decision table
    const tableX = W * 0.06;
    const tableW = W * 0.88;
    const tableY = 60;
    const rowH = 36;
    const col1W = tableW * 0.28; // Property
    const col2W = tableW * 0.36; // DDPM
    const col3W = tableW * 0.36; // DDIM

    const rows = [
      { prop: 'rowSpeed', ddpm: 'ddpmSpeed', ddim: 'ddimSpeed', ddpmGood: false, ddimGood: true },
      { prop: 'rowQuality', ddpm: 'ddpmQuality', ddim: 'ddimQuality', ddpmGood: true, ddimGood: true },
      { prop: 'rowDeterminism', ddpm: 'ddpmDeterminism', ddim: 'ddimDeterminism', ddpmGood: false, ddimGood: true },
      { prop: 'rowInterpolation', ddpm: 'ddpmInterpolation', ddim: 'ddimInterpolation', ddpmGood: false, ddimGood: true },
    ];

    // Header row
    const headerP = easedSub(progress, 0.06, 0.16);
    if (headerP > 0) {
      ctx.save();
      ctx.globalAlpha = headerP;

      // Header background
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(tableX, tableY, tableW, rowH);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, tableW, rowH);

      // Column lines
      ctx.beginPath();
      ctx.moveTo(tableX + col1W, tableY);
      ctx.lineTo(tableX + col1W, tableY + rowH);
      ctx.moveTo(tableX + col1W + col2W, tableY);
      ctx.lineTo(tableX + col1W + col2W, tableY + rowH);
      ctx.stroke();

      // Header text
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = colors.textSecondary;
      ctx.fillText(tx('scene7', 'headerProperty'), tableX + col1W / 2, tableY + rowH / 2);

      ctx.fillStyle = colors.error;
      ctx.fillText(tx('scene7', 'headerDDPM'), tableX + col1W + col2W / 2, tableY + rowH / 2);

      ctx.fillStyle = colors.insight;
      ctx.fillText(tx('scene7', 'headerDDIM'), tableX + col1W + col2W + col3W / 2, tableY + rowH / 2);

      ctx.restore();
    }

    // Data rows (staggered)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowStart = 0.14 + i * 0.12;
      const rowP = easedSub(progress, rowStart, rowStart + 0.12);

      if (rowP > 0) {
        ctx.save();
        ctx.globalAlpha = rowP;

        const ry = tableY + rowH * (i + 1);

        // Row background (alternating)
        if (i % 2 === 0) {
          ctx.fillStyle = colors.bodyBg;
        } else {
          ctx.fillStyle = colors.panelBg + '40';
        }
        ctx.fillRect(tableX, ry, tableW, rowH);

        // Row border
        ctx.strokeStyle = colors.border + '60';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tableX, ry, tableW, rowH);

        // Column lines
        ctx.strokeStyle = colors.border + '40';
        ctx.beginPath();
        ctx.moveTo(tableX + col1W, ry);
        ctx.lineTo(tableX + col1W, ry + rowH);
        ctx.moveTo(tableX + col1W + col2W, ry);
        ctx.lineTo(tableX + col1W + col2W, ry + rowH);
        ctx.stroke();

        // Property name
        ctx.fillStyle = colors.textSecondary;
        ctx.font = '11px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tx('scene7', row.prop), tableX + col1W / 2, ry + rowH / 2);

        // DDPM value
        ctx.fillStyle = row.ddpmGood ? colors.insight : colors.textDimmed;
        ctx.font = '11px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(tx('scene7', row.ddpm), tableX + col1W + col2W / 2, ry + rowH / 2);

        // DDIM value
        ctx.fillStyle = row.ddimGood ? colors.insight : colors.textDimmed;
        ctx.fillText(tx('scene7', row.ddim), tableX + col1W + col2W + col3W / 2, ry + rowH / 2);

        ctx.restore();
      }
    }

    // Insight box at bottom
    const insightP = easedSub(progress, 0.8, 0.95);
    if (insightP > 0) {
      ctx.save();
      ctx.globalAlpha = insightP;

      const boxW = W * 0.75;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 55;
      const boxH = 36;

      ctx.fillStyle = colors.accent + '15';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = colors.accent + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'insight'), W / 2, boxY + boxH / 2);

      ctx.restore();
    }
  },
});
