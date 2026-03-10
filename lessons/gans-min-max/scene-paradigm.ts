// Scene 1: A New Paradigm — from likelihood to adversarial competition

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const timelineY = H * 0.35;
    const startX = W * 0.1;
    const endX = W * 0.7;

    // Likelihood thread line
    const lineP = easedSub(progress, 0.08, 0.25);
    if (lineP > 0) {
      ctx.save();
      ctx.globalAlpha = lineP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(startX, timelineY);
      ctx.lineTo(startX + (endX - startX) * lineP, timelineY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, tx('scene1', 'likelihoodThread'), (startX + endX) / 2, timelineY - 30, lineP, {
        color: colors.textDimmed, font: '11px "Segoe UI", system-ui, sans-serif'
      });
    }

    // AR Models node
    const arP = easedSub(progress, 0.12, 0.25);
    if (arP > 0) {
      const arX = startX + (endX - startX) * 0.0;
      ctx.beginPath();
      ctx.arc(arX, timelineY, 8 * arP, 0, Math.PI * 2);
      ctx.fillStyle = series[0];
      ctx.fill();
      fadeInText(ctx, tx('scene1', 'arLabel'), arX, timelineY + 22, arP, {
        color: series[0], font: '11px "Segoe UI", system-ui, sans-serif'
      });
    }

    // VAE node
    const vaeP = easedSub(progress, 0.18, 0.32);
    if (vaeP > 0) {
      const vaeX = startX + (endX - startX) * 0.4;
      ctx.beginPath();
      ctx.arc(vaeX, timelineY, 8 * vaeP, 0, Math.PI * 2);
      ctx.fillStyle = series[1];
      ctx.fill();
      fadeInText(ctx, tx('scene1', 'vaeLabel'), vaeX, timelineY + 22, vaeP, {
        color: series[1], font: '11px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Flows node
    const flowP = easedSub(progress, 0.25, 0.4);
    if (flowP > 0) {
      const flowX = startX + (endX - startX) * 0.8;
      ctx.beginPath();
      ctx.arc(flowX, timelineY, 8 * flowP, 0, Math.PI * 2);
      ctx.fillStyle = series[4];
      ctx.fill();
      fadeInText(ctx, tx('scene1', 'flowLabel'), flowX, timelineY + 22, flowP, {
        color: series[4], font: '11px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Scissors cut — diagonal slash through the line
    const cutP = easedSub(progress, 0.42, 0.55);
    if (cutP > 0) {
      const cutX = endX + 20;
      ctx.save();
      ctx.globalAlpha = cutP;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cutX - 12, timelineY - 18 * cutP);
      ctx.lineTo(cutX + 12, timelineY + 18 * cutP);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cutX + 12, timelineY - 18 * cutP);
      ctx.lineTo(cutX - 12, timelineY + 18 * cutP);
      ctx.stroke();
      ctx.restore();
    }

    // GANs box — appears below with versus sign
    const gansP = easedSub(progress, 0.55, 0.75);
    if (gansP > 0) {
      const gansX = W / 2;
      const gansY = H * 0.62;
      const boxW = 180;
      const boxH = 60;

      r.box(gansX - boxW / 2, gansY - boxH / 2, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.accent, radius: 10, lineWidth: 2
      });

      fadeInText(ctx, tx('scene1', 'gansLabel'), gansX, gansY - 8, gansP, {
        color: colors.accent, font: 'bold 22px "Segoe UI", system-ui, sans-serif'
      });

      fadeInText(ctx, tx('scene1', 'vsLabel'), gansX, gansY + 16, gansP, {
        color: colors.warning, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });

      // Arrow from timeline down to GANs box
      animateArrow(ctx, W / 2, timelineY + 30, gansX, gansY - boxH / 2 - 5, gansP, {
        color: colors.error, lineWidth: 2, dash: [4, 4]
      });
    }

    // Break label
    const breakP = easedSub(progress, 0.75, 0.9);
    if (breakP > 0) {
      fadeInText(ctx, tx('scene1', 'breakLabel'), W / 2, H * 0.82, breakP, {
        color: colors.error, font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
