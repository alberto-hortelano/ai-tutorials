// Scene 4: Discriminative vs Generative
// Split screen: left = decision boundary, right = density contours

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Seeded RNG for reproducible scatter points
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// Generate two-class Gaussian clusters
interface ClassPoint { x: number; y: number; cls: number }

function generateTwoClassData(n: number, seed: number): ClassPoint[] {
  const rng = seededRandom(seed);
  const points: ClassPoint[] = [];

  // Box-Muller for Gaussian sampling
  function randn(): number {
    const u1 = rng();
    const u2 = rng();
    return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }

  // Class 0: cluster at (-1.2, 0.8)
  for (let i = 0; i < n; i++) {
    points.push({
      x: -1.2 + randn() * 0.7,
      y: 0.8 + randn() * 0.6,
      cls: 0,
    });
  }

  // Class 1: cluster at (1.2, -0.6)
  for (let i = 0; i < n; i++) {
    points.push({
      x: 1.2 + randn() * 0.65,
      y: -0.6 + randn() * 0.7,
      cls: 1,
    });
  }

  return points;
}

const data = generateTwoClassData(25, 314);

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

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Split: left half = discriminative, right half = generative
    const midX = W / 2;
    const plotTop = 55;
    const plotBottom = H - 50;
    const plotH = plotBottom - plotTop;
    const plotLeft = 20;
    const plotRight = midX - 15;
    const plotW = plotRight - plotLeft;

    const rightLeft = midX + 15;
    const rightRight = W - 20;
    const rightW = rightRight - rightLeft;

    // Data coordinate system: [-3, 3] x [-3, 3]
    const dataMin = -3;
    const dataMax = 3;
    const dataRange = dataMax - dataMin;

    // Convert data coord to left panel pixel
    const toLeftPx = (dx: number) => plotLeft + ((dx - dataMin) / dataRange) * plotW;
    const toLeftPy = (dy: number) => plotBottom - ((dy - dataMin) / dataRange) * plotH;

    // Convert data coord to right panel pixel
    const toRightPx = (dx: number) => rightLeft + ((dx - dataMin) / dataRange) * rightW;
    const toRightPy = (dy: number) => plotBottom - ((dy - dataMin) / dataRange) * plotH;

    // Divider line
    const divP = easedSub(progress, 0.05, 0.15);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP * 0.4;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(midX, plotTop - 10);
      ctx.lineTo(midX, plotBottom + 25);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Panel labels
    fadeInText(ctx, tx('scene4', 'discTitle'), plotLeft + plotW / 2, plotTop - 5, easedSub(progress, 0.05, 0.15), {
      color: series[0], font: `bold 13px ${fonts.body}`
    });
    fadeInText(ctx, tx('scene4', 'genTitle'), rightLeft + rightW / 2, plotTop - 5, easedSub(progress, 0.05, 0.15), {
      color: series[1], font: `bold 13px ${fonts.body}`
    });

    // ═══════ Draw scatter points (both panels) ═══════
    const scatterP = easedSub(progress, 0.1, 0.3);
    if (scatterP > 0) {
      const classColors = [series[0], series[3]]; // indigo, amber

      ctx.save();
      // Left panel dots
      for (const pt of data) {
        const frac = data.indexOf(pt) / data.length;
        if (frac > scatterP) continue;
        const alpha = Math.min((scatterP - frac) * data.length, 1) * 0.8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = classColors[pt.cls];
        ctx.beginPath();
        ctx.arc(toLeftPx(pt.x), toLeftPy(pt.y), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Right panel dots
      for (const pt of data) {
        const frac = data.indexOf(pt) / data.length;
        if (frac > scatterP) continue;
        const alpha = Math.min((scatterP - frac) * data.length, 1) * 0.8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = classColors[pt.cls];
        ctx.beginPath();
        ctx.arc(toRightPx(pt.x), toRightPy(pt.y), 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ═══════ Left panel: Decision boundary ═══════
    const boundaryP = easedSub(progress, 0.28, 0.52);
    if (boundaryP > 0) {
      ctx.save();
      ctx.globalAlpha = easeOut(boundaryP);

      // Draw a linear decision boundary: roughly the perpendicular bisector
      // between the two cluster centers (-1.2,0.8) and (1.2,-0.6)
      // Midpoint: (0, 0.1), direction perpendicular to (2.4, -1.4) => (1.4, 2.4)
      const bx1 = toLeftPx(-2.5);
      const by1 = toLeftPy(-2.5 * (2.4 / 1.4) + 0.1);
      const bx2 = toLeftPx(2.5);
      const by2 = toLeftPy(2.5 * (2.4 / 1.4) + 0.1);

      // Draw the line, clipped to panel
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      // Interpolate along the boundary
      const steps = 50;
      const drawSteps = Math.floor(steps * boundaryP);
      for (let i = 0; i <= drawSteps; i++) {
        const t = i / steps;
        const dataX = -2.5 + 5 * t;
        // Line equation: y = (2.4/1.4)*x + 0.1 = 1.714*x + 0.1
        const dataY = 1.714 * dataX + 0.1;
        const px = toLeftPx(dataX);
        const py = toLeftPy(dataY);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();
    }

    // Decision boundary label
    fadeInText(ctx, tx('scene4', 'discDesc'), plotLeft + plotW / 2, plotBottom + 15, easedSub(progress, 0.4, 0.52), {
      color: colors.textMuted, font: `11px ${fonts.body}`
    });

    // ═══════ Right panel: Density contour ellipses ═══════
    const contourP = easedSub(progress, 0.52, 0.85);
    if (contourP > 0) {
      const classColors = [series[0] + '30', series[3] + '30'];
      const classStroke = [series[0], series[3]];

      // Cluster 0 centered at (-1.2, 0.8), sigma ~ (0.7, 0.6)
      // Cluster 1 centered at (1.2, -0.6), sigma ~ (0.65, 0.7)
      const clusters = [
        { cx: -1.2, cy: 0.8, sx: 0.7, sy: 0.6 },
        { cx: 1.2, cy: -0.6, sx: 0.65, sy: 0.7 },
      ];

      ctx.save();
      for (let c = 0; c < 2; c++) {
        const cl = clusters[c];
        // Draw 3 concentric ellipses (1-sigma, 2-sigma, 3-sigma)
        const sigmas = [1, 2, 2.8];
        for (let s = sigmas.length - 1; s >= 0; s--) {
          const sigma = sigmas[s];
          const ellipseP = easedSub(progress, 0.52 + s * 0.06, 0.65 + s * 0.06);
          if (ellipseP <= 0) continue;

          const rx = sigma * cl.sx;
          const ry = sigma * cl.sy;
          const pxCx = toRightPx(cl.cx);
          const pyCy = toRightPy(cl.cy);
          const pxRx = (rx / dataRange) * rightW * easeOut(ellipseP);
          const pyRy = (ry / dataRange) * plotH * easeOut(ellipseP);

          ctx.globalAlpha = (0.5 - s * 0.12) * easeOut(ellipseP);
          ctx.fillStyle = classColors[c];
          ctx.beginPath();
          ctx.ellipse(pxCx, pyCy, pxRx, pyRy, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = (0.8 - s * 0.15) * easeOut(ellipseP);
          ctx.strokeStyle = classStroke[c];
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(pxCx, pyCy, pxRx, pyRy, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Generative label
    fadeInText(ctx, tx('scene4', 'genDesc'), rightLeft + rightW / 2, plotBottom + 15, easedSub(progress, 0.65, 0.78), {
      color: colors.textMuted, font: `11px ${fonts.body}`
    });

    // ═══════ Formulas ═══════
    if (state.formulaManager) {
      const fDiscP = easedSub(progress, 0.35, 0.5);
      if (fDiscP > 0) {
        formulaAppear(state.formulaManager, 'disc', 'p(y \\mid x)', 25, 93, fDiscP, {
          color: series[0], fontSize: '1em'
        });
      }
      const fGenP = easedSub(progress, 0.6, 0.75);
      if (fGenP > 0) {
        formulaAppear(state.formulaManager, 'gen', 'p(x)', 75, 93, fGenP, {
          color: series[1], fontSize: '1em'
        });
      }
    }
  }
});
