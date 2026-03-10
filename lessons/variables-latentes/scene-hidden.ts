// Scene 1: Hidden Causes — cookie factory analogy, conveyor belt from mysterious box

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Deterministic cookie positions from seeded offsets
const COOKIE_COUNT = 12;
function cookieX(i: number, beltProgress: number, beltLeft: number, beltW: number): number {
  const spacing = beltW / (COOKIE_COUNT + 1);
  const offset = beltProgress * spacing * 3; // scroll speed
  return beltLeft + spacing * (i + 1) - (offset % (beltW + spacing));
}

// Each cookie gets a z-dependent color
const COOKIE_COLORS = [series[0], series[1], series[2], series[3], series[0], series[1],
                        series[2], series[3], series[4], series[0], series[1], series[2]];

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Layout: machine box in center, conveyor belt below
    const machineW = W * 0.28;
    const machineH = H * 0.3;
    const machineX = W * 0.36;
    const machineY = H * 0.2;

    const beltY = machineY + machineH + 15;
    const beltH = 12;
    const beltLeft = W * 0.08;
    const beltRight = W * 0.92;
    const beltW = beltRight - beltLeft;

    // Phase 1: Machine box appears (mysterious)
    const machineP = easedSub(progress, 0.05, 0.2);
    if (machineP > 0) {
      ctx.save();
      ctx.globalAlpha = machineP;

      // Machine body
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(machineX + 8, machineY);
      ctx.lineTo(machineX + machineW - 8, machineY);
      ctx.quadraticCurveTo(machineX + machineW, machineY, machineX + machineW, machineY + 8);
      ctx.lineTo(machineX + machineW, machineY + machineH - 8);
      ctx.quadraticCurveTo(machineX + machineW, machineY + machineH, machineX + machineW - 8, machineY + machineH);
      ctx.lineTo(machineX + 8, machineY + machineH);
      ctx.quadraticCurveTo(machineX, machineY + machineH, machineX, machineY + machineH - 8);
      ctx.lineTo(machineX, machineY + 8);
      ctx.quadraticCurveTo(machineX, machineY, machineX + 8, machineY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Question mark (mystery)
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `bold 36px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', machineX + machineW / 2, machineY + machineH / 2);

      // Machine label
      fadeInText(ctx, tx('scene1', 'machineLabel'), machineX + machineW / 2, machineY - 10, machineP, {
        color: colors.textSecondary, font: `12px ${fonts.body}`
      });

      ctx.restore();
    }

    // Phase 2: Conveyor belt appears
    const beltP = easedSub(progress, 0.15, 0.3);
    if (beltP > 0) {
      ctx.save();
      ctx.globalAlpha = beltP;

      // Belt track
      ctx.fillStyle = colors.axis + '60';
      ctx.fillRect(beltLeft, beltY, beltW, beltH);

      // Belt lines (moving)
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 0.5;
      const lineSpacing = 20;
      const scrollOffset = (progress * 300) % lineSpacing;
      for (let lx = beltLeft - lineSpacing + scrollOffset; lx <= beltRight; lx += lineSpacing) {
        if (lx >= beltLeft && lx <= beltRight) {
          ctx.beginPath();
          ctx.moveTo(lx, beltY);
          ctx.lineTo(lx, beltY + beltH);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Phase 3: Cookies appear on belt (circles of different colors coming from machine)
    const cookieP = easedSub(progress, 0.25, 0.55);
    if (cookieP > 0) {
      const cookieY = beltY - 8;
      const cookieR = 10;

      for (let i = 0; i < COOKIE_COUNT; i++) {
        const cx = cookieX(i, cookieP, beltLeft, beltW);
        // Only draw if on belt
        if (cx >= beltLeft - cookieR && cx <= beltRight + cookieR) {
          const entryProgress = Math.min(1, cookieP * 3 - i * 0.15);
          if (entryProgress > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(entryProgress, 1) * 0.9;
            ctx.beginPath();
            ctx.arc(cx, cookieY, cookieR * easeOut(Math.min(entryProgress, 1)), 0, Math.PI * 2);
            ctx.fillStyle = COOKIE_COLORS[i];
            ctx.fill();

            // Small inner mark to look like cookie
            ctx.beginPath();
            ctx.arc(cx, cookieY, cookieR * 0.4 * easeOut(Math.min(entryProgress, 1)), 0, Math.PI * 2);
            ctx.fillStyle = colors.bodyBg + '80';
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // Cookie label
      fadeInText(ctx, tx('scene1', 'cookieLabel'), beltRight - 30, beltY + beltH + 22, easedSub(progress, 0.35, 0.45), {
        color: series[0], font: `bold 12px ${fonts.body}`
      });
    }

    // Phase 4: Reveal inside — dials/levers representing z
    const revealP = easedSub(progress, 0.5, 0.7);
    if (revealP > 0) {
      ctx.save();
      ctx.globalAlpha = revealP;

      // Replace question mark with dials
      // Re-draw machine background to cover ?
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(machineX + 3, machineY + 3, machineW - 6, machineH - 6);

      // Dial 1
      const dialCx1 = machineX + machineW * 0.3;
      const dialCy = machineY + machineH * 0.4;
      const dialR = 14;

      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dialCx1, dialCy, dialR, 0, Math.PI * 2);
      ctx.stroke();

      // Dial needle
      const needleAngle1 = -Math.PI * 0.3 + revealP * Math.PI * 0.4;
      ctx.beginPath();
      ctx.moveTo(dialCx1, dialCy);
      ctx.lineTo(dialCx1 + dialR * 0.8 * Math.cos(needleAngle1), dialCy + dialR * 0.8 * Math.sin(needleAngle1));
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Dial 2
      const dialCx2 = machineX + machineW * 0.7;
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dialCx2, dialCy, dialR, 0, Math.PI * 2);
      ctx.stroke();

      const needleAngle2 = Math.PI * 0.2 - revealP * Math.PI * 0.3;
      ctx.beginPath();
      ctx.moveTo(dialCx2, dialCy);
      ctx.lineTo(dialCx2 + dialR * 0.8 * Math.cos(needleAngle2), dialCy + dialR * 0.8 * Math.sin(needleAngle2));
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Lever (slider)
      const leverY = machineY + machineH * 0.72;
      const leverLeft = machineX + machineW * 0.2;
      const leverRight = machineX + machineW * 0.8;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leverLeft, leverY);
      ctx.lineTo(leverRight, leverY);
      ctx.stroke();

      // Lever handle
      const handleX = leverLeft + (leverRight - leverLeft) * (0.3 + revealP * 0.2);
      ctx.beginPath();
      ctx.arc(handleX, leverY, 6, 0, Math.PI * 2);
      ctx.fillStyle = series[4];
      ctx.fill();

      // z label
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('z', machineX + machineW / 2, machineY + machineH * 0.2);

      ctx.restore();

      // Settings label
      fadeInText(ctx, tx('scene1', 'settingsLabel'), machineX + machineW / 2, machineY + machineH + 20, easedSub(progress, 0.55, 0.65), {
        color: series[1], font: `bold 12px ${fonts.body}`
      });
    }

    // Phase 5: Arrow from z to x and insight label
    const arrowP = easedSub(progress, 0.7, 0.85);
    if (arrowP > 0) {
      ctx.save();
      ctx.globalAlpha = arrowP;
      animateArrow(ctx, machineX + machineW / 2, machineY + machineH + 6, machineX + machineW / 2, beltY - 12, arrowP, {
        color: colors.accent, headSize: 8
      });

      // z -> x label
      fadeInText(ctx, 'z → x', machineX + machineW / 2 + 20, (machineY + machineH + beltY) / 2, arrowP, {
        color: colors.accent, font: `bold 11px ${fonts.body}`, align: 'left'
      });
      ctx.restore();
    }

    // Phase 6: Summary insight
    const insightP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene1', 'topic').split('.')[0], W / 2, H - 20, insightP, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });
  }
});
