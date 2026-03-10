// Scene 4: Forward (z→x) and Inverse (x→z) mappings
// Split panel: left forward, right inverse, with "how to read" for each

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText, typewriterText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 26,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const midX = W / 2;

    // Dividing line
    const divP = easedSub(progress, 0.04, 0.1);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(midX, 45);
      ctx.lineTo(midX, H * 0.55);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ─── LEFT PANEL: Forward (z → x) ───
    const fwdP = easedSub(progress, 0.06, 0.2);
    if (fwdP > 0) {
      fadeInText(ctx, tx('scene4', 'forwardTitle'), midX * 0.5, 52, fwdP, {
        color: series[0], font: `bold 13px ${fonts.body}`
      });
    }

    // Forward formula
    const fwdFP = easedSub(progress, 0.12, 0.25);
    if (fwdFP > 0) {
      formulaAppear(state.formulaManager, 'fwd_eq',
        'x_i = \\mu_i + z_i \\cdot \\exp(\\alpha_i)',
        25, 22, fwdFP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // Forward "how to read"
    const fwdRP = easedSub(progress, 0.22, 0.38);
    if (fwdRP > 0) {
      const readY = H * 0.3;
      ctx.save();
      ctx.globalAlpha = fwdRP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(W * 0.04, readY - 8, 3, 24);
      ctx.restore();

      typewriterText(ctx, tx('scene4', 'forwardRead'), W * 0.07, readY + 6, fwdRP, {
        color: colors.warning, font: `italic 10px ${fonts.body}`
      });
    }

    // ─── RIGHT PANEL: Inverse (x → z) ───
    const invP = easedSub(progress, 0.25, 0.4);
    if (invP > 0) {
      fadeInText(ctx, tx('scene4', 'inverseTitle'), midX + midX * 0.5, 52, invP, {
        color: series[2], font: `bold 13px ${fonts.body}`
      });
    }

    // Inverse formula
    const invFP = easedSub(progress, 0.3, 0.43);
    if (invFP > 0) {
      formulaAppear(state.formulaManager, 'inv_eq',
        'z_i = \\frac{x_i - \\mu_i}{\\exp(\\alpha_i)}',
        75, 22, invFP, { color: colors.textPrimary, fontSize: '1em' });
    }

    // Inverse "how to read"
    const invRP = easedSub(progress, 0.38, 0.52);
    if (invRP > 0) {
      const readY = H * 0.3;
      ctx.save();
      ctx.globalAlpha = invRP;
      ctx.fillStyle = colors.warning;
      ctx.fillRect(midX + W * 0.04, readY - 8, 3, 24);
      ctx.restore();

      typewriterText(ctx, tx('scene4', 'inverseRead'), midX + W * 0.07, readY + 6, invRP, {
        color: colors.warning, font: `italic 10px ${fonts.body}`
      });
    }

    // ─── Bidirectional arrow ───
    const arrowP = easedSub(progress, 0.5, 0.65);
    if (arrowP > 0) {
      const arrowY = H * 0.45;
      ctx.save();
      ctx.globalAlpha = arrowP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;

      // Left arrow
      ctx.beginPath();
      ctx.moveTo(W * 0.25, arrowY);
      ctx.lineTo(W * 0.75, arrowY);
      ctx.stroke();

      // Right arrowhead
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(W * 0.75, arrowY);
      ctx.lineTo(W * 0.75 - 7, arrowY - 4);
      ctx.lineTo(W * 0.75 - 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();

      // Left arrowhead
      ctx.beginPath();
      ctx.moveTo(W * 0.25, arrowY);
      ctx.lineTo(W * 0.25 + 7, arrowY - 4);
      ctx.lineTo(W * 0.25 + 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // ─── z-space ↔ x-space diagram ───
    const spaceP = easedSub(progress, 0.6, 0.82);
    if (spaceP > 0) {
      const spY = H * 0.65;
      ctx.save();
      ctx.globalAlpha = spaceP;

      // z-space: bell curve (simple)
      const zCX = W * 0.25;
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.02) {
        const x = -3 + t * 6;
        const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
        const px = zCX - 40 + t * 80;
        const py = spY - y * 120;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      fadeInText(ctx, tx('scene4', 'zSpace'), zCX, spY + 20, spaceP, {
        color: series[0], font: `10px ${fonts.body}`
      });

      // x-space: wavy/complex shape
      const xCX = W * 0.75;
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.02) {
        const x = -3 + t * 6;
        const y1 = Math.exp(-(x - 1) * (x - 1) / 1.2) * 0.6;
        const y2 = Math.exp(-(x + 1.5) * (x + 1.5) / 0.8) * 0.8;
        const y = y1 + y2;
        const px = xCX - 40 + t * 80;
        const py = spY - y * 80;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      fadeInText(ctx, tx('scene4', 'xSpace'), xCX, spY + 20, spaceP, {
        color: series[1], font: `10px ${fonts.body}`
      });

      // Bidirectional arrow between spaces
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(zCX + 50, spY - 10);
      ctx.lineTo(xCX - 50, spY - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }

    // Insight box
    const insP = easedSub(progress, 0.85, 0.97);
    if (insP > 0) {
      const insY = H * 0.9;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.1, insY - 14, W * 0.8, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene4', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
