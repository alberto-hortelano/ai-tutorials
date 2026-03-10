// Scene 3: Applying Jensen's Inequality — the single step that introduces approximation

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 24,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Jensen's rule box at top
    const ruleP = easedSub(progress, 0.05, 0.2);
    if (ruleP > 0) {
      const boxX = W / 2;
      const boxY = H * 0.15;
      const bw = W * 0.65;
      const bh = 46;
      ctx.save();
      ctx.globalAlpha = ruleP;

      roundRect(ctx, boxX - bw / 2, boxY - bh / 2, bw, bh, 8);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.info;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = colors.info;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene3', 'jensenRule'), boxX, boxY - 10);

      ctx.fillStyle = colors.textSecondary;
      ctx.font = `12px ${fonts.body}`;
      ctx.fillText(tx('scene3', 'jensenDesc'), boxX, boxY + 10);

      ctx.restore();
    }

    // Jensen formula in KaTeX
    const jensenFP = easedSub(progress, 0.12, 0.3);
    if (jensenFP > 0) {
      formulaAppear(state.formulaManager, 'jensen-rule',
        '\\log \\mathbb{E}[X] \\;\\geq\\; \\mathbb{E}[\\log X]',
        50, 30, jensenFP, { color: colors.info, fontSize: '1.1em' });
    }

    // Starting formula (from previous scene)
    const startP = easedSub(progress, 0.18, 0.35);
    if (startP > 0) {
      formulaAppear(state.formulaManager, 'start-eq',
        '\\log p(\\mathbf{x}) = \\log\\, \\mathbb{E}_{q} \\!\\left[\\frac{p(\\mathbf{x}, \\mathbf{z})}{q(\\mathbf{z}|\\mathbf{x})}\\right]',
        50, 45, startP, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // The >= symbol: highlighted, circled
    const geqP = easedSub(progress, 0.35, 0.55);
    if (geqP > 0) {
      const geqX = W / 2;
      const geqY = H * 0.52;

      ctx.save();
      ctx.globalAlpha = geqP;

      // Pulsing circle around >=
      const pulseScale = 1 + 0.08 * Math.sin(progress * Math.PI * 8);
      ctx.translate(geqX, geqY);
      ctx.scale(pulseScale, pulseScale);

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = colors.warning;
      ctx.font = `bold 24px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2265', 0, 0);
      ctx.restore();

      // "Approximation enters here" label
      fadeInText(ctx, tx('scene3', 'approxHere'), geqX + 38, geqY, geqP, {
        color: colors.warning, font: `bold 11px ${fonts.body}`, align: 'left',
      });
    }

    // Result: the ELBO inequality
    const resultP = easedSub(progress, 0.48, 0.7);
    if (resultP > 0) {
      formulaAppear(state.formulaManager, 'elbo-ineq',
        '\\log p(\\mathbf{x}) \\;\\geq\\; \\mathbb{E}_{q(\\mathbf{z}|\\mathbf{x})}\\!\\left[\\log p(\\mathbf{x}, \\mathbf{z}) - \\log q(\\mathbf{z}|\\mathbf{x})\\right]',
        50, 65, resultP, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // Equivalence sign to ELBO definition
    const defP = easedSub(progress, 0.65, 0.82);
    if (defP > 0) {
      const defY = H * 0.78;
      ctx.save();
      ctx.globalAlpha = defP;

      // Triple bar (definition symbol)
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2261', W * 0.38, defY);

      ctx.restore();
    }

    // ELBO label reveal - big green badge
    const elboP = easedSub(progress, 0.72, 0.92);
    if (elboP > 0) {
      const elboX = W / 2;
      const elboY = H * 0.86;
      const bw = W * 0.4;
      const bh = 44;
      ctx.save();
      ctx.globalAlpha = elboP;

      const scale = 0.85 + 0.15 * easeOut(elboP);
      ctx.translate(elboX, elboY);
      ctx.scale(scale, scale);

      roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 10);
      ctx.fillStyle = colors.insight + '20';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // ELBO title
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 20px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene3', 'elboLabel'), 0, -6);

      // Subtitle
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.fillText('Evidence Lower BOund', 0, 14);

      ctx.restore();
    }
  },
});
