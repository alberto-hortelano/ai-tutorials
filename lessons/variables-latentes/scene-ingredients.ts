// Scene 7: Road to ELBO — three ingredients flying in, assembling, arrow to next lesson

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 20,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Three ingredient boxes
    const boxW = W * 0.26;
    const boxH = H * 0.2;
    const boxY = H * 0.22;
    const gap = W * 0.03;
    const totalW = 3 * boxW + 2 * gap;
    const startX = (W - totalW) / 2;

    const boxColors = [colors.error, series[0], colors.warning];
    const ingLabels = ['ing1', 'ing2', 'ing3'];
    const ingIcons = ['p(x)', 'q(z|x)', 'ELBO'];

    const boxTimings = [
      { start: 0.08, end: 0.25 },
      { start: 0.2, end: 0.4 },
      { start: 0.35, end: 0.55 },
    ];

    for (let i = 0; i < 3; i++) {
      const bP = easedSub(progress, boxTimings[i].start, boxTimings[i].end);
      if (bP <= 0) continue;

      const bx = startX + i * (boxW + gap);

      ctx.save();

      // Fly-in from above
      const flyOffset = (1 - easeOutBack(Math.min(bP, 1))) * 40;
      ctx.globalAlpha = bP;

      // Box background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = boxColors[i];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 8, boxY - flyOffset);
      ctx.lineTo(bx + boxW - 8, boxY - flyOffset);
      ctx.quadraticCurveTo(bx + boxW, boxY - flyOffset, bx + boxW, boxY + 8 - flyOffset);
      ctx.lineTo(bx + boxW, boxY + boxH - 8 - flyOffset);
      ctx.quadraticCurveTo(bx + boxW, boxY + boxH - flyOffset, bx + boxW - 8, boxY + boxH - flyOffset);
      ctx.lineTo(bx + 8, boxY + boxH - flyOffset);
      ctx.quadraticCurveTo(bx, boxY + boxH - flyOffset, bx, boxY + boxH - 8 - flyOffset);
      ctx.lineTo(bx, boxY + 8 - flyOffset);
      ctx.quadraticCurveTo(bx, boxY - flyOffset, bx + 8, boxY - flyOffset);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Number badge
      const badgeR = 12;
      const badgeX = bx + boxW / 2;
      const badgeY = boxY + 18 - flyOffset;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
      ctx.fillStyle = boxColors[i] + '30';
      ctx.fill();
      ctx.strokeStyle = boxColors[i];
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = boxColors[i];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), badgeX, badgeY);

      // Icon/symbol
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 16px ${fonts.mono}`;
      ctx.fillText(ingIcons[i], bx + boxW / 2, boxY + boxH * 0.5 - flyOffset);

      // Label
      ctx.fillStyle = boxColors[i];
      ctx.font = `11px ${fonts.body}`;
      ctx.fillText(tx('scene7', ingLabels[i]), bx + boxW / 2, boxY + boxH * 0.78 - flyOffset);

      ctx.restore();
    }

    // Phase 4: Assembly — arrows converging from all three boxes to ELBO
    const assembleP = easedSub(progress, 0.5, 0.7);
    if (assembleP > 0) {
      const targetX = W / 2;
      const targetY = boxY + boxH + H * 0.18;

      for (let i = 0; i < 3; i++) {
        const bx = startX + i * (boxW + gap) + boxW / 2;
        const by = boxY + boxH + 5;
        ctx.save();
        ctx.globalAlpha = assembleP;
        animateArrow(ctx, bx, by, targetX, targetY - 15, assembleP, {
          color: boxColors[i] + '80', headSize: 6
        });
        ctx.restore();
      }

      // ELBO target circle
      const elboP = easedSub(progress, 0.6, 0.78);
      if (elboP > 0) {
        ctx.save();
        ctx.globalAlpha = elboP;

        // Glowing circle
        ctx.beginPath();
        ctx.arc(targetX, targetY, 30 * easeOut(Math.min(elboP, 1)), 0, Math.PI * 2);
        ctx.fillStyle = colors.accent + '20';
        ctx.fill();
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = colors.textPrimary;
        ctx.font = `bold 16px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ELBO', targetX, targetY);

        ctx.restore();
      }
    }

    // Phase 5: ELBO formula
    const fP = easedSub(progress, 0.7, 0.87);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'elbo-preview',
        '\\log p(\\mathbf{x}) \\geq \\underbrace{\\mathbb{E}_{q}[\\log p(\\mathbf{x} \\mid \\mathbf{z})] - D_{\\text{KL}}(q \\| p(\\mathbf{z}))}_{\\text{ELBO}}',
        50, 80, fP, { color: colors.accent, fontSize: '0.9em' });
    }

    // Phase 6: Next lesson pointer
    const nextP = easedSub(progress, 0.88, 1);
    if (nextP > 0) {
      const nextY = H - 25;

      fadeInText(ctx, tx('scene7', 'nextLabel'), W / 2, nextY, nextP, {
        color: colors.insight, font: `bold 13px ${fonts.body}`
      });

      // Animated arrow pointing right
      const arrowBaseX = W / 2 + 90;
      animateArrow(ctx, arrowBaseX, nextY, arrowBaseX + 25, nextY, nextP, {
        color: colors.insight, headSize: 7
      });
    }
  }
});
