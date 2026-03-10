// Scene 6: Equation 2 — Multi-layer change of variables
// "How to read" pattern: formula → reading → 7-row symbol table → pipeline diagram

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 30,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.05), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Phase 1: Formula
    const fP = easedSub(progress, 0.03, 0.13);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'eq2',
        '\\log p(\\mathbf{x}) = \\log p(\\mathbf{z}_0) + \\sum_{k=1}^{K} \\log|\\det J_k^{-1}|',
        50, 13, fP, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // Phase 2: "How to read"
    const readP = easedSub(progress, 0.11, 0.22);
    if (readP > 0) {
      const readY = H * 0.22;
      ctx.save();
      ctx.globalAlpha = readP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(W * 0.06, readY - 8, 3, 24);
      ctx.restore();

      typewriterText(ctx, tx('scene6', 'howToRead'), W * 0.09, readY + 6, readP, {
        color: colors.warning, font: `italic 10px ${fonts.body}`
      });
    }

    // Phase 3: Symbol table (7 rows — the largest)
    const tableP = easedSub(progress, 0.2, 0.58);
    if (tableP > 0) {
      const tableY = H * 0.3;
      const rowH = 22;
      const symColW = W * 0.28;
      const descColW = W * 0.52;
      const tableX = W * 0.1;

      const symbols = [
        { key: 'sym1', sym: '\\log p(\\mathbf{x})' },
        { key: 'sym2', sym: '\\log p(\\mathbf{z}_0)' },
        { key: 'sym3', sym: 'K' },
        { key: 'sym7', sym: '\\sum_{k=1}^{K}' },
        { key: 'sym4', sym: '\\log|\\det J_k^{-1}|' },
        { key: 'sym5', sym: '\\mathbf{z}_0' },
        { key: 'sym6', sym: 'J_k^{-1}' },
      ];

      symbols.forEach((row, i) => {
        const rp = easedSub(progress, 0.2 + i * 0.04, 0.27 + i * 0.04, easeOut);
        if (rp <= 0) return;

        const ry = tableY + i * rowH;
        ctx.save();
        ctx.globalAlpha = rp;

        ctx.fillStyle = i % 2 === 0 ? colors.panelBg : colors.bodyBg;
        ctx.fillRect(tableX, ry, symColW + descColW, rowH);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tableX, ry, symColW + descColW, rowH);

        formulaAppear(state.formulaManager, `eq2_sym${i}`, row.sym,
          ((tableX + symColW / 2) / W) * 100,
          ((ry + rowH / 2) / H) * 100,
          rp, { color: colors.accent, fontSize: '0.75em' });

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene6', `${row.key}desc`), tableX + symColW + 8, ry + rowH / 2 + 3);

        ctx.restore();
      });
    }

    // Phase 4: Pipeline diagram
    const pipeP = easedSub(progress, 0.6, 0.85);
    if (pipeP > 0) {
      const pipeY = H * 0.82;
      const nLayers = 4;
      const layerW = 50;
      const gap = 16;
      const totalW = nLayers * layerW + (nLayers - 1) * gap;
      const pipeStartX = W / 2 - totalW / 2;

      ctx.save();
      ctx.globalAlpha = pipeP;

      // "x" label on left
      ctx.fillStyle = series[1];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('x', pipeStartX - 18, pipeY + 4);

      for (let k = 0; k < nLayers; k++) {
        const kp = easedSub(progress, 0.6 + k * 0.05, 0.68 + k * 0.05, easeOut);
        if (kp <= 0) continue;

        const lx = pipeStartX + k * (layerW + gap);

        // Layer box
        const isPermute = k % 2 === 1;
        const layerColor = isPermute ? colors.warning : colors.accent;
        ctx.fillStyle = layerColor + '20';
        ctx.strokeStyle = layerColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(lx, pipeY - 14, layerW, 28, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = layerColor;
        ctx.font = `bold 9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(isPermute ? 'Perm' : `MADE${Math.floor(k / 2) + 1}`, lx + layerW / 2, pipeY + 4);

        // "+log_det" annotation below MADE blocks
        if (!isPermute) {
          ctx.fillStyle = colors.textDimmed;
          ctx.font = `8px ${fonts.mono}`;
          ctx.fillText('+log|det|', lx + layerW / 2, pipeY + 22);
        }

        // Arrow to next
        if (k < nLayers - 1) {
          const arrowStart = lx + layerW + 2;
          const arrowEnd = lx + layerW + gap - 2;
          ctx.strokeStyle = colors.textMuted;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(arrowStart, pipeY);
          ctx.lineTo(arrowEnd, pipeY);
          ctx.stroke();
          ctx.fillStyle = colors.textMuted;
          ctx.beginPath();
          ctx.moveTo(arrowEnd, pipeY);
          ctx.lineTo(arrowEnd - 4, pipeY - 3);
          ctx.lineTo(arrowEnd - 4, pipeY + 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // "z₀" label on right
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('z\u2080', pipeStartX + totalW + 18, pipeY + 4);

      // Arrow from x to first layer
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pipeStartX - 10, pipeY);
      ctx.lineTo(pipeStartX - 2, pipeY);
      ctx.stroke();

      // Arrow from last layer to z0
      ctx.beginPath();
      ctx.moveTo(pipeStartX + totalW + 2, pipeY);
      ctx.lineTo(pipeStartX + totalW + 10, pipeY);
      ctx.stroke();

      ctx.restore();
    }

    // Sum explanation annotation (between pipeline and insight)
    const sumExpP = easedSub(progress, 0.82, 0.90);
    if (sumExpP > 0) {
      fadeInText(ctx, tx('scene6', 'sumExplanation'), W / 2, H * 0.89, sumExpP, {
        color: colors.textSecondary, font: `10px ${fonts.body}`
      });
    }

    // Notation note: fₖ vs f^k
    const noteP = easedSub(progress, 0.78, 0.86);
    if (noteP > 0) {
      fadeInText(ctx, tx('scene6', 'notationNote'), W / 2, H * 0.92, noteP, {
        color: colors.textDimmed, font: `9px ${fonts.body}`
      });
    }

    // Insight box
    const insP = easedSub(progress, 0.88, 0.97);
    if (insP > 0) {
      const insY = H * 0.97;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.15, insY - 12, W * 0.7, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
