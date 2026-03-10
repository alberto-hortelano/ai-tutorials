// Scene 4: NICE — additive coupling, det J = 1
// Enhanced: specific 2D example with x₁=z₁, x₂=z₂+sin(z₁)

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { animateDots } from '../../engine/animation/particles';
import { sampleGaussian2D } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 20,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const nPts = 150;
    const basePts = sampleGaussian2D(nPts, 99);
    const scale = Math.min(W, H) * 0.1;

    // Side-by-side: before (z) and after (x) with NICE coupling
    const panelW = W * 0.42;
    const panelH = H * 0.42;
    const panelTop = 55;

    // --- Left panel: z ~ N(0,I) ---
    const leftCx = W * 0.03 + panelW / 2;
    const leftCy = panelTop + panelH / 2;
    const leftP = easedSub(progress, 0.05, 0.25);
    if (leftP > 0) {
      ctx.save();
      ctx.globalAlpha = leftP;

      // Panel border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(leftCx - panelW / 2, panelTop, panelW, panelH, 6);
      ctx.stroke();

      fadeInText(ctx, tx('scene4', 'beforeLabel'), leftCx, panelTop - 5, 1, {
        color: series[0], font: `bold 12px ${fonts.body}`
      });

      // Draw original Gaussian dots
      const pts = basePts.map(p => ({
        x: leftCx + p.x * scale,
        y: leftCy - p.y * scale,
      }));
      animateDots(ctx, pts, Math.min(leftP * 2, 1), {
        color: series[0], radius: 2.5, sequential: false,
      });

      // Draw axis cross
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftCx - panelW * 0.4, leftCy);
      ctx.lineTo(leftCx + panelW * 0.4, leftCy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(leftCx, panelTop + 10);
      ctx.lineTo(leftCx, panelTop + panelH - 10);
      ctx.stroke();

      ctx.fillStyle = colors.textMuted;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('z\u2081', leftCx + panelW * 0.38, leftCy - 5);
      ctx.fillText('z\u2082', leftCx + 8, panelTop + 15);

      ctx.restore();
    }

    // --- Right panel: x = NICE(z) with animation ---
    const rightCx = W * 0.55 + panelW / 2;
    const rightCy = panelTop + panelH / 2;
    const morphT = easedSub(progress, 0.2, 0.55, easeInOut);
    const rightP = easedSub(progress, 0.15, 0.35);
    if (rightP > 0) {
      ctx.save();
      ctx.globalAlpha = rightP;

      // Panel border
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(rightCx - panelW / 2, panelTop, panelW, panelH, 6);
      ctx.stroke();

      fadeInText(ctx, tx('scene4', 'afterLabel'), rightCx, panelTop - 5, 1, {
        color: series[1], font: `bold 12px ${fonts.body}`
      });

      // NICE transform: x₁ = z₁, x₂ = z₂ + m(z₁) where m(z₁) = sin(2·z₁)
      const pts = basePts.map(p => {
        const shift = morphT * Math.sin(2 * p.x);
        return {
          x: rightCx + p.x * scale,
          y: rightCy - (p.y + shift) * scale,
        };
      });

      animateDots(ctx, pts, Math.min(rightP * 2, 1), {
        color: series[1], radius: 2.5, sequential: false,
      });

      // Draw axis cross
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rightCx - panelW * 0.4, rightCy);
      ctx.lineTo(rightCx + panelW * 0.4, rightCy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightCx, panelTop + 10);
      ctx.lineTo(rightCx, panelTop + panelH - 10);
      ctx.stroke();

      ctx.fillStyle = colors.textMuted;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('x\u2081', rightCx + panelW * 0.38, rightCy - 5);
      ctx.fillText('x\u2082', rightCx + 8, panelTop + 15);

      // Draw the sin curve as a guide line (the shift function)
      if (morphT > 0.3) {
        const guideP = (morphT - 0.3) / 0.7;
        ctx.globalAlpha = guideP * 0.4 * rightP;
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const steps = 100;
        for (let i = 0; i <= steps; i++) {
          const z1 = -3 + (i / steps) * 6;
          const shiftVal = Math.sin(2 * z1);
          const sx = rightCx + z1 * scale;
          const sy = rightCy - shiftVal * scale;
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();
    }

    // Example label
    const exP = easedSub(progress, 0.35, 0.5);
    fadeInText(ctx, tx('scene4', 'exampleLabel'), W / 2, panelTop + panelH + 15, exP, {
      color: colors.warning, font: `bold 11px ${fonts.body}`
    });

    // Area preservation visual — small unit square morph
    const areaP = easedSub(progress, 0.5, 0.65);
    if (areaP > 0) {
      ctx.save();
      ctx.globalAlpha = areaP * 0.6;
      const sz = scale * 0.6;

      const corners = [
        { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }
      ].map(c => ({
        x: rightCx + c.x * sz * 0.3,
        y: rightCy - (c.y + morphT * Math.sin(2 * c.x * 0.3) * 0.5) * sz * 0.3,
      }));

      ctx.fillStyle = series[3] + '20';
      ctx.strokeStyle = series[3];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Properties
    const detP = easedSub(progress, 0.58, 0.72);
    fadeInText(ctx, tx('scene4', 'detOne'), W * 0.3, H * 0.78, detP, {
      color: colors.insight, font: `bold 14px ${fonts.body}`
    });

    const volP = easedSub(progress, 0.68, 0.8);
    fadeInText(ctx, tx('scene4', 'volumePreserving'), W * 0.7, H * 0.78, volP, {
      color: colors.warning, font: `bold 12px ${fonts.body}`
    });

    // Formula
    const fP = easedSub(progress, 0.8, 0.95);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'nice',
        '\\mathbf{x}_1 = \\mathbf{z}_1, \\quad \\mathbf{x}_2 = \\mathbf{z}_2 + m(\\mathbf{z}_1) \\quad\\Rightarrow\\quad \\det J = 1',
        50, 92, fP, { color: colors.textPrimary, fontSize: '0.95em' });
    }
  }
});
