// Scene 1: Context — Why Normalizing Flows? Comparative boxes + flow diagram

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Three comparison boxes: Autoregressive, VAEs, Flows
    const boxes = [
      { label: tx('scene1', 'arLabel'), pro: tx('scene1', 'arPro'), con: tx('scene1', 'arCon'), color: series[0], start: 0.05 },
      { label: tx('scene1', 'vaeLabel'), pro: tx('scene1', 'vaePro'), con: tx('scene1', 'vaeCon'), color: series[3], start: 0.15 },
      { label: tx('scene1', 'flowLabel'), pro: tx('scene1', 'flowPro'), con: tx('scene1', 'flowCon'), color: series[1], start: 0.3 },
    ];

    const boxW = Math.min(W * 0.28, 155);
    const boxH = 80;
    const gap = (W - 3 * boxW) / 4;
    const boxY = 55;

    boxes.forEach((box, i) => {
      const bp = easedSub(progress, box.start, box.start + 0.12, easeOutBack);
      if (bp <= 0) return;

      const bx = gap + i * (boxW + gap);
      ctx.save();
      ctx.globalAlpha = bp;

      // Box background
      ctx.fillStyle = box.color + '15';
      ctx.strokeStyle = box.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = box.color;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(box.label, bx + boxW / 2, boxY + 18);

      // Pro (green check)
      ctx.fillStyle = colors.insight;
      ctx.font = `10px ${fonts.body}`;
      ctx.fillText(`+ ${box.pro}`, bx + boxW / 2, boxY + 40);

      // Con (red x)
      ctx.fillStyle = colors.error;
      ctx.fillText(`- ${box.con}`, bx + boxW / 2, boxY + 56);

      ctx.restore();
    });

    // Convergent arrows to Flows box
    const arrowP = easedSub(progress, 0.35, 0.5);
    if (arrowP > 0) {
      ctx.save();
      ctx.globalAlpha = arrowP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);

      const flowX = gap + 2 * (boxW + gap) + boxW / 2;
      const flowY = boxY + boxH + 5;

      // Arrow from Autoregressive box
      const arX = gap + boxW / 2;
      ctx.beginPath();
      ctx.moveTo(arX, boxY + boxH + 5);
      ctx.quadraticCurveTo(arX + (flowX - arX) / 2, boxY + boxH + 30, flowX, flowY);
      ctx.stroke();

      // Arrow from VAE box
      const vaeX = gap + (boxW + gap) + boxW / 2;
      ctx.beginPath();
      ctx.moveTo(vaeX, boxY + boxH + 5);
      ctx.quadraticCurveTo(vaeX + (flowX - vaeX) / 2, boxY + boxH + 25, flowX, flowY);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.restore();
    }

    // "Best of both worlds?" label
    const bestP = easedSub(progress, 0.45, 0.58);
    if (bestP > 0) {
      fadeInText(ctx, tx('scene1', 'bestOfBoth'), W / 2, boxY + boxH + 36, bestP, {
        color: colors.warning, font: `bold 13px ${fonts.body}`
      });
    }

    // Flow diagram: p(z) → f → p(x)
    const diagP = easedSub(progress, 0.55, 0.75);
    if (diagP > 0) {
      const diagY = H * 0.62;
      ctx.save();
      ctx.globalAlpha = diagP;

      // p(z) circle (simple)
      const leftX = W * 0.2;
      ctx.beginPath();
      ctx.arc(leftX, diagY, 25, 0, Math.PI * 2);
      ctx.fillStyle = series[0] + '30';
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('p(z)', leftX, diagY + 4);

      // Arrow
      const midX = W * 0.5;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(leftX + 30, diagY);
      ctx.lineTo(midX - 20, diagY);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(midX - 20, diagY);
      ctx.lineTo(midX - 26, diagY - 4);
      ctx.lineTo(midX - 26, diagY + 4);
      ctx.closePath();
      ctx.fill();

      // f box
      ctx.fillStyle = colors.accent + '30';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(midX - 18, diagY - 16, 36, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.fillText('f', midX, diagY + 5);

      // Arrow to p(x)
      const rightX = W * 0.8;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midX + 20, diagY);
      ctx.lineTo(rightX - 30, diagY);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted;
      ctx.beginPath();
      ctx.moveTo(rightX - 30, diagY);
      ctx.lineTo(rightX - 36, diagY - 4);
      ctx.lineTo(rightX - 36, diagY + 4);
      ctx.closePath();
      ctx.fill();

      // p(x) circle (complex)
      ctx.beginPath();
      ctx.arc(rightX, diagY, 25, 0, Math.PI * 2);
      ctx.fillStyle = series[1] + '30';
      ctx.strokeStyle = series[1];
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = series[1];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.fillText('p(x)', rightX, diagY + 4);

      ctx.restore();
    }

    // Preview: two moons dataset dots
    const dotsP = easedSub(progress, 0.75, 0.95);
    if (dotsP > 0) {
      ctx.save();
      ctx.globalAlpha = dotsP * 0.7;
      const dotY = H * 0.85;
      const nDots = 40;
      for (let i = 0; i < Math.floor(nDots * dotsP); i++) {
        const angle = (i / nDots) * Math.PI + (i % 2 === 0 ? 0 : Math.PI);
        const noiseX = (Math.sin(i * 7.3) * 0.3);
        const noiseY = (Math.cos(i * 13.1) * 0.15);
        const dx = W / 2 + (Math.cos(angle) * W * 0.15 + noiseX * W * 0.08) * (i % 2 === 0 ? 1 : 1);
        const dy = dotY + (Math.sin(angle) * 15 + noiseY * 10) + (i % 2 === 0 ? -8 : 8);
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? series[0] : series[1];
        ctx.fill();
      }
      ctx.restore();
    }
  }
});
