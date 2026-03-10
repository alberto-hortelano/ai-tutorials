// Scene 7: Latent Space Results — VAE (one blob) vs GMVAE (K clusters)

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { lerp } from '../../engine/shared/math-utils';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const K = 5;
const N_PER_CLASS = 40;
const TOTAL = K * N_PER_CLASS;

// Cluster centers for GMVAE (spread around in 2D)
const clusterCenters = [
  { x: -2.0, y: 1.5 },
  { x: 1.8, y: 2.0 },
  { x: 0.0, y: -1.8 },
  { x: -2.2, y: -1.5 },
  { x: 2.5, y: -0.8 },
];

// Generate points for both views
interface ColoredPoint {
  blobX: number; blobY: number;   // VAE: single Gaussian
  clustX: number; clustY: number; // GMVAE: separated clusters
  cls: number;
}

function generatePoints(seed: number): ColoredPoint[] {
  const rng = mulberry32(seed);
  const pts: ColoredPoint[] = [];
  for (let k = 0; k < K; k++) {
    for (let i = 0; i < N_PER_CLASS; i++) {
      // Box-Muller for 2D Gaussian samples
      const u1 = rng(), u2 = rng();
      const u3 = rng(), u4 = rng();
      const r1 = Math.sqrt(-2 * Math.log(u1 + 1e-10));
      const g1x = r1 * Math.cos(2 * Math.PI * u2);
      const g1y = r1 * Math.sin(2 * Math.PI * u2);
      const r2 = Math.sqrt(-2 * Math.log(u3 + 1e-10));
      const g2x = r2 * Math.cos(2 * Math.PI * u4);
      const g2y = r2 * Math.sin(2 * Math.PI * u4);

      pts.push({
        blobX: g1x * 1.0,
        blobY: g1y * 1.0,
        clustX: clusterCenters[k].x + g2x * 0.4,
        clustY: clusterCenters[k].y + g2y * 0.4,
        cls: k,
      });
    }
  }
  return pts;
}

const allPts = generatePoints(77);

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 25,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Side-by-side panels
    const panelW = W * 0.42;
    const panelH = H * 0.58;
    const panelY = H * 0.16;
    const gapX = W * 0.04;
    const leftX = W / 2 - gapX / 2 - panelW;
    const rightX = W / 2 + gapX / 2;

    const scale = Math.min(panelW, panelH) * 0.13;

    // Panel drawing helper
    function drawPanel(
      px: number, py: number, pw: number, ph: number,
      title: string, borderColor: string, alpha: number,
    ): { cx: number; cy: number } {
      if (alpha <= 0) return { cx: px + pw / 2, cy: py + ph / 2 };
      ctx.save();
      ctx.globalAlpha = alpha;
      r.box(px, py, pw, ph, {
        fill: colors.panelBg, stroke: borderColor, radius: 8, lineWidth: 1.5,
      });
      ctx.fillStyle = borderColor;
      ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(title, px + pw / 2, py + 8);
      ctx.restore();
      return { cx: px + pw / 2, cy: py + ph / 2 + 10 };
    }

    // ── Left panel: Standard VAE (blob) ──
    const leftPanelP = easedSub(progress, 0.06, 0.2);
    const { cx: lcx, cy: lcy } = drawPanel(leftX, panelY, panelW, panelH,
      tx('scene7', 'vaeTitle'), colors.textMuted, leftPanelP);

    // Draw VAE dots (single blob, all classes mixed)
    const blobDotsP = easedSub(progress, 0.15, 0.45);
    if (blobDotsP > 0) {
      const visCount = Math.floor(TOTAL * Math.min(blobDotsP, 1));
      for (let i = 0; i < visCount; i++) {
        const pt = allPts[i];
        const px = lcx + pt.blobX * scale;
        const py = lcy + pt.blobY * scale;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = series[pt.cls];
        ctx.globalAlpha = 0.65;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Blob label
    const blobLabelP = easedSub(progress, 0.4, 0.52);
    fadeInText(ctx, tx('scene7', 'blobLabel'), lcx, panelY + panelH - 16, blobLabelP, {
      color: colors.textDimmed, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // ── Right panel: GMVAE (clusters) ──
    const rightPanelP = easedSub(progress, 0.15, 0.3);
    const { cx: rcx, cy: rcy } = drawPanel(rightX, panelY, panelW, panelH,
      tx('scene7', 'gmvaeTitle'), colors.accent, rightPanelP);

    // Morph parameter: 0 = blob, 1 = clusters
    const morphP = easedSub(progress, 0.35, 0.7);

    // Draw GMVAE dots (morph from blob to clusters)
    const rightDotsP = easedSub(progress, 0.25, 0.5);
    if (rightDotsP > 0) {
      const visCount = Math.floor(TOTAL * Math.min(rightDotsP, 1));
      for (let i = 0; i < visCount; i++) {
        const pt = allPts[i];
        // Interpolate between blob and cluster positions
        const t = easeOut(Math.min(morphP, 1));
        const dataX = lerp(pt.blobX, pt.clustX, t);
        const dataY = lerp(pt.blobY, pt.clustY, t);
        const px = rcx + dataX * scale;
        const py = rcy + dataY * scale;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = series[pt.cls];
        ctx.globalAlpha = 0.7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Draw faint cluster contours when morphed
    if (morphP > 0.5) {
      const contourAlpha = (morphP - 0.5) * 2 * 0.2;
      ctx.save();
      ctx.globalAlpha = contourAlpha;
      for (let k = 0; k < K; k++) {
        ctx.strokeStyle = series[k];
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        const cpx = rcx + clusterCenters[k].x * scale;
        const cpy = rcy + clusterCenters[k].y * scale;
        ctx.ellipse(cpx, cpy, scale * 0.9, scale * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Clusters label
    const clustLabelP = easedSub(progress, 0.68, 0.78);
    fadeInText(ctx, tx('scene7', 'clustersLabel'), rcx, panelY + panelH - 16, clustLabelP, {
      color: colors.accent, font: '11px "Segoe UI", system-ui, sans-serif',
    });

    // ── Color legend ──
    const legendP = easedSub(progress, 0.5, 0.65);
    if (legendP > 0) {
      ctx.globalAlpha = legendP;
      const legX = W / 2;
      const legY = panelY + panelH + 16;
      for (let k = 0; k < K; k++) {
        const dotX = legX + (k - 2) * 42;
        ctx.beginPath();
        ctx.arc(dotX - 6, legY, 4, 0, Math.PI * 2);
        ctx.fillStyle = series[k];
        ctx.fill();
        ctx.fillStyle = colors.textDimmed;
        ctx.font = '9px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`C${k + 1}`, dotX, legY);
      }
      ctx.globalAlpha = 1;
    }

    // ── VS divider ──
    const vsP = easedSub(progress, 0.2, 0.35);
    if (vsP > 0) {
      ctx.globalAlpha = vsP * 0.6;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('vs', W / 2, panelY + panelH / 2);
      ctx.globalAlpha = 1;
    }

    // Insight
    const insP = easedSub(progress, 0.85, 0.98);
    fadeInText(ctx, tx('scene7', 'insight'), W / 2, H - 18, insP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
