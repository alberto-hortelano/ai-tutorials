// Scene 5: Composition of flows — log-determinants add
// Enhanced: chain rule visualization with det product → log sum

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { stdNormalPdf } from '../_shared/flow-utils';
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

    // Three-panel pipeline: z → f₁ → h → f₂ → x
    const panelW = W * 0.26;
    const panelH = H * 0.28;
    const panelTop = H * 0.15;
    const gapX = (W - 3 * panelW) / 4;

    const panels = [
      { label: tx('scene5', 'zLabel'), color: series[0], start: 0.05, end: 0.3,
        fn: (x: number) => stdNormalPdf(x) },
      { label: tx('scene5', 'hLabel'), color: series[1], start: 0.2, end: 0.45,
        fn: (x: number) => 0.35 * Math.exp(-0.5 * ((x - 0.5) / 0.8) ** 2) + 0.15 * Math.exp(-0.5 * ((x + 1.5) / 0.5) ** 2) },
      { label: tx('scene5', 'xLabel'), color: series[2], start: 0.35, end: 0.6,
        fn: (x: number) => 0.2 * Math.exp(-0.5 * ((x - 1.5) / 0.6) ** 2) + 0.25 * Math.exp(-0.5 * ((x + 0.8) / 0.4) ** 2) + 0.1 * Math.exp(-0.5 * ((x - 3) / 0.5) ** 2) },
    ];

    const xMin = -4, xMax = 4;

    panels.forEach((panel, i) => {
      const pP = easedSub(progress, panel.start, panel.end);
      if (pP <= 0) return;

      const px = gapX + i * (panelW + gapX);

      ctx.save();
      ctx.globalAlpha = pP;

      // Panel background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, panelTop, panelW, panelH, 6);
      ctx.fill();
      ctx.stroke();

      // Label
      fadeInText(ctx, panel.label, px + panelW / 2, panelTop - 8, 1, {
        color: panel.color, font: `bold 12px ${fonts.body}`
      });

      // Mini curve
      const toX = (x: number) => px + 8 + ((x - xMin) / (xMax - xMin)) * (panelW - 16);
      const toY = (y: number) => panelTop + panelH - 10 - (y / 0.45) * (panelH - 30);

      ctx.fillStyle = panel.color + '20';
      ctx.beginPath();
      ctx.moveTo(toX(xMin), toY(0));
      const steps = 150;
      for (let s = 0; s <= steps; s++) {
        const x = xMin + (s / steps) * (xMax - xMin);
        ctx.lineTo(toX(x), toY(panel.fn(x) * pP));
      }
      ctx.lineTo(toX(xMax), toY(0));
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = panel.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const x = xMin + (s / steps) * (xMax - xMin);
        const sx = toX(x), sy = toY(panel.fn(x) * pP);
        if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      ctx.restore();
    });

    // Arrows between panels
    for (let i = 0; i < 2; i++) {
      const arrP = easedSub(progress, 0.15 + i * 0.15, 0.35 + i * 0.15);
      if (arrP > 0) {
        const px1 = gapX + (i + 1) * (panelW + gapX) - gapX + 5;
        const px2 = gapX + (i + 1) * (panelW + gapX) - 5;
        const ay = panelTop + panelH / 2;
        animateArrow(ctx, px1, ay, px2, ay, arrP, {
          color: colors.textMuted, lineWidth: 2, headSize: 8
        });
        ctx.save();
        ctx.globalAlpha = arrP;
        ctx.fillStyle = colors.accent;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`f${i + 1}`, (px1 + px2) / 2, ay - 10);
        ctx.restore();
      }
    }

    // --- Chain rule: determinant multiplication section ---
    const detSectionY = panelTop + panelH + 20;

    // Show individual determinant badges under each arrow
    const det1P = easedSub(progress, 0.4, 0.52);
    const det2P = easedSub(progress, 0.46, 0.58);

    const detValues = [
      { label: tx('scene5', 'det1'), x: gapX + panelW + gapX / 2, color: series[0] },
      { label: tx('scene5', 'det2'), x: gapX + 2 * panelW + 1.5 * gapX, color: series[1] },
    ];

    [det1P, det2P].forEach((dP, i) => {
      if (dP > 0) {
        const det = detValues[i];
        ctx.save();
        ctx.globalAlpha = dP;
        ctx.fillStyle = det.color + '25';
        ctx.strokeStyle = det.color;
        ctx.lineWidth = 1.5;
        const bw = 90, bh = 22;
        ctx.beginPath();
        ctx.roundRect(det.x - bw / 2, detSectionY, bw, bh, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = det.color;
        ctx.font = `bold 10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(det.label, det.x, detSectionY + bh / 2 + 3);
        ctx.restore();
      }
    });

    // Chain rule: det(J_total) = det(J₁)·det(J₂) product line
    const chainP = easedSub(progress, 0.55, 0.7);
    if (chainP > 0) {
      const lineY = detSectionY + 35;
      ctx.save();
      ctx.globalAlpha = chainP;

      // Product expression
      fadeInText(ctx, tx('scene5', 'detProduct'), W / 2, lineY, 1, {
        color: colors.warning, font: `bold 11px ${fonts.mono}`
      });

      ctx.restore();
    }

    // Log conversion: product → sum
    const logP = easedSub(progress, 0.65, 0.78);
    if (logP > 0) {
      const lineY = detSectionY + 55;
      ctx.save();
      ctx.globalAlpha = logP;

      fadeInText(ctx, tx('scene5', 'logSum'), W / 2, lineY, 1, {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }

    // Numeric example
    const numP = easedSub(progress, 0.72, 0.85);
    if (numP > 0) {
      const lineY = detSectionY + 78;
      ctx.save();
      ctx.globalAlpha = numP;

      fadeInText(ctx, tx('scene5', 'product'), W * 0.35, lineY, 1, {
        color: colors.textSecondary, font: `10px ${fonts.mono}`
      });
      fadeInText(ctx, tx('scene5', 'logProduct'), W * 0.72, lineY, 1, {
        color: colors.textSecondary, font: `10px ${fonts.mono}`
      });

      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.82, 0.97);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'comp',
        '\\log p(\\mathbf{x}) = \\log p(\\mathbf{z}_0) - \\sum_{k=1}^{K} \\log|\\det J_k|',
        50, 92, fP, { color: colors.textPrimary, fontSize: '1em' });
    }
  }
});
