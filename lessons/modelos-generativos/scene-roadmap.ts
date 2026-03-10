// Scene 7: Course roadmap — taxonomy tree

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Colors for each branch — cycle through series + extras
const branchColors = [
  series[0],        // Autoregressive — indigo
  series[1],        // VAEs — emerald
  series[4],        // Flows — sky blue
  series[2],        // GANs — rose
  colors.warning,   // Energy/Score — amber
  series[3],        // Diffusion — (series[3] = '#fbbf24' — use info instead for variety)
];
// Override last to avoid duplicate with warning
branchColors[5] = colors.info; // Diffusion — sky blue-ish

/** Draw a small checkmark icon. */
function drawCheckmark(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x - 1, y + 4);
  ctx.lineTo(x + 5, y - 4);
  ctx.stroke();
  ctx.restore();
}

/** Draw a small lightning bolt icon. */
function drawLightning(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + 1, y - 6);
  ctx.lineTo(x - 3, y + 1);
  ctx.lineTo(x, y + 1);
  ctx.lineTo(x - 1, y + 6);
  ctx.lineTo(x + 3, y - 1);
  ctx.lineTo(x, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draw a small brain icon (simplified as concentric curves). */
function drawBrain(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Left hemisphere
  ctx.beginPath();
  ctx.arc(x - 2, y, 5, Math.PI * 0.6, Math.PI * 1.8);
  ctx.stroke();
  // Right hemisphere
  ctx.beginPath();
  ctx.arc(x + 2, y, 5, -Math.PI * 0.8, Math.PI * 0.4);
  ctx.stroke();
  // Center fold
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.quadraticCurveTo(x + 1, y, x, y + 4);
  ctx.stroke();
  ctx.restore();
}

// Indicator definitions per branch:
// Autoregressive: density yes, sampling slow, repr no
// VAEs:           density approx, sampling yes, repr yes
// Flows:          density yes, sampling yes, repr no
// GANs:           density no, sampling yes, repr partial
// Energy/Score:   density unnorm, sampling slow, repr no
// Diffusion:      density approx, sampling yes, repr yes
// We show small icons for the strong capabilities of each branch.
const branchIndicators: { density: boolean; sampling: boolean; repr: boolean }[] = [
  { density: true,  sampling: false, repr: false },  // Autoregressive
  { density: false, sampling: true,  repr: true },   // VAEs
  { density: true,  sampling: true,  repr: false },  // Flows
  { density: false, sampling: true,  repr: false },  // GANs
  { density: false, sampling: false, repr: false },  // Energy/Score
  { density: false, sampling: true,  repr: true },   // Diffusion
];

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 24,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Root node
    const rootX = W / 2;
    const rootY = H * 0.18;
    const rootP = easedSub(progress, 0.06, 0.18);

    if (rootP > 0) {
      // Root rounded rect
      ctx.save();
      ctx.globalAlpha = rootP;
      const rootW = 160;
      const rootH = 30;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(rootX - rootW / 2, rootY - rootH / 2, rootW, rootH, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      fadeInText(ctx, tx('scene7', 'rootLabel'), rootX, rootY, rootP, {
        color: colors.accent, font: `bold 13px ${fonts.body}`
      });
    }

    // Branch positions: 6 children spread horizontally
    const branchKeys = ['branch1', 'branch2', 'branch3', 'branch4', 'branch5', 'branch6'];
    const numBranches = 6;
    const branchY = H * 0.48;
    const marginX = W * 0.08;
    const availW = W - 2 * marginX;
    const branchSpacing = availW / (numBranches - 1);

    for (let i = 0; i < numBranches; i++) {
      const bx = marginX + i * branchSpacing;
      const startT = 0.15 + i * 0.08;
      const endT = startT + 0.12;
      const bp = easedSub(progress, startT, endT);

      if (bp <= 0) continue;
      const bColor = branchColors[i];

      // Connecting line from root to branch
      ctx.save();
      ctx.globalAlpha = bp;
      ctx.strokeStyle = bColor + '60';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rootX, rootY + 15);
      // Route through an intermediate y to create a tree look
      const midY = rootY + (branchY - rootY) * 0.3;
      ctx.quadraticCurveTo(rootX, midY, bx, branchY - 22);
      ctx.stroke();
      ctx.restore();

      // Branch node (circle)
      ctx.save();
      ctx.globalAlpha = bp;
      ctx.beginPath();
      ctx.arc(bx, branchY, 18, 0, Math.PI * 2);
      ctx.fillStyle = bColor + '20';
      ctx.fill();
      ctx.strokeStyle = bColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Branch label below
      fadeInText(ctx, tx('scene7', branchKeys[i]), bx, branchY + 30, bp, {
        color: bColor, font: `bold 11px ${fonts.body}`
      });

      // Indicator icons below the label
      const indicators = branchIndicators[i];
      const iconY = branchY + 48;
      const iconSpacing = 16;
      let iconOffset = 0;
      const totalIcons = (indicators.density ? 1 : 0) + (indicators.sampling ? 1 : 0) + (indicators.repr ? 1 : 0);
      const startOffset = -((totalIcons - 1) * iconSpacing) / 2;

      const indicatorP = easedSub(progress, startT + 0.1, endT + 0.1);

      if (indicators.density) {
        drawCheckmark(ctx, bx + startOffset + iconOffset * iconSpacing, iconY, colors.insight, indicatorP);
        iconOffset++;
      }
      if (indicators.sampling) {
        drawLightning(ctx, bx + startOffset + iconOffset * iconSpacing, iconY, colors.warning, indicatorP);
        iconOffset++;
      }
      if (indicators.repr) {
        drawBrain(ctx, bx + startOffset + iconOffset * iconSpacing, iconY, colors.accent, indicatorP);
        iconOffset++;
      }
    }

    // Legend at bottom
    const legendP = easedSub(progress, 0.75, 0.88);
    if (legendP > 0) {
      const legendY = H * 0.78;
      const legendCx = W / 2;
      const legSpacing = W * 0.22;

      // Density legend
      drawCheckmark(ctx, legendCx - legSpacing - 8, legendY, colors.insight, legendP);
      fadeInText(ctx, tx('scene7', 'density'), legendCx - legSpacing + 8, legendY, legendP, {
        color: colors.insight, font: `10px ${fonts.body}`, align: 'left'
      });

      // Sampling legend
      drawLightning(ctx, legendCx - 8, legendY, colors.warning, legendP);
      fadeInText(ctx, tx('scene7', 'sampling'), legendCx + 8, legendY, legendP, {
        color: colors.warning, font: `10px ${fonts.body}`, align: 'left'
      });

      // Representations legend
      drawBrain(ctx, legendCx + legSpacing - 8, legendY, colors.accent, legendP);
      fadeInText(ctx, tx('scene7', 'repr'), legendCx + legSpacing + 8, legendY, legendP, {
        color: colors.accent, font: `10px ${fonts.body}`, align: 'left'
      });
    }

    // Final insight: each with different trade-offs
    const finalP = easedSub(progress, 0.88, 0.98);
    if (finalP > 0) {
      const lang = getLang();
      const tradeoffText = lang === 'en'
        ? 'Each with different trade-offs'
        : 'Cada uno con distintos compromisos';
      fadeInText(ctx, tradeoffText, W / 2, H - 25, finalP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });
    }
  }
});
