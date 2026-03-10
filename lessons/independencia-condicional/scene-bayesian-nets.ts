// Scene 3: Bayesian Networks
// DAG where nodes=variables, edges=dependencies

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Node positions for a 4-node DAG: A -> B, A -> C, B -> D, C -> D
interface NodePos { x: number; y: number; label: string; color: string }

function getNodes(W: number, H: number): NodePos[] {
  return [
    { x: W * 0.5, y: H * 0.25, label: 'A', color: series[0] },   // top
    { x: W * 0.28, y: H * 0.5, label: 'B', color: series[1] },    // mid-left
    { x: W * 0.72, y: H * 0.5, label: 'C', color: series[2] },    // mid-right
    { x: W * 0.5, y: H * 0.75, label: 'D', color: series[3] },    // bottom
  ];
}

// Edges: [from, to]
const edges: [number, number][] = [
  [0, 1], // A -> B
  [0, 2], // A -> C
  [1, 3], // B -> D
  [2, 3], // C -> D
];

function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, nodeColor: string, alpha: number, radius: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  // Glow
  ctx.shadowColor = nodeColor;
  ctx.shadowBlur = 10 * alpha;

  // Circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.panelBg;
  ctx.fill();
  ctx.strokeStyle = nodeColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = nodeColor;
  ctx.font = `bold 16px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

function drawEdge(ctx: CanvasRenderingContext2D, from: NodePos, to: NodePos, progress: number, radius: number): void {
  if (progress <= 0) return;

  // Calculate start/end points at node border
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / dist;
  const ny = dy / dist;

  const x1 = from.x + nx * (radius + 4);
  const y1 = from.y + ny * (radius + 4);
  const x2 = to.x - nx * (radius + 4);
  const y2 = to.y - ny * (radius + 4);

  animateArrow(ctx, x1, y1, x2, y2, progress, {
    color: colors.textMuted, headSize: 10, lineWidth: 2
  });
}

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;
    const nodeRadius = Math.max(18, W * 0.035);

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // DAG label
    const dagP = easedSub(progress, 0.05, 0.15);
    if (dagP > 0) {
      fadeInText(ctx, tx('scene3', 'dagLabel'), W / 2, 55, dagP, {
        color: colors.textSecondary, font: `13px ${fonts.body}`
      });
    }

    const nodes = getNodes(W, H);

    // Phase 1: Nodes appear one by one
    for (let i = 0; i < nodes.length; i++) {
      const nP = easedSub(progress, 0.1 + i * 0.06, 0.2 + i * 0.06);
      if (nP > 0) {
        drawNode(ctx, nodes[i].x, nodes[i].y, nodes[i].label, nodes[i].color, nP, nodeRadius);
      }
    }

    // Phase 2: Edges appear
    for (let i = 0; i < edges.length; i++) {
      const eP = easedSub(progress, 0.3 + i * 0.07, 0.45 + i * 0.07);
      if (eP > 0) {
        drawEdge(ctx, nodes[edges[i][0]], nodes[edges[i][1]], eP, nodeRadius);
      }
    }

    // Phase 3: Highlight conditional independence (A and D given B,C)
    const highlightP = easedSub(progress, 0.65, 0.85);
    if (highlightP > 0) {
      ctx.save();
      ctx.globalAlpha = highlightP;

      // Highlight B and C with a shielding glow
      for (const idx of [1, 2]) {
        ctx.beginPath();
        ctx.arc(nodes[idx].x, nodes[idx].y, nodeRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dashed line between A and D showing "blocked"
      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.moveTo(nodes[0].x, nodes[0].y + nodeRadius + 8);
      ctx.lineTo(nodes[3].x, nodes[3].y - nodeRadius - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      // X mark in the middle
      const midX = (nodes[0].x + nodes[3].x) / 2;
      const midY = (nodes[0].y + nodes[3].y) / 2;
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2.5;
      const xSize = 8;
      ctx.beginPath();
      ctx.moveTo(midX - xSize, midY - xSize);
      ctx.lineTo(midX + xSize, midY + xSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX + xSize, midY - xSize);
      ctx.lineTo(midX - xSize, midY + xSize);
      ctx.stroke();

      ctx.restore();
    }

    // Independence statement
    const indepP = easedSub(progress, 0.78, 0.95);
    if (indepP > 0) {
      fadeInText(ctx, tx('scene3', 'indepLabel'), W / 2, H - 25, indepP, {
        color: colors.insight, font: `bold 14px ${fonts.body}`
      });
    }
  }
});
