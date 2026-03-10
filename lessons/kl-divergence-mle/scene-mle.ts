// Scene 6: MLE = minimize KL — with derivation steps

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, tweenColor } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
// formulaAppear not needed — derivation uses canvas text for step-by-step graying
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 25,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // --- Derivation section ---
    const derivBaseY = H * 0.16;
    const lineH = 28;

    // Step 1: Full KL expansion
    const deriv1P = easedSub(progress, 0.06, 0.2);
    fadeInText(ctx, tx('scene6', 'derivStep1'), W * 0.05, derivBaseY, deriv1P, {
      color: colors.textDimmed, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
    });
    fadeInText(ctx, 'D_KL(p_data || p_\u03b8) = E_p[log p_data] \u2212 E_p[log p_\u03b8]', W / 2, derivBaseY + lineH, deriv1P, {
      color: colors.textSecondary, font: '13px "Courier New", monospace'
    });

    // Step 2: Identify constant term
    const deriv2P = easedSub(progress, 0.2, 0.38);
    fadeInText(ctx, tx('scene6', 'derivStep2'), W * 0.05, derivBaseY + lineH * 2.3, deriv2P, {
      color: colors.textDimmed, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
    });

    // Rewrite with constant highlighted — this is the key animation
    if (deriv2P > 0) {
      // The constant term grays out as progress increases
      const grayP = easedSub(progress, 0.32, 0.5);
      const constColor = grayP > 0
        ? tweenColor(colors.warning, colors.textDimmed, grayP)
        : colors.warning;
      const constAlpha = grayP > 0 ? 1 - grayP * 0.6 : 1;

      const yRow = derivBaseY + lineH * 3.3;

      // "= " prefix
      fadeInText(ctx, '=', W * 0.2, yRow, deriv2P, {
        color: colors.textSecondary, font: '13px "Courier New", monospace'
      });

      // Constant part: -H(p_data) — grays out
      ctx.save();
      ctx.globalAlpha = deriv2P * constAlpha;
      ctx.fillStyle = constColor;
      ctx.font = '13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2212H(p_data)', W * 0.36, yRow);

      // Strikethrough when fully grayed
      if (grayP > 0.7) {
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = (grayP - 0.7) / 0.3;
        const textW = ctx.measureText('\u2212H(p_data)').width;
        ctx.beginPath();
        ctx.moveTo(W * 0.36 - textW / 2 - 4, yRow);
        ctx.lineTo(W * 0.36 + textW / 2 + 4, yRow);
        ctx.stroke();
      }
      ctx.restore();

      // Active part: - E_p[log p_theta]
      fadeInText(ctx, '\u2212 E_p[log p_\u03b8(x)]', W * 0.62, yRow, deriv2P, {
        color: series[0], font: 'bold 13px "Courier New", monospace'
      });

      // "constant" label
      if (grayP < 0.8) {
        fadeInText(ctx, tx('scene6', 'constLabel'), W * 0.36, yRow + 18, deriv2P, {
          color: colors.warning, font: '9px "Segoe UI", system-ui, sans-serif'
        });
      }
    }

    // Step 3: Therefore...
    const deriv3P = easedSub(progress, 0.45, 0.58);
    const yConclusion = derivBaseY + lineH * 5;
    fadeInText(ctx, tx('scene6', 'derivStep3'), W * 0.05, yConclusion, deriv3P, {
      color: colors.textDimmed, font: '11px "Segoe UI", system-ui, sans-serif', align: 'left'
    });

    // ---- Big equation: min KL = max log-likelihood ----
    const centerY = H * 0.58;

    const step1P = easedSub(progress, 0.52, 0.66);
    fadeInText(ctx, tx('scene6', 'minimize'), W / 2, centerY - 20, step1P, {
      color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif'
    });
    fadeInText(ctx, 'min D_KL( p_data || p_\u03b8 )', W / 2, centerY + 2, step1P, {
      color: colors.error, font: 'bold 15px "Courier New", monospace'
    });

    // Equals sign / arrow
    const eqP = easedSub(progress, 0.62, 0.72);
    fadeInText(ctx, tx('scene6', 'equivTo'), W / 2, centerY + 28, eqP, {
      color: colors.textDimmed, font: '12px "Segoe UI", system-ui, sans-serif'
    });

    // MLE objective
    const step2P = easedSub(progress, 0.68, 0.82);
    fadeInText(ctx, tx('scene6', 'mleMaximizes'), W / 2, centerY + 52, step2P, {
      color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif'
    });
    fadeInText(ctx, 'max E_{p_data}[ log p_\u03b8(x) ]', W / 2, centerY + 74, step2P, {
      color: series[0], font: 'bold 15px "Courier New", monospace'
    });

    // Box highlight around the equivalence
    const boxP = easedSub(progress, 0.78, 0.88);
    if (boxP > 0) {
      ctx.save();
      ctx.globalAlpha = boxP * 0.5;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      const bx = W * 0.15, by = centerY - 30;
      const bw = W * 0.7, bh = 115;
      const rad = 8;
      ctx.beginPath();
      ctx.moveTo(bx + rad, by);
      ctx.lineTo(bx + bw - rad, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + rad, rad);
      ctx.lineTo(bx + bw, by + bh - rad);
      ctx.arcTo(bx + bw, by + bh, bx + bw - rad, by + bh, rad);
      ctx.lineTo(bx + rad, by + bh);
      ctx.arcTo(bx, by + bh, bx, by + bh - rad, rad);
      ctx.lineTo(bx, by + rad);
      ctx.arcTo(bx, by, bx + rad, by, rad);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Bottom insight
    const insP = easedSub(progress, 0.86, 0.97);
    fadeInText(ctx, tx('scene6', 'insight'), W / 2, H - 22, insP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif'
    });
  }
});
