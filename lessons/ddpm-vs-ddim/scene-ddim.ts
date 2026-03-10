// Scene 3: DDIM — Deterministic Sampling

import { Scene } from '../../engine/scene';
import { colors } from '../../engine/shared/design-tokens';
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

/** Generate a smooth deterministic path */
function generateSmoothPath(nPoints: number): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  for (let i = 0; i < nPoints; i++) {
    const t = i / (nPoints - 1);
    // Smooth curve from noise to data
    const x = t;
    const y = 0.5 + 0.15 * Math.sin(t * Math.PI * 1.5) * (1 - t * 0.5);
    path.push({ x, y });
  }
  return path;
}

/** Generate a branching stochastic path */
function generateBranchPath(nPoints: number, seed: number): { x: number; y: number }[] {
  const rng = seededRng(seed);
  const path: { x: number; y: number }[] = [];
  let y = 0.5;
  for (let i = 0; i < nPoints; i++) {
    const x = i / (nPoints - 1);
    y += (rng() - 0.5) * 0.07;
    y = Math.max(0.15, Math.min(0.85, y));
    path.push({ x, y });
  }
  return path;
}

const ddimPath = generateSmoothPath(40);
const ddpmPaths = [
  generateBranchPath(40, 42),
  generateBranchPath(40, 77),
  generateBranchPath(40, 123),
];

export const scene3 = new Scene({
  id: () => tx('scene3', 'id'),
  duration: 22,
  narration: () => tx('scene3', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene3 as SceneText)?.subtitleCues ?? (text.es.scene3 as SceneText).subtitleCues,
  topic: () => tx('scene3', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene3', 'title'), W / 2, 30, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Left panel: DDPM (branching tree)
    const leftX = W * 0.04;
    const panelW = W * 0.42;
    const panelY = 55;
    const panelH = H * 0.5;

    // Left label
    const leftLabelP = easedSub(progress, 0.06, 0.14);
    fadeInText(ctx, tx('scene3', 'ddpmLabel'), leftX + panelW / 2, panelY - 6, leftLabelP, {
      color: colors.error, font: '12px "Segoe UI", system-ui, sans-serif',
    });

    // DDPM branching paths (faded)
    const ddpmP = easedSub(progress, 0.1, 0.5);
    if (ddpmP > 0) {
      ctx.save();
      ctx.globalAlpha = ddpmP * 0.5;

      for (let b = 0; b < 3; b++) {
        const path = ddpmPaths[b];
        const nDraw = Math.floor(path.length * ddpmP);

        ctx.strokeStyle = colors.error + '80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < nDraw; i++) {
          const px = leftX + panelW - path[i].x * panelW;
          const py = panelY + path[i].y * panelH;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Right panel: DDIM (single clean curve)
    const rightX = W * 0.54;

    // Right label
    const rightLabelP = easedSub(progress, 0.25, 0.35);
    fadeInText(ctx, tx('scene3', 'ddimLabel'), rightX + panelW / 2, panelY - 6, rightLabelP, {
      color: colors.insight, font: '12px "Segoe UI", system-ui, sans-serif',
    });

    // DDIM clean path
    const ddimP = easedSub(progress, 0.3, 0.7);
    if (ddimP > 0) {
      const nDraw = Math.floor(ddimPath.length * ddimP);

      ctx.save();
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < nDraw; i++) {
        const px = rightX + panelW - ddimPath[i].x * panelW;
        const py = panelY + ddimPath[i].y * panelH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = colors.insight + '30';
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let i = 0; i < nDraw; i++) {
        const px = rightX + panelW - ddimPath[i].x * panelW;
        const py = panelY + ddimPath[i].y * panelH;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.restore();
    }

    // Single trajectory label
    const singleP = easedSub(progress, 0.65, 0.78);
    fadeInText(ctx, tx('scene3', 'singlePath'), rightX + panelW / 2, panelY + panelH + 16, singleP, {
      color: colors.insight, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
    });

    // Divider
    const divP = easedSub(progress, 0.1, 0.2);
    if (divP > 0) {
      ctx.save();
      ctx.globalAlpha = divP * 0.4;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, panelY - 10);
      ctx.lineTo(W / 2, panelY + panelH + 30);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Directional labels (noise -> data)
    const dirP = easedSub(progress, 0.1, 0.2);
    if (dirP > 0) {
      ctx.save();
      ctx.globalAlpha = dirP;
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';

      // Left panel
      ctx.fillStyle = colors.textDimmed;
      ctx.textAlign = 'right';
      ctx.fillText('x_T', leftX + panelW, panelY + panelH + 8);
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('x_0', leftX, panelY + panelH + 8);

      // Right panel
      ctx.fillStyle = colors.textDimmed;
      ctx.textAlign = 'right';
      ctx.fillText('x_T', rightX + panelW, panelY + panelH + 8);
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('x_0', rightX, panelY + panelH + 8);

      ctx.restore();
    }

    // Deterministic label box
    const detP = easedSub(progress, 0.82, 0.95);
    if (detP > 0) {
      ctx.save();
      ctx.globalAlpha = detP;
      const boxW = W * 0.55;
      const boxX = W / 2 - boxW / 2;
      const boxY = H - 50;
      ctx.fillStyle = colors.insight + '15';
      ctx.fillRect(boxX, boxY, boxW, 30);
      ctx.strokeStyle = colors.insight + '50';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, boxW, 30);
      ctx.restore();

      fadeInText(ctx, `sigma_t = 0  =>  ${tx('scene3', 'deterministic')}`, W / 2, H - 35, detP, {
        color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
      });
    }
  },
});
