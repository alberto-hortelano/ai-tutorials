// Scene 4: Why This Integral is Intractable — dimensionality explosion

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene4 = new Scene({
  id: () => tx('scene4', 'id'),
  duration: 22,
  narration: () => tx('scene4', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene4 as SceneText)?.subtitleCues ?? (text.es.scene4 as SceneText).subtitleCues,
  topic: () => tx('scene4', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene4', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Four panels showing 1D, 2D, 3D, 256D
    const panelW = W * 0.2;
    const panelH = H * 0.38;
    const panelY = H * 0.18;
    const gap = W * 0.02;
    const startX = (W - 4 * panelW - 3 * gap) / 2;

    const panelColors = [colors.insight, series[4], series[3], colors.error];
    const dimLabels = ['dim1', 'dim2', 'dim3', 'dimHigh'];
    const panelTimings = [
      { start: 0.08, end: 0.28 },
      { start: 0.22, end: 0.42 },
      { start: 0.38, end: 0.58 },
      { start: 0.55, end: 0.75 },
    ];

    // Grid point counts (for display)
    const gridPoints = ['10', '100', '1000', '10^{256}'];
    const gridNotes = ['10', '10^2', '10^3', '10^{256}'];

    for (let p = 0; p < 4; p++) {
      const pP = easedSub(progress, panelTimings[p].start, panelTimings[p].end);
      if (pP <= 0) continue;

      const px = startX + p * (panelW + gap);

      ctx.save();
      ctx.globalAlpha = pP;

      // Panel background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = panelColors[p] + '60';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px + 6, panelY);
      ctx.lineTo(px + panelW - 6, panelY);
      ctx.quadraticCurveTo(px + panelW, panelY, px + panelW, panelY + 6);
      ctx.lineTo(px + panelW, panelY + panelH - 6);
      ctx.quadraticCurveTo(px + panelW, panelY + panelH, px + panelW - 6, panelY + panelH);
      ctx.lineTo(px + 6, panelY + panelH);
      ctx.quadraticCurveTo(px, panelY + panelH, px, panelY + panelH - 6);
      ctx.lineTo(px, panelY + 6);
      ctx.quadraticCurveTo(px, panelY, px + 6, panelY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center of panel
      const cx = px + panelW / 2;
      const cy = panelY + panelH * 0.45;
      const drawR = panelW * 0.35;

      if (p === 0) {
        // 1D: simple line with dots
        ctx.strokeStyle = panelColors[p];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - drawR, cy);
        ctx.lineTo(cx + drawR, cy);
        ctx.stroke();

        // Grid dots
        const nd = 10;
        for (let i = 0; i <= nd; i++) {
          const dx = cx - drawR + (2 * drawR * i / nd);
          ctx.beginPath();
          ctx.arc(dx, cy, 2.5 * easeOut(Math.min(pP * 2, 1)), 0, Math.PI * 2);
          ctx.fillStyle = panelColors[p];
          ctx.fill();
        }
      } else if (p === 1) {
        // 2D: grid of dots on a plane
        const nd = 5;
        for (let ix = 0; ix <= nd; ix++) {
          for (let iy = 0; iy <= nd; iy++) {
            const dx = cx - drawR * 0.8 + (drawR * 1.6 * ix / nd);
            const dy = cy - drawR * 0.8 + (drawR * 1.6 * iy / nd);
            ctx.beginPath();
            ctx.arc(dx, dy, 2 * easeOut(Math.min(pP * 2, 1)), 0, Math.PI * 2);
            ctx.fillStyle = panelColors[p];
            ctx.fill();
          }
        }
        // Grid lines
        ctx.strokeStyle = panelColors[p] + '40';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= nd; i++) {
          const pos = cy - drawR * 0.8 + (drawR * 1.6 * i / nd);
          ctx.beginPath();
          ctx.moveTo(cx - drawR * 0.8, pos);
          ctx.lineTo(cx + drawR * 0.8, pos);
          ctx.stroke();
          const posX = cx - drawR * 0.8 + (drawR * 1.6 * i / nd);
          ctx.beginPath();
          ctx.moveTo(posX, cy - drawR * 0.8);
          ctx.lineTo(posX, cy + drawR * 0.8);
          ctx.stroke();
        }
      } else if (p === 2) {
        // 3D: pseudo-3D cube wireframe with dots
        const s = drawR * 0.6;
        const iso = 0.4; // isometric factor

        // Draw a wireframe cube with dots at vertices
        const vertices = [
          [cx - s, cy + s * 0.5],
          [cx + s, cy + s * 0.5],
          [cx + s, cy - s * 0.5],
          [cx - s, cy - s * 0.5],
          [cx - s + s * iso, cy + s * 0.5 - s * iso],
          [cx + s + s * iso, cy + s * 0.5 - s * iso],
          [cx + s + s * iso, cy - s * 0.5 - s * iso],
          [cx - s + s * iso, cy - s * 0.5 - s * iso],
        ];

        ctx.strokeStyle = panelColors[p] + '60';
        ctx.lineWidth = 1;
        // Front face
        const frontEdges = [[0,1],[1,2],[2,3],[3,0]];
        for (const [a, b] of frontEdges) {
          ctx.beginPath();
          ctx.moveTo(vertices[a][0], vertices[a][1]);
          ctx.lineTo(vertices[b][0], vertices[b][1]);
          ctx.stroke();
        }
        // Back face
        const backEdges = [[4,5],[5,6],[6,7],[7,4]];
        for (const [a, b] of backEdges) {
          ctx.beginPath();
          ctx.moveTo(vertices[a][0], vertices[a][1]);
          ctx.lineTo(vertices[b][0], vertices[b][1]);
          ctx.stroke();
        }
        // Connecting edges
        const connEdges = [[0,4],[1,5],[2,6],[3,7]];
        for (const [a, b] of connEdges) {
          ctx.beginPath();
          ctx.moveTo(vertices[a][0], vertices[a][1]);
          ctx.lineTo(vertices[b][0], vertices[b][1]);
          ctx.stroke();
        }

        // Dots at vertices
        for (const v of vertices) {
          ctx.beginPath();
          ctx.arc(v[0], v[1], 2.5, 0, Math.PI * 2);
          ctx.fillStyle = panelColors[p];
          ctx.fill();
        }

        // Interior dots suggesting volume
        const nd3 = 3;
        for (let ix = 1; ix < nd3; ix++) {
          for (let iy = 1; iy < nd3; iy++) {
            for (let iz = 1; iz < nd3; iz++) {
              const fx = ix / nd3, fy = iy / nd3, fz = iz / nd3;
              const dx = cx - s + 2 * s * fx + s * iso * fz;
              const dy = cy + s * 0.5 - s * fy - s * iso * fz;
              ctx.beginPath();
              ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = panelColors[p] + '60';
              ctx.fill();
            }
          }
        }
      } else {
        // 256D: chaos/impossibility
        // Dense cloud of tiny dots, suggesting explosion
        ctx.save();

        // Draw expanding scatter cloud
        const seed = 42;
        const nd = 100;
        for (let i = 0; i < nd; i++) {
          // Deterministic pseudo-random positions
          const a1 = Math.sin(seed + i * 7.37) * 0.5 + 0.5;
          const a2 = Math.cos(seed + i * 13.17) * 0.5 + 0.5;
          const dist = Math.sqrt(a1 * a1 + a2 * a2) * drawR;
          const angle = (a1 * 2 + a2 * 3) * Math.PI * 2;
          const dx = cx + dist * Math.cos(angle) * easeOut(Math.min(pP * 1.5, 1));
          const dy = cy + dist * Math.sin(angle) * easeOut(Math.min(pP * 1.5, 1));

          if (dx > px + 4 && dx < px + panelW - 4 && dy > panelY + 4 && dy < panelY + panelH - 10) {
            ctx.beginPath();
            ctx.arc(dx, dy, 1, 0, Math.PI * 2);
            ctx.fillStyle = panelColors[p] + '50';
            ctx.fill();
          }
        }

        // Large X overlay
        const xP = easedSub(progress, panelTimings[p].end - 0.05, panelTimings[p].end + 0.05);
        if (xP > 0) {
          ctx.globalAlpha = pP * xP;
          ctx.strokeStyle = colors.error;
          ctx.lineWidth = 4;
          const xSize = drawR * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx - xSize, cy - xSize);
          ctx.lineTo(cx + xSize * xP, cy + xSize * xP);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + xSize, cy - xSize);
          ctx.lineTo(cx - xSize * xP, cy + xSize * xP);
          ctx.stroke();
        }

        ctx.restore();
      }

      // Dimension label below each panel
      ctx.fillStyle = panelColors[p];
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene4', dimLabels[p]), cx, panelY + panelH + 18);

      ctx.restore();
    }

    // Grid point count labels
    const countP = easedSub(progress, 0.6, 0.8);
    if (countP > 0) {
      for (let p = 0; p < 4; p++) {
        const px = startX + p * (panelW + gap);
        const cx = px + panelW / 2;
        const iP = easedSub(progress, 0.6 + p * 0.04, 0.78 + p * 0.04);
        fadeInText(ctx, gridNotes[p], cx, panelY + panelH + 34, iP, {
          color: colors.textMuted, font: `10px ${fonts.mono}`
        });
      }
    }

    // Formula: the integral over 256D
    const fP = easedSub(progress, 0.78, 0.92);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'intract',
        '\\int_{\\mathbb{R}^{256}} p(\\mathbf{x}, \\mathbf{z}) \\, d\\mathbf{z} \\quad \\longrightarrow \\quad \\text{intractable!}',
        50, 90, fP, { color: colors.error, fontSize: '1em' });
    }
  }
});
