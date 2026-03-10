// Scene 4: The Minimax Objective — min_G max_D V(G,D)

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

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 25,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state: TimelineState) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    const centerY = H * 0.32;

    // Main formula: min_G max_D V(G,D)
    const mainP = easedSub(progress, 0.08, 0.22);
    if (mainP > 0) {
      formulaAppear(state.formulaManager, 'minimax-main',
        '\\min_G \\max_D \\; V(G, D)',
        50, 25, mainP, { color: colors.textPrimary, fontSize: '1.3em' });
    }

    // Term 1: E[log D(x)]
    const t1P = easedSub(progress, 0.2, 0.4);
    if (t1P > 0) {
      formulaAppear(state.formulaManager, 'minimax-t1',
        '\\underbrace{\\mathbb{E}_{x \\sim p_{\\text{data}}}[\\log D(x)]}_{\\text{Term 1}}',
        30, 48, t1P, { color: series[0], fontSize: '1.1em' });
    }

    // Plus sign
    const plusP = easedSub(progress, 0.35, 0.45);
    if (plusP > 0) {
      fadeInText(ctx, '+', W * 0.48, centerY + H * 0.13, plusP, {
        color: colors.textPrimary, font: 'bold 20px "Courier New", monospace'
      });
    }

    // Term 2: E[log(1 - D(G(z)))]
    const t2P = easedSub(progress, 0.38, 0.55);
    if (t2P > 0) {
      formulaAppear(state.formulaManager, 'minimax-t2',
        '\\underbrace{\\mathbb{E}_{z \\sim p_z}[\\log(1 - D(G(z)))]}_{\\text{Term 2}}',
        70, 48, t2P, { color: series[2], fontSize: '1.1em' });
    }

    // D pushes up arrows (both terms)
    const dArrP = easedSub(progress, 0.55, 0.72);
    if (dArrP > 0) {
      const arrowY1 = H * 0.6;
      const arrowY2 = H * 0.54;

      // D arrow on term 1
      animateArrow(ctx, W * 0.22, arrowY1, W * 0.22, arrowY2, dArrP, {
        color: colors.insight, lineWidth: 2.5, headSize: 10
      });

      // D arrow on term 2
      animateArrow(ctx, W * 0.72, arrowY1, W * 0.72, arrowY2, dArrP, {
        color: colors.insight, lineWidth: 2.5, headSize: 10
      });

      fadeInText(ctx, tx('scene4', 'dPushes'), W / 2, arrowY1 + 18, dArrP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // G pushes second term down
    const gArrP = easedSub(progress, 0.7, 0.85);
    if (gArrP > 0) {
      const arrStartY = H * 0.68;
      const arrEndY = H * 0.74;

      animateArrow(ctx, W * 0.72, arrStartY, W * 0.72, arrEndY, gArrP, {
        color: colors.error, lineWidth: 2.5, headSize: 10
      });

      fadeInText(ctx, tx('scene4', 'gPushes'), W * 0.72, arrEndY + 18, gArrP, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Zero-sum label
    const zsP = easedSub(progress, 0.85, 0.97);
    if (zsP > 0) {
      fadeInText(ctx, tx('scene4', 'zeroSum'), W / 2, H - 30, zsP, {
        color: colors.warning, font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
