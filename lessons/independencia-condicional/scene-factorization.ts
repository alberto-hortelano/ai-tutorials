// Scene 4: Factorization from Graph
// p(x) = product of p(xi | Parents(xi))

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

interface NodeDef { x: number; y: number; label: string; color: string; localFormula: string }

function getNodes(W: number, H: number): NodeDef[] {
  return [
    { x: W * 0.5, y: H * 0.2, label: 'A', color: series[0], localFormula: 'localA' },
    { x: W * 0.25, y: H * 0.48, label: 'B', color: series[1], localFormula: 'localB' },
    { x: W * 0.75, y: H * 0.48, label: 'C', color: series[2], localFormula: 'localC' },
    { x: W * 0.5, y: H * 0.76, label: 'D', color: series[3], localFormula: 'localD' },
  ];
}

const edgeDefs: [number, number][] = [
  [0, 1], // A -> B
  [0, 2], // A -> C
  [1, 3], // B -> D
  [2, 3], // C -> D
];

function drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, nodeColor: string, alpha: number, radius: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = colors.panelBg;
  ctx.fill();
  ctx.strokeStyle = nodeColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = nodeColor;
  ctx.font = `bold 15px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);

  ctx.restore();
}

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;
    const nodeRadius = Math.max(16, W * 0.03);

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Main formula via KaTeX
    const formulaP = easedSub(progress, 0.05, 0.2);
    if (formulaP > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'factor',
        'p(\\mathbf{x}) = \\prod_{i=1}^{n} p(x_i \\mid \\text{Pa}(x_i))',
        50, 17, formulaP, { color: colors.accent, fontSize: '1em' });
    }

    const nodes = getNodes(W, H);

    // Draw DAG (always visible after initial fade)
    const dagP = easedSub(progress, 0.1, 0.3);
    if (dagP > 0) {
      // Edges
      for (const [fi, ti] of edgeDefs) {
        const from = nodes[fi];
        const to = nodes[ti];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        animateArrow(ctx,
          from.x + nx * (nodeRadius + 3), from.y + ny * (nodeRadius + 3),
          to.x - nx * (nodeRadius + 3), to.y - ny * (nodeRadius + 3),
          dagP, { color: colors.axis, headSize: 8, lineWidth: 1.5 });
      }

      // Nodes
      for (const node of nodes) {
        drawNode(ctx, node.x, node.y, node.label, node.color, dagP, nodeRadius);
      }
    }

    // Phase 2: Local conditional formulas appear next to each node
    for (let i = 0; i < nodes.length; i++) {
      const localP = easedSub(progress, 0.3 + i * 0.1, 0.45 + i * 0.1);
      if (localP <= 0) continue;

      const node = nodes[i];
      const formulaText = tx('scene4', node.localFormula);

      // Position formula to the right of the node
      const offsetX = i === 1 ? -nodeRadius - 10 : nodeRadius + 10;
      const align: CanvasTextAlign = i === 1 ? 'right' : 'left';

      ctx.save();
      ctx.globalAlpha = easeOut(localP);

      // Background pill
      ctx.font = `bold 11px ${fonts.mono}`;
      const textW = ctx.measureText(formulaText).width;
      const pillX = i === 1 ? node.x + offsetX - textW - 8 : node.x + offsetX - 4;
      const pillY = node.y - 10;
      const pillW = textW + 12;
      const pillH = 20;

      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const rd = 4;
      ctx.moveTo(pillX + rd, pillY);
      ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, rd);
      ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, rd);
      ctx.arcTo(pillX, pillY + pillH, pillX, pillY, rd);
      ctx.arcTo(pillX, pillY, pillX + pillW, pillY, rd);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Formula text
      ctx.fillStyle = node.color;
      ctx.font = `bold 11px ${fonts.mono}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formulaText, pillX + pillW / 2, pillY + pillH / 2);

      ctx.restore();
    }

    // Phase 3: "Depends only on parents" label
    const parentP = easedSub(progress, 0.72, 0.88);
    if (parentP > 0) {
      fadeInText(ctx, tx('scene4', 'onlyParents'), W / 2, H - 25, parentP, {
        color: colors.insight, font: `bold 13px ${fonts.body}`
      });
    }
  }
});
