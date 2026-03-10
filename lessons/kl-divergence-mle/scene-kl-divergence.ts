// Scene 4: KL Divergence

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { entropy, crossEntropy, klDiscrete, clamp } from '../../engine/shared/math-utils';
import { fairDie, loadedDie } from './scene-entropy';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 25,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const hP = entropy(fairDie);
    const hPQ = crossEntropy(fairDie, loadedDie);
    const kl = klDiscrete(fairDie, loadedDie);

    // Three bars: H(P), H(P,Q), D_KL
    const barArea = { x: W * 0.2, y: H * 0.15, w: W * 0.6, h: H * 0.55 };
    const barH = 30;
    const gap = 20;
    const maxVal = hPQ * 1.2;

    const barsPhase = easedSub(progress, 0.08, 0.5);
    if (barsPhase > 0) {
      // H(P)
      const hPWidth = (hP / maxVal) * barArea.w * easeOut(clamp(barsPhase, 0, 1));
      ctx.fillStyle = colors.textMuted;
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      let y = barArea.y;
      ctx.fillText('H(P)', barArea.x - 10, y + barH / 2);
      ctx.fillStyle = series[0] + 'aa';
      ctx.fillRect(barArea.x, y, hPWidth, barH);
      ctx.fillStyle = series[0];
      ctx.textAlign = 'left';
      ctx.fillText(hP.toFixed(3), barArea.x + hPWidth + 8, y + barH / 2);

      // H(P,Q)
      y += barH + gap;
      const hPQWidth = (hPQ / maxVal) * barArea.w * easeOut(clamp(barsPhase, 0, 1));
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'right';
      ctx.fillText('H(P,Q)', barArea.x - 10, y + barH / 2);
      ctx.fillStyle = series[2] + 'aa';
      ctx.fillRect(barArea.x, y, hPQWidth, barH);
      ctx.fillStyle = series[2];
      ctx.textAlign = 'left';
      ctx.fillText(hPQ.toFixed(3), barArea.x + hPQWidth + 8, y + barH / 2);

      // KL bar (the gap)
      const klPhase = easedSub(progress, 0.35, 0.6);
      if (klPhase > 0) {
        y += barH + gap;
        const klWidth = (kl / maxVal) * barArea.w * easeOut(clamp(klPhase, 0, 1));
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'right';
        ctx.fillText('D_KL(P||Q)', barArea.x - 10, y + barH / 2);
        ctx.fillStyle = colors.error + 'cc';
        ctx.fillRect(barArea.x, y, klWidth, barH);
        ctx.fillStyle = colors.error;
        ctx.textAlign = 'left';
        ctx.fillText(kl.toFixed(3), barArea.x + klWidth + 8, y + barH / 2);

        // Bracket connecting H(P,Q) and H(P)
        const bracketX = barArea.x + hPQWidth + 30;
        const topBarY = barArea.y + barH / 2;
        const midBarY = barArea.y + barH + gap + barH / 2;
        animateArrow(ctx, bracketX + 30, topBarY, bracketX + 30, midBarY, klPhase, {
          color: colors.error, headSize: 6, lineWidth: 1.5
        });
        if (klPhase > 0.5) {
          ctx.globalAlpha = (klPhase - 0.5) * 2;
          ctx.fillStyle = colors.error;
          ctx.font = '10px "Segoe UI", system-ui, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(tx('scene4', 'gapLabel'), bracketX + 36, (topBarY + midBarY) / 2);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Properties
    const propsP = easedSub(progress, 0.65, 0.95);
    if (propsP > 0) {
      const propY = H * 0.78;
      const props = [
        { text: tx('scene4', 'prop1'), color: colors.insight },
        { text: tx('scene4', 'prop2'), color: colors.info },
        { text: tx('scene4', 'prop3'), color: colors.warning },
      ];
      props.forEach((prop, i) => {
        fadeInText(ctx, prop.text, W / 2, propY + i * 24, easedSub(progress, 0.65 + i * 0.08, 0.85 + i * 0.05), {
          color: prop.color, font: '12px "Segoe UI", system-ui, sans-serif'
        });
      });
    }
  }
});
