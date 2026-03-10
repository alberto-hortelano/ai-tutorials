// Scene 5: Class-Specific Generation — grid of classes x variations

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Seeded pseudo-random for deterministic pixel patterns
function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 20,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 25, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const nRows = 4; // classes
    const nCols = 5; // variations
    const gridTop = 65;
    const gridLeft = 55;
    const gridW = W - gridLeft - 20;
    const gridH = H - gridTop - 45;
    const cellW = gridW / nCols - 4;
    const cellH = gridH / nRows - 4;
    const cellSize = Math.min(cellW, cellH, 45);

    const classLabels = tx('scene5', 'rowLabels').split(',');
    const classColors = [series[0], series[1], series[2], series[3]];

    // Row labels (classes)
    const labelP = easedSub(progress, 0.05, 0.2);
    if (labelP > 0) {
      fadeInText(ctx, tx('scene5', 'classLabel'), 28, gridTop - 10, labelP, {
        color: colors.textMuted, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene5', 'varLabel'), gridLeft + gridW / 2, gridTop - 10, labelP, {
        color: colors.textMuted, font: 'bold 10px "Segoe UI", system-ui, sans-serif',
      });

      for (let row = 0; row < nRows; row++) {
        const ry = gridTop + row * (cellSize + 8) + cellSize / 2;
        fadeInText(ctx, classLabels[row] || String(row), 28, ry, labelP, {
          color: classColors[row], font: 'bold 12px "Segoe UI", system-ui, sans-serif',
        });
      }
    }

    // Grid cells: each cell is a mini-pixel-art digit representation
    for (let row = 0; row < nRows; row++) {
      for (let col = 0; col < nCols; col++) {
        const cellProgress = easedSub(progress, 0.1 + row * 0.15 + col * 0.02, 0.25 + row * 0.15 + col * 0.02 + 0.12);
        if (cellProgress > 0) {
          const cx = gridLeft + col * (cellSize + 6);
          const cy = gridTop + row * (cellSize + 8);

          ctx.save();
          ctx.globalAlpha = cellProgress;

          // Background
          ctx.fillStyle = colors.panelBg;
          ctx.fillRect(cx, cy, cellSize, cellSize);
          ctx.strokeStyle = classColors[row] + '50';
          ctx.lineWidth = 1;
          ctx.strokeRect(cx, cy, cellSize, cellSize);

          // Pseudo-digit pattern using seeded RNG
          const rng = seededRng(row * 1000 + col * 100 + 42);
          const pixSize = cellSize / 7;

          // Draw a rough digit shape
          for (let py = 0; py < 7; py++) {
            for (let px = 0; px < 7; px++) {
              const val = rng();
              // Each class has a different "shape" pattern
              let threshold = 0.65;
              const digit = row;
              // Simple shape heuristic per digit
              if (digit === 0) {
                // Circle-ish
                const dx = px - 3, dy = py - 3;
                threshold = (dx * dx + dy * dy > 1.5 && dx * dx + dy * dy < 8) ? 0.3 : 0.8;
              } else if (digit === 1) {
                // Vertical line
                threshold = (px >= 2 && px <= 4) ? 0.3 : 0.85;
              } else if (digit === 2) {
                // Top, middle, bottom horizontal
                threshold = (py <= 1 || (py >= 3 && py <= 3) || py >= 5) ? 0.35 : 0.8;
              } else if (digit === 3) {
                // Right side + horizontals
                threshold = (px >= 4 || py <= 1 || py === 3 || py >= 5) ? 0.35 : 0.85;
              }

              if (val < threshold) {
                const intensity = 0.3 + val * 0.7;
                ctx.fillStyle = classColors[row] + Math.floor(intensity * 200 + 55).toString(16).padStart(2, '0');
                ctx.fillRect(cx + px * pixSize, cy + py * pixSize, pixSize - 0.5, pixSize - 0.5);
              }
            }
          }

          ctx.restore();
        }
      }
    }

    // Annotation: y fijo, z varia
    const annoP = easedSub(progress, 0.75, 0.92);
    if (annoP > 0) {
      // Horizontal arrow over columns
      ctx.save();
      ctx.globalAlpha = annoP;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(gridLeft, gridTop + nRows * (cellSize + 8) + 5);
      ctx.lineTo(gridLeft + nCols * (cellSize + 6) - 6, gridTop + nRows * (cellSize + 8) + 5);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      fadeInText(ctx, 'z \u2192', gridLeft + nCols * (cellSize + 6) / 2, gridTop + nRows * (cellSize + 8) + 18, annoP, {
        color: colors.textMuted, font: '10px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
