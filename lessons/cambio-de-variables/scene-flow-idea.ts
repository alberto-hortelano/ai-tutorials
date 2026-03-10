// Scene 6: The normalizing flow concept

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateDots } from '../../engine/animation/particles';
import { sampleGaussian2D, sampleTwoMoons, lerpPoints } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Pipeline diagram at top
    const pipeP = easedSub(progress, 0.05, 0.25);
    if (pipeP > 0) {
      const pipeY = 60;
      const labels = ['z₀', 'f₁', 'f₂', '...', 'fₖ', 'x'];
      const spacing = W / (labels.length + 1);

      ctx.save();
      ctx.globalAlpha = pipeP;

      labels.forEach((label, i) => {
        const lx = spacing * (i + 1);
        const isFunc = i > 0 && i < labels.length - 1;
        const isEndpoint = i === 0 || i === labels.length - 1;

        if (isEndpoint) {
          // Circle for z₀ and x
          ctx.beginPath();
          ctx.arc(lx, pipeY, 16, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 ? series[0] + '30' : series[2] + '30';
          ctx.fill();
          ctx.strokeStyle = i === 0 ? series[0] : series[2];
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (label !== '...') {
          // Box for functions
          ctx.fillStyle = colors.panelBg;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(lx - 18, pipeY - 14, 36, 28, 4);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = isEndpoint ? (i === 0 ? series[0] : series[2]) : colors.textSecondary;
        ctx.font = isFunc ? `11px ${fonts.body}` : `bold 13px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, lx, pipeY);

        // Arrows between
        if (i < labels.length - 1 && label !== '...') {
          const nextX = spacing * (i + 2);
          const ax1 = lx + (isEndpoint ? 18 : 20);
          const ax2 = nextX - (labels[i + 1] === '...' ? 10 : (i + 1 === labels.length - 1 ? 18 : 20));
          ctx.strokeStyle = colors.textMuted;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ax1, pipeY);
          ctx.lineTo(ax2, pipeY);
          ctx.stroke();
          // Arrowhead
          ctx.fillStyle = colors.textMuted;
          ctx.beginPath();
          ctx.moveTo(ax2, pipeY);
          ctx.lineTo(ax2 - 6, pipeY - 3);
          ctx.lineTo(ax2 - 6, pipeY + 3);
          ctx.closePath();
          ctx.fill();
        }
      });
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // 2D scatter morphing from Gaussian to two-moons
    const scatterTop = 100;
    const scatterH = H - scatterTop - 80;
    const scatterCx = W / 2, scatterCy = scatterTop + scatterH / 2;
    const scale = Math.min(scatterH, W * 0.8) * 0.2;

    const nPts = 200;
    const gaussPts = sampleGaussian2D(nPts, 42);
    const moonPts = sampleTwoMoons(nPts, 0.08, 42);

    const morphT = easedSub(progress, 0.25, 0.7, easeInOut);
    const scatterP = easedSub(progress, 0.15, 0.3);

    if (scatterP > 0) {
      const morphed = lerpPoints(gaussPts, moonPts, morphT);
      const pixelPts = morphed.map(p => ({
        x: scatterCx + p.x * scale,
        y: scatterCy - p.y * scale,
      }));
      animateDots(ctx, pixelPts, scatterP, {
        color: morphT < 0.5 ? series[0] : series[2],
        radius: 3, sequential: false,
      });
    }

    // Labels for the scatter
    if (morphT < 0.3) {
      fadeInText(ctx, tx('scene6', 'gaussianLabel'), scatterCx, scatterTop + scatterH + 15, easedSub(progress, 0.2, 0.3), {
        color: series[0], font: `11px ${fonts.body}`
      });
    }
    if (morphT > 0.7) {
      fadeInText(ctx, tx('scene6', 'complexLabel'), scatterCx, scatterTop + scatterH + 15, easedSub(progress, 0.65, 0.75), {
        color: series[2], font: `11px ${fonts.body}`
      });
    }

    // Properties
    const prop1P = easedSub(progress, 0.72, 0.85);
    const prop2P = easedSub(progress, 0.8, 0.93);

    const propY = H - 50;
    fadeInText(ctx, tx('scene6', 'prop1'), W * 0.3, propY, prop1P, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });
    fadeInText(ctx, tx('scene6', 'prop2'), W * 0.7, propY, prop2P, {
      color: colors.accent, font: `bold 12px ${fonts.body}`
    });
  }
});
