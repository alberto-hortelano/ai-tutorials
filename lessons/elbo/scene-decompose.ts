// Scene 4: ELBO = Reconstruction - KL decomposition

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { roundRect } from '../../engine/shared/canvas-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 24,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Full ELBO formula at top
    const fullP = easedSub(progress, 0.06, 0.22);
    if (fullP > 0) {
      formulaAppear(state.formulaManager, 'elbo-full',
        '\\text{ELBO} = \\underbrace{\\mathbb{E}_{q}[\\log p(\\mathbf{x}|\\mathbf{z})]}_{\\textcolor{#34d399}{\\text{Reconstruction}}} \\;-\\; \\underbrace{D_{\\text{KL}}\\big(q(\\mathbf{z}|\\mathbf{x}) \\,\\|\\, p(\\mathbf{z})\\big)}_{\\textcolor{#f87171}{\\text{Regularization}}}',
        50, 22, fullP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // Two-column layout for the terms
    const colLeft = W * 0.28;
    const colRight = W * 0.72;
    const termTop = H * 0.38;

    // Reconstruction term (green, left)
    const reconP = easedSub(progress, 0.25, 0.5);
    if (reconP > 0) {
      const boxW = W * 0.38;
      const boxH = H * 0.32;
      const bx = colLeft - boxW / 2;
      const by = termTop;

      ctx.save();
      ctx.globalAlpha = reconP;

      roundRect(ctx, bx, by, boxW, boxH, 10);
      ctx.fillStyle = colors.insight + '10';
      ctx.fill();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Term label
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene4', 'reconLabel'), colLeft, by + 22);

      // Formula
      ctx.fillStyle = colors.insight;
      ctx.font = `13px ${fonts.mono}`;
      ctx.fillText(tx('scene4', 'reconDesc'), colLeft, by + 50);

      // Divider line
      ctx.strokeStyle = colors.insight + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 15, by + 70);
      ctx.lineTo(bx + boxW - 15, by + 70);
      ctx.stroke();

      // Icon: decoder quality visual
      const iconY = by + boxH * 0.62;
      const iconR = 16;

      // Input image placeholder
      ctx.fillStyle = colors.accent + '50';
      roundRect(ctx, colLeft - 38, iconY - iconR, iconR * 2, iconR * 2, 3);
      ctx.fill();
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('x', colLeft - 22, iconY + 4);

      // Arrow
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(colLeft - 2, iconY);
      ctx.lineTo(colLeft + 10, iconY);
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.moveTo(colLeft + 10, iconY);
      ctx.lineTo(colLeft + 5, iconY - 3);
      ctx.lineTo(colLeft + 5, iconY + 3);
      ctx.closePath();
      ctx.fill();

      // Output image placeholder
      ctx.fillStyle = colors.insight + '50';
      roundRect(ctx, colLeft + 14, iconY - iconR, iconR * 2, iconR * 2, 3);
      ctx.fill();
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('x\u0302', colLeft + 30, iconY + 4);

      // Description
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.fillText(tx('scene4', 'reconIcon'), colLeft, by + boxH - 16);

      ctx.restore();
    }

    // KL term (red, right)
    const klP = easedSub(progress, 0.4, 0.65);
    if (klP > 0) {
      const boxW = W * 0.38;
      const boxH = H * 0.32;
      const bx = colRight - boxW / 2;
      const by = termTop;

      ctx.save();
      ctx.globalAlpha = klP;

      roundRect(ctx, bx, by, boxW, boxH, 10);
      ctx.fillStyle = colors.error + '10';
      ctx.fill();
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Term label
      ctx.fillStyle = colors.error;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('-' + tx('scene4', 'klLabel'), colRight, by + 22);

      // Formula
      ctx.fillStyle = colors.error;
      ctx.font = `12px ${fonts.mono}`;
      ctx.fillText(tx('scene4', 'klDesc'), colRight, by + 50);

      // Divider
      ctx.strokeStyle = colors.error + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx + 15, by + 70);
      ctx.lineTo(bx + boxW - 15, by + 70);
      ctx.stroke();

      // Icon: two Gaussians (q and prior) wanting to be close
      const iconY = by + boxH * 0.62;

      // q(z|x) curve (narrower)
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) {
        const t = i / 20;
        const gx = colRight - 15 + t * 25;
        const gy = iconY - 18 * Math.exp(-t * t * 4);
        if (i === -20) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();

      // p(z) prior curve (broader)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) {
        const t = i / 20;
        const gx = colRight + 5 + t * 30;
        const gy = iconY - 12 * Math.exp(-t * t * 2);
        if (i === -20) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Small legend
      ctx.font = `9px ${fonts.body}`;
      ctx.fillStyle = colors.insight;
      ctx.fillText('q(z|x)', colRight - 30, iconY + 14);
      ctx.fillStyle = colors.accent;
      ctx.fillText('p(z)', colRight + 18, iconY + 14);

      // Description
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.fillText(tx('scene4', 'klIcon'), colRight, by + boxH - 16);

      ctx.restore();
    }

    // Plus/minus sign between the boxes
    const signP = easedSub(progress, 0.5, 0.65);
    if (signP > 0) {
      ctx.save();
      ctx.globalAlpha = signP;
      ctx.fillStyle = colors.textSecondary;
      ctx.font = `bold 24px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2212', W / 2, termTop + H * 0.16);
      ctx.restore();
    }

    // Bottom summary with ELBO = recon - KL
    const sumP = easedSub(progress, 0.78, 0.95);
    if (sumP > 0) {
      formulaAppear(state.formulaManager, 'elbo-summary',
        '\\boxed{\\;\\text{ELBO} = \\textcolor{#34d399}{\\text{Recon}} - \\textcolor{#f87171}{\\text{KL}}\\;}',
        50, 92, sumP, { color: colors.textPrimary, fontSize: '1.2em' });
    }
  },
});
