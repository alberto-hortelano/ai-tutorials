// Scene 5: Asymmetry of KL — expanded with morphing Q and formulas

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { gaussian, lerp } from '../../engine/shared/math-utils';
import { formulaAppear, type FormulaManager } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Draw a curve in a local panel coordinate system */
function drawLocalCurve(
  ctx: CanvasRenderingContext2D,
  fn: (x: number) => number,
  toX: (x: number) => number, toY: (y: number) => number,
  xMin: number, xMax: number, steps: number,
  style: { color: string; lineWidth?: number; dash?: number[]; fill?: string },
): void {
  const dx = (xMax - xMin) / steps;

  // Fill
  if (style.fill) {
    ctx.fillStyle = style.fill;
    ctx.beginPath();
    ctx.moveTo(toX(xMin), toY(0));
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      ctx.lineTo(toX(x), toY(fn(x)));
    }
    ctx.lineTo(toX(xMax), toY(0));
    ctx.closePath();
    ctx.fill();
  }

  // Stroke
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.lineWidth ?? 2;
  if (style.dash) ctx.setLineDash(style.dash);
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const px = toX(x), py = toY(fn(x));
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  if (style.dash) ctx.setLineDash([]);
}

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 30,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;
    const fm: FormulaManager | undefined = state?.formulaManager;

    fadeInText(ctx, tx('scene5', 'title'), W / 2, 22, easedSub(progress, 0, 0.06), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // P = bimodal (mixture of two gaussians)
    const pBimodal = (x: number): number => 0.5 * gaussian(x, -2, 0.7) + 0.5 * gaussian(x, 2, 0.7);

    // Q starting point: single narrow Gaussian at 0
    const qInit = (x: number): number => gaussian(x, 0, 1.0);

    // Forward KL optimal Q: broad, covers both modes
    const qForwardFinal = (x: number): number => gaussian(x, 0, 2.2);

    // Reverse KL optimal Q: narrow, picks one mode
    const qReverseFinal = (x: number): number => gaussian(x, 2, 0.7);

    const xMin = -6, xMax = 6;
    const yMax = Math.max(pBimodal(2), pBimodal(-2)) * 1.4;
    const steps = 300;

    // ---- Left panel: Forward KL ----
    const leftW = W * 0.48;
    const panelTop = 42;
    const panelH = H * 0.48;

    const fwdP = easedSub(progress, 0.04, 0.46);
    if (fwdP > 0) {
      ctx.save();
      ctx.globalAlpha = fwdP;

      fadeInText(ctx, tx('scene5', 'fwdTitle'), leftW / 2, panelTop + 3, 1, {
        color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });
      fadeInText(ctx, tx('scene5', 'fwdBehavior'), leftW / 2, panelTop + 18, 1, {
        color: colors.insight, font: '11px "Segoe UI", system-ui, sans-serif'
      });

      const toX = (x: number): number => 10 + ((x - xMin) / (xMax - xMin)) * (leftW - 20);
      const toY = (y: number): number => panelTop + panelH - ((y / yMax) * (panelH - 32));

      // Draw P (static)
      drawLocalCurve(ctx, pBimodal, toX, toY, xMin, xMax, steps, {
        color: series[0], fill: series[0] + '20',
      });

      // Q morphing: starts as narrow Gaussian, becomes broad
      const morphT = easedSub(progress, 0.15, 0.42);
      if (morphT > 0) {
        const qMorphed = (x: number): number => {
          const t = easeInOut(Math.min(morphT, 1));
          return lerp(qInit(x), qForwardFinal(x), t);
        };

        // Show "spreading" fill for Q
        drawLocalCurve(ctx, qMorphed, toX, toY, xMin, xMax, steps, {
          color: series[2], dash: [6, 4], fill: series[2] + '12',
        });

        // Highlight uncovered region when Q hasn't spread enough
        if (morphT < 0.6) {
          const uncoverAlpha = (1 - morphT / 0.6) * 0.25;
          ctx.fillStyle = colors.error + Math.round(uncoverAlpha * 255).toString(16).padStart(2, '0');
          // Left mode region where Q is small
          ctx.beginPath();
          ctx.moveTo(toX(-4), toY(0));
          for (let i = 0; i <= 100; i++) {
            const x = -4 + i * 4 / 100;
            const pVal = pBimodal(x);
            const qVal = qMorphed(x);
            if (pVal > qVal) {
              ctx.lineTo(toX(x), toY(pVal - qVal));
            } else {
              ctx.lineTo(toX(x), toY(0));
            }
          }
          ctx.lineTo(toX(0), toY(0));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Labels
      ctx.fillStyle = series[0];
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', toX(-2), toY(pBimodal(-2)) - 8);
      if (morphT > 0.3) {
        ctx.fillStyle = series[2];
        const qLabel = morphT < 1 ? 'Q' : 'Q*';
        ctx.fillText(qLabel, toX(0), toY(qForwardFinal(0)) - 8);
      }

      ctx.restore();
    }

    // ---- Right panel: Reverse KL ----
    const rightStart = W * 0.52;
    const rightW = W * 0.48;

    const revP = easedSub(progress, 0.3, 0.7);
    if (revP > 0) {
      ctx.save();
      ctx.globalAlpha = revP;

      fadeInText(ctx, tx('scene5', 'revTitle'), rightStart + rightW / 2, panelTop + 3, 1, {
        color: series[3], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
      });
      fadeInText(ctx, tx('scene5', 'revBehavior'), rightStart + rightW / 2, panelTop + 18, 1, {
        color: colors.warning, font: '11px "Segoe UI", system-ui, sans-serif'
      });

      const toX = (x: number): number => rightStart + 10 + ((x - xMin) / (xMax - xMin)) * (rightW - 20);
      const toY = (y: number): number => panelTop + panelH - ((y / yMax) * (panelH - 32));

      // Draw P (static)
      drawLocalCurve(ctx, pBimodal, toX, toY, xMin, xMax, steps, {
        color: series[0], fill: series[0] + '20',
      });

      // Q morphing: starts at the mean, collapses to right mode
      const morphT = easedSub(progress, 0.45, 0.68);
      if (morphT > 0) {
        const qMorphed = (x: number): number => {
          const t = easeInOut(Math.min(morphT, 1));
          return lerp(qInit(x), qReverseFinal(x), t);
        };

        drawLocalCurve(ctx, qMorphed, toX, toY, xMin, xMax, steps, {
          color: series[2], dash: [6, 4], fill: series[2] + '12',
        });

        // Highlight the abandoned left mode
        if (morphT > 0.5) {
          const abandonAlpha = Math.min((morphT - 0.5) * 2, 1) * 0.2;
          ctx.fillStyle = colors.warning + Math.round(abandonAlpha * 255).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.moveTo(toX(-4.5), toY(0));
          for (let i = 0; i <= 100; i++) {
            const x = -4.5 + i * 3.5 / 100;
            ctx.lineTo(toX(x), toY(pBimodal(x)));
          }
          ctx.lineTo(toX(-1), toY(0));
          ctx.closePath();
          ctx.fill();

          // "missed!" annotation
          if (morphT > 0.7) {
            ctx.globalAlpha = (morphT - 0.7) / 0.3;
            fadeInText(ctx, tx('scene5', 'missedMode'), toX(-2), toY(pBimodal(-2)) + 14, 1, {
              color: colors.warning, font: 'bold 9px "Segoe UI", system-ui, sans-serif'
            });
            ctx.globalAlpha = revP;
          }
        }
      }

      // Labels
      ctx.fillStyle = series[0];
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('P', toX(-2), toY(pBimodal(-2)) - 8);
      if (morphT > 0.3) {
        ctx.fillStyle = series[2];
        const qLabel = morphT < 1 ? 'Q' : 'Q*';
        ctx.fillText(qLabel, toX(2), toY(qReverseFinal(2)) - 8);
      }

      ctx.restore();
    }

    // ---- Formulas: MLE forward KL, GAN reverse KL ----
    const fwdFormP = easedSub(progress, 0.72, 0.84);
    if (fm && fwdFormP > 0) {
      formulaAppear(fm, 'fwd-kl-formula',
        '\\text{MLE} \\Rightarrow D_{KL}(P \\| Q) \\;\\to\\; \\textbf{mode-covering}',
        50, 72, fwdFormP, { color: colors.insight, fontSize: '0.85em' });
    } else if (fm) {
      fm.hide('fwd-kl-formula');
    }

    const revFormP = easedSub(progress, 0.80, 0.92);
    if (fm && revFormP > 0) {
      formulaAppear(fm, 'rev-kl-formula',
        '\\text{GAN} \\Rightarrow D_{KL}(Q \\| P) \\;\\to\\; \\textbf{mode-seeking}',
        50, 82, revFormP, { color: colors.warning, fontSize: '0.85em' });
    } else if (fm) {
      fm.hide('rev-kl-formula');
    }

    // ---- Bottom insight ----
    const insP = easedSub(progress, 0.9, 1);
    fadeInText(ctx, tx('scene5', 'insight'), W / 2, H - 16, insP, {
      color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif'
    });
  }
});
