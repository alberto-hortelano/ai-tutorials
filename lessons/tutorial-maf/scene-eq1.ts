// Scene 2: Equation 1 — Autoregressive factorization
// "How to read" pattern: formula → reading → symbol table → example → insight

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 28,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Phase 1: Formula appears
    const fP = easedSub(progress, 0.04, 0.15);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'eq1',
        'p(\\mathbf{x}) = \\prod_{i=1}^{n} p(x_i \\mid \\mathbf{x}_{<i})',
        50, 15, fP, { color: colors.textPrimary, fontSize: '1.2em' });
    }

    // Phase 2: "How to read" — typewriter in warning/italic with left bar
    const readP = easedSub(progress, 0.15, 0.32);
    if (readP > 0) {
      const readY = H * 0.28;
      ctx.save();
      ctx.globalAlpha = readP;

      // Left accent bar (blockquote style)
      ctx.fillStyle = colors.warning;
      ctx.fillRect(W * 0.08, readY - 12, 3, 36);

      ctx.restore();

      typewriterText(ctx, tx('scene2', 'howToRead'), W * 0.12, readY + 6, readP, {
        color: colors.warning, font: `italic 11px ${fonts.body}`
      });
    }

    // Phase 3: Symbol-by-symbol table
    const tableP = easedSub(progress, 0.3, 0.55);
    if (tableP > 0) {
      const tableY = H * 0.4;
      const rowH = 26;
      const symColW = W * 0.25;
      const descColW = W * 0.55;
      const tableX = W * 0.1;

      const symbols = [
        { sym: 'p(\\mathbf{x})', desc: tx('scene2', 'sym1desc') },
        { sym: '\\prod_{i=1}^{n}', desc: tx('scene2', 'sym2desc') },
        { sym: 'p(x_i \\mid \\mathbf{x}_{<i})', desc: tx('scene2', 'sym3desc') },
        { sym: '\\mathbf{x}_{<i}', desc: tx('scene2', 'sym4desc') },
      ];

      symbols.forEach((row, i) => {
        const rp = easedSub(progress, 0.3 + i * 0.05, 0.38 + i * 0.05, easeOut);
        if (rp <= 0) return;

        const ry = tableY + i * rowH;
        ctx.save();
        ctx.globalAlpha = rp;

        // Row background
        ctx.fillStyle = i % 2 === 0 ? colors.panelBg : colors.bodyBg;
        ctx.fillRect(tableX, ry, symColW + descColW, rowH);
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(tableX, ry, symColW + descColW, rowH);

        // Symbol via KaTeX
        formulaAppear(state.formulaManager, `eq1_sym${i}`, row.sym,
          ((tableX + symColW / 2) / W) * 100,
          ((ry + rowH / 2) / H) * 100,
          rp, { color: colors.accent, fontSize: '0.85em' });

        // Description text
        ctx.fillStyle = colors.textSecondary;
        ctx.font = `11px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(row.desc, tableX + symColW + 10, ry + rowH / 2 + 4);

        ctx.restore();
      });
    }

    // Phase 4: Example n=2
    const exP = easedSub(progress, 0.58, 0.78);
    if (exP > 0) {
      const exY = H * 0.72;

      fadeInText(ctx, tx('scene2', 'exampleTitle'), W / 2, exY - 8, exP, {
        color: colors.textSecondary, font: `bold 12px ${fonts.body}`
      });

      formulaAppear(state.formulaManager, 'eq1_ex1',
        'p(x_1, x_2) = p(x_1) \\cdot p(x_2 \\mid x_1)',
        50, ((exY + 12) / H) * 100, exP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // Phase 5: Insight box
    const insP = easedSub(progress, 0.82, 0.95);
    if (insP > 0) {
      const insY = H * 0.9;
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
      ctx.fillText(tx('scene2', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
