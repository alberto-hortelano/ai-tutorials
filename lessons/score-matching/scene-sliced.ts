// Scene 5: Sliced Score Matching — random projections for cheaper computation

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Problem: tr(∇s) is expensive
    const problemP = easedSub(progress, 0.08, 0.28);
    if (problemP > 0) {
      r.box(W * 0.1, H * 0.14, W * 0.38, 45, {
        fill: colors.panelBg, stroke: colors.error + '80', radius: 8,
      });
      fadeInText(ctx, tx('scene5', 'expensive'), W * 0.29, H * 0.14 + 22, problemP, {
        color: colors.error, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Solution: v^T(∇s)v is cheap
    const solP = easedSub(progress, 0.2, 0.4);
    if (solP > 0) {
      r.box(W * 0.52, H * 0.14, W * 0.38, 45, {
        fill: colors.panelBg, stroke: colors.insight + '80', radius: 8,
      });
      fadeInText(ctx, tx('scene5', 'cheap'), W * 0.71, H * 0.14 + 22, solP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Arrow from problem to solution
    const arrowP = easedSub(progress, 0.3, 0.45);
    if (arrowP > 0) {
      animateArrow(ctx, W * 0.49, H * 0.14 + 22, W * 0.52, H * 0.14 + 22, arrowP, {
        color: colors.warning, headSize: 8,
      });
    }

    // 2D visualization of random direction projections
    const vizCx = W / 2;
    const vizCy = H * 0.55;
    const vizR = Math.min(W, H) * 0.2;

    // Draw a circle representing high-dimensional space
    const circleP = easedSub(progress, 0.35, 0.5);
    if (circleP > 0) {
      ctx.save();
      ctx.globalAlpha = circleP * 0.3;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vizCx, vizCy, vizR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Draw a score vector at center
      ctx.save();
      ctx.globalAlpha = circleP;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      const sAngle = -Math.PI * 0.25;
      const sLen = vizR * 0.7;
      ctx.beginPath();
      ctx.moveTo(vizCx, vizCy);
      ctx.lineTo(vizCx + sLen * Math.cos(sAngle), vizCy + sLen * Math.sin(sAngle));
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = colors.accent;
      const ex = vizCx + sLen * Math.cos(sAngle);
      const ey = vizCy + sLen * Math.sin(sAngle);
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 6 * Math.cos(sAngle - 0.4), ey - 6 * Math.sin(sAngle - 0.4));
      ctx.lineTo(ex - 6 * Math.cos(sAngle + 0.4), ey - 6 * Math.sin(sAngle + 0.4));
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      fadeInText(ctx, 's_\u03b8(x)', ex + 10, ey - 8, circleP, {
        color: colors.accent, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
      });
    }

    // Random direction projections appearing one by one
    const dirs = [0.4, 1.5, 2.7, 3.8, 5.2]; // angles
    const projP = easedSub(progress, 0.48, 0.82);
    if (projP > 0) {
      const numVisible = Math.floor(projP * dirs.length) + 1;
      for (let i = 0; i < Math.min(numVisible, dirs.length); i++) {
        const angle = dirs[i];
        const localP = Math.min(1, (projP * dirs.length - i));
        if (localP <= 0) continue;

        ctx.save();
        ctx.globalAlpha = localP * 0.5;
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(vizCx - vizR * Math.cos(angle), vizCy - vizR * Math.sin(angle));
        ctx.lineTo(vizCx + vizR * Math.cos(angle), vizCy + vizR * Math.sin(angle));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Projection dot on the random direction
        const sAngle = -Math.PI * 0.25;
        const sLen = vizR * 0.7;
        const proj = Math.cos(sAngle - angle) * sLen;
        const dotX = vizCx + proj * Math.cos(angle);
        const dotY = vizCy + proj * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3 * localP, 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.fill();

        if (i === 0) {
          fadeInText(ctx, 'v', vizCx + vizR * Math.cos(angle) + 8, vizCy + vizR * Math.sin(angle), localP, {
            color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif', align: 'left',
          });
        }
      }

      fadeInText(ctx, tx('scene5', 'projection'), vizCx, vizCy + vizR + 20, projP, {
        color: colors.warning, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Formula
    const formulaP = easedSub(progress, 0.7, 0.88);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'sm-sliced',
        '\\mathbb{E}_v\\left[ v^\\top (\\nabla s_\\theta) v \\right] = \\text{tr}(\\nabla s_\\theta)',
        50, 90, formulaP, { color: colors.insight, fontSize: '1.1em' });
    }

    // Bottom label
    const bottomP = easedSub(progress, 0.9, 1);
    fadeInText(ctx, tx('scene5', 'randomDir'), W / 2, H - 22, bottomP, {
      color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
