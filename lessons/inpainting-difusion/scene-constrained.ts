// Scene 3: Constrained Reverse Process — two layers merged

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawBlock, drawSimpleArrow } from '../_shared/network-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const layerW = W * 0.32;
    const layerH = H * 0.22;
    const topY = H * 0.18;
    const midY = topY + layerH + 20;

    // Known layer (top-left, green)
    const knownP = easedSub(progress, 0.08, 0.25);
    const knownX = W * 0.08;

    if (knownP > 0) {
      ctx.save();
      ctx.globalAlpha = knownP;

      // Background rectangle
      ctx.fillStyle = colors.insight + '15';
      ctx.fillRect(knownX, topY, layerW, layerH);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.strokeRect(knownX, topY, layerW, layerH);

      // Noise pattern inside (representing noised known pixels)
      const stepP = easedSub(progress, 0.1, 0.7);
      const noiseAlpha = Math.max(0.1, 1 - stepP * 0.8);

      for (let i = 0; i < 15; i++) {
        const x = knownX + 10 + (i % 5) * (layerW - 20) / 4;
        const y = topY + 10 + Math.floor(i / 5) * (layerH - 20) / 2;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.insight;
        ctx.globalAlpha = knownP * (0.4 + noiseAlpha * 0.4);
        ctx.fill();
      }

      ctx.globalAlpha = knownP;
      ctx.restore();
    }

    fadeInText(ctx, tx('scene3', 'knownLayer'), knownX + layerW / 2, topY - 8, knownP, {
      color: colors.insight, font: '10px "Segoe UI", system-ui, sans-serif',
    });

    // Generated layer (top-right, purple/accent)
    const genP = easedSub(progress, 0.2, 0.37);
    const genX = W * 0.6;

    if (genP > 0) {
      ctx.save();
      ctx.globalAlpha = genP;

      ctx.fillStyle = colors.accent + '15';
      ctx.fillRect(genX, topY, layerW, layerH);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(genX, topY, layerW, layerH);

      // Random dots (generated content)
      for (let i = 0; i < 15; i++) {
        const x = genX + 10 + (i % 5) * (layerW - 20) / 4;
        const y = topY + 10 + Math.floor(i / 5) * (layerH - 20) / 2;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.globalAlpha = genP * 0.6;
        ctx.fill();
      }

      ctx.restore();
    }

    fadeInText(ctx, tx('scene3', 'genLayer'), genX + layerW / 2, topY - 8, genP, {
      color: colors.accent, font: '10px "Segoe UI", system-ui, sans-serif',
    });

    // Mask "m" between them
    const maskP = easedSub(progress, 0.3, 0.45);
    if (maskP > 0) {
      ctx.save();
      ctx.globalAlpha = maskP;

      const mX = W / 2;
      const mY = topY + layerH / 2;

      ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = colors.warning;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('m', mX, mY - 10);
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('x', mX, mY + 12);

      ctx.restore();
    }

    // Merge arrows pointing down
    const mergeArrowP = easedSub(progress, 0.45, 0.6);
    drawSimpleArrow(ctx, knownX + layerW / 2, topY + layerH + 4, W / 2 - 20, midY + layerH / 2, mergeArrowP, colors.insight + '80', 7);
    drawSimpleArrow(ctx, genX + layerW / 2, topY + layerH + 4, W / 2 + 20, midY + layerH / 2, mergeArrowP, colors.accent + '80', 7);

    // Merged result (bottom center)
    const mergeP = easedSub(progress, 0.55, 0.75);
    const mergeX = W / 2 - layerW / 2;

    if (mergeP > 0) {
      ctx.save();
      ctx.globalAlpha = mergeP;

      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(mergeX, midY, layerW, layerH);

      // Left part: known (green)
      ctx.fillStyle = colors.insight + '25';
      ctx.fillRect(mergeX, midY, layerW * 0.4, layerH);

      // Right part: generated (purple)
      ctx.fillStyle = colors.accent + '25';
      ctx.fillRect(mergeX + layerW * 0.4, midY, layerW * 0.2, layerH);

      // Left part again
      ctx.fillStyle = colors.insight + '25';
      ctx.fillRect(mergeX + layerW * 0.6, midY, layerW * 0.4, layerH);

      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.strokeRect(mergeX, midY, layerW, layerH);

      ctx.restore();
    }

    // Merge formula
    const mergeFormP = easedSub(progress, 0.7, 0.85);
    fadeInText(ctx, tx('scene3', 'mergeLabel'), W / 2, midY + layerH + 18, mergeFormP, {
      color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });

    // Step indicator showing time progression
    const stepP = easedSub(progress, 0.1, 0.7);
    if (stepP > 0) {
      const tVal = Math.floor((1 - stepP) * 1000);
      ctx.save();
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`t = ${tVal}`, W - 16, topY + 12);
      ctx.restore();
    }
  },
});
