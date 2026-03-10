// Scene 5: The Emergent Classifier — gray dots acquiring colors, decision boundaries

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const rng = mulberry32(54321);
const NUM_DOTS = 150;
const CLASS_COLORS = [series[0], series[1], series[2], series[3]];
const CENTERS = [
  { x: 0.25, y: 0.3 },
  { x: 0.72, y: 0.28 },
  { x: 0.28, y: 0.72 },
  { x: 0.75, y: 0.72 },
];

interface Dot { x: number; y: number; cls: number }
const DOTS: Dot[] = [];
for (let i = 0; i < NUM_DOTS; i++) {
  const cls = Math.floor(rng() * 4);
  DOTS.push({
    x: CENTERS[cls].x + (rng() - 0.5) * 0.28,
    y: CENTERS[cls].y + (rng() - 0.5) * 0.28,
    cls,
  });
}

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Scatter area
    const areaLeft = W * 0.08;
    const areaTop = H * 0.14;
    const areaW = W * 0.84;
    const areaH = H * 0.6;

    // Color transition: gray -> class color based on progress
    const colorTransP = easedSub(progress, 0.35, 0.75);

    // Phase 1: All gray dots
    const dotsP = easedSub(progress, 0.06, 0.3);
    if (dotsP > 0) {
      const visCount = Math.floor(NUM_DOTS * easeOut(Math.min(dotsP, 1)));
      for (let i = 0; i < visCount; i++) {
        const dot = DOTS[i];
        const sx = areaLeft + dot.x * areaW;
        const sy = areaTop + dot.y * areaH;

        // Interpolate from gray to class color
        const dotAlpha = colorTransP;
        const grayAlpha = 1 - dotAlpha;

        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);

        if (colorTransP <= 0) {
          ctx.fillStyle = colors.textDimmed;
        } else {
          // Blend: draw gray first, then overlay color
          ctx.fillStyle = colors.textDimmed;
          ctx.fill();
          ctx.globalAlpha = 0.65 * easeInOut(colorTransP);
          ctx.beginPath();
          ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = CLASS_COLORS[dot.cls];
        }
        ctx.fill();
        ctx.restore();
      }
    }

    // Phase 2: Decision boundaries appear
    const boundP = easedSub(progress, 0.45, 0.7);
    if (boundP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(boundP) * 0.35;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);

      // Vertical boundary
      const midX = areaLeft + areaW * 0.5;
      ctx.beginPath();
      ctx.moveTo(midX, areaTop);
      ctx.lineTo(midX, areaTop + areaH);
      ctx.stroke();

      // Horizontal boundary
      const midY = areaTop + areaH * 0.5;
      ctx.beginPath();
      ctx.moveTo(areaLeft, midY);
      ctx.lineTo(areaLeft + areaW, midY);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    }

    // Phase 3: Before/After labels
    const labelP = easedSub(progress, 0.3, 0.42);
    if (labelP > 0 && colorTransP < 0.5) {
      fadeInText(ctx, tx('scene5', 'beforeLabel'), W / 2, areaTop + areaH + 18, labelP, {
        color: colors.textDimmed, font: `bold 12px ${fonts.body}`,
      });
    }

    const afterP = easedSub(progress, 0.6, 0.72);
    if (afterP > 0) {
      fadeInText(ctx, tx('scene5', 'afterLabel'), W / 2, areaTop + areaH + 18, afterP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`,
      });
    }

    // Phase 4: Classifier label
    const classP = easedSub(progress, 0.75, 0.88);
    if (classP > 0) {
      const boxX = W * 0.2;
      const boxY = H * 0.82;
      const boxW = W * 0.6;
      const boxH = 30;

      ctx.save();
      ctx.globalAlpha = easeOut(classP) * 0.8;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      fadeInText(ctx, tx('scene5', 'classifierLabel'), boxX + boxW / 2, boxY + boxH / 2, classP, {
        color: colors.insight, font: `bold 13px ${fonts.body}`,
      });
    }

    // Phase 5: "Aha" moment
    const ahaP = easedSub(progress, 0.9, 1.0);
    fadeInText(ctx, tx('scene5', 'ahaLabel'), W / 2, H - 12, ahaP, {
      color: colors.warning, font: `bold 12px ${fonts.body}`,
    });
  },
});
