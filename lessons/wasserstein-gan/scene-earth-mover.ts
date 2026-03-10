// Scene 2: Earth Mover Distance — W(P,Q) = min work to reshape P into Q

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const fmP = easedSub(progress, 0.05, 0.18);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'emd',
        'W(P,Q) = \\inf_{\\gamma \\in \\Pi(P,Q)} \\mathbb{E}_{(x,y)\\sim\\gamma}[\\|x-y\\|]',
        50, 13, fmP, { color: colors.accent, fontSize: '0.8em' });
    }

    const midY = H * 0.52;
    const pileW = 50;

    // P distribution "dirt piles" (left side)
    const pPiles = [
      { x: W * 0.15, h: 55, amount: 0.35 },
      { x: W * 0.22, h: 40, amount: 0.25 },
      { x: W * 0.29, h: 65, amount: 0.4 },
    ];

    // Q target "holes" (right side)
    const qPiles = [
      { x: W * 0.65, h: 45, amount: 0.3 },
      { x: W * 0.73, h: 60, amount: 0.35 },
      { x: W * 0.81, h: 50, amount: 0.35 },
    ];

    // Draw P piles
    const pileP = easedSub(progress, 0.1, 0.35);
    if (pileP > 0) {
      ctx.save();
      ctx.globalAlpha = pileP;

      fadeInText(ctx, tx('scene2', 'pile1Label'), W * 0.22, midY + 50, 1, {
        color: series[0], font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      for (const pile of pPiles) {
        const h = pile.h * pileP;
        // Triangle-ish pile
        ctx.fillStyle = series[0] + '40';
        ctx.beginPath();
        ctx.moveTo(pile.x - pileW / 2, midY);
        ctx.lineTo(pile.x, midY - h);
        ctx.lineTo(pile.x + pileW / 2, midY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = series[0];
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw Q target piles
    const qP = easedSub(progress, 0.2, 0.45);
    if (qP > 0) {
      ctx.save();
      ctx.globalAlpha = qP;

      fadeInText(ctx, tx('scene2', 'pile2Label'), W * 0.73, midY + 50, 1, {
        color: colors.insight, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      for (const pile of qPiles) {
        const h = pile.h * qP;
        ctx.fillStyle = colors.insight + '30';
        ctx.beginPath();
        ctx.moveTo(pile.x - pileW / 2, midY);
        ctx.lineTo(pile.x, midY - h);
        ctx.lineTo(pile.x + pileW / 2, midY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Transport lines connecting P to Q
    const transP = easedSub(progress, 0.4, 0.75);
    if (transP > 0) {
      const connections = [
        { from: 0, to: 0, weight: 0.3 },
        { from: 0, to: 1, weight: 0.05 },
        { from: 1, to: 1, weight: 0.25 },
        { from: 2, to: 1, weight: 0.1 },
        { from: 2, to: 2, weight: 0.3 },
      ];

      for (const conn of connections) {
        const lineP = easedSub(progress, 0.4 + conn.from * 0.05, 0.6 + conn.from * 0.05);
        if (lineP > 0) {
          const fromPile = pPiles[conn.from];
          const toPile = qPiles[conn.to];
          const lineWidth = Math.max(1, conn.weight * 8);

          ctx.save();
          ctx.globalAlpha = lineP * 0.6;
          ctx.strokeStyle = colors.warning;
          ctx.lineWidth = lineWidth;
          ctx.setLineDash([3, 3]);

          // Curved connection
          const cpY = midY - 80 - conn.from * 15;
          ctx.beginPath();
          ctx.moveTo(fromPile.x, midY - fromPile.h * 0.5);
          ctx.quadraticCurveTo(
            (fromPile.x + toPile.x) / 2, cpY,
            fromPile.x + (toPile.x - fromPile.x) * lineP, midY - toPile.h * 0.5 * lineP + (midY - fromPile.h * 0.5) * (1 - lineP),
          );
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      // Cost label
      fadeInText(ctx, tx('scene2', 'costLabel'), W / 2, midY - 90, transP, {
        color: colors.warning, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Lines shorten as P approaches Q (animate transport completing)
    const completeP = easedSub(progress, 0.7, 0.9);
    if (completeP > 0) {
      // Show cost decreasing
      const cost = (1 - completeP) * 3.5 + 0.2;
      fadeInText(ctx, `W = ${cost.toFixed(2)}`, W * 0.45, midY + 30, completeP, {
        color: colors.accent, font: 'bold 14px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Insight
    const insP = easedSub(progress, 0.88, 1);
    if (insP > 0) {
      fadeInText(ctx, tx('scene2', 'insight'), W / 2, H - 20, insP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    if (progress > 0.95) {
      state.formulaManager.hide('emd');
    }
  },
});
