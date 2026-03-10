// Scene 9: Recap — Summary of log p(x) computation, PS3 exercise overview, key concepts

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene9 = new Scene({
  id: () => tx('scene9', 'id'),
  duration: 22,
  narration: () => tx('scene9', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene9 as SceneText)?.subtitleCues ?? (text.es.scene9 as SceneText).subtitleCues,
  topic: () => tx('scene9', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene9', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ─── 4 computation steps ───
    const steps = [
      { key: 'step1', color: series[0] },
      { key: 'step2', color: series[0] },
      { key: 'step3', color: series[1] },
      { key: 'step4', color: colors.accent },
    ];

    const stepY = 50;
    const stepH = 22;

    steps.forEach((step, i) => {
      const sp = easedSub(progress, 0.04 + i * 0.06, 0.12 + i * 0.06, easeOut);
      if (sp <= 0) return;

      const sy = stepY + i * stepH;
      ctx.save();
      ctx.globalAlpha = sp;

      // Step number circle
      const circleX = W * 0.08;
      ctx.fillStyle = step.color + '30';
      ctx.strokeStyle = step.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(circleX, sy + stepH / 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = step.color;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${i + 1}`, circleX, sy + stepH / 2);
      ctx.textBaseline = 'alphabetic';

      // Step text
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText(tx('scene9', step.key), W * 0.14, sy + stepH / 2 + 4);

      ctx.restore();
    });

    // ─── Final formula ───
    const fP = easedSub(progress, 0.3, 0.42);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'recap_eq',
        '\\log p(\\mathbf{x}) = \\log p(\\mathbf{z}_0) - \\sum_{k,i} \\alpha_{k,i}',
        50, 46, fP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // ─── PS3 Exercise table ───
    const ps3P = easedSub(progress, 0.42, 0.68);
    if (ps3P > 0) {
      const tableY = H * 0.55;
      const tableX = W * 0.15;
      const tableW = W * 0.7;
      const rowH = 26;

      ctx.save();
      ctx.globalAlpha = ps3P;

      fadeInText(ctx, tx('scene9', 'ps3Title'), W / 2, tableY - 8, ps3P, {
        color: colors.accent, font: `bold 13px ${fonts.body}`
      });

      const parts = [
        { key: 'partA', color: series[0] },
        { key: 'partB', color: series[2] },
        { key: 'partC', color: series[1] },
      ];

      parts.forEach((part, i) => {
        const pp = easedSub(progress, 0.45 + i * 0.06, 0.53 + i * 0.06, easeOut);
        if (pp <= 0) return;

        const py = tableY + 8 + i * rowH;
        ctx.globalAlpha = pp * ps3P;

        ctx.fillStyle = part.color + '10';
        ctx.strokeStyle = part.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tableX, py, tableW, rowH - 4, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = part.color;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene9', part.key), W / 2, py + rowH / 2);
      });

      ctx.restore();
    }

    // ─── 5 key concepts ───
    const conceptsP = easedSub(progress, 0.68, 0.95);
    if (conceptsP > 0) {
      const conceptY = H * 0.78;
      const conceptKeys = ['concept1', 'concept2', 'concept3', 'concept4', 'concept5'];

      conceptKeys.forEach((key, i) => {
        const cp = easedSub(progress, 0.68 + i * 0.04, 0.76 + i * 0.04, easeOut);
        if (cp <= 0) return;

        const cy = conceptY + i * 16;
        ctx.save();
        ctx.globalAlpha = cp;

        // Bullet
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(W * 0.12, cy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = colors.textSecondary;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene9', key), W * 0.15, cy + 3);

        ctx.restore();
      });
    }
  }
});
