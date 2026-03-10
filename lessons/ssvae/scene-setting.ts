// Scene 1: Semi-Supervised Setting — 100 colored labeled + many gray unlabeled dots

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Generate deterministic scatter data
const rng = mulberry32(12345);
const NUM_UNLABELED = 200; // represent 50K visually
const NUM_LABELED = 20;    // represent 100 visually
const CLASS_COLORS = [series[0], series[1], series[2], series[3]];
const NUM_CLASSES = 4;

// Cluster centers
const CENTERS = [
  { x: 0.25, y: 0.3 },
  { x: 0.7, y: 0.25 },
  { x: 0.3, y: 0.75 },
  { x: 0.75, y: 0.7 },
];

interface ScatterPt { x: number; y: number; cls: number; labeled: boolean }

const POINTS: ScatterPt[] = [];

// Generate unlabeled points (gray)
for (let i = 0; i < NUM_UNLABELED; i++) {
  const cls = Math.floor(rng() * NUM_CLASSES);
  const cx = CENTERS[cls].x + (rng() - 0.5) * 0.25;
  const cy = CENTERS[cls].y + (rng() - 0.5) * 0.25;
  POINTS.push({ x: cx, y: cy, cls, labeled: false });
}

// Generate labeled points (colored, placed near centers)
for (let i = 0; i < NUM_LABELED; i++) {
  const cls = i % NUM_CLASSES;
  const cx = CENTERS[cls].x + (rng() - 0.5) * 0.15;
  const cy = CENTERS[cls].y + (rng() - 0.5) * 0.15;
  POINTS.push({ x: cx, y: cy, cls, labeled: true });
}

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Scatter area
    const areaLeft = W * 0.08;
    const areaTop = H * 0.15;
    const areaW = W * 0.6;
    const areaH = H * 0.65;

    function ptToScreen(pt: ScatterPt): { sx: number; sy: number } {
      return {
        sx: areaLeft + pt.x * areaW,
        sy: areaTop + pt.y * areaH,
      };
    }

    // Phase 1: Unlabeled points appear (gray)
    const unlabelP = easedSub(progress, 0.08, 0.35);
    if (unlabelP > 0) {
      const visCount = Math.floor(NUM_UNLABELED * easeOut(unlabelP));
      for (let i = 0; i < visCount; i++) {
        const pt = POINTS[i];
        if (pt.labeled) continue;
        const { sx, sy } = ptToScreen(pt);

        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = colors.textDimmed;
        ctx.fill();
        ctx.restore();
      }
    }

    // Phase 2: Labeled points appear (colored, larger)
    const labelP = easedSub(progress, 0.3, 0.55);
    if (labelP > 0) {
      for (let i = NUM_UNLABELED; i < POINTS.length; i++) {
        const pt = POINTS[i];
        const entryP = easedSub(progress, 0.3 + (i - NUM_UNLABELED) * 0.01, 0.4 + (i - NUM_UNLABELED) * 0.01);
        if (entryP > 0) {
          const { sx, sy } = ptToScreen(pt);

          ctx.save();
          ctx.globalAlpha = easeOut(entryP) * 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, 5 * easeOut(entryP), 0, Math.PI * 2);
          ctx.fillStyle = CLASS_COLORS[pt.cls];
          ctx.fill();
          ctx.strokeStyle = colors.textPrimary;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Phase 3: Legend
    const legendP = easedSub(progress, 0.5, 0.65);
    if (legendP > 0) {
      const legX = W * 0.72;
      const legY = H * 0.22;

      ctx.save();
      ctx.globalAlpha = easeOut(legendP);

      // Labeled entry
      ctx.beginPath();
      ctx.arc(legX, legY, 5, 0, Math.PI * 2);
      ctx.fillStyle = series[0];
      ctx.fill();
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = colors.textSecondary;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'labeledLabel'), legX + 12, legY);

      // Unlabeled entry
      ctx.beginPath();
      ctx.arc(legX, legY + 22, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.textDimmed;
      ctx.fill();

      ctx.fillStyle = colors.textMuted;
      ctx.fillText(tx('scene1', 'unlabeledLabel'), legX + 12, legY + 22);

      ctx.restore();
    }

    // Phase 4: Question callout
    const qP = easedSub(progress, 0.68, 0.85);
    if (qP > 0) {
      const boxX = W * 0.62;
      const boxY = H * 0.55;
      const boxW = W * 0.34;
      const boxH = 40;

      ctx.save();
      ctx.globalAlpha = easeOut(qP) * 0.85;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      fadeInText(ctx, tx('scene1', 'questionLabel'), boxX + boxW / 2, boxY + boxH / 2, qP, {
        color: colors.warning, font: `bold 12px ${fonts.body}`,
      });
    }

    // Insight
    const insightP = easedSub(progress, 0.9, 1.0);
    fadeInText(ctx, tx('scene1', 'topic').split('.')[0], W / 2, H - 16, insightP, {
      color: colors.insight, font: `bold 11px ${fonts.body}`,
    });
  },
});
