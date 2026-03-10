// Scene 6: From Jensen to ELBO
// log p(x) = log ∫ p(x,z) dz → insert q → Jensen → ELBO. Step-by-step formula building.

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 28,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const fm = state.formulaManager;
    const yBase = 22; // Percentage from top for first formula
    const yStep = 16; // Percentage step between lines

    // Step 1: Definition (0.06 - 0.25)
    // log p(x) = log ∫ p(x,z) dz
    const step1P = easedSub(progress, 0.06, 0.18);
    formulaAppear(fm, 'elbo-step1',
      '\\log p(\\mathbf{x}) = \\log \\int p(\\mathbf{x}, \\mathbf{z})\\, d\\mathbf{z}',
      50, yBase, step1P, { color: colors.textPrimary, fontSize: '1.05em' });

    // Step 1 label
    fadeInText(ctx, tx('scene6', 'step1Label'), W * 0.08, H * (yBase / 100), easedSub(progress, 0.1, 0.18), {
      color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left'
    });

    // Step 2: Insert q (0.22 - 0.42)
    // = log ∫ p(x,z) * q(z)/q(z) dz = log E_q[p(x,z)/q(z)]
    const step2P = easedSub(progress, 0.22, 0.35);
    formulaAppear(fm, 'elbo-step2',
      '= \\log \\int \\frac{p(\\mathbf{x}, \\mathbf{z})}{q(\\mathbf{z})}\\, q(\\mathbf{z})\\, d\\mathbf{z} = \\log\\, \\mathbb{E}_{q}\\!\\left[\\frac{p(\\mathbf{x}, \\mathbf{z})}{q(\\mathbf{z})}\\right]',
      50, yBase + yStep, step2P, { color: colors.textPrimary, fontSize: '1.05em' });

    // Step 2 label
    fadeInText(ctx, tx('scene6', 'step2Label'), W * 0.08, H * ((yBase + yStep) / 100), easedSub(progress, 0.25, 0.35), {
      color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left'
    });

    // Step 3: Apply Jensen (0.42 - 0.62)
    // >= E_q[log p(x,z)/q(z)]
    const step3P = easedSub(progress, 0.42, 0.55);
    formulaAppear(fm, 'elbo-step3',
      '\\geq\\; \\mathbb{E}_{q}\\!\\left[\\log \\frac{p(\\mathbf{x}, \\mathbf{z})}{q(\\mathbf{z})}\\right]',
      50, yBase + yStep * 2, step3P, { color: colors.textPrimary, fontSize: '1.05em' });

    // Step 3 label
    fadeInText(ctx, tx('scene6', 'step3Label'), W * 0.08, H * ((yBase + yStep * 2) / 100), easedSub(progress, 0.45, 0.55), {
      color: colors.textDimmed, font: `11px ${fonts.body}`, align: 'left'
    });

    // Glow the >= sign (animated pulsing)
    const glowP = easedSub(progress, 0.55, 0.7);
    if (glowP > 0) {
      const gx = W * 0.28;
      const gy = H * ((yBase + yStep * 2) / 100);
      const glowAlpha = glowP * (0.4 + 0.3 * Math.sin(progress * 25));
      ctx.fillStyle = colors.warning;
      ctx.globalAlpha = glowAlpha;
      ctx.beginPath();
      ctx.arc(gx, gy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Step 4: ELBO (0.62 - 0.82)
    // = E_q[log p(x,z) - log q(z)] = ELBO
    const step4P = easedSub(progress, 0.62, 0.75);
    formulaAppear(fm, 'elbo-step4',
      '= \\mathbb{E}_{q}\\!\\left[\\log p(\\mathbf{x}, \\mathbf{z}) - \\log q(\\mathbf{z})\\right] \\;\\equiv\\; \\text{ELBO}',
      50, yBase + yStep * 3, step4P, { color: colors.insight, fontSize: '1.1em' });

    // Step 4 label
    fadeInText(ctx, tx('scene6', 'step4Label'), W * 0.08, H * ((yBase + yStep * 3) / 100), easedSub(progress, 0.65, 0.75), {
      color: colors.insight, font: `bold 11px ${fonts.body}`, align: 'left'
    });

    // Summary box at bottom
    const summP = easedSub(progress, 0.82, 0.95);
    if (summP > 0) {
      const boxY = H * 0.85;
      const boxW = W * 0.7;
      const boxH = 36;
      const boxX = (W - boxW) / 2;

      ctx.globalAlpha = summP;
      r.box(boxX, boxY, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.insight, radius: 6, lineWidth: 1.5
      });
      ctx.globalAlpha = 1;

      fadeInText(ctx, 'log p(x)  \u2265  ELBO', W / 2, boxY + boxH / 2, summP, {
        color: colors.insight, font: `bold 14px ${fonts.body}`
      });
    }
  }
});
