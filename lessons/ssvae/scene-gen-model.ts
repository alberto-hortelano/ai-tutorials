// Scene 2: Generative Model with Labels — DAG: y->x, z->x, labeled vs unlabeled

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { drawNode, drawEdge } from '../_shared/dag-utils';
import type { DagNode, DagEdge } from '../_shared/dag-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Formula
    const f1P = easedSub(progress, 0.06, 0.22);
    if (f1P > 0) {
      formulaAppear(state.formulaManager, 'ssvae-joint',
        'p(\\mathbf{x}, y, \\mathbf{z}) = p(y)\\, p(\\mathbf{z})\\, p(\\mathbf{x} | y, \\mathbf{z})',
        50, 18, f1P, { color: colors.textPrimary, fontSize: '1.05em' });
    }

    // DAG Layout — two side-by-side: labeled and unlabeled
    const dagCenterX1 = W * 0.28; // labeled
    const dagCenterX2 = W * 0.72; // unlabeled
    const dagTopY = H * 0.35;
    const dagBottomY = H * 0.68;
    const nodeR = 20;

    // Common positions
    function dagNodes(cx: number, yFilled: boolean): DagNode[] {
      return [
        { id: 'y', label: 'y', x: cx - 40, y: dagTopY, color: series[3], filled: yFilled },
        { id: 'z', label: 'z', x: cx + 40, y: dagTopY, color: series[0], filled: false },
        { id: 'x', label: 'x', x: cx, y: dagBottomY, color: colors.textPrimary, filled: true },
      ];
    }

    const edges: DagEdge[] = [
      { from: 'y', to: 'x', color: series[3] },
      { from: 'z', to: 'x', color: series[0] },
    ];

    // Phase 1: Labeled DAG (left)
    const dag1P = easedSub(progress, 0.18, 0.45);
    if (dag1P > 0) {
      const nodes = dagNodes(dagCenterX1, true); // y filled = observed
      const nodeMap = new Map<string, DagNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      const nodeP = easedSub(progress, 0.18, 0.32);
      const edgeP = easedSub(progress, 0.28, 0.42);

      // Draw edges
      for (const edge of edges) {
        drawEdge(ctx, nodeMap, edge, edgeP, nodeR);
      }

      // Draw nodes
      for (const node of nodes) {
        drawNode(ctx, node, nodeP, nodeR);
      }

      // "Labeled" label below
      fadeInText(ctx, tx('scene2', 'labeledNode'), dagCenterX1, dagBottomY + 40, dag1P, {
        color: series[3], font: `bold 12px ${fonts.body}`,
      });

      // Node labels
      fadeInText(ctx, tx('scene2', 'yLabel'), dagCenterX1 - 40, dagTopY - 28, nodeP, {
        color: series[3], font: `10px ${fonts.body}`,
      });
      fadeInText(ctx, tx('scene2', 'zLabel'), dagCenterX1 + 40, dagTopY - 28, nodeP, {
        color: series[0], font: `10px ${fonts.body}`,
      });
      fadeInText(ctx, tx('scene2', 'xLabel'), dagCenterX1, dagBottomY + 26, nodeP, {
        color: colors.textMuted, font: `10px ${fonts.body}`,
      });
    }

    // Phase 2: Unlabeled DAG (right)
    const dag2P = easedSub(progress, 0.4, 0.68);
    if (dag2P > 0) {
      const nodes = dagNodes(dagCenterX2, false); // y NOT filled = latent
      const nodeMap = new Map<string, DagNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      const nodeP = easedSub(progress, 0.4, 0.55);
      const edgeP = easedSub(progress, 0.5, 0.64);

      // Draw edges
      for (const edge of edges) {
        drawEdge(ctx, nodeMap, edge, edgeP, nodeR);
      }

      // Draw nodes
      for (const node of nodes) {
        drawNode(ctx, node, nodeP, nodeR);
      }

      // "Unlabeled" label below
      fadeInText(ctx, tx('scene2', 'unlabeledNode'), dagCenterX2, dagBottomY + 40, dag2P, {
        color: colors.textDimmed, font: `bold 12px ${fonts.body}`,
      });

      // Node labels
      fadeInText(ctx, tx('scene2', 'yLabel'), dagCenterX2 - 40, dagTopY - 28, nodeP, {
        color: colors.textDimmed, font: `10px ${fonts.body}`,
      });
      fadeInText(ctx, tx('scene2', 'zLabel'), dagCenterX2 + 40, dagTopY - 28, nodeP, {
        color: series[0], font: `10px ${fonts.body}`,
      });
      fadeInText(ctx, tx('scene2', 'xLabel'), dagCenterX2, dagBottomY + 26, nodeP, {
        color: colors.textMuted, font: `10px ${fonts.body}`,
      });

      // Question mark on y node for unlabeled
      if (nodeP > 0.5) {
        ctx.save();
        ctx.globalAlpha = (nodeP - 0.5) * 2;
        ctx.fillStyle = colors.warning;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', dagCenterX2 - 40, dagTopY);
        ctx.restore();
      }
    }

    // Divider between the two DAGs
    const divP = easedSub(progress, 0.35, 0.5);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(divP) * 0.4;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, dagTopY - 30);
      ctx.lineTo(W / 2, dagBottomY + 50);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Phase 3: Insight — y observed vs latent
    const insightP = easedSub(progress, 0.85, 1.0);
    fadeInText(ctx, tx('scene2', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
