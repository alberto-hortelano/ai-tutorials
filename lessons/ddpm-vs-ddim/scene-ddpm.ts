// Scene 1: DDPM Recap — Stochastic sampling and branching trajectories

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Seeded RNG */
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
}

/** Generate a branching trajectory with stochastic noise */
function generateBranchPath(nPoints: number, seed: number, spread: number): { x: number; y: number }[] {
  const rng = seededRng(seed);
  const path: { x: number; y: number }[] = [];
  let y = 0.5; // start centered
  for (let i = 0; i < nPoints; i++) {
    const x = i / (nPoints - 1);
    y += (rng() - 0.5) * spread;
    y = Math.max(0.1, Math.min(0.9, y));
    path.push({ x, y });
  }
  return path;
}

const branchPaths = [
  generateBranchPath(30, 42, 0.08),
  generateBranchPath(30, 77, 0.08),
  generateBranchPath(30, 123, 0.08),
];
const branchColors = [series[0], series[1], series[2]];

export const scene1 = new Scene({
  id: () => tx('scene1', 'id'),
  duration: 20,
  narration: () => tx('scene1', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene1 as SceneText)?.subtitleCues ?? (text.es.scene1 as SceneText).subtitleCues,
  topic: () => tx('scene1', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene1', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    const areaX = W * 0.1;
    const areaY = 60;
    const areaW = W * 0.8;
    const areaH = H * 0.55;

    // Background
    const bgP = easedSub(progress, 0.05, 0.12);
    if (bgP > 0) {
      ctx.save();
      ctx.globalAlpha = bgP * 0.2;
      ctx.fillStyle = colors.panelBg;
      ctx.fillRect(areaX, areaY, areaW, areaH);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Starting point (same for all)
    const startP = easedSub(progress, 0.08, 0.18);
    if (startP > 0) {
      ctx.save();
      ctx.globalAlpha = startP;
      const sx = areaX + areaW; // starts from noise (right)
      const sy = areaY + areaH / 2;

      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.fillStyle = colors.textDimmed + '40';
      ctx.fill();
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene1', 'sameStart'), sx, sy + 22);
      ctx.restore();
    }

    // Branching trajectories (animated drawing)
    const trajP = easedSub(progress, 0.15, 0.75);
    if (trajP > 0) {
      for (let b = 0; b < 3; b++) {
        const path = branchPaths[b];
        const nDraw = Math.floor(path.length * trajP);
        if (nDraw < 2) continue;

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = branchColors[b];
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < nDraw; i++) {
          // Reverse x: noise (right) -> data (left)
          const px = areaX + areaW - path[i].x * areaW;
          const py = areaY + path[i].y * areaH;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // End dot
        if (trajP > 0.9) {
          const last = path[path.length - 1];
          const px = areaX + areaW - last.x * areaW;
          const py = areaY + last.y * areaH;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = branchColors[b];
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Branch labels
    const labelP = easedSub(progress, 0.7, 0.82);
    if (labelP > 0) {
      const labels = ['branch1', 'branch2', 'branch3'];
      for (let b = 0; b < 3; b++) {
        const last = branchPaths[b][branchPaths[b].length - 1];
        const px = areaX + areaW - last.x * areaW;
        const py = areaY + last.y * areaH;
        fadeInText(ctx, tx('scene1', labels[b]), px - 10, py - 12, labelP, {
          color: branchColors[b], font: '10px "Segoe UI", system-ui, sans-serif', align: 'right',
        });
      }
    }

    // Arrows showing noise (right) -> data (left)
    const dirP = easedSub(progress, 0.1, 0.2);
    if (dirP > 0) {
      ctx.save();
      ctx.globalAlpha = dirP;
      ctx.fillStyle = colors.textDimmed;
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('x_T (noise)', areaX + areaW, areaY - 6);
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.insight;
      ctx.fillText('x_0 (data)', areaX, areaY - 6);
      ctx.restore();
    }

    // Stochastic label
    const stochP = easedSub(progress, 0.82, 0.95);
    if (stochP > 0) {
      ctx.save();
      ctx.globalAlpha = stochP;
      const boxW = W * 0.5;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 50;
      ctx.fillStyle = colors.error + '15';
      ctx.fillRect(boxX, boxY, boxW, 30);
      ctx.strokeStyle = colors.error + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, 30);
      ctx.restore();

      fadeInText(ctx, tx('scene1', 'stochastic'), W / 2, H - 35, stochP, {
        color: colors.error, font: 'bold 13px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
