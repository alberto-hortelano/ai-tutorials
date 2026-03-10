// Scene 5: RealNVP — affine coupling, more expressive
// Enhanced: same 2D example with scaling, density adjustment, historical note

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateDots } from '../../engine/animation/particles';
import { sampleGaussian2D } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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

    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const nPts = 150;
    const basePts = sampleGaussian2D(nPts, 77);
    const scale = Math.min(W, H) * 0.09;

    // Side-by-side: NICE vs RealNVP with the same 2D example
    const panelW = W * 0.42;
    const panelH = H * 0.42;
    const panelTop = 55;

    const configs = [
      {
        label: tx('scene5', 'niceLabel'),
        color: series[1],
        start: 0.05, end: 0.45,
        transform: (p: { x: number; y: number }, t: number) => ({
          x: p.x,
          y: p.y + t * Math.sin(2 * p.x), // additive only
        }),
      },
      {
        label: tx('scene5', 'realNvpLabel'),
        color: series[2],
        start: 0.3, end: 0.7,
        transform: (p: { x: number; y: number }, t: number) => {
          const s = 0.3 * Math.sin(1.5 * p.x); // scale function
          const shift = 0.5 * Math.cos(p.x);     // shift function
          return {
            x: p.x,
            y: p.y * Math.exp(t * s) + t * shift, // affine: scale + shift
          };
        },
      },
    ];

    configs.forEach((cfg, i) => {
      const pP = easedSub(progress, cfg.start, cfg.end);
      if (pP <= 0) return;

      const px = i === 0 ? W * 0.03 : W * 0.55;
      const cx = px + panelW / 2;
      const cy = panelTop + panelH / 2;

      ctx.save();
      ctx.globalAlpha = pP;

      // Panel border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, panelTop, panelW, panelH, 6);
      ctx.stroke();

      // Label
      fadeInText(ctx, cfg.label, cx, panelTop - 5, 1, {
        color: cfg.color, font: `bold 12px ${fonts.body}`
      });

      // Before label
      fadeInText(ctx, tx('scene5', 'beforeLabel'), px + 5, panelTop + 12, 1, {
        color: colors.textDimmed, font: `9px ${fonts.body}`, align: 'left'
      });

      // Transform and draw
      const morphT = easedSub(progress, cfg.start + 0.05, cfg.end, easeInOut);
      const pts = basePts.map(p => {
        const tp = cfg.transform(p, morphT);
        return { x: cx + tp.x * scale, y: cy - tp.y * scale };
      });

      animateDots(ctx, pts, Math.min(pP * 2, 1), {
        color: cfg.color, radius: 2.5, sequential: false,
      });

      // Axis cross
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px + 10, cy);
      ctx.lineTo(px + panelW - 10, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, panelTop + 10);
      ctx.lineTo(cx, panelTop + panelH - 10);
      ctx.stroke();

      // For RealNVP: show density adjustment annotation
      if (i === 1 && morphT > 0.5) {
        const annoP = (morphT - 0.5) * 2;
        ctx.globalAlpha = annoP * pP;

        // Show where density is compressed vs stretched
        ctx.fillStyle = colors.insight + '40';
        ctx.font = `8px ${fonts.body}`;
        ctx.textAlign = 'center';

        // Area near x=0 where scale is small (compressed)
        const compX = cx;
        const compY = panelTop + panelH - 18;
        ctx.fillStyle = colors.insight;
        ctx.fillText('density \u2191', compX, compY);

        // Area where scale is large (stretched)
        const strX = cx + 1.5 * scale;
        ctx.fillStyle = colors.warning;
        ctx.fillText('density \u2193', strX, compY);
      }

      ctx.restore();
    });

    // "More expressive" label
    const expP = easedSub(progress, 0.6, 0.72);
    fadeInText(ctx, tx('scene5', 'moreExpressive'), W * 0.75, panelTop + panelH + 12, expP, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });

    // log det label
    const logDetP = easedSub(progress, 0.65, 0.78);
    fadeInText(ctx, tx('scene5', 'logDet'), W / 2, panelTop + panelH + 30, logDetP, {
      color: colors.warning, font: `bold 11px ${fonts.mono}`
    });

    // "First flow with realistic images" historical note
    const histP = easedSub(progress, 0.73, 0.85);
    if (histP > 0) {
      ctx.save();
      ctx.globalAlpha = histP;
      const bx = W / 2, by = H * 0.82;
      ctx.fillStyle = colors.accent + '15';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx - 130, by - 12, 260, 24, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'firstImages'), bx, by + 3);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.82, 0.97);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'rnvp',
        '\\mathbf{x}_2 = \\mathbf{z}_2 \\odot \\exp\\bigl(s(\\mathbf{z}_1)\\bigr) + t(\\mathbf{z}_1)',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1em' });
    }
  }
});
