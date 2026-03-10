// Scene 7: Equation 3 — Triangular Jacobian → −Σαᵢ
// "How to read" + matrix visualization + derivation chain

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 28,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Phase 1: Formula
    const fP = easedSub(progress, 0.04, 0.15);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'eq3',
        '\\log|\\det J| = -\\sum_i \\alpha_i',
        50, 14, fP, { color: colors.textPrimary, fontSize: '1.3em' });
    }

    // Phase 2: "How to read"
    const readP = easedSub(progress, 0.13, 0.26);
    if (readP > 0) {
      const readY = H * 0.24;
      ctx.save();
      ctx.globalAlpha = readP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(W * 0.08, readY - 8, 3, 24);
      ctx.restore();

      typewriterText(ctx, tx('scene7', 'howToRead'), W * 0.12, readY + 6, readP, {
        color: colors.warning, font: `italic 10px ${fonts.body}`
      });
    }

    // Phase 3: Symbol table (3 rows)
    const tableP = easedSub(progress, 0.24, 0.42);
    if (tableP > 0) {
      const tableY = H * 0.32;
      const rowH = 26;
      const symColW = W * 0.25;
      const descColW = W * 0.52;
      const tableX = W * 0.1;

      const symbols = [
        { sym: '\\log|\\det J|', key: 'sym1' },
        { sym: '-\\sum_i \\alpha_i', key: 'sym2' },
        { sym: '\\alpha_i', key: 'sym3' },
      ];

      symbols.forEach((row, i) => {
        const rp = easedSub(progress, 0.24 + i * 0.05, 0.32 + i * 0.05, easeOut);
        if (rp <= 0) return;

        const ry = tableY + i * rowH;
        ctx.save();
        ctx.globalAlpha = rp;

        ctx.fillStyle = i % 2 === 0 ? colors.panelBg : colors.bodyBg;
        ctx.fillRect(tableX, ry, symColW + descColW, rowH);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tableX, ry, symColW + descColW, rowH);

        formulaAppear(state.formulaManager, `eq3_sym${i}`, row.sym,
          ((tableX + symColW / 2) / W) * 100,
          ((ry + rowH / 2) / H) * 100,
          rp, { color: colors.accent, fontSize: '0.85em' });

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene7', `${row.key}desc`), tableX + symColW + 10, ry + rowH / 2 + 4);

        ctx.restore();
      });
    }

    // Phase 4: 3×3 matrix visualization
    const matP = easedSub(progress, 0.4, 0.65);
    if (matP > 0) {
      const matCX = W * 0.3;
      const matCY = H * 0.65;
      const cellSize = Math.min(W * 0.06, 30);
      const n = 3;
      const matW = n * cellSize;
      const matStartX = matCX - matW / 2;
      const matStartY = matCY - matW / 2;

      ctx.save();
      ctx.globalAlpha = matP;

      // Title
      fadeInText(ctx, tx('scene7', 'matrixTitle'), matCX, matStartY - 12, matP, {
        color: colors.textSecondary, font: `bold 10px ${fonts.body}`
      });

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const cx = matStartX + col * cellSize;
          const cy = matStartY + row * cellSize;

          const isDiag = row === col;
          const isLower = row > col;
          const isUpper = row < col;

          // Cell background
          if (isDiag) {
            ctx.fillStyle = colors.accent + '40';
            ctx.strokeStyle = colors.accent;
          } else if (isUpper) {
            ctx.fillStyle = colors.error + '15';
            ctx.strokeStyle = colors.border;
          } else {
            ctx.fillStyle = colors.panelBg;
            ctx.strokeStyle = colors.border;
          }

          ctx.lineWidth = isDiag ? 2 : 0.5;
          ctx.beginPath();
          ctx.rect(cx, cy, cellSize, cellSize);
          ctx.fill();
          ctx.stroke();

          // Cell text
          ctx.font = `${isDiag ? 'bold' : ''} 10px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if (isDiag) {
            ctx.fillStyle = colors.accent;
            ctx.fillText(`1/\u03C3${row + 1}`, cx + cellSize / 2, cy + cellSize / 2);
          } else if (isUpper) {
            ctx.fillStyle = colors.error;
            ctx.fillText('0', cx + cellSize / 2, cy + cellSize / 2);
          } else {
            ctx.fillStyle = colors.textDimmed;
            ctx.fillText('*', cx + cellSize / 2, cy + cellSize / 2);
          }

          ctx.textBaseline = 'alphabetic';
        }
      }

      // Labels
      const labelY = matStartY + matW + 14;
      ctx.fillStyle = colors.accent;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'diagLabel'), matCX, labelY);

      ctx.fillStyle = colors.error;
      ctx.fillText(tx('scene7', 'zerosLabel'), matCX, labelY + 13);

      // Brackets
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      // Left bracket
      ctx.beginPath();
      ctx.moveTo(matStartX - 4, matStartY - 2);
      ctx.lineTo(matStartX - 8, matStartY - 2);
      ctx.lineTo(matStartX - 8, matStartY + matW + 2);
      ctx.lineTo(matStartX - 4, matStartY + matW + 2);
      ctx.stroke();
      // Right bracket
      ctx.beginPath();
      ctx.moveTo(matStartX + matW + 4, matStartY - 2);
      ctx.lineTo(matStartX + matW + 8, matStartY - 2);
      ctx.lineTo(matStartX + matW + 8, matStartY + matW + 2);
      ctx.lineTo(matStartX + matW + 4, matStartY + matW + 2);
      ctx.stroke();

      // "Why triangular?" annotation under matrix
      const whyP = easedSub(progress, 0.48, 0.58);
      if (whyP > 0) {
        const whyY = matStartY + matW + 30;
        ctx.save();
        ctx.globalAlpha = whyP;
        ctx.fillStyle = colors.warning;
        ctx.font = `9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(tx('scene7', 'whyTriangular1'), matCX, whyY);
        ctx.fillText(tx('scene7', 'whyTriangular2'), matCX, whyY + 13);
        ctx.restore();
      }

      ctx.restore();
    }

    // Phase 5: Derivation chain (3 steps on the right)
    const derP = easedSub(progress, 0.55, 0.82);
    if (derP > 0) {
      const derX = W * 0.65;
      const stepY = H * 0.55;
      const stepGap = H * 0.1;

      const steps = [
        { key: 'step1', start: 0.55 },
        { key: 'step2', start: 0.63 },
        { key: 'step3', start: 0.71 },
      ];

      steps.forEach((step, i) => {
        const sp = easedSub(progress, step.start, step.start + 0.08);
        if (sp <= 0) return;

        formulaAppear(state.formulaManager, `eq3_step${i}`, tx('scene7', step.key),
          (derX / W) * 100,
          ((stepY + i * stepGap) / H) * 100,
          sp, { color: colors.textPrimary, fontSize: '0.85em' });

        // Arrow between steps
        if (i > 0 && sp > 0) {
          const prevY = stepY + (i - 1) * stepGap + 10;
          const curY = stepY + i * stepGap - 10;
          ctx.save();
          ctx.globalAlpha = sp;
          ctx.strokeStyle = colors.textDimmed;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(derX, prevY);
          ctx.lineTo(derX, curY);
          ctx.stroke();
          ctx.fillStyle = colors.textDimmed;
          ctx.beginPath();
          ctx.moveTo(derX, curY);
          ctx.lineTo(derX - 3, curY - 5);
          ctx.lineTo(derX + 3, curY - 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });
    }

    // Insight box
    const insP = easedSub(progress, 0.86, 0.97);
    if (insP > 0) {
      const insY = H * 0.92;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.2, insY - 14, W * 0.6, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
