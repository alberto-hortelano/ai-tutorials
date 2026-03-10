// Scene 5: Sequential vs Parallel — the MAF asymmetry
// Top panel: forward (sequential, red). Bottom panel: inverse (parallel, green).

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 28,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const D = 4;
    const boxW = Math.min(W * 0.12, 60);
    const boxH = 28;
    const spacing = boxW + 14;
    const startX = W / 2 - (D * spacing) / 2 + boxW / 2;

    // ─── UPPER PANEL: Forward (z→x) sequential ───
    const fwdLabelP = easedSub(progress, 0.05, 0.12);
    if (fwdLabelP > 0) {
      fadeInText(ctx, tx('scene5', 'forwardLabel'), W / 2, 52, fwdLabelP, {
        color: colors.error, font: `bold 12px ${fonts.body}`
      });
    }

    const fwdY = H * 0.2;
    // Boxes appear one by one (sequential — slow)
    for (let i = 0; i < D; i++) {
      const boxP = easedSub(progress, 0.1 + i * 0.06, 0.16 + i * 0.06, easeOut);
      if (boxP <= 0) continue;

      const bx = startX + i * spacing;
      ctx.save();
      ctx.globalAlpha = boxP;

      ctx.fillStyle = colors.error + '25';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - boxW / 2, fwdY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.error;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(`x${i + 1}`, bx, fwdY + boxH / 2 + 4);

      // Arrow from previous box
      if (i > 0) {
        const prevX = startX + (i - 1) * spacing + boxW / 2 + 4;
        const curX = bx - boxW / 2 - 4;
        ctx.strokeStyle = colors.error;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(prevX, fwdY + boxH / 2);
        ctx.lineTo(curX, fwdY + boxH / 2);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = colors.error;
        ctx.beginPath();
        ctx.moveTo(curX, fwdY + boxH / 2);
        ctx.lineTo(curX - 5, fwdY + boxH / 2 - 3);
        ctx.lineTo(curX - 5, fwdY + boxH / 2 + 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    // Forward badge
    const fwdBadgeP = easedSub(progress, 0.3, 0.4);
    if (fwdBadgeP > 0) {
      const badgeY = fwdY + boxH + 14;
      ctx.save();
      ctx.globalAlpha = fwdBadgeP;

      ctx.fillStyle = colors.error + '20';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 45, badgeY - 10, 90, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.error;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'forwardBadge'), W / 2, badgeY + 4);

      ctx.restore();
    }

    // ─── LOWER PANEL: Inverse (x→z) parallel ───
    const invLabelP = easedSub(progress, 0.38, 0.45);
    if (invLabelP > 0) {
      fadeInText(ctx, tx('scene5', 'inverseLabel'), W / 2, H * 0.48, invLabelP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });
    }

    const invY = H * 0.55;

    // x input boxes (all appear at once)
    const xInputP = easedSub(progress, 0.42, 0.5);
    if (xInputP > 0) {
      for (let i = 0; i < D; i++) {
        const bx = startX + i * spacing;
        ctx.save();
        ctx.globalAlpha = xInputP;

        ctx.fillStyle = colors.accent + '25';
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, invY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.accent;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`x${i + 1}`, bx, invY + boxH / 2 + 4);

        ctx.restore();
      }
    }

    // MADE box (appears in the middle)
    const madeP = easedSub(progress, 0.5, 0.6);
    if (madeP > 0) {
      const madeY = invY + boxH + 8;
      const madeW = D * spacing - 14;
      const madeH = 26;
      const madeX = startX - boxW / 2;

      ctx.save();
      ctx.globalAlpha = madeP;

      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(madeX, madeY, madeW, madeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'madeLabel'), madeX + madeW / 2, madeY + madeH / 2 + 4);

      ctx.restore();
    }

    // Output z boxes (all appear at once — parallel!)
    const zOutP = easedSub(progress, 0.58, 0.68);
    if (zOutP > 0) {
      const zY = invY + boxH + 42;

      for (let i = 0; i < D; i++) {
        const bx = startX + i * spacing;
        const flash = Math.min(zOutP * 3, 1);
        ctx.save();
        ctx.globalAlpha = flash;

        ctx.fillStyle = colors.insight + '25';
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - boxW / 2, zY, boxW, boxH, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = colors.insight;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(`z${i + 1}`, bx, zY + boxH / 2 + 4);

        ctx.restore();
      }

      // "All at once" label
      fadeInText(ctx, tx('scene5', 'allAtOnce'), W / 2, zY + boxH + 14, zOutP, {
        color: colors.insight, font: `bold 10px ${fonts.body}`
      });
    }

    // Inverse badge
    const invBadgeP = easedSub(progress, 0.68, 0.76);
    if (invBadgeP > 0) {
      const badgeY = invY + boxH + 82;
      ctx.save();
      ctx.globalAlpha = invBadgeP;

      ctx.fillStyle = colors.insight + '20';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 40, badgeY - 10, 80, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'inverseBadge'), W / 2, badgeY + 4);

      ctx.restore();
    }

    // Insight box
    const insP = easedSub(progress, 0.82, 0.95);
    if (insP > 0) {
      const insY = H * 0.93;
      ctx.save();
      ctx.globalAlpha = insP;

      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.05, insY - 14, W * 0.9, 28, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'insight'), W / 2, insY + 4);

      ctx.restore();
    }
  }
});
