// Scene 2: Introducing q(z|x) — Multiply/divide by q inside integral

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 24,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    const stepY1 = H * 0.22;
    const stepY2 = H * 0.42;
    const stepY3 = H * 0.62;

    // Step 1: Start from marginal
    const s1P = easedSub(progress, 0.06, 0.22);
    if (s1P > 0) {
      fadeInText(ctx, tx('scene2', 'step1Label'), W * 0.12, stepY1, s1P, {
        color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left',
      });
      formulaAppear(state.formulaManager, 'step1',
        '\\log p(\\mathbf{x}) = \\log \\int p(\\mathbf{x}, \\mathbf{z})\\, d\\mathbf{z}',
        52, 25, s1P, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // Equals sign connecting step 1 and 2
    const eqP1 = easedSub(progress, 0.2, 0.32);
    if (eqP1 > 0) {
      ctx.save();
      ctx.globalAlpha = eqP1;
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 18px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('=', W * 0.08, (stepY1 + stepY2) / 2);
      ctx.restore();
    }

    // Step 2: Insert q(z|x) - multiply and divide
    const s2P = easedSub(progress, 0.22, 0.45);
    if (s2P > 0) {
      fadeInText(ctx, tx('scene2', 'step2Label'), W * 0.12, stepY2, s2P, {
        color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left',
      });
      formulaAppear(state.formulaManager, 'step2',
        '= \\log \\int \\frac{\\textcolor{#818cf8}{p(\\mathbf{x}, \\mathbf{z})}}{\\textcolor{#34d399}{q(\\mathbf{z}|\\mathbf{x})}} \\cdot \\textcolor{#34d399}{q(\\mathbf{z}|\\mathbf{x})}\\, d\\mathbf{z}',
        52, 46, s2P, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // Highlight the q/q insertion with a bracket annotation
    const annotP = easedSub(progress, 0.35, 0.52);
    if (annotP > 0) {
      ctx.save();
      ctx.globalAlpha = annotP;

      // Small annotation box pointing to the q terms
      const annotX = W * 0.78;
      const annotY = stepY2;
      const bw = W * 0.2;
      const bh = 28;
      roundRect(ctx, annotX - bw / 2, annotY - bh / 2, bw, bh, 6);
      ctx.fillStyle = colors.insight + '18';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene2', 'stepLabel'), annotX, annotY);
      ctx.restore();
    }

    // Equals sign between step 2 and 3
    const eqP2 = easedSub(progress, 0.43, 0.55);
    if (eqP2 > 0) {
      ctx.save();
      ctx.globalAlpha = eqP2;
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 18px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('=', W * 0.08, (stepY2 + stepY3) / 2);
      ctx.restore();
    }

    // Step 3: Rewrite as expectation
    const s3P = easedSub(progress, 0.45, 0.68);
    if (s3P > 0) {
      fadeInText(ctx, tx('scene2', 'step3Label'), W * 0.12, stepY3, s3P, {
        color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left',
      });
      formulaAppear(state.formulaManager, 'step3',
        '= \\log\\, \\mathbb{E}_{\\textcolor{#34d399}{q(\\mathbf{z}|\\mathbf{x})}} \\!\\left[\\frac{\\textcolor{#818cf8}{p(\\mathbf{x}, \\mathbf{z})}}{\\textcolor{#34d399}{q(\\mathbf{z}|\\mathbf{x})}}\\right]',
        52, 67, s3P, { color: colors.textPrimary, fontSize: '1.15em' });
    }

    // "Exact" badge at the bottom
    const badgeP = easedSub(progress, 0.72, 0.9);
    if (badgeP > 0) {
      const badgeX = W / 2;
      const badgeY = H * 0.85;
      ctx.save();
      ctx.globalAlpha = badgeP;

      const bw = W * 0.35;
      const bh = 34;
      roundRect(ctx, badgeX - bw / 2, badgeY - bh / 2, bw, bh, 8);
      ctx.fillStyle = colors.accent + '15';
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene2', 'exactBadge') + '  \u2014  ' + tx('scene2', 'exactLabel'), badgeX, badgeY);
      ctx.restore();
    }

    // Color legend
    const legP = easedSub(progress, 0.55, 0.72);
    if (legP > 0) {
      const legY = H * 0.78;
      ctx.save();
      ctx.globalAlpha = legP;

      // p(x,z) accent
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(W * 0.3, legY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.fillText('p(x,z)', W * 0.3 + 10, legY + 4);

      // q(z|x) insight
      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.arc(W * 0.6, legY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('q(z|x)', W * 0.6 + 10, legY + 4);

      ctx.restore();
    }
  },
});
