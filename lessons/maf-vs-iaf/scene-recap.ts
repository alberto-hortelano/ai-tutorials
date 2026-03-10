// Scene 7: Module recap — mind map

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Center node: Normalizing Flows
    const cx = W / 2, cy = H * 0.4;
    const centerP = easedSub(progress, 0.05, 0.2, easeOutBack);
    if (centerP > 0) {
      ctx.save();
      ctx.globalAlpha = centerP;

      const nodeW = 160, nodeH = 36;
      ctx.fillStyle = colors.accent + '30';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(cx - nodeW / 2, cy - nodeH / 2, nodeW, nodeH, nodeH / 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'center'), cx, cy);
      ctx.textBaseline = 'alphabetic';

      ctx.restore();
    }

    // Three branches
    const branches = [
      {
        label: tx('scene7', 'branch1'),
        detail: tx('scene7', 'detail1'),
        color: series[0],
        angle: -2.3, // upper left
        start: 0.15, end: 0.4,
      },
      {
        label: tx('scene7', 'branch2'),
        detail: tx('scene7', 'detail2'),
        color: series[1],
        angle: -0.8, // upper right
        start: 0.3, end: 0.55,
      },
      {
        label: tx('scene7', 'branch3'),
        detail: tx('scene7', 'detail3'),
        color: series[2],
        angle: 0, // right
        start: 0.45, end: 0.7,
      },
    ];

    const armLen = Math.min(W, H) * 0.25;

    branches.forEach(branch => {
      const bP = easedSub(progress, branch.start, branch.end, easeOutBack);
      if (bP <= 0) return;

      const endX = cx + Math.cos(branch.angle) * armLen;
      const endY = cy + Math.sin(branch.angle) * armLen;

      ctx.save();
      ctx.globalAlpha = bP;

      // Connection line
      ctx.strokeStyle = branch.color;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const curEndX = cx + (endX - cx) * bP;
      const curEndY = cy + (endY - cy) * bP;
      ctx.lineTo(curEndX, curEndY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Branch node
      if (bP > 0.3) {
        const nodeW = 140, nodeH = 28;
        ctx.fillStyle = branch.color + '20';
        ctx.strokeStyle = branch.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(endX - nodeW / 2, endY - nodeH / 2, nodeW, nodeH, nodeH / 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = branch.color;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(branch.label, endX, endY);
        ctx.textBaseline = 'alphabetic';

        // Detail below
        fadeInText(ctx, branch.detail, endX, endY + nodeH / 2 + 15, Math.min((bP - 0.3) * 3, 1), {
          color: colors.textMuted, font: `10px ${fonts.body}`
        });
      }

      ctx.restore();
    });

    // Connection note at bottom
    const connP = easedSub(progress, 0.7, 0.88);
    if (connP > 0) {
      const connY = H * 0.78;
      ctx.save();
      ctx.globalAlpha = connP;

      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W * 0.15, connY - 16, W * 0.7, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'connection'), W / 2, connY + 4);

      ctx.restore();
    }

    // Final formula
    const fP = easedSub(progress, 0.85, 1);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'recap',
        '\\log p(\\mathbf{x}) = \\log p(\\mathbf{z}_0) - \\sum_{k=1}^{K} \\log|\\det J_k|',
        50, 93, fP, { color: colors.textPrimary, fontSize: '1em' });
    }
  }
});
