// Scene 5: Sampling (Slow...) — step-by-step with clock, conditional distributions

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 24,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const N = 6;
    const boxW = Math.min(W * 0.1, 50);
    const boxH = 30;
    const spacing = boxW + 16;
    const startX = W / 2 - (N * spacing) / 2 + boxW / 2;
    const boxY = H * 0.22;

    // Step-by-step sampling: each box appears sequentially with an arrow from prev
    for (let i = 0; i < N; i++) {
      const stepStart = 0.05 + i * 0.12;
      const stepEnd = stepStart + 0.12;
      const stepP = easedSub(progress, stepStart, stepEnd);
      if (stepP <= 0) continue;

      const bx = startX + i * spacing;

      // Step label above
      fadeInText(ctx, `${tx('scene5', 'step')} ${i + 1}`, bx, boxY - 18, easedSub(progress, stepStart, stepStart + 0.05), {
        color: colors.textDimmed, font: `9px ${fonts.body}`
      });

      // Mini conditional distribution curve above the box
      const distP = easedSub(progress, stepStart, stepStart + 0.06);
      if (distP > 0) {
        const distY = boxY + boxH + 10;
        const distH = 28;
        const distW = boxW + 4;
        const distStartX = bx - distW / 2;

        ctx.save();
        ctx.globalAlpha = easeOut(distP) * 0.8;

        // Draw mini bell curve
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const steps = 30;
        const mu = 0.5 + (i * 0.1); // slightly shifting means
        for (let s = 0; s <= steps * distP; s++) {
          const t = s / steps;
          const xVal = t;
          const yVal = gaussian(xVal, mu % 1, 0.15);
          const px = distStartX + t * distW;
          const py = distY + distH - yVal * distH * 0.8;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Sample point (dot on the curve)
        const sampleP = easedSub(progress, stepStart + 0.04, stepStart + 0.08);
        if (sampleP > 0) {
          const sampleX = distStartX + (mu % 1) * distW + (i % 2 === 0 ? 5 : -5);
          const sampleYVal = gaussian((mu % 1) + (i % 2 === 0 ? 0.05 : -0.05), mu % 1, 0.15);
          const sampleYPos = distY + distH - sampleYVal * distH * 0.8;

          ctx.beginPath();
          ctx.arc(sampleX, sampleYPos, 3, 0, Math.PI * 2);
          ctx.fillStyle = colors.warning;
          ctx.globalAlpha = easeOut(sampleP);
          ctx.fill();
        }

        ctx.restore();
      }

      // Variable box
      const boxAppearP = easedSub(progress, stepStart + 0.06, stepStart + 0.1);
      if (boxAppearP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(boxAppearP);

        // Box
        ctx.fillStyle = series[0] + '30';
        ctx.strokeStyle = series[0];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, boxY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = series[0];
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`x${i + 1}`, bx, boxY + boxH / 2);
        ctx.textBaseline = 'alphabetic';

        // Checkmark for completed
        if (boxAppearP > 0.8) {
          ctx.fillStyle = colors.insight;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.fillText('\u2713', bx + boxW / 2 - 4, boxY + 6);
        }

        ctx.restore();
      }

      // Arrow from previous box
      if (i > 0) {
        const arrP = easedSub(progress, stepStart + 0.02, stepStart + 0.07);
        if (arrP > 0) {
          const prevX = startX + (i - 1) * spacing + boxW / 2 + 3;
          const curX = bx - boxW / 2 - 3;
          const mid = boxY + boxH / 2;

          ctx.save();
          ctx.globalAlpha = easeOut(arrP);
          ctx.strokeStyle = colors.error;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, mid);
          ctx.lineTo(prevX + (curX - prevX) * easeOut(arrP), mid);
          ctx.stroke();

          if (arrP > 0.5) {
            ctx.fillStyle = colors.error;
            ctx.beginPath();
            ctx.moveTo(curX, mid);
            ctx.lineTo(curX - 5, mid - 3);
            ctx.lineTo(curX - 5, mid + 3);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // "Waiting..." for the NEXT unfinished box
      if (i < N - 1) {
        const waitP = easedSub(progress, stepStart + 0.08, stepStart + 0.11);
        const nextStepP = easedSub(progress, stepStart + 0.12, stepStart + 0.14);
        if (waitP > 0 && nextStepP < 1) {
          const nextBx = startX + (i + 1) * spacing;
          fadeInText(ctx, tx('scene5', 'waiting'), nextBx, boxY + boxH / 2, waitP * (1 - nextStepP), {
            color: colors.textDimmed, font: `9px ${fonts.body}`
          });
        }
      }
    }

    // Clock ticking animation
    const clockP = easedSub(progress, 0.1, 0.8);
    if (clockP > 0) {
      const clockX = W * 0.9;
      const clockY = H * 0.3;
      const clockR = 18;

      ctx.save();
      ctx.globalAlpha = easeOut(Math.min(clockP * 3, 1));

      // Clock face
      ctx.beginPath();
      ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2);
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clock ticks
      for (let t = 0; t < 12; t++) {
        const angle = (t / 12) * Math.PI * 2 - Math.PI / 2;
        const inner = clockR - 4;
        const outer = clockR - 1;
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(clockX + Math.cos(angle) * inner, clockY + Math.sin(angle) * inner);
        ctx.lineTo(clockX + Math.cos(angle) * outer, clockY + Math.sin(angle) * outer);
        ctx.stroke();
      }

      // Clock hand (rotates with progress)
      const handAngle = clockP * Math.PI * 4 - Math.PI / 2;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.cos(handAngle) * (clockR - 5), clockY + Math.sin(handAngle) * (clockR - 5));
      ctx.stroke();

      ctx.restore();
    }

    // Sequential label
    const seqP = easedSub(progress, 0.75, 0.88);
    fadeInText(ctx, tx('scene5', 'sequential'), W / 2, H * 0.75, seqP, {
      color: colors.error, font: `bold 13px ${fonts.body}`
    });

    // SLOW badge
    const slowP = easedSub(progress, 0.85, 0.95, easeOutBack);
    if (slowP > 0) {
      const sx = W / 2;
      const sy = H * 0.87;

      ctx.save();
      ctx.globalAlpha = slowP;
      ctx.fillStyle = colors.error + '25';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(sx - 60, sy - 16, 120, 32, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.error;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'slow'), sx, sy + 5);
      ctx.restore();
    }
  }
});
