// Scene 1: The Prior Problem — standard VAE p(z)=N(0,I) is a single blob

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import { mulberry32 } from '../_shared/flow-utils';
import type { SceneText } from './text';

/** Generate 2D points from a single Gaussian — all classes forced into one blob. */
function generateBlobPoints(n: number, seed: number): { x: number; y: number; cls: number }[] {
  const rng = mulberry32(seed);
  const pts: { x: number; y: number; cls: number }[] = [];
  const K = 5;
  for (let i = 0; i < n; i++) {
    const u1 = rng(), u2 = rng();
    const r = Math.sqrt(-2 * Math.log(u1 + 1e-10));
    const gx = r * Math.cos(2 * Math.PI * u2);
    const gy = r * Math.sin(2 * Math.PI * u2);
    pts.push({ x: gx, y: gy, cls: i % K });
  }
  return pts;
}

const blobPts = generateBlobPoints(200, 7);

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

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula: p(z) = N(0, I)
    formulaAppear(state.formulaManager, 'prior-std', 'p(z) = \\mathcal{N}(0, I)', 50, 12, easedSub(progress, 0.05, 0.18));

    // Draw 2D latent space axes
    const cx = W / 2, cy = H * 0.52;
    const scale = Math.min(W, H) * 0.15;

    const axesP = easedSub(progress, 0.08, 0.2);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      // Horizontal axis
      ctx.beginPath();
      ctx.moveTo(cx - scale * 3, cy);
      ctx.lineTo(cx + scale * 3, cy);
      ctx.stroke();
      // Vertical axis
      ctx.beginPath();
      ctx.moveTo(cx, cy - scale * 3);
      ctx.lineTo(cx, cy + scale * 3);
      ctx.stroke();
      // Labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('z\u2081', cx + scale * 3 + 10, cy + 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('z\u2082', cx + 12, cy - scale * 3 - 2);
      ctx.globalAlpha = 1;
    }

    // Draw single-Gaussian blob with colored dots (classes mixed)
    const dotsP = easedSub(progress, 0.15, 0.55);
    if (dotsP > 0) {
      const visibleCount = Math.floor(blobPts.length * Math.min(dotsP, 1));
      for (let i = 0; i < visibleCount; i++) {
        const pt = blobPts[i];
        const px = cx + pt.x * scale;
        const py = cy + pt.y * scale;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = series[pt.cls % series.length];
        ctx.globalAlpha = 0.7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Label: single blob
    const blobLabelP = easedSub(progress, 0.45, 0.6);
    fadeInText(ctx, tx('scene1', 'blobLabel'), cx + scale * 2.5, cy - scale * 2.2, blobLabelP, {
      color: colors.textMuted, font: '12px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // Label: mixed classes
    const mixedP = easedSub(progress, 0.55, 0.7);
    fadeInText(ctx, tx('scene1', 'classLabels'), cx + scale * 2.5, cy - scale * 1.7, mixedP, {
      color: colors.warning, font: '12px "Segoe UI", system-ui, sans-serif', align: 'left',
    });

    // Draw a fading circle to show the single Gaussian contour
    const contourP = easedSub(progress, 0.3, 0.5);
    if (contourP > 0) {
      ctx.save();
      ctx.globalAlpha = contourP * 0.3;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale * 2, scale * 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw small color legend for 5 classes
    const legendP = easedSub(progress, 0.6, 0.75);
    if (legendP > 0) {
      ctx.globalAlpha = legendP;
      const lx = W * 0.08, ly = H * 0.75;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(lx, ly + k * 18, 4, 0, Math.PI * 2);
        ctx.fillStyle = series[k];
        ctx.fill();
        ctx.fillStyle = colors.textDimmed;
        ctx.font = '10px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Class ${k + 1}`, lx + 10, ly + k * 18);
      }
      ctx.globalAlpha = 1;
    }

    // Insight
    const insP = easedSub(progress, 0.82, 0.98);
    fadeInText(ctx, tx('scene1', 'insight'), W / 2, H - 25, insP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
