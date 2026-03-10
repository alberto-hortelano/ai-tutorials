// Scene 4: Trade-off — seesaw comparison

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 24,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Comparison table
    const tableX = W * 0.15;
    const tableW = W * 0.7;
    const tableY = 60;
    const rowH = 36;
    const colW = tableW / 3;

    const headers = ['', tx('scene4', 'mafLabel'), tx('scene4', 'iafLabel')];
    const rows = [
      { label: tx('scene4', 'densityLabel') ?? 'Density', maf: tx('scene4', 'densityFast'), iaf: tx('scene4', 'densitySlow'), mafColor: colors.insight, iafColor: colors.error },
      { label: tx('scene4', 'samplingLabel') ?? 'Sampling', maf: tx('scene4', 'samplingSlow'), iaf: tx('scene4', 'samplingFast'), mafColor: colors.error, iafColor: colors.insight },
    ];

    // Header row
    const tableP = easedSub(progress, 0.05, 0.25);
    if (tableP > 0) {
      ctx.save();
      ctx.globalAlpha = tableP;

      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(tableX, tableY, tableW, rowH);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, tableY, tableW, rowH);

      headers.forEach((h, i) => {
        ctx.fillStyle = i === 1 ? series[0] : i === 2 ? series[2] : colors.textPrimary;
        ctx.font = `bold 13px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(h, tableX + colW * i + colW / 2, tableY + rowH / 2 + 4);
      });

      ctx.restore();
    }

    // Data rows
    rows.forEach((row, ri) => {
      const rowP = easedSub(progress, 0.15 + ri * 0.15, 0.35 + ri * 0.15);
      if (rowP <= 0) return;

      ctx.save();
      ctx.globalAlpha = rowP;

      const ry = tableY + (ri + 1) * rowH;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(tableX, ry, tableW, rowH);

      // Row label
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(row.label, tableX + colW / 2, ry + rowH / 2 + 4);

      // MAF cell
      ctx.fillStyle = row.mafColor + '20';
      ctx.fillRect(tableX + colW, ry, colW, rowH);
      ctx.fillStyle = row.mafColor;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.fillText(row.maf, tableX + colW + colW / 2, ry + rowH / 2 + 4);

      // IAF cell
      ctx.fillStyle = row.iafColor + '20';
      ctx.fillRect(tableX + 2 * colW, ry, colW, rowH);
      ctx.fillStyle = row.iafColor;
      ctx.fillText(row.iaf, tableX + 2 * colW + colW / 2, ry + rowH / 2 + 4);

      ctx.restore();
    });

    // Seesaw animation
    const seesawP = easedSub(progress, 0.4, 0.75, easeInOut);
    if (seesawP > 0) {
      const scx = W / 2, scy = H * 0.68;
      const beamW = W * 0.4;
      const beamH = 4;

      // Seesaw tilts: MAF side down for density (left), IAF side down for sampling (right)
      // Oscillate based on progress
      const tiltAngle = Math.sin(seesawP * Math.PI) * 0.15;

      ctx.save();
      ctx.globalAlpha = seesawP;
      ctx.translate(scx, scy);
      ctx.rotate(tiltAngle);

      // Beam
      ctx.fillStyle = colors.textMuted;
      ctx.fillRect(-beamW / 2, -beamH / 2, beamW, beamH);

      // Left bucket (MAF)
      const bktW = 40, bktH = 25;
      ctx.fillStyle = series[0] + '50';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-beamW / 2 - bktW / 2, beamH / 2 + 2, bktW, bktH, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('MAF', -beamW / 2, beamH / 2 + 2 + bktH / 2 + 3);

      // Right bucket (IAF)
      ctx.fillStyle = series[2] + '50';
      ctx.strokeStyle = series[2];
      ctx.beginPath();
      ctx.roundRect(beamW / 2 - bktW / 2, beamH / 2 + 2, bktW, bktH, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[2];
      ctx.fillText('IAF', beamW / 2, beamH / 2 + 2 + bktH / 2 + 3);

      ctx.restore();

      // Fulcrum triangle
      ctx.save();
      ctx.globalAlpha = seesawP;
      ctx.fillStyle = colors.axis;
      ctx.beginPath();
      ctx.moveTo(scx, scy + 2);
      ctx.lineTo(scx - 12, scy + 20);
      ctx.lineTo(scx + 12, scy + 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Application boxes
    const appP = easedSub(progress, 0.75, 0.95);
    if (appP > 0) {
      const appY = H * 0.87;

      ctx.save();
      ctx.globalAlpha = appP;

      // MAF application
      ctx.fillStyle = series[0] + '20';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(W * 0.1, appY - 14, W * 0.35, 28, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene4', 'appMaf'), W * 0.275, appY + 4);

      // IAF application
      ctx.fillStyle = series[2] + '20';
      ctx.strokeStyle = series[2];
      ctx.beginPath();
      ctx.roundRect(W * 0.55, appY - 14, W * 0.35, 28, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[2];
      ctx.fillText(tx('scene4', 'appIaf'), W * 0.725, appY + 4);

      ctx.restore();
    }
  }
});
