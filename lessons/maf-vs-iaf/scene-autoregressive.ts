// Scene 1: Autoregressive structure — staircase dependency diagram

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateArrow } from '../../engine/animation/arrow';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 22,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const D = 4;
    const deps = [
      { label: tx('scene1', 'dep1'), from: [1], to: 1 },
      { label: tx('scene1', 'dep2'), from: [1, 2], to: 2 },
      { label: tx('scene1', 'dep3'), from: [1, 2, 3], to: 3 },
      { label: tx('scene1', 'depD'), from: [1, 2, 3, 4], to: 4 },
    ];

    const nodeR = 18;
    const topRow = H * 0.22; // z row
    const botRow = H * 0.48; // x row
    const spacing = W / (D + 1);

    // Staircase dependency: z nodes (top), x nodes (bottom), arrows
    deps.forEach((dep, i) => {
      const depP = easedSub(progress, 0.05 + i * 0.12, 0.2 + i * 0.12);
      if (depP <= 0) return;

      ctx.save();
      ctx.globalAlpha = depP;

      // z node
      const zx = spacing * (i + 1), zy = topRow;
      ctx.beginPath();
      ctx.arc(zx, zy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = series[0] + '40';
      ctx.fill();
      ctx.strokeStyle = series[0];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = series[0];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`z${i + 1}`, zx, zy);

      // x node
      const xx = spacing * (i + 1), xy = botRow;
      ctx.beginPath();
      ctx.arc(xx, xy, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = series[2] + '40';
      ctx.fill();
      ctx.strokeStyle = series[2];
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = series[2];
      ctx.fillText(`x${i + 1}`, xx, xy);

      // Arrows from each z_j (j<=i) to x_i
      for (let j = 0; j <= i; j++) {
        const fromX = spacing * (j + 1);
        const arrP = easedSub(progress, 0.1 + i * 0.12 + j * 0.02, 0.22 + i * 0.12 + j * 0.02);
        if (arrP > 0) {
          ctx.globalAlpha = arrP * depP;
          ctx.strokeStyle = j === i ? series[1] : colors.textMuted;
          ctx.lineWidth = j === i ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(fromX, zy + nodeR + 2);
          ctx.lineTo(xx, xy - nodeR - 2);
          ctx.stroke();
          // Arrowhead
          const angle = Math.atan2(xy - nodeR - 2 - (zy + nodeR + 2), xx - fromX);
          const hx = xx - 6 * Math.cos(angle), hy = xy - nodeR - 2 - 6 * Math.sin(angle);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(xx, xy - nodeR - 2);
          ctx.lineTo(hx - 4 * Math.cos(angle + 0.5), hy - 4 * Math.sin(angle + 0.5));
          ctx.lineTo(hx - 4 * Math.cos(angle - 0.5), hy - 4 * Math.sin(angle - 0.5));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Dependency label
      fadeInText(ctx, dep.label, xx, botRow + nodeR + 18, easeOut(depP), {
        color: colors.textSecondary, font: `10px ${fonts.body}`
      });

      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    });

    // Row labels
    const labP = easedSub(progress, 0.05, 0.15);
    fadeInText(ctx, 'z', 25, topRow, labP, {
      color: series[0], font: `bold 14px ${fonts.body}`, align: 'center'
    });
    fadeInText(ctx, 'x', 25, botRow, labP, {
      color: series[2], font: `bold 14px ${fonts.body}`, align: 'center'
    });

    // Jacobian matrix visualization
    const jacP = easedSub(progress, 0.6, 0.85);
    if (jacP > 0) {
      const matX = W / 2;
      const matY = H * 0.72;
      const cellSz = Math.min(W * 0.06, 28);

      ctx.save();
      ctx.globalAlpha = jacP;

      fadeInText(ctx, tx('scene1', 'triangular'), matX, matY - cellSz * D / 2 - 10, 1, {
        color: colors.insight, font: `bold 11px ${fonts.body}`
      });

      for (let row = 0; row < D; row++) {
        for (let col = 0; col < D; col++) {
          const x = matX - (D / 2) * cellSz + col * cellSz;
          const y = matY - (D / 2) * cellSz + cellSz + row * cellSz;
          const isLower = col <= row;
          const isDiag = col === row;

          if (isLower) {
            ctx.fillStyle = isDiag ? series[1] + '80' : series[0] + '30';
          } else {
            ctx.fillStyle = colors.panelBg;
          }
          ctx.fillRect(x + 1, y + 1, cellSz - 2, cellSz - 2);

          if (!isLower) {
            ctx.fillStyle = colors.textDimmed;
            ctx.font = `${cellSz * 0.4}px ${fonts.body}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', x + cellSz / 2, y + cellSz / 2);
          }

          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 1, y + 1, cellSz - 2, cellSz - 2);
        }
      }
      ctx.textBaseline = 'alphabetic';
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.85, 0.98);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'autoreg',
        'x_i = \\tau(z_i;\\, \\mathbf{x}_{1:i-1}) \\quad\\Rightarrow\\quad \\det J = \\prod_i \\frac{\\partial x_i}{\\partial z_i}',
        50, 93, fP, { color: colors.textPrimary, fontSize: '0.9em' });
    }
  }
});
