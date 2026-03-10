// Scene 3: ELBO for Labeled Data — encoder q(z|x,y), decoder p(x|y,z), standard ELBO

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 20,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Diagram layout: x,y -> encoder -> z -> decoder -> x
    const pipeY = H * 0.45;
    const boxH = 40;
    const boxW = W * 0.18;

    // Input box (x, y)
    const inX = W * 0.04;
    // Encoder box
    const encX = W * 0.28;
    // z (latent) circle
    const zCX = W * 0.54;
    // Decoder box
    const decX = W * 0.64;
    // Output (x reconstructed)
    const outX = W * 0.88;

    // Phase 1: Input (x, y)
    const inP = easedSub(progress, 0.06, 0.2);
    if (inP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(inP);

      // x box
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 1.5;
      ctx.fillRect(inX, pipeY - boxH / 2, boxW * 0.55, boxH);
      ctx.strokeRect(inX, pipeY - boxH / 2, boxW * 0.55, boxH);

      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('x', inX + boxW * 0.275, pipeY - 6);

      // y label (small colored chip below x)
      ctx.fillStyle = series[3];
      ctx.fillText('y', inX + boxW * 0.275, pipeY + 10);

      ctx.restore();
    }

    // Phase 2: Encoder box
    const encP = easedSub(progress, 0.18, 0.35);
    if (encP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(encP);

      ctx.fillStyle = series[0] + '25';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.fillRect(encX, pipeY - boxH / 2, boxW, boxH);
      ctx.strokeRect(encX, pipeY - boxH / 2, boxW, boxH);

      ctx.restore();

      fadeInText(ctx, tx('scene3', 'encoderLabel'), encX + boxW / 2, pipeY, encP, {
        color: series[0], font: `bold 11px ${fonts.body}`,
      });

      // Arrow from input to encoder
      animateArrow(ctx, inX + boxW * 0.55 + 5, pipeY, encX - 5, pipeY, encP, {
        color: colors.textMuted, headSize: 6,
      });
    }

    // Phase 3: z latent
    const zP = easedSub(progress, 0.3, 0.48);
    if (zP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(zP);

      ctx.beginPath();
      ctx.arc(zCX, pipeY, 18, 0, Math.PI * 2);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = series[0];
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('z', zCX, pipeY);

      ctx.restore();

      // Arrow encoder -> z
      animateArrow(ctx, encX + boxW + 5, pipeY, zCX - 22, pipeY, zP, {
        color: series[0], headSize: 6,
      });
    }

    // Phase 4: Decoder box
    const decP = easedSub(progress, 0.42, 0.58);
    if (decP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(decP);

      ctx.fillStyle = series[1] + '25';
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2;
      ctx.fillRect(decX, pipeY - boxH / 2, boxW, boxH);
      ctx.strokeRect(decX, pipeY - boxH / 2, boxW, boxH);

      ctx.restore();

      fadeInText(ctx, tx('scene3', 'decoderLabel'), decX + boxW / 2, pipeY, decP, {
        color: series[1], font: `bold 11px ${fonts.body}`,
      });

      // Arrow z -> decoder
      animateArrow(ctx, zCX + 22, pipeY, decX - 5, pipeY, decP, {
        color: series[1], headSize: 6,
      });

      // y also feeds into decoder (arrow from below)
      const yInY = pipeY + boxH / 2 + 20;
      animateArrow(ctx, decX + boxW / 2, yInY, decX + boxW / 2, pipeY + boxH / 2 + 2, decP, {
        color: series[3], headSize: 5, dash: [3, 3],
      });

      fadeInText(ctx, 'y', decX + boxW / 2, yInY + 10, decP, {
        color: series[3], font: `bold 12px ${fonts.body}`,
      });
    }

    // Phase 5: Output x hat
    const outP = easedSub(progress, 0.55, 0.68);
    if (outP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(outP);

      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 1.5;
      ctx.fillRect(outX - boxW * 0.25, pipeY - boxH / 2, boxW * 0.5, boxH);
      ctx.strokeRect(outX - boxW * 0.25, pipeY - boxH / 2, boxW * 0.5, boxH);

      ctx.fillStyle = series[1];
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('x\u0302', outX, pipeY);

      ctx.restore();

      // Arrow decoder -> output
      animateArrow(ctx, decX + boxW + 5, pipeY, outX - boxW * 0.25 - 5, pipeY, outP, {
        color: series[1], headSize: 6,
      });
    }

    // Phase 6: ELBO decomposition
    const f1P = easedSub(progress, 0.65, 0.82);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'labeled-elbo',
        '-\\mathcal{L}(\\mathbf{x},y) = \\mathbb{E}_{q(z|x,y)}[\\log p(\\mathbf{x}|y,z)] - \\mathrm{KL}(q(z|\\mathbf{x},y) \\| p(z))',
        50, 82, f1P, { color: colors.textPrimary, fontSize: '0.88em' });
    }

    // Phase 7: Two-term labels
    const labP = easedSub(progress, 0.8, 0.93);
    if (labP > 0) {
      const reconX = W * 0.25;
      const klX = W * 0.75;
      const labY = H * 0.92;

      fadeInText(ctx, tx('scene3', 'reconLabel'), reconX, labY, labP, {
        color: series[1], font: `bold 11px ${fonts.body}`,
      });
      fadeInText(ctx, tx('scene3', 'klLabel'), klX, labY, labP, {
        color: colors.error, font: `bold 11px ${fonts.body}`,
      });
    }
  },
});
