// Scene 5: MADE — masked autoencoder for efficient autoregressive
// Enhanced: expanded masking mechanism with weight matrix × mask visualization

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { mulberry32 } from '../_shared/flow-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 22,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // --- Network layout (top half) ---
    const layers = [3, 5, 5, 3];
    const nodeR = 10;
    const layerSpacing = W / (layers.length + 1);
    const netTop = H * 0.15;

    // Node positions
    const nodePos: { x: number; y: number }[][] = layers.map((n, li) => {
      const x = layerSpacing * (li + 1);
      return Array.from({ length: n }, (_, ni) => ({
        x,
        y: netTop + (ni - (n - 1) / 2) * 35,
      }));
    });

    // Autoregressive mask assignment
    const rng = mulberry32(42);
    const hiddenMasks = layers.map((n, li) => {
      if (li === 0) return Array.from({ length: n }, (_, i) => i);
      if (li === layers.length - 1) return Array.from({ length: n }, (_, i) => i);
      return Array.from({ length: n }, () => Math.floor(rng() * 3));
    });

    function isConnected(fromLayer: number, fromIdx: number, toLayer: number, toIdx: number): boolean {
      const fromM = hiddenMasks[fromLayer][fromIdx];
      const toM = hiddenMasks[toLayer][toIdx];
      if (toLayer === layers.length - 1) {
        return fromM < toM;
      }
      return fromM <= toM;
    }

    // Mask progress
    const maskT = easedSub(progress, 0.25, 0.55, easeInOut);

    // Draw connections
    const connP = easedSub(progress, 0.08, 0.3);
    if (connP > 0) {
      for (let li = 0; li < layers.length - 1; li++) {
        for (let fi = 0; fi < layers[li]; fi++) {
          for (let ti = 0; ti < layers[li + 1]; ti++) {
            const connected = isConnected(li, fi, li + 1, ti);
            const alpha = connected ? connP : connP * (1 - maskT);

            if (alpha > 0.01) {
              ctx.save();
              ctx.globalAlpha = alpha * 0.5;
              ctx.strokeStyle = connected ? colors.accent : colors.error;
              ctx.lineWidth = connected ? 1.5 : 0.8;
              if (!connected && maskT > 0) {
                ctx.setLineDash([3, 3]);
              }
              ctx.beginPath();
              ctx.moveTo(nodePos[li][fi].x + nodeR, nodePos[li][fi].y);
              ctx.lineTo(nodePos[li + 1][ti].x - nodeR, nodePos[li + 1][ti].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }
    }

    // Draw nodes
    const nodeP = easedSub(progress, 0.05, 0.18);
    if (nodeP > 0) {
      nodePos.forEach((layer, li) => {
        layer.forEach((pos, ni) => {
          ctx.save();
          ctx.globalAlpha = nodeP;

          const isInput = li === 0;
          const isOutput = li === layers.length - 1;
          const color = isInput ? series[0] : isOutput ? series[2] : colors.accent;

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = color + '40';
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.font = `bold 9px ${fonts.body}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(hiddenMasks[li][ni]), pos.x, pos.y);

          ctx.textBaseline = 'alphabetic';
          ctx.restore();
        });
      });
    }

    // Net labels
    const lblP = easedSub(progress, 0.08, 0.18);
    fadeInText(ctx, tx('scene5', 'fullNet'), layerSpacing, netTop - 55, lblP, {
      color: colors.textMuted, font: `10px ${fonts.body}`
    });

    const masked2P = easedSub(progress, 0.4, 0.55);
    if (masked2P > 0) {
      fadeInText(ctx, tx('scene5', 'maskedNet'), W / 2, netTop - 55, masked2P, {
        color: colors.accent, font: `bold 11px ${fonts.body}`
      });
    }

    // --- Weight matrix × Mask visualization (bottom half) ---
    const matSectionY = H * 0.55;
    const matP = easedSub(progress, 0.45, 0.8, easeInOut);
    if (matP > 0) {
      ctx.save();
      ctx.globalAlpha = matP;

      const mRows = 5, mCols = 5;
      const cellSz = Math.min(18, (W * 0.2) / mCols);

      // Mask matrix (autoregressive: lower triangular)
      // We show W, M, and W_eff = W ⊙ M

      // Weight matrix W (all entries filled)
      const wStartX = W * 0.1;
      const wStartY = matSectionY + 18;
      fadeInText(ctx, tx('scene5', 'weightMatrix'), wStartX + mCols * cellSz / 2, matSectionY + 5, 1, {
        color: colors.textSecondary, font: `bold 10px ${fonts.body}`
      });

      const rng2 = mulberry32(123);
      for (let row = 0; row < mRows; row++) {
        for (let col = 0; col < mCols; col++) {
          const val = (rng2() * 2 - 1).toFixed(1);
          const x = wStartX + col * cellSz;
          const y = wStartY + row * cellSz;
          ctx.fillStyle = colors.accent + '40';
          ctx.fillRect(x, y, cellSz - 1, cellSz - 1);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSz - 1, cellSz - 1);
          ctx.fillStyle = colors.textSecondary;
          ctx.font = `7px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(val, x + cellSz / 2, y + cellSz / 2);
        }
      }

      // Multiplication symbol
      const symX = wStartX + mCols * cellSz + 15;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2299', symX, wStartY + mRows * cellSz / 2);

      // Mask matrix M (binary, lower triangular)
      const mStartX = symX + 20;
      fadeInText(ctx, tx('scene5', 'maskMatrix'), mStartX + mCols * cellSz / 2, matSectionY + 5, 1, {
        color: colors.warning, font: `bold 10px ${fonts.body}`
      });

      for (let row = 0; row < mRows; row++) {
        for (let col = 0; col < mCols; col++) {
          const mask = col < row ? 1 : 0; // strict lower triangular (autoregressive)
          const x = mStartX + col * cellSz;
          const y = wStartY + row * cellSz;
          ctx.fillStyle = mask ? colors.accent + '60' : colors.textDimmed + '20';
          ctx.fillRect(x, y, cellSz - 1, cellSz - 1);
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSz - 1, cellSz - 1);
          ctx.fillStyle = mask ? colors.textPrimary : colors.textDimmed;
          ctx.font = `bold 8px ${fonts.mono}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(mask), x + cellSz / 2, y + cellSz / 2);
        }
      }

      // Equals sign
      const eqX = mStartX + mCols * cellSz + 15;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 16px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('=', eqX, wStartY + mRows * cellSz / 2);

      // Effective weight matrix W_eff = W ⊙ M
      const effStartX = eqX + 15;
      fadeInText(ctx, tx('scene5', 'effectiveMatrix'), effStartX + mCols * cellSz / 2, matSectionY + 5, 1, {
        color: colors.insight, font: `bold 10px ${fonts.body}`
      });

      const rng3 = mulberry32(123); // same seed to get same values
      for (let row = 0; row < mRows; row++) {
        for (let col = 0; col < mCols; col++) {
          const val = (rng3() * 2 - 1).toFixed(1);
          const mask = col < row ? 1 : 0;
          const x = effStartX + col * cellSz;
          const y = wStartY + row * cellSz;

          if (mask) {
            ctx.fillStyle = colors.insight + '50';
            ctx.fillRect(x, y, cellSz - 1, cellSz - 1);
            ctx.fillStyle = colors.textPrimary;
            ctx.font = `7px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, x + cellSz / 2, y + cellSz / 2);
          } else {
            ctx.fillStyle = colors.panelBg;
            ctx.fillRect(x, y, cellSz - 1, cellSz - 1);
            ctx.fillStyle = colors.textDimmed;
            ctx.font = `7px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0', x + cellSz / 2, y + cellSz / 2);
          }
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, cellSz - 1, cellSz - 1);
        }
      }

      ctx.textBaseline = 'alphabetic';

      // Legend
      const legY = wStartY + mRows * cellSz + 12;
      const legP = easedSub(progress, 0.6, 0.72);
      if (legP > 0) {
        ctx.globalAlpha = legP * matP;

        // Allowed
        ctx.fillStyle = colors.insight + '50';
        ctx.fillRect(W * 0.3, legY, 12, 12);
        ctx.fillStyle = colors.textSecondary;
        ctx.font = `9px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene5', 'allowed'), W * 0.3 + 16, legY + 10);

        // Blocked
        ctx.fillStyle = colors.textDimmed + '20';
        ctx.fillRect(W * 0.55, legY, 12, 12);
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(tx('scene5', 'blocked'), W * 0.55 + 16, legY + 10);
      }

      ctx.restore();
    }

    // One pass label
    const oneP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene5', 'onePass'), W / 2, H - 18, oneP, {
      color: colors.insight, font: `bold 12px ${fonts.body}`
    });
  }
});
