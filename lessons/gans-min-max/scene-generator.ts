// Scene 2: The Generator — z ~ N(0,I) -> G_theta(z) -> x_fake

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { animateDots } from '../../engine/animation/particles';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Pre-generate random noise dots (seeded positions)
const NOISE_DOTS: { x: number; y: number }[] = [];
const OUTPUT_DOTS: { x: number; y: number }[] = [];
for (let i = 0; i < 20; i++) {
  const angle = (i / 20) * Math.PI * 2 + (i * 1.37);
  const radius = 0.3 + 0.5 * Math.abs(Math.sin(i * 2.7));
  NOISE_DOTS.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
  // Structured output: cluster around two modes
  const cluster = i % 2 === 0 ? -0.6 : 0.6;
  OUTPUT_DOTS.push({
    x: cluster + 0.15 * Math.cos(i * 1.8),
    y: 0.2 * Math.sin(i * 1.3 + 0.5)
  });
}

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const centerY = H * 0.5;
    const noiseX = W * 0.15;
    const boxX = W * 0.45;
    const outputX = W * 0.78;
    const boxW = 100;
    const boxH = 60;

    // Noise label
    const noiseP = easedSub(progress, 0.08, 0.22);
    if (noiseP > 0) {
      fadeInText(ctx, tx('scene2', 'noiseLabel'), noiseX, centerY - 65, noiseP, {
        color: colors.info, font: '12px "Courier New", monospace'
      });

      // Draw noise dots as a cloud
      const noisePxDots = NOISE_DOTS.map(d => ({
        x: noiseX + d.x * 50,
        y: centerY + d.y * 50
      }));
      animateDots(ctx, noisePxDots, noiseP, {
        color: colors.info, radius: 4, sequential: true
      });
    }

    // Arrow from noise to G box
    const arr1P = easedSub(progress, 0.2, 0.35);
    if (arr1P > 0) {
      animateArrow(ctx, noiseX + 55, centerY, boxX - boxW / 2 - 5, centerY, arr1P, {
        color: colors.textMuted, lineWidth: 2
      });
    }

    // G_theta box
    const boxP = easedSub(progress, 0.28, 0.45);
    if (boxP > 0) {
      ctx.save();
      ctx.globalAlpha = boxP;
      r.box(boxX - boxW / 2, centerY - boxH / 2, boxW, boxH, {
        fill: colors.panelBg, stroke: colors.accent, radius: 10, lineWidth: 2.5
      });
      ctx.restore();

      fadeInText(ctx, tx('scene2', 'gBox'), boxX, centerY, boxP, {
        color: colors.accent, font: 'bold 16px "Courier New", monospace'
      });
    }

    // Arrow from G box to output
    const arr2P = easedSub(progress, 0.4, 0.55);
    if (arr2P > 0) {
      animateArrow(ctx, boxX + boxW / 2 + 5, centerY, outputX - 55, centerY, arr2P, {
        color: colors.textMuted, lineWidth: 2
      });
    }

    // Output dots — structured
    const outP = easedSub(progress, 0.48, 0.7);
    if (outP > 0) {
      fadeInText(ctx, tx('scene2', 'outputLabel'), outputX, centerY - 65, outP, {
        color: colors.warning, font: '12px "Courier New", monospace'
      });

      const outPxDots = OUTPUT_DOTS.map(d => ({
        x: outputX + d.x * 55,
        y: centerY + d.y * 55
      }));
      animateDots(ctx, outPxDots, outP, {
        color: colors.warning, radius: 4, sequential: true
      });
    }

    // Flowing dots animation: noise dots morph to output through box
    const flowP = easedSub(progress, 0.55, 0.85);
    if (flowP > 0) {
      ctx.save();
      ctx.globalAlpha = flowP * 0.6;
      for (let i = 0; i < 8; i++) {
        const t = ((flowP * 3 + i * 0.12) % 1);
        const startPx = noiseX + NOISE_DOTS[i].x * 50;
        const startPy = centerY + NOISE_DOTS[i].y * 50;
        const endPx = outputX + OUTPUT_DOTS[i].x * 55;
        const endPy = centerY + OUTPUT_DOTS[i].y * 55;
        const px = startPx + (endPx - startPx) * t;
        const py = startPy + (endPy - startPy) * t;

        // Color transitions from blue to yellow
        const isBeforeBox = t < 0.4;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = isBeforeBox ? colors.info : colors.warning;
        ctx.fill();
      }
      ctx.restore();
    }

    // Implicit distribution label
    const implP = easedSub(progress, 0.8, 0.95);
    if (implP > 0) {
      fadeInText(ctx, tx('scene2', 'implicitLabel'), W / 2, H - 30, implP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
