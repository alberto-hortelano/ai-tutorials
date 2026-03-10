// Scene 2: cGAN Architecture — G(z,y), D(x,y)

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { drawGanArchitecture } from '../_shared/gan-utils';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 20,
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

    // Architecture diagram using gan-utils with conditional flag
    const archP = easedSub(progress, 0.1, 0.55);
    if (archP > 0) {
      drawGanArchitecture(ctx, 20, 50, W - 40, H * 0.5, archP, {
        gLabel: tx('scene2', 'gBlock'),
        dLabel: tx('scene2', 'dBlock'),
        showConditional: true,
        condLabel: tx('scene2', 'yInput'),
      });
    }

    // Formula
    const fmP = easedSub(progress, 0.45, 0.65);
    if (fmP > 0) {
      formulaAppear(state.formulaManager, 'cganObj',
        '\\min_G \\max_D \\; \\mathbb{E}_{x,y}[\\log D(x,y)] + \\mathbb{E}_{z,y}[\\log(1-D(G(z,y),y))]',
        50, 72, fmP, { color: colors.accent, fontSize: '0.75em' });
    }

    // Key points below
    const keyPoints = [
      { text: 'G(z, y)', color: colors.accent, pStart: 0.55, pEnd: 0.7 },
      { text: 'D(x, y)', color: series[2], pStart: 0.65, pEnd: 0.8 },
      { text: tx('scene2', 'dOutput'), color: colors.warning, pStart: 0.75, pEnd: 0.9 },
    ];

    const listY = H * 0.78;
    keyPoints.forEach((kp, i) => {
      const kpP = easedSub(progress, kp.pStart, kp.pEnd);
      if (kpP > 0) {
        // Bullet
        ctx.save();
        ctx.globalAlpha = kpP;
        ctx.fillStyle = kp.color;
        ctx.beginPath();
        ctx.arc(35, listY + i * 22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        fadeInText(ctx, kp.text, 48, listY + i * 22, kpP, {
          color: kp.color, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left',
        });
      }
    });

    if (progress > 0.95) {
      state.formulaManager.hide('cganObj');
    }
  },
});
