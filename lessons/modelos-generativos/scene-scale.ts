// Scene 3: The scale of the problem
// Exponential counter, contrast with training set, data manifold visualization

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ── Phase 1: Spinning counter for possible images ──
    const counterP = easedSub(progress, 0.08, 0.45);
    if (counterP > 0) {
      // Label
      fadeInText(ctx, tx('scene3', 'possibleLabel'), W / 2, H * 0.22, easedSub(progress, 0.08, 0.18), {
        color: colors.textSecondary, font: `14px ${fonts.body}`
      });

      // Animated exponent: spins through digits before settling on 289,000
      const spinP = easedSub(progress, 0.12, 0.4);
      if (spinP > 0) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // "10^" prefix
        ctx.globalAlpha = Math.min(spinP * 3, 1);
        ctx.fillStyle = colors.warning;
        ctx.font = `bold 28px ${fonts.body}`;
        ctx.fillText('10', W / 2 - 55, H * 0.33);

        // Spinning exponent
        const settled = spinP > 0.85;
        let exponentText: string;
        if (settled) {
          exponentText = '289,000';
        } else {
          // Spin through random-looking large numbers
          const tick = Math.floor(spinP * 30);
          const fakeExps = [
            '142,857', '203,441', '67,320', '318,007', '250,193',
            '176,542', '289,001', '99,720', '301,456', '223,847',
            '155,032', '289,100', '344,211', '189,305', '276,439',
            '133,682', '289,050', '307,891', '198,764', '258,003',
            '289,012', '289,003', '289,001', '289,000', '289,000',
            '289,000', '289,000', '289,000', '289,000', '289,000',
          ];
          exponentText = fakeExps[Math.min(tick, fakeExps.length - 1)];
        }

        ctx.fillStyle = settled ? colors.error : colors.warning;
        ctx.font = `bold 22px ${fonts.body}`;
        ctx.fillText(exponentText, W / 2 + 20, H * 0.3);

        ctx.restore();
      }
    }

    // ── Phase 2: Training set counter ──
    const trainP = easedSub(progress, 0.4, 0.65);
    if (trainP > 0) {
      fadeInText(ctx, tx('scene3', 'trainingLabel'), W / 2, H * 0.48, easedSub(progress, 0.4, 0.5), {
        color: colors.textSecondary, font: `14px ${fonts.body}`
      });

      // Count up to 15,000,000
      const countP = easedSub(progress, 0.45, 0.6);
      if (countP > 0) {
        const val = Math.floor(15000000 * easeOut(countP));
        const formatted = val.toLocaleString('en-US');

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = Math.min(countP * 3, 1);
        ctx.fillStyle = series[1];
        ctx.font = `bold 28px ${fonts.body}`;
        ctx.fillText(formatted, W / 2, H * 0.57);
        ctx.restore();
      }
    }

    // ── Visual scale comparison: tiny bar vs enormous implied space ──
    const barP = easedSub(progress, 0.55, 0.72);
    if (barP > 0) {
      const barY = H * 0.67;
      const barLeft = W * 0.1;
      const barFullW = W * 0.8;

      ctx.save();
      ctx.globalAlpha = barP;

      // Full bar (representing possible space) - just outline
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.strokeRect(barLeft, barY, barFullW, 14);

      // Tiny sliver for training data
      const sliver = Math.max(2, barFullW * 0.003 * easeOut(barP));
      ctx.fillStyle = series[1];
      ctx.fillRect(barLeft, barY, sliver, 14);

      // Labels
      ctx.font = `10px ${fonts.body}`;
      ctx.fillStyle = colors.textDimmed;
      ctx.textAlign = 'left';
      ctx.fillText('15M', barLeft, barY + 28);
      ctx.textAlign = 'right';
      ctx.fillText('10^289,000', barLeft + barFullW, barY + 28);

      ctx.restore();
    }

    // ── Phase 3: Data manifold — thin curve within a large bounding box ──
    const manifoldP = easedSub(progress, 0.7, 0.95);
    if (manifoldP > 0) {
      const boxCx = W / 2;
      const boxCy = H * 0.85;
      const boxW = W * 0.55;
      const boxH = H * 0.18;

      ctx.save();
      ctx.globalAlpha = manifoldP;

      // Bounding box — represents full space
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxCx - boxW / 2, boxCy - boxH / 2, boxW, boxH);
      ctx.setLineDash([]);

      // Thin sinuous manifold curve through the box
      const curveP = easedSub(progress, 0.75, 0.92);
      if (curveP > 0) {
        ctx.strokeStyle = colors.insight;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const steps = 100;
        const drawSteps = Math.floor(steps * curveP);
        for (let i = 0; i <= drawSteps; i++) {
          const t = i / steps;
          const px = (boxCx - boxW / 2 + 15) + t * (boxW - 30);
          const py = boxCy + Math.sin(t * Math.PI * 3.5) * boxH * 0.3
                     + Math.cos(t * Math.PI * 1.5) * boxH * 0.1;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Glow
        ctx.strokeStyle = colors.insight + '40';
        ctx.lineWidth = 8;
        ctx.beginPath();
        for (let i = 0; i <= drawSteps; i++) {
          const t = i / steps;
          const px = (boxCx - boxW / 2 + 15) + t * (boxW - 30);
          const py = boxCy + Math.sin(t * Math.PI * 3.5) * boxH * 0.3
                     + Math.cos(t * Math.PI * 1.5) * boxH * 0.1;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Manifold label
      fadeInText(ctx, tx('scene3', 'manifoldLabel'), boxCx, boxCy - boxH / 2 - 10, easedSub(progress, 0.82, 0.92), {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });

      ctx.restore();
    }
  }
});
