// Scene 6: The learning framework — diagram build-up

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Draw a cloud shape representing the unknown data distribution. */
function drawCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color + '18';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  // Approximate cloud with overlapping arcs
  ctx.moveTo(cx - w * 0.4, cy + h * 0.3);
  ctx.quadraticCurveTo(cx - w * 0.55, cy - h * 0.1, cx - w * 0.25, cy - h * 0.35);
  ctx.quadraticCurveTo(cx - w * 0.1, cy - h * 0.55, cx + w * 0.15, cy - h * 0.35);
  ctx.quadraticCurveTo(cx + w * 0.45, cy - h * 0.5, cx + w * 0.45, cy - h * 0.1);
  ctx.quadraticCurveTo(cx + w * 0.55, cy + h * 0.15, cx + w * 0.35, cy + h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Draw a rounded box for the model family. */
function drawModelBox(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color + '15';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Draw a pulsing question mark at given position. */
function drawQuestionMark(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Circle background
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fillStyle = color + '25';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Question mark
  ctx.fillStyle = color;
  ctx.font = `bold 16px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x, y);

  // Label below
  ctx.font = `11px ${fonts.body}`;
  ctx.fillText(label, x, y + 26);

  ctx.restore();
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Layout positions
    const diagramY = H * 0.35;
    const cloudX = W * 0.25;
    const boxX = W * 0.75;
    const cloudW = W * 0.2;
    const cloudH = H * 0.18;
    const boxW = W * 0.2;
    const boxH = H * 0.18;

    // Phase 1: Data cloud (p_data)
    const cloudP = easedSub(progress, 0.06, 0.22);
    if (cloudP > 0) {
      drawCloud(ctx, cloudX, diagramY, cloudW, cloudH, series[0], cloudP);
      fadeInText(ctx, tx('scene6', 'dataLabel'), cloudX, diagramY, cloudP, {
        color: series[0], font: `bold 12px ${fonts.mono}`
      });

      // Small dots inside cloud to represent data samples
      ctx.save();
      ctx.globalAlpha = cloudP * 0.6;
      ctx.fillStyle = series[0];
      const dotPositions = [
        [-0.15, -0.1], [0.1, -0.15], [-0.05, 0.1],
        [0.15, 0.05], [-0.2, 0.05], [0.05, -0.05],
        [-0.1, 0.15], [0.2, -0.08],
      ];
      for (const [dx, dy] of dotPositions) {
        ctx.beginPath();
        ctx.arc(cloudX + dx * cloudW, diagramY + dy * cloudH, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Phase 2: Arrow from data to model
    const arrowP = easedSub(progress, 0.2, 0.35);
    if (arrowP > 0) {
      animateArrow(ctx, cloudX + cloudW * 0.6, diagramY, boxX - boxW * 0.6, diagramY, arrowP, {
        color: colors.textMuted, headSize: 10, lineWidth: 2
      });
    }

    // Phase 3: Model box (M: {p_theta})
    const boxP = easedSub(progress, 0.28, 0.42);
    if (boxP > 0) {
      drawModelBox(ctx, boxX, diagramY, boxW, boxH, colors.accent, boxP);
      fadeInText(ctx, tx('scene6', 'modelLabel'), boxX, diagramY - 4, boxP, {
        color: colors.accent, font: `bold 12px ${fonts.mono}`
      });
      // Inner p_theta symbol
      fadeInText(ctx, 'p_\u03b8', boxX, diagramY + 16, boxP, {
        color: colors.accent, font: `14px ${fonts.mono}`
      });
    }

    // Phase 4: Objective formula below via KaTeX overlay
    const formulaP = easedSub(progress, 0.4, 0.6);
    if (formulaP > 0) {
      formulaAppear(
        state.formulaManager,
        'framework-obj',
        '\\min_{\\theta} \\; d(\\,p_{\\text{data}},\\; p_\\theta\\,)',
        50,  // x percent
        65,  // y percent
        formulaP,
        { color: colors.textPrimary, fontSize: '1.4em' }
      );
    }

    // Phase 5: Three question marks positioned near key concepts
    const q1P = easedSub(progress, 0.6, 0.75);
    const q2P = easedSub(progress, 0.68, 0.83);
    const q3P = easedSub(progress, 0.76, 0.9);

    // Q1: near the model box — what family M?
    if (q1P > 0) {
      drawQuestionMark(ctx, boxX, diagramY - boxH * 0.5 - 30, tx('scene6', 'q1'), colors.warning, q1P);
    }

    // Q2: between data and model — what distance d?
    if (q2P > 0) {
      const midX = (cloudX + boxX) / 2;
      drawQuestionMark(ctx, midX, diagramY + cloudH * 0.5 + 35, tx('scene6', 'q2'), colors.error, q2P);
    }

    // Q3: below the box — how to optimize?
    if (q3P > 0) {
      drawQuestionMark(ctx, boxX + boxW * 0.5 + 30, diagramY + boxH * 0.5 + 30, tx('scene6', 'q3'), colors.insight, q3P);
    }

    // Subtitle label for formula
    const objLabelP = easedSub(progress, 0.45, 0.58);
    if (objLabelP > 0) {
      fadeInText(ctx, tx('scene6', 'objectiveLabel'), W / 2, H * 0.6 - 20, objLabelP, {
        color: colors.textDimmed, font: `11px ${fonts.body}`
      });
    }
  }
});
