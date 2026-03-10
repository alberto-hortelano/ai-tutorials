// Scene 1: What is a generative model?
// Opening montage: data grid → model box → new samples emerging

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Pre-generate deterministic "data" grid block colors
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

interface Block { x: number; y: number; color: string }

function generateGrid(cols: number, rows: number, cx: number, cy: number, cellSize: number, gap: number, seed: number): Block[] {
  const rng = seededRandom(seed);
  const palette = [series[0], series[1], series[2], series[3], series[4], colors.accent, colors.insight];
  const blocks: Block[] = [];
  const totalW = cols * (cellSize + gap) - gap;
  const totalH = rows * (cellSize + gap) - gap;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      blocks.push({
        x: cx - totalW / 2 + col * (cellSize + gap),
        y: cy - totalH / 2 + row * (cellSize + gap),
        color: palette[Math.floor(rng() * palette.length)],
      });
    }
  }
  return blocks;
}

function drawGrid(ctx: CanvasRenderingContext2D, blocks: Block[], cellSize: number, alpha: number): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  for (const b of blocks) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, cellSize, cellSize);
  }
  ctx.restore();
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
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    const cellSize = Math.max(6, Math.floor(W * 0.012));
    const gap = 2;

    // ── Phase 1: Data cloud (grid of colored blocks on the left) ──
    const dataBlocks = generateGrid(8, 8, W * 0.2, H * 0.45, cellSize, gap, 42);
    const dataP = easedSub(progress, 0.05, 0.25);
    if (dataP > 0) {
      drawGrid(ctx, dataBlocks, cellSize, dataP);
      fadeInText(ctx, tx('scene1', 'dataLabel'), W * 0.2, H * 0.45 + (8 * (cellSize + gap)) / 2 + 18, dataP, {
        color: colors.textSecondary, font: `12px ${fonts.body}`
      });
    }

    // ── Phase 2: Model box in center ──
    const modelP = easedSub(progress, 0.2, 0.45);
    if (modelP > 0) {
      const boxW = W * 0.22;
      const boxH = H * 0.18;
      const boxX = W * 0.5 - boxW / 2;
      const boxY = H * 0.45 - boxH / 2;

      ctx.save();
      ctx.globalAlpha = modelP;

      // Glow effect
      ctx.shadowColor = colors.accent;
      ctx.shadowBlur = 15 * modelP;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const rad = 8;
      ctx.moveTo(boxX + rad, boxY);
      ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, rad);
      ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, rad);
      ctx.arcTo(boxX, boxY + boxH, boxX, boxY, rad);
      ctx.arcTo(boxX, boxY, boxX + boxW, boxY, rad);
      ctx.closePath();
      ctx.fillStyle = colors.panelBg;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label inside box
      ctx.fillStyle = colors.accent;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene1', 'modelLabel'), W * 0.5, H * 0.45);

      ctx.restore();
    }

    // ── Phase 3: Arrow data → model ──
    const arrow1P = easedSub(progress, 0.3, 0.5);
    if (arrow1P > 0) {
      const dataRight = W * 0.2 + (8 * (cellSize + gap)) / 2 + 8;
      const modelLeft = W * 0.5 - W * 0.11;
      animateArrow(ctx, dataRight, H * 0.45, modelLeft, H * 0.45, arrow1P, {
        color: colors.textMuted, headSize: 10
      });
    }

    // ── Phase 4: New samples emerge on the right ──
    const newBlocks = generateGrid(8, 8, W * 0.8, H * 0.45, cellSize, gap, 137);
    const newP = easedSub(progress, 0.55, 0.8);
    if (newP > 0) {
      drawGrid(ctx, newBlocks, cellSize, newP);
      fadeInText(ctx, tx('scene1', 'newSamples'), W * 0.8, H * 0.45 + (8 * (cellSize + gap)) / 2 + 18, newP, {
        color: colors.insight, font: `12px ${fonts.body}`
      });
    }

    // ── Arrow model → new samples ──
    const arrow2P = easedSub(progress, 0.5, 0.65);
    if (arrow2P > 0) {
      const modelRight = W * 0.5 + W * 0.11;
      const newLeft = W * 0.8 - (8 * (cellSize + gap)) / 2 - 8;
      animateArrow(ctx, modelRight, H * 0.45, newLeft, H * 0.45, arrow2P, {
        color: colors.insight, headSize: 10
      });
    }

    // ── Phase 5: Objective formula at bottom ──
    const formulaP = easedSub(progress, 0.8, 0.95);
    if (formulaP > 0 && state.formulaManager) {
      formulaAppear(state.formulaManager, 'obj', '\\min_\\theta \\; d(p_{\\text{data}},\\, p_\\theta)', 50, 82, formulaP, {
        color: colors.warning, fontSize: '1.1em'
      });
    }
  }
});
