// Scene 5: Why do they matter? — Application icons

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Draw a simple paintbrush icon (image synthesis). */
function drawPaintbrush(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const s = size * 0.4;
  // Handle
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.8, cy - s * 0.8);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.2);
  ctx.stroke();
  // Bristles
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.2, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.6, cy + s * 0.8);
  ctx.lineTo(cx - s * 0.9, cy + s * 0.5);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draw a hexagon icon (molecule / drug discovery). */
function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const r = size * 0.35;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const px = cx + r * Math.cos(angle);
    const py = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  // Small circle at center (atom)
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Draw a speech bubble icon (text generation). */
function drawSpeechBubble(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const w = size * 0.45;
  const h = size * 0.3;
  ctx.beginPath();
  ctx.roundRect(cx - w, cy - h, w * 2, h * 1.6, 6);
  ctx.stroke();
  // Tail
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.3, cy + h * 0.6);
  ctx.lineTo(cx - w * 0.5, cy + h * 1.1);
  ctx.lineTo(cx, cy + h * 0.6);
  ctx.stroke();
  // Text lines inside
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, cy - h * 0.2);
  ctx.lineTo(cx + w * 0.6, cy - h * 0.2);
  ctx.moveTo(cx - w * 0.6, cy + h * 0.15);
  ctx.lineTo(cx + w * 0.3, cy + h * 0.15);
  ctx.stroke();
  ctx.restore();
}

/** Draw a warning triangle icon (anomaly detection). */
function drawWarningTriangle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const s = size * 0.4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s * 0.9, cy + s * 0.6);
  ctx.lineTo(cx - s * 0.9, cy + s * 0.6);
  ctx.closePath();
  ctx.stroke();
  // Exclamation mark
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(s * 0.9)}px ${fonts.body}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('!', cx, cy + s * 0.05);
  ctx.restore();
}

/** Draw a database / cylinder icon (data augmentation). */
function drawDatabase(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const w = size * 0.3;
  const h = size * 0.4;
  const ry = h * 0.25;
  // Top ellipse
  ctx.beginPath();
  ctx.ellipse(cx, cy - h * 0.5, w, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Sides
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - h * 0.5);
  ctx.lineTo(cx - w, cy + h * 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + w, cy - h * 0.5);
  ctx.lineTo(cx + w, cy + h * 0.5);
  ctx.stroke();
  // Bottom ellipse
  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.5, w, ry, 0, 0, Math.PI);
  ctx.stroke();
  // Plus sign
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy);
  ctx.lineTo(cx + 5, cy);
  ctx.moveTo(cx, cy - 5);
  ctx.lineTo(cx, cy + 5);
  ctx.stroke();
  ctx.restore();
}

/** Draw a zip / compression icon (two converging arrows). */
function drawCompression(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const s = size * 0.35;
  // Two inward arrows representing compression
  // Left arrow pointing right
  ctx.beginPath();
  ctx.moveTo(cx - s, cy);
  ctx.lineTo(cx - s * 0.25, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.25, cy);
  ctx.lineTo(cx - s * 0.5, cy - 4);
  ctx.lineTo(cx - s * 0.5, cy + 4);
  ctx.closePath();
  ctx.fill();
  // Right arrow pointing left
  ctx.beginPath();
  ctx.moveTo(cx + s, cy);
  ctx.lineTo(cx + s * 0.25, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.25, cy);
  ctx.lineTo(cx + s * 0.5, cy - 4);
  ctx.lineTo(cx + s * 0.5, cy + 4);
  ctx.closePath();
  ctx.fill();
  // Small rectangle in center
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - 4, cy - 8, 8, 16);
  ctx.restore();
}

type IconDrawFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, alpha: number) => void;

const iconDrawers: IconDrawFn[] = [
  drawPaintbrush,
  drawHexagon,
  drawSpeechBubble,
  drawWarningTriangle,
  drawDatabase,
  drawCompression,
];

const iconColors = [
  series[0],   // indigo — images
  series[1],   // emerald — molecules
  series[4],   // sky — text
  colors.warning, // amber — anomaly
  series[2],   // rose — augmentation
  colors.textMuted, // muted — compression
];

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 20,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Layout: 6 icons in a horizontal row, 2 rows of 3 on small screens
    const appKeys = ['app1', 'app2', 'app3', 'app4', 'app5', 'app6'];
    const cols = W > 500 ? 6 : 3;
    const rows = Math.ceil(6 / cols);
    const iconSize = Math.min(60, W / (cols + 1) * 0.7);
    const colSpacing = W / (cols + 1);
    const rowSpacing = rows > 1 ? 100 : 0;
    const baseY = H * 0.42 - (rows > 1 ? rowSpacing * 0.3 : 0);

    for (let i = 0; i < 6; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = colSpacing * (col + 1);
      const cy = baseY + row * rowSpacing;

      // Staggered appearance: each icon gets its own time window
      const startT = 0.08 + i * 0.1;
      const endT = startT + 0.15;
      const p = easedSub(progress, startT, endT);

      if (p > 0) {
        // Draw icon
        iconDrawers[i](ctx, cx, cy, iconSize, iconColors[i], p);

        // Label below icon
        fadeInText(ctx, tx('scene5', appKeys[i]), cx, cy + iconSize * 0.65 + 14, p, {
          color: colors.textSecondary, font: `11px ${fonts.body}`
        });
      }
    }

    // Closing insight line
    const insightP = easedSub(progress, 0.82, 0.95);
    if (insightP > 0) {
      const lang = getLang();
      const closingText = lang === 'en'
        ? 'Behind the AI revolution'
        : 'Detr\u00e1s de la revoluci\u00f3n de la IA';
      fadeInText(ctx, closingText, W / 2, H - 30, insightP, {
        color: colors.insight, font: `bold 12px ${fonts.body}`
      });
    }
  }
});
