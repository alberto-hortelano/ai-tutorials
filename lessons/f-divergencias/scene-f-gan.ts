// Scene 5: f-GAN Framework — table of f choices and GAN objectives

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Table layout
    const tableTop = 55;
    const tableLeft = 15;
    const tableW = W - 30;
    const rowH = (H - tableTop - 45) / 5; // header + 4 rows
    const colWidths = [tableW * 0.12, tableW * 0.28, tableW * 0.28, tableW * 0.32];

    // Header row
    const headerP = easedSub(progress, 0.05, 0.18);
    if (headerP > 0) {
      ctx.save();
      ctx.globalAlpha = headerP;

      // Header background
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(tableLeft, tableTop, tableW, rowH);

      // Header line
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tableLeft, tableTop + rowH);
      ctx.lineTo(tableLeft + tableW, tableTop + rowH);
      ctx.stroke();

      const headers = [tx('scene5', 'headerF'), tx('scene5', 'headerConj'), tx('scene5', 'headerAct'), tx('scene5', 'headerObj')];
      let cx = tableLeft;
      for (let i = 0; i < headers.length; i++) {
        fadeInText(ctx, headers[i], cx + colWidths[i] / 2, tableTop + rowH / 2, 1, {
          color: colors.textMuted, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
        });
        cx += colWidths[i];
      }

      ctx.restore();
    }

    // Table data
    const rows = [
      { name: 'KL', f: 't ln t', conj: 'e^{s-1}', act: 'exp', obj: 'E_P[T] - E_Q[e^{T-1}]', color: series[0], pStart: 0.15, pEnd: 0.4 },
      { name: 'Rev KL', f: '-ln t', conj: '-1-ln(-s)', act: '-exp(-T)', obj: '-E_P[-T]-E_Q[1+ln T]', color: series[3], pStart: 0.3, pEnd: 0.55 },
      { name: 'JSD', f: 't ln t-(t+1)ln((t+1)/2)', conj: '-ln(2-e^s)', act: 'sigmoid', obj: 'log D + log(1-D)', color: series[4], pStart: 0.45, pEnd: 0.75, highlight: true },
      { name: 'Chi-sq', f: '(t-1)^2', conj: 's^2/4 + s', act: 's/2', obj: 'E_P[T]-E_Q[T^2/4+T]', color: series[2], pStart: 0.6, pEnd: 0.85 },
    ];

    rows.forEach((row, idx) => {
      const rowP = easedSub(progress, row.pStart, row.pEnd);
      if (rowP > 0) {
        const ry = tableTop + rowH * (idx + 1);

        ctx.save();
        ctx.globalAlpha = rowP;

        // Highlight JSD row
        if (row.highlight) {
          ctx.fillStyle = colors.accent + '12';
          ctx.fillRect(tableLeft, ry, tableW, rowH);
        }

        // Row border
        ctx.strokeStyle = colors.border + '60';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(tableLeft, ry + rowH);
        ctx.lineTo(tableLeft + tableW, ry + rowH);
        ctx.stroke();

        // Name column
        let cx = tableLeft;
        fadeInText(ctx, row.name, cx + colWidths[0] / 2, ry + rowH / 2, 1, {
          color: row.color, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
        });
        cx += colWidths[0];

        // f(t) column
        fadeInText(ctx, row.f, cx + colWidths[1] / 2, ry + rowH / 2, 1, {
          color: colors.textSecondary, font: '9px "Courier New", monospace',
        });
        cx += colWidths[1];

        // f*(s) column
        fadeInText(ctx, row.conj, cx + colWidths[2] / 2, ry + rowH / 2, 1, {
          color: colors.textSecondary, font: '9px "Courier New", monospace',
        });
        cx += colWidths[2];

        // Objective column
        fadeInText(ctx, row.obj, cx + colWidths[3] / 2, ry + rowH / 2, 1, {
          color: colors.textSecondary, font: '9px "Courier New", monospace',
        });

        ctx.restore();
      }
    });

    // JSD highlight label
    const jsdHighP = easedSub(progress, 0.7, 0.9);
    if (jsdHighP > 0) {
      const jsdRow = tableTop + rowH * 3;
      fadeInText(ctx, tx('scene5', 'stdGanLabel'), tableLeft + tableW + 5, jsdRow + rowH / 2, jsdHighP, {
        color: colors.accent, font: 'bold 10px "Segoe UI", system-ui, sans-serif', align: 'left',
      });

      // Arrow pointing to JSD row
      ctx.save();
      ctx.globalAlpha = jsdHighP;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tableLeft + tableW + 3, jsdRow + rowH / 2);
      ctx.lineTo(tableLeft + tableW - 2, jsdRow + rowH / 2);
      ctx.stroke();
      ctx.restore();
    }
  },
});
