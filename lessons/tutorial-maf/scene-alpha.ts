// Scene 3: What is alpha_i? — sigma = exp(alpha)
// "How to read" pattern: formula → reading → symbol table → diagram → insight

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Phase 1: Formula
    const fP = easedSub(progress, 0.05, 0.18);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'alpha_eq',
        '\\sigma_i = \\exp(\\alpha_i)',
        50, 14, fP, { color: colors.textPrimary, fontSize: '1.3em' });
    }

    // Phase 2: "How to read"
    const readP = easedSub(progress, 0.16, 0.3);
    if (readP > 0) {
      const readY = H * 0.26;
      ctx.save();
      ctx.globalAlpha = readP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(W * 0.08, readY - 10, 3, 28);
      ctx.restore();

      typewriterText(ctx, tx('scene3', 'howToRead'), W * 0.12, readY + 6, readP, {
        color: colors.warning, font: `italic 11px ${fonts.body}`
      });
    }

    // Phase 3: Symbol table (3 rows)
    const tableP = easedSub(progress, 0.28, 0.5);
    if (tableP > 0) {
      const tableY = H * 0.36;
      const rowH = 28;
      const symColW = W * 0.28;
      const descColW = W * 0.5;
      const tableX = W * 0.1;

      const symbols = [
        { sym: '\\alpha_i', desc: tx('scene3', 'sym1desc'), range: tx('scene3', 'rangeAlpha') },
        { sym: '\\exp(\\alpha_i)', desc: tx('scene3', 'sym2desc'), range: tx('scene3', 'rangeSigma') },
        { sym: '\\exp(\\alpha_i)^2', desc: tx('scene3', 'sym3desc'), range: tx('scene3', 'rangeSigma') },
      ];

      symbols.forEach((row, i) => {
        const rp = easedSub(progress, 0.28 + i * 0.06, 0.36 + i * 0.06, easeOut);
        if (rp <= 0) return;

        const ry = tableY + i * rowH;
        ctx.save();
        ctx.globalAlpha = rp;

        ctx.fillStyle = i % 2 === 0 ? colors.panelBg : colors.bodyBg;
        ctx.fillRect(tableX, ry, symColW + descColW, rowH);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tableX, ry, symColW + descColW, rowH);

        formulaAppear(state.formulaManager, `alpha_sym${i}`, row.sym,
          ((tableX + symColW / 2) / W) * 100,
          ((ry + rowH / 2) / H) * 100,
          rp, { color: colors.accent, fontSize: '0.85em' });

        ctx.fillStyle = colors.textSecondary;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(row.desc, tableX + symColW + 10, ry + rowH / 2 + 4);

        ctx.restore();
      });
    }

    // Phase 4: Diagram — number line alpha → exp curve → sigma > 0
    const diagP = easedSub(progress, 0.5, 0.8);
    if (diagP > 0) {
      const diagY = H * 0.72;
      const lineLen = W * 0.25;

      ctx.save();
      ctx.globalAlpha = diagP;

      // Alpha number line (left)
      const alphaX = W * 0.12;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(alphaX, diagY);
      ctx.lineTo(alphaX + lineLen, diagY);
      ctx.stroke();

      // Tick marks and labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = `9px ${fonts.mono}`;
      ctx.textAlign = 'center';
      const ticks = ['-2', '0', '2'];
      ticks.forEach((t, i) => {
        const tx_ = alphaX + (i / (ticks.length - 1)) * lineLen;
        ctx.beginPath();
        ctx.moveTo(tx_, diagY - 4);
        ctx.lineTo(tx_, diagY + 4);
        ctx.stroke();
        ctx.fillText(t, tx_, diagY + 14);
      });

      ctx.fillStyle = series[0];
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.fillText('\\u03B1', alphaX + lineLen / 2, diagY - 12);

      // Exp curve in the middle
      const curveX = W * 0.42;
      const curveW = W * 0.16;
      const curveH = 40;

      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let px = 0; px <= 1; px += 0.02) {
        const xVal = -2 + px * 4; // alpha from -2 to 2
        const yVal = Math.exp(xVal);
        const maxY = Math.exp(2);
        const screenX = curveX + px * curveW;
        const screenY = diagY + curveH / 2 - (yVal / maxY) * curveH;
        if (px === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
      }
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('exp()', curveX + curveW / 2, diagY - 18);

      // Arrow from alpha to exp
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(alphaX + lineLen + 5, diagY);
      ctx.lineTo(curveX - 5, diagY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sigma number line (right) — only positive
      const sigmaX = W * 0.65;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sigmaX, diagY);
      ctx.lineTo(sigmaX + lineLen, diagY);
      ctx.stroke();

      // Only positive ticks
      const sigTicks = ['0', '1', '4', '7'];
      sigTicks.forEach((t, i) => {
        const tx_ = sigmaX + (i / (sigTicks.length - 1)) * lineLen;
        ctx.beginPath();
        ctx.moveTo(tx_, diagY - 4);
        ctx.lineTo(tx_, diagY + 4);
        ctx.stroke();
        ctx.fillStyle = colors.textMuted;
        ctx.font = `9px ${fonts.mono}`;
        ctx.textAlign = 'center';
        ctx.fillText(t, tx_, diagY + 14);
      });

      // Highlight: always > 0
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.fillText('\u03C3 > 0', sigmaX + lineLen / 2, diagY - 12);

      // Arrow from exp to sigma
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(curveX + curveW + 5, diagY);
      ctx.lineTo(sigmaX - 5, diagY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Phase 5: Insight box
    const insP = easedSub(progress, 0.82, 0.95);
    if (insP > 0) {
      const insY = H * 0.92;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.1, insY - 14, W * 0.8, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene3', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
