// Scene 2: Three fundamental tasks — density estimation, sampling, representation learning
// Three-panel layout with sequential animations

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateDots } from '../../engine/animation/particles';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Gaussian helper for the bell curve
function gaussian(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// Generate deterministic sample points from Gaussian
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene2', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Panel dimensions — three columns
    const panelY = 55;
    const panelH = H - panelY - 20;
    const panelW = (W - 40) / 3;
    const gap = 10;
    const panels = [
      { x: 10, label: tx('scene2', 'densityTitle'), desc: tx('scene2', 'densityDesc'), color: series[0] },
      { x: 10 + panelW + gap, label: tx('scene2', 'samplingTitle'), desc: tx('scene2', 'samplingDesc'), color: series[1] },
      { x: 10 + 2 * (panelW + gap), label: tx('scene2', 'reprTitle'), desc: tx('scene2', 'reprDesc'), color: series[2] },
    ];

    // Draw panel borders (subtle)
    const bordersP = easedSub(progress, 0.04, 0.15);
    if (bordersP > 0) {
      ctx.save();
      ctx.globalAlpha = bordersP * 0.3;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (const p of panels) {
        ctx.strokeRect(p.x, panelY, panelW, panelH);
      }
      ctx.restore();
    }

    // ═══════ Panel 1: Density estimation — bell curve with sliding query dot ═══════
    const p1 = panels[0];
    const densP = easedSub(progress, 0.08, 0.35);
    if (densP > 0) {
      // Panel title
      fadeInText(ctx, p1.label, p1.x + panelW / 2, panelY + 18, densP, {
        color: p1.color, font: `bold 13px ${fonts.body}`
      });

      // Draw bell curve in pixel space
      const curveBase = panelY + panelH - 25;
      const curveTop = panelY + 40;
      const curveH = curveBase - curveTop;
      const curveLeft = p1.x + 15;
      const curveRight = p1.x + panelW - 15;
      const curveW = curveRight - curveLeft;

      const curveP = easedSub(progress, 0.1, 0.25);
      if (curveP > 0) {
        ctx.save();
        ctx.globalAlpha = curveP;

        // Axis line
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(curveLeft, curveBase);
        ctx.lineTo(curveRight, curveBase);
        ctx.stroke();

        // Bell curve
        ctx.beginPath();
        ctx.strokeStyle = p1.color;
        ctx.lineWidth = 2;
        const steps = 80;
        for (let i = 0; i <= steps * curveP; i++) {
          const t = i / steps;
          const xVal = -3 + 6 * t;
          const yVal = gaussian(xVal, 0, 1);
          const px = curveLeft + t * curveW;
          const py = curveBase - (yVal / 0.42) * curveH * 0.85;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.restore();
      }

      // Sliding query dot
      const dotP = easedSub(progress, 0.22, 0.35);
      if (dotP > 0) {
        const queryX = -1.5 + 3.0 * dotP; // slide from left to right
        const queryY = gaussian(queryX, 0, 1);
        const dotPx = curveLeft + ((queryX + 3) / 6) * curveW;
        const dotPy = curveBase - (queryY / 0.42) * curveH * 0.85;

        ctx.save();
        ctx.globalAlpha = Math.min(dotP * 3, 1);
        // Vertical dashed line
        ctx.strokeStyle = colors.warning;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(dotPx, curveBase);
        ctx.lineTo(dotPx, dotPy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dot
        ctx.fillStyle = colors.warning;
        ctx.beginPath();
        ctx.arc(dotPx, dotPy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Description
      fadeInText(ctx, p1.desc, p1.x + panelW / 2, panelY + panelH - 8, easedSub(progress, 0.15, 0.25), {
        color: colors.textMuted, font: `11px ${fonts.body}`
      });
    }

    // ═══════ Panel 2: Sampling — dots raining down into histogram ═══════
    const p2 = panels[1];
    const sampP = easedSub(progress, 0.33, 0.65);
    if (sampP > 0) {
      fadeInText(ctx, p2.label, p2.x + panelW / 2, panelY + 18, sampP, {
        color: p2.color, font: `bold 13px ${fonts.body}`
      });

      const histBase = panelY + panelH - 25;
      const histTop = panelY + 55;
      const histH = histBase - histTop;
      const histLeft = p2.x + 15;
      const histRight = p2.x + panelW - 15;
      const histW = histRight - histLeft;

      // Histogram bins (Gaussian-shaped heights)
      const nBins = 9;
      const binW = histW / nBins;
      const binHeights = Array.from({ length: nBins }, (_, i) => {
        const center = -3 + 6 * (i + 0.5) / nBins;
        return gaussian(center, 0, 1) / 0.42;
      });

      const barsP = easedSub(progress, 0.38, 0.55);
      if (barsP > 0) {
        ctx.save();
        ctx.globalAlpha = barsP;

        // Axis line
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(histLeft, histBase);
        ctx.lineTo(histRight, histBase);
        ctx.stroke();

        // Bars
        for (let i = 0; i < nBins; i++) {
          const barH = binHeights[i] * histH * 0.8 * easeOut(Math.min(barsP * 1.5, 1));
          ctx.fillStyle = p2.color + '80';
          ctx.fillRect(histLeft + i * binW + 1, histBase - barH, binW - 2, barH);
          ctx.strokeStyle = p2.color;
          ctx.lineWidth = 1;
          ctx.strokeRect(histLeft + i * binW + 1, histBase - barH, binW - 2, barH);
        }
        ctx.restore();
      }

      // Falling dots
      const dotsP = easedSub(progress, 0.42, 0.6);
      if (dotsP > 0) {
        const rng = seededRandom(99);
        const nDots = 12;
        const dotPoints = [];
        for (let i = 0; i < nDots; i++) {
          const frac = i / nDots;
          if (frac > dotsP) break;
          const binIdx = Math.floor(rng() * nBins);
          const fallProgress = Math.min((dotsP - frac) * nDots, 1);
          const startY = panelY + 40;
          const endY = histBase - binHeights[binIdx] * histH * 0.8 - 6;
          const dotX = histLeft + (binIdx + 0.3 + rng() * 0.4) * binW;
          const dotY = startY + (endY - startY) * easeOut(fallProgress);
          dotPoints.push({ x: dotX, y: dotY });
        }
        animateDots(ctx, dotPoints, 1, { color: p2.color, radius: 3, sequential: false });
      }

      fadeInText(ctx, p2.desc, p2.x + panelW / 2, panelY + panelH - 8, easedSub(progress, 0.4, 0.5), {
        color: colors.textMuted, font: `11px ${fonts.body}`
      });
    }

    // ═══════ Panel 3: Representation learning — gray dots colored into clusters ═══════
    const p3 = panels[2];
    const reprP = easedSub(progress, 0.6, 0.95);
    if (reprP > 0) {
      fadeInText(ctx, p3.label, p3.x + panelW / 2, panelY + 18, reprP, {
        color: p3.color, font: `bold 13px ${fonts.body}`
      });

      const clusterCx = p3.x + panelW / 2;
      const clusterCy = panelY + panelH / 2 + 10;
      const rng = seededRandom(77);

      // Generate 3 clusters
      const clusterColors = [series[0], series[1], series[3]];
      const centers = [
        { cx: clusterCx - panelW * 0.2, cy: clusterCy - 15 },
        { cx: clusterCx + panelW * 0.15, cy: clusterCy - 25 },
        { cx: clusterCx, cy: clusterCy + 25 },
      ];

      const dotsPerCluster = 10;
      const allDots: { x: number; y: number; cluster: number }[] = [];
      for (let c = 0; c < 3; c++) {
        for (let j = 0; j < dotsPerCluster; j++) {
          allDots.push({
            x: centers[c].cx + (rng() - 0.5) * panelW * 0.28,
            y: centers[c].cy + (rng() - 0.5) * panelH * 0.25,
            cluster: c,
          });
        }
      }

      // Draw dots — gray first, then transition to colored
      const colorT = easedSub(progress, 0.72, 0.9);
      const dotsAppearP = easedSub(progress, 0.62, 0.75);
      if (dotsAppearP > 0) {
        ctx.save();
        for (const d of allDots) {
          const alpha = Math.min(dotsAppearP * 2, 0.85);
          ctx.globalAlpha = alpha;

          // Interpolate between gray and cluster color
          if (colorT > 0) {
            ctx.fillStyle = clusterColors[d.cluster];
            ctx.globalAlpha = alpha * colorT;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = colors.textDimmed;
            ctx.globalAlpha = alpha * (1 - colorT);
            ctx.beginPath();
            ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = colors.textDimmed;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      fadeInText(ctx, p3.desc, p3.x + panelW / 2, panelY + panelH - 8, easedSub(progress, 0.7, 0.8), {
        color: colors.textMuted, font: `11px ${fonts.body}`
      });
    }
  }
});
