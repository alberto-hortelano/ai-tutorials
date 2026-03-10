// Scene 6: Connection to JSD — V(G,D*) = 2*JSD(p_data,p_g) - log4

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';
import type { TimelineState } from '../../engine/types';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 24,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state: TimelineState) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const centerY = H * 0.28;

    // Main formula: V(G, D*) = 2 JSD - log 4
    const mainP = easedSub(progress, 0.08, 0.28);
    if (mainP > 0) {
      formulaAppear(state.formulaManager, 'jsd-main',
        'V(G, D^*) = 2 \\cdot \\text{JSD}(p_{\\text{data}} \\| p_g) - \\log 4',
        50, 22, mainP, { color: colors.textPrimary, fontSize: '1.1em' });
    }

    // JSD definition
    const jsdDefP = easedSub(progress, 0.25, 0.45);
    if (jsdDefP > 0) {
      formulaAppear(state.formulaManager, 'jsd-def',
        '\\text{JSD}(P \\| Q) = \\frac{1}{2} D_{KL}(P \\| M) + \\frac{1}{2} D_{KL}(Q \\| M)',
        50, 40, jsdDefP, { color: series[0], fontSize: '0.95em' });
    }

    // M definition
    const mP = easedSub(progress, 0.4, 0.55);
    if (mP > 0) {
      formulaAppear(state.formulaManager, 'jsd-m',
        'M = \\frac{P + Q}{2}',
        50, 52, mP, { color: colors.textMuted, fontSize: '0.9em' });
    }

    // Visual: Two distributions with symmetric arrows to M
    const vizP = easedSub(progress, 0.45, 0.7);
    if (vizP > 0) {
      const vizY = H * 0.68;
      const pX = W * 0.2;
      const mX = W * 0.5;
      const qX = W * 0.8;

      // P circle
      ctx.save();
      ctx.globalAlpha = vizP;
      ctx.beginPath();
      ctx.arc(pX, vizY, 22, 0, Math.PI * 2);
      ctx.fillStyle = series[0] + '44';
      ctx.fill();
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      fadeInText(ctx, 'P', pX, vizY, vizP, {
        color: series[0], font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });

      // M circle (middle)
      ctx.save();
      ctx.globalAlpha = vizP;
      ctx.beginPath();
      ctx.arc(mX, vizY, 22, 0, Math.PI * 2);
      ctx.fillStyle = colors.warning + '44';
      ctx.fill();
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      fadeInText(ctx, 'M', mX, vizY, vizP, {
        color: colors.warning, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });

      // Q circle
      ctx.save();
      ctx.globalAlpha = vizP;
      ctx.beginPath();
      ctx.arc(qX, vizY, 22, 0, Math.PI * 2);
      ctx.fillStyle = series[2] + '44';
      ctx.fill();
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      fadeInText(ctx, 'Q', qX, vizY, vizP, {
        color: series[2], font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });

      // Arrows P -> M and Q -> M
      animateArrow(ctx, pX + 28, vizY, mX - 28, vizY, vizP, {
        color: series[0], lineWidth: 2
      });
      animateArrow(ctx, qX - 28, vizY, mX + 28, vizY, vizP, {
        color: series[2], lineWidth: 2
      });

      // KL labels on arrows
      if (vizP > 0.5) {
        fadeInText(ctx, 'KL(P||M)', (pX + mX) / 2, vizY - 18, (vizP - 0.5) * 2, {
          color: series[0], font: '10px "Segoe UI", system-ui, sans-serif'
        });
        fadeInText(ctx, 'KL(Q||M)', (qX + mX) / 2, vizY - 18, (vizP - 0.5) * 2, {
          color: series[2], font: '10px "Segoe UI", system-ui, sans-serif'
        });
      }
    }

    // Min value
    const minP = easedSub(progress, 0.7, 0.85);
    if (minP > 0) {
      fadeInText(ctx, tx('scene6', 'minValue'), W / 2, H * 0.84, minP, {
        color: colors.info, font: '12px "Courier New", monospace'
      });
    }

    // Insight
    const insP = easedSub(progress, 0.85, 0.97);
    if (insP > 0) {
      fadeInText(ctx, tx('scene6', 'insight'), W / 2, H - 25, insP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
