// Scene 5: The Two Forces — Tug-of-war between reconstruction and KL

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { roundRect } from '../../engine/shared/canvas-utils';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 24,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // --- Top panel: Two Gaussian curves showing the tension ---
    const panelTop = H * 0.12;
    const panelH = H * 0.3;
    const panelCy = panelTop + panelH / 2;

    // Reconstruction pulls q to be narrow/specific
    const reconP = easedSub(progress, 0.06, 0.3);
    if (reconP > 0) {
      ctx.save();
      ctx.globalAlpha = reconP;

      // Narrow Gaussian (specific q)
      const leftCx = W * 0.28;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = -30; i <= 30; i++) {
        const t = i / 30;
        const gx = leftCx + t * 60;
        const gy = panelCy - panelH * 0.7 * gaussian(t * 3, 0, 0.5) / gaussian(0, 0, 0.5);
        if (i === -30) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();

      // Label
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'pullLeft'), leftCx, panelCy + 10);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.fillText(tx('scene5', 'reconForce'), leftCx, panelCy + 26);

      ctx.restore();
    }

    // KL pulls q to be broad/near prior
    const klP = easedSub(progress, 0.2, 0.45);
    if (klP > 0) {
      ctx.save();
      ctx.globalAlpha = klP;

      // Broad Gaussian (prior-like)
      const rightCx = W * 0.72;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = -30; i <= 30; i++) {
        const t = i / 30;
        const gx = rightCx + t * 80;
        const gy = panelCy - panelH * 0.4 * gaussian(t * 3, 0, 1.2) / gaussian(0, 0, 1.2);
        if (i === -30) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();

      // Dashed prior overlay
      ctx.strokeStyle = colors.accent + '60';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = -30; i <= 30; i++) {
        const t = i / 30;
        const gx = rightCx + t * 80;
        const gy = panelCy - panelH * 0.38 * gaussian(t * 3, 0, 1.0) / gaussian(0, 0, 1.0);
        if (i === -30) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'pullRight'), rightCx, panelCy + 10);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.fillText(tx('scene5', 'klForce'), rightCx, panelCy + 26);

      ctx.restore();
    }

    // VS in the middle
    const vsP = easedSub(progress, 0.25, 0.4);
    if (vsP > 0) {
      ctx.save();
      ctx.globalAlpha = vsP;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('vs', W / 2, panelCy);
      ctx.restore();
    }

    // --- Tug-of-war animation ---
    const tugTop = H * 0.52;
    const tugH = 10;
    const ropeY = tugTop + 30;
    const ropeLen = W * 0.7;
    const ropeLeft = (W - ropeLen) / 2;

    const tugP = easedSub(progress, 0.4, 0.85);
    if (tugP > 0) {
      ctx.save();
      ctx.globalAlpha = tugP;

      // Oscillating balance point (starts right, oscillates, settles center)
      const oscillation = Math.sin(tugP * Math.PI * 4) * (1 - tugP) * 0.15;
      const balanceX = W / 2 + oscillation * ropeLen;

      // Rope
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ropeLeft, ropeY);
      ctx.lineTo(ropeLeft + ropeLen, ropeY);
      ctx.stroke();

      // Green pull (left side, reconstruction)
      const pullExtent = ropeLen * 0.15 * easeOut(Math.min(tugP * 2, 1));

      // Green arrows pulling left
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ropeLeft + pullExtent + 10, ropeY);
      ctx.lineTo(ropeLeft, ropeY);
      ctx.stroke();
      ctx.fillStyle = colors.insight;
      ctx.beginPath();
      ctx.moveTo(ropeLeft, ropeY);
      ctx.lineTo(ropeLeft + 10, ropeY - 6);
      ctx.lineTo(ropeLeft + 10, ropeY + 6);
      ctx.closePath();
      ctx.fill();

      // Green label
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(tx('scene5', 'reconForce'), ropeLeft - 5, ropeY + 12);

      // Red arrows pulling right
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ropeLeft + ropeLen - pullExtent - 10, ropeY);
      ctx.lineTo(ropeLeft + ropeLen, ropeY);
      ctx.stroke();
      ctx.fillStyle = colors.error;
      ctx.beginPath();
      ctx.moveTo(ropeLeft + ropeLen, ropeY);
      ctx.lineTo(ropeLeft + ropeLen - 10, ropeY - 6);
      ctx.lineTo(ropeLeft + ropeLen - 10, ropeY + 6);
      ctx.closePath();
      ctx.fill();

      // Red label
      ctx.fillStyle = colors.error;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene5', 'klForce'), ropeLeft + ropeLen + 5, ropeY + 12);

      // Balance marker (ELBO diamond)
      const diamondSize = 10;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(balanceX, ropeY - diamondSize - 4);
      ctx.lineTo(balanceX + diamondSize, ropeY - 4);
      ctx.lineTo(balanceX, ropeY + diamondSize - 4);
      ctx.lineTo(balanceX - diamondSize, ropeY - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(tx('scene5', 'balanceLabel'), balanceX, ropeY - diamondSize - 8);

      ctx.restore();
    }

    // Balance description at bottom
    const balP = easedSub(progress, 0.82, 0.96);
    if (balP > 0) {
      const descY = H * 0.82;

      ctx.save();
      ctx.globalAlpha = balP;

      const bw = W * 0.6;
      const bh = 36;
      roundRect(ctx, (W - bw) / 2, descY - bh / 2, bw, bh, 8);
      ctx.fillStyle = colors.accent + '12';
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene5', 'balanceDesc'), W / 2, descY);

      ctx.restore();
    }
  },
});
