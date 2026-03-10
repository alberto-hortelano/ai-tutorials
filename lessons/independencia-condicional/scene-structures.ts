// Scene 6: Common Graph Structures
// Chain, Common cause, V-structure with explaining away

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
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
  ctx.font = `bold 13px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

function drawEdgeFromTo(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, progress: number, radius: number): void {
  if (progress <= 0) return;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  animateArrow(ctx,
    x1 + nx * (radius + 3), y1 + ny * (radius + 3),
    x2 - nx * (radius + 3), y2 - ny * (radius + 3),
    progress, { color: colors.textMuted, headSize: 7, lineWidth: 1.5 });
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;
    const nodeR = Math.max(14, W * 0.025);

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Three columns for three structures
    const colW = W / 3;
    const topY = H * 0.18;
    const midY = H * 0.42;
    const botY = H * 0.62;

    // ── Structure 1: Chain X → Y → Z ──
    const chainP = easedSub(progress, 0.08, 0.3);
    if (chainP > 0) {
      const cx = colW * 0.5;

      // Label
      fadeInText(ctx, tx('scene6', 'chainLabel'), cx, topY - 15, chainP, {
        color: series[0], font: `bold 13px ${fonts.body}`
      });

      // Nodes
      drawSmallNode(ctx, cx - W * 0.08, midY, 'X', series[0], chainP, nodeR);
      drawSmallNode(ctx, cx, midY, 'Y', series[0], chainP, nodeR);
      drawSmallNode(ctx, cx + W * 0.08, midY, 'Z', series[0], chainP, nodeR);

      // Edges: X → Y → Z
      drawEdgeFromTo(ctx, cx - W * 0.08, midY, cx, midY, chainP, nodeR);
      drawEdgeFromTo(ctx, cx, midY, cx + W * 0.08, midY, chainP, nodeR);

      // Independence statement
      const indP = easedSub(progress, 0.22, 0.35);
      if (indP > 0) {
        fadeInText(ctx, tx('scene6', 'chainIndep'), cx, botY + 5, indP, {
          color: colors.insight, font: `bold 11px ${fonts.body}`
        });
      }
    }

    // ── Structure 2: Common cause X ← Y → Z ──
    const commonP = easedSub(progress, 0.28, 0.52);
    if (commonP > 0) {
      const cx = colW * 1.5;

      // Label
      fadeInText(ctx, tx('scene6', 'commonLabel'), cx, topY - 15, commonP, {
        color: series[1], font: `bold 13px ${fonts.body}`
      });

      // Y at top center, X bottom-left, Z bottom-right
      const yNode = { x: cx, y: midY - H * 0.08 };
      const xNode = { x: cx - W * 0.07, y: midY + H * 0.08 };
      const zNode = { x: cx + W * 0.07, y: midY + H * 0.08 };

      drawSmallNode(ctx, yNode.x, yNode.y, 'Y', series[1], commonP, nodeR);
      drawSmallNode(ctx, xNode.x, xNode.y, 'X', series[1], commonP, nodeR);
      drawSmallNode(ctx, zNode.x, zNode.y, 'Z', series[1], commonP, nodeR);

      // Edges: Y → X, Y → Z
      drawEdgeFromTo(ctx, yNode.x, yNode.y, xNode.x, xNode.y, commonP, nodeR);
      drawEdgeFromTo(ctx, yNode.x, yNode.y, zNode.x, zNode.y, commonP, nodeR);

      // Independence statement
      const indP = easedSub(progress, 0.42, 0.55);
      if (indP > 0) {
        fadeInText(ctx, tx('scene6', 'commonIndep'), cx, botY + 5, indP, {
          color: colors.insight, font: `bold 11px ${fonts.body}`
        });
      }
    }

    // ── Structure 3: V-structure X → Y ← Z ──
    const vstP = easedSub(progress, 0.48, 0.72);
    if (vstP > 0) {
      const cx = colW * 2.5;

      // Label
      fadeInText(ctx, tx('scene6', 'vstLabel'), cx, topY - 15, vstP, {
        color: series[2], font: `bold 13px ${fonts.body}`
      });

      // X top-left, Z top-right, Y bottom-center
      const xNode = { x: cx - W * 0.07, y: midY - H * 0.08 };
      const zNode = { x: cx + W * 0.07, y: midY - H * 0.08 };
      const yNode = { x: cx, y: midY + H * 0.08 };

      drawSmallNode(ctx, xNode.x, xNode.y, 'X', series[2], vstP, nodeR);
      drawSmallNode(ctx, zNode.x, zNode.y, 'Z', series[2], vstP, nodeR);
      drawSmallNode(ctx, yNode.x, yNode.y, 'Y', series[2], vstP, nodeR);

      // Edges: X → Y, Z → Y
      drawEdgeFromTo(ctx, xNode.x, xNode.y, yNode.x, yNode.y, vstP, nodeR);
      drawEdgeFromTo(ctx, zNode.x, zNode.y, yNode.x, yNode.y, vstP, nodeR);

      // Independence statement
      const indP = easedSub(progress, 0.62, 0.75);
      if (indP > 0) {
        fadeInText(ctx, tx('scene6', 'vstIndep'), cx, botY + 5, indP, {
          color: colors.insight, font: `bold 11px ${fonts.body}`
        });
      }
    }

    // Explaining away highlight on V-structure
    const explainP = easedSub(progress, 0.75, 0.92);
    if (explainP > 0) {
      const cx = colW * 2.5;
      const yNode = { x: cx, y: midY + H * 0.08 };

      ctx.save();
      ctx.globalAlpha = explainP;

      // Glowing circle around Y node
      ctx.beginPath();
      ctx.arc(yNode.x, yNode.y, nodeR + 8, 0, Math.PI * 2);
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // "Explaining away" label
      fadeInText(ctx, tx('scene6', 'vstExplain'), cx, botY + 28, explainP, {
        color: colors.warning, font: `bold 12px ${fonts.body}`
      });
    }
  }
});
