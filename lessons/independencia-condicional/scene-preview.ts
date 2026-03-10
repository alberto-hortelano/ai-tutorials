// Scene 7: Why This Matters
// AR models = chain, VAEs = latent structure, different graphs → different models

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

function drawSmallNode(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, nodeColor: string, alpha: number, radius: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.panelBg;
  ctx.fill();
  ctx.strokeStyle = nodeColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = nodeColor;
  ctx.font = `bold 11px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

function drawEdgeBetween(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, progress: number, radius: number, edgeColor: string): void {
  if (progress <= 0) return;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  animateArrow(ctx,
    x1 + nx * (radius + 2), y1 + ny * (radius + 2),
    x2 - nx * (radius + 2), y2 - ny * (radius + 2),
    progress, { color: edgeColor, headSize: 6, lineWidth: 1.5 });
}

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 20,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;
    const nodeR = Math.max(12, W * 0.022);

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ── Autoregressive model: chain x1 → x2 → x3 → x4 → x5 ──
    const arP = easedSub(progress, 0.08, 0.35);
    if (arP > 0) {
      // Section label
      fadeInText(ctx, tx('scene7', 'arLabel'), W * 0.15, H * 0.22, arP, {
        color: series[0], font: `bold 14px ${fonts.body}`, align: 'left' as CanvasTextAlign
      });

      const chainY = H * 0.32;
      const chainStartX = W * 0.15;
      const chainSpacing = W * 0.12;
      const chainN = 5;

      for (let i = 0; i < chainN; i++) {
        const nx = chainStartX + i * chainSpacing;
        const label = `x\u2080${i + 1}`; // x subscript as crude unicode
        const labels = ['x\u2081', 'x\u2082', 'x\u2083', 'x\u2084', 'x\u2085'];
        drawSmallNode(ctx, nx, chainY, labels[i], series[0], arP, nodeR);

        if (i > 0) {
          drawEdgeBetween(ctx, chainStartX + (i - 1) * chainSpacing, chainY, nx, chainY, arP, nodeR, series[0]);
        }
      }

      // Description
      fadeInText(ctx, tx('scene7', 'arDesc'), W * 0.78, chainY, arP, {
        color: colors.textMuted, font: `12px ${fonts.mono}`, align: 'left' as CanvasTextAlign
      });
    }

    // ── VAE model: z → x1, z → x2, z → x3 ──
    const vaeP = easedSub(progress, 0.32, 0.6);
    if (vaeP > 0) {
      // Section label
      fadeInText(ctx, tx('scene7', 'vaeLabel'), W * 0.15, H * 0.5, vaeP, {
        color: series[1], font: `bold 14px ${fonts.body}`, align: 'left' as CanvasTextAlign
      });

      const zX = W * 0.35;
      const zY = H * 0.58;
      drawSmallNode(ctx, zX, zY, 'z', series[1], vaeP, nodeR + 3);

      // x nodes fanning out to the right
      const xStartX = W * 0.52;
      const xSpacing = H * 0.08;
      const xCount = 3;

      for (let i = 0; i < xCount; i++) {
        const xNodeX = xStartX;
        const xNodeY = zY - (xCount - 1) * xSpacing / 2 + i * xSpacing;
        const labels = ['x\u2081', 'x\u2082', 'x\u2083'];
        drawSmallNode(ctx, xNodeX, xNodeY, labels[i], series[1], vaeP, nodeR);
        drawEdgeBetween(ctx, zX, zY, xNodeX, xNodeY, vaeP, nodeR + (i === 0 ? 3 : 0), series[1]);
      }

      // Description
      fadeInText(ctx, tx('scene7', 'vaeDesc'), W * 0.78, zY, vaeP, {
        color: colors.textMuted, font: `12px ${fonts.mono}`, align: 'left' as CanvasTextAlign
      });
    }

    // ── "Different graphs → different models" ──
    const connP = easedSub(progress, 0.6, 0.78);
    if (connP > 0) {
      // Dividing line
      ctx.save();
      ctx.globalAlpha = connP * 0.4;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.08, H * 0.44);
      ctx.lineTo(W * 0.92, H * 0.44);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, tx('scene7', 'structureLabel'), W / 2, H * 0.76, connP, {
        color: colors.accent, font: `bold 15px ${fonts.body}`
      });
    }

    // "Coming up next" / future lessons preview
    const nextP = easedSub(progress, 0.78, 0.95);
    if (nextP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(nextP);

      // Box at bottom
      const boxX = W * 0.15;
      const boxY = H * 0.82;
      const boxW = W * 0.7;
      const boxH = H * 0.12;
      const rad = 8;

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = colors.panelBg;
      ctx.beginPath();
      ctx.moveTo(boxX + rad, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, rad);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, rad);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY, rad);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, rad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'nextLabel'), W / 2, boxY + boxH / 2);

      ctx.restore();
    }
  }
});
