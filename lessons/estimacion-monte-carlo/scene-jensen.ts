// Scene 5: Jensen's Inequality
// For concave f (log): log(E[X]) >= E[log(X)]. Show log curve, dots, gap.

import { Scene } from '../../engine/scene';
import { colors, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateCurve } from '../../engine/animation/graph';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { clamp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 24,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula
    formulaAppear(state.formulaManager, 'jensen-formula',
      '\\log\\bigl(\\mathbb{E}[X]\\bigr) \\;\\geq\\; \\mathbb{E}[\\log(X)]',
      50, 12, easedSub(progress, 0.05, 0.2), { color: colors.textPrimary, fontSize: '1.1em' });

    // Set up data-space viewport for log curve
    r.setViewport(0, 6, -1.5, 2.5);

    // Axes
    const axesP = easedSub(progress, 0.08, 0.18);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: '', xTicks: 6, yTicks: 4 });
      r.drawZeroLine();
      ctx.globalAlpha = 1;
    }

    // Log curve
    const logFn = (x: number) => x > 0.05 ? Math.log(x) : Math.log(0.05);
    const curveProg = easedSub(progress, 0.12, 0.3);
    if (curveProg > 0) {
      animateCurve(r, logFn, colors.accent, curveProg, 2.5);
    }

    // Label on log curve
    fadeInText(ctx, tx('scene5', 'logCurve'), r.toX(5.2), r.toY(logFn(5.2)) - 12, easedSub(progress, 0.25, 0.32), {
      color: colors.accent, font: `bold 11px ${fonts.body}`
    });

    // Sample points: x1=1, x2=2, x3=5 (with equal weight 1/3)
    const xs = [1, 2, 5];
    const logXs = xs.map(x => Math.log(x));

    // E[X] = mean of xs
    const eX = xs.reduce((a, b) => a + b, 0) / xs.length; // 2.667
    const logEX = Math.log(eX); // log(2.667) ≈ 0.981
    const eLogX = logXs.reduce((a, b) => a + b, 0) / logXs.length; // (0 + 0.693 + 1.609)/3 ≈ 0.767

    // Draw dots on the log curve
    const dotProg = easedSub(progress, 0.3, 0.45);
    if (dotProg > 0) {
      for (let i = 0; i < xs.length; i++) {
        const xi = xs[i];
        const yi = logFn(xi);
        const dotT = easeOut(clamp(dotProg * 3 - i * 0.8, 0, 1));
        if (dotT <= 0) continue;

        const px = r.toX(xi);
        const py = r.toY(yi);

        // Dot on curve
        ctx.beginPath();
        ctx.arc(px, py, 5 * dotT, 0, Math.PI * 2);
        ctx.fillStyle = colors.warning;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        // Vertical dashed line from x-axis to curve
        ctx.strokeStyle = colors.textDimmed;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = 0.5 * dotT;
        ctx.beginPath();
        ctx.moveTo(px, r.toY(0));
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // x label
        ctx.fillStyle = colors.textMuted;
        ctx.font = `10px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = dotT;
        ctx.fillText(`x${i + 1}=${xi}`, px, r.toY(0) + 14);
      }
      ctx.globalAlpha = 1;
    }

    // Show E[X] on x-axis and log(E[X]) on curve (the HIGH point)
    const avgProg = easedSub(progress, 0.48, 0.62);
    if (avgProg > 0) {
      const exPx = r.toX(eX);
      const logExPy = r.toY(logEX);

      // Vertical line at E[X]
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.globalAlpha = avgProg;
      ctx.beginPath();
      ctx.moveTo(exPx, r.toY(0));
      ctx.lineTo(exPx, logExPy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot at log(E[X])
      ctx.beginPath();
      ctx.arc(exPx, logExPy, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.insight;
      ctx.fill();

      // Label: log(E[X])
      fadeInText(ctx, tx('scene5', 'logOfAvg'), exPx + 12, logExPy - 8, avgProg, {
        color: colors.insight, font: `bold 11px ${fonts.body}`, align: 'left'
      });
      ctx.globalAlpha = 1;
    }

    // Show E[log(X)] (the LOW point) — average of the y-values
    const avgLogProg = easedSub(progress, 0.58, 0.72);
    if (avgLogProg > 0) {
      const eLogPy = r.toY(eLogX);
      const exPx = r.toX(eX);

      // Horizontal dashed line at E[log(X)]
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.globalAlpha = avgLogProg;
      ctx.beginPath();
      ctx.moveTo(r.toX(0.2), eLogPy);
      ctx.lineTo(exPx, eLogPy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Dot at E[log(X)]
      ctx.beginPath();
      ctx.arc(exPx, eLogPy, 6, 0, Math.PI * 2);
      ctx.fillStyle = colors.error;
      ctx.fill();

      // Label: E[log(X)]
      fadeInText(ctx, tx('scene5', 'avgOfLogs'), exPx + 12, eLogPy + 12, avgLogProg, {
        color: colors.error, font: `bold 11px ${fonts.body}`, align: 'left'
      });
      ctx.globalAlpha = 1;
    }

    // Show gap arrow between the two points
    const gapProg = easedSub(progress, 0.72, 0.88);
    if (gapProg > 0) {
      const exPx = r.toX(eX);
      const logExPy = r.toY(logEX);
      const eLogPy = r.toY(eLogX);

      // Vertical arrow from E[log(X)] down to log(E[X]) actually from low to high
      animateArrow(ctx, exPx - 15, eLogPy, exPx - 15, logExPy, gapProg, {
        color: colors.warning, headSize: 6, lineWidth: 2
      });

      // Gap label
      fadeInText(ctx, tx('scene5', 'gapLabel'), exPx - 25, (logExPy + eLogPy) / 2, gapProg, {
        color: colors.warning, font: `bold 11px ${fonts.body}`, align: 'right'
      });

      // Highlight: glow the >= in the formula region
      const glowAlpha = 0.3 + 0.2 * Math.sin(progress * 20);
      ctx.fillStyle = colors.warning;
      ctx.globalAlpha = glowAlpha * gapProg;
      ctx.font = `bold 24px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('\u2265', W / 2, H - 22);
      ctx.globalAlpha = 1;
    }
  }
});
