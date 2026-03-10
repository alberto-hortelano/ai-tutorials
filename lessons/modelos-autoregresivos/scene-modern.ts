// Scene 7: Beyond Basics — PixelCNN, WaveNet, GPT mini-diagrams

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeOutBack } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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

    // Three columns for three models
    const colW = W / 3;
    const models = [
      {
        name: tx('scene7', 'pixelcnn'),
        desc: tx('scene7', 'pixelcnnDesc'),
        domain: tx('scene7', 'pixelcnnDomain'),
        color: series[0],
        start: 0.05,
        end: 0.4,
        drawIcon: (cx: number, cy: number, p: number) => {
          // Masked convolution: small pixel grid with mask
          const gridSize = 5;
          const cellSize = Math.min(W * 0.03, 14);
          const startGX = cx - (gridSize * cellSize) / 2;
          const startGY = cy - (gridSize * cellSize) / 2;

          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const cellP = easedSub(p, 0.2 + (row * gridSize + col) * 0.015, 0.5 + (row * gridSize + col) * 0.015);
              if (cellP <= 0) continue;

              const gx = startGX + col * cellSize;
              const gy = startGY + row * cellSize;

              // Determine if this cell is in the "visible" region (before center)
              const center = Math.floor(gridSize / 2);
              const isCenter = row === center && col === center;
              const isBefore = row < center || (row === center && col < center);
              const isMasked = row > center || (row === center && col > center);

              if (isCenter) {
                ctx.fillStyle = colors.warning + '80';
              } else if (isBefore) {
                ctx.fillStyle = series[0] + '60';
              } else if (isMasked) {
                ctx.fillStyle = colors.panelBg;
              } else {
                ctx.fillStyle = colors.panelBg;
              }

              ctx.globalAlpha = cellP * easeOut(p);
              ctx.fillRect(gx + 0.5, gy + 0.5, cellSize - 1, cellSize - 1);

              // X for masked cells
              if (isMasked && cellP > 0.5) {
                ctx.strokeStyle = colors.textDimmed + '60';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(gx + 2, gy + 2);
                ctx.lineTo(gx + cellSize - 3, gy + cellSize - 3);
                ctx.moveTo(gx + cellSize - 3, gy + 2);
                ctx.lineTo(gx + 2, gy + cellSize - 3);
                ctx.stroke();
              }

              ctx.strokeStyle = colors.border;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(gx + 0.5, gy + 0.5, cellSize - 1, cellSize - 1);
            }
          }
        },
      },
      {
        name: tx('scene7', 'wavenet'),
        desc: tx('scene7', 'wavenetDesc'),
        domain: tx('scene7', 'wavenetDomain'),
        color: series[1],
        start: 0.25,
        end: 0.6,
        drawIcon: (cx: number, cy: number, p: number) => {
          // Dilated causal convolutions: layered connections with increasing dilation
          const layers = 4;
          const nodesPerLayer = 8;
          const layerH = 20;
          const nodeSpacing = Math.min(W * 0.025, 12);
          const startNX = cx - (nodesPerLayer * nodeSpacing) / 2;
          const startNY = cy - (layers * layerH) / 2;

          for (let l = 0; l < layers; l++) {
            const lP = easedSub(p, 0.2 + l * 0.15, 0.5 + l * 0.15);
            if (lP <= 0) continue;

            const dilation = Math.pow(2, l);
            const ny = startNY + l * layerH;

            ctx.globalAlpha = easeOut(lP) * easeOut(p);

            // Draw nodes
            for (let n = 0; n < nodesPerLayer; n++) {
              const nx = startNX + n * nodeSpacing + nodeSpacing / 2;
              ctx.beginPath();
              ctx.arc(nx, ny, 3, 0, Math.PI * 2);
              ctx.fillStyle = series[1] + '80';
              ctx.fill();
            }

            // Draw causal connections to next layer
            if (l < layers - 1) {
              const nextY = startNY + (l + 1) * layerH;
              for (let n = 0; n < nodesPerLayer; n++) {
                const nx = startNX + n * nodeSpacing + nodeSpacing / 2;
                // Causal: connect to n and n-dilation
                const targets = [n, n - dilation];
                for (const t of targets) {
                  if (t >= 0 && t < nodesPerLayer) {
                    const tx2 = startNX + t * nodeSpacing + nodeSpacing / 2;
                    ctx.strokeStyle = series[1] + '40';
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(tx2, ny + 3);
                    ctx.lineTo(nx, nextY - 3);
                    ctx.stroke();
                  }
                }
              }
            }
          }

          // Dilation labels
          if (p > 0.5) {
            ctx.globalAlpha = easeOut(p) * 0.7;
            ctx.fillStyle = series[1];
            ctx.font = `7px ${fonts.mono}`;
            ctx.textAlign = 'right';
            for (let l = 0; l < layers; l++) {
              const ny = startNY + l * layerH;
              ctx.fillText(`d=${Math.pow(2, l)}`, startNX - 5, ny + 3);
            }
          }
        },
      },
      {
        name: tx('scene7', 'gpt'),
        desc: tx('scene7', 'gptDesc'),
        domain: tx('scene7', 'gptDomain'),
        color: series[4],
        start: 0.45,
        end: 0.8,
        drawIcon: (cx: number, cy: number, p: number) => {
          // Masked self-attention: triangular attention matrix
          const matSize = 6;
          const cellSize = Math.min(W * 0.025, 12);
          const startMX = cx - (matSize * cellSize) / 2;
          const startMY = cy - (matSize * cellSize) / 2;

          for (let row = 0; row < matSize; row++) {
            for (let col = 0; col < matSize; col++) {
              const cellP = easedSub(p, 0.2 + row * 0.08, 0.5 + row * 0.08);
              if (cellP <= 0) continue;

              const mx = startMX + col * cellSize;
              const my = startMY + row * cellSize;
              const isAttend = col <= row; // causal mask

              ctx.globalAlpha = cellP * easeOut(p);

              if (isAttend) {
                // Attention weight: darker for closer tokens
                const dist = row - col;
                const intensity = Math.max(0.3, 1 - dist * 0.15);
                ctx.fillStyle = series[4] + Math.round(intensity * 99).toString().padStart(2, '0');
              } else {
                ctx.fillStyle = colors.panelBg;
              }

              ctx.fillRect(mx + 0.5, my + 0.5, cellSize - 1, cellSize - 1);
              ctx.strokeStyle = colors.border;
              ctx.lineWidth = 0.5;
              ctx.strokeRect(mx + 0.5, my + 0.5, cellSize - 1, cellSize - 1);
            }
          }

          // Token labels
          if (p > 0.5) {
            ctx.globalAlpha = easeOut(p) * 0.7;
            ctx.fillStyle = series[4];
            ctx.font = `7px ${fonts.mono}`;
            ctx.textAlign = 'center';
            const tokens = ['t1', 't2', 't3', 't4', 't5', 't6'];
            for (let i = 0; i < matSize; i++) {
              const tx3 = startMX + i * cellSize + cellSize / 2;
              ctx.fillText(tokens[i], tx3, startMY - 4);
            }
          }
        },
      },
    ];

    models.forEach((model, idx) => {
      const mP = easedSub(progress, model.start, model.end);
      if (mP <= 0) return;

      const cx = colW * idx + colW / 2;

      ctx.save();

      // Model name
      fadeInText(ctx, model.name, cx, 55, easedSub(progress, model.start, model.start + 0.08), {
        color: model.color, font: `bold 14px ${fonts.body}`
      });

      // Description
      fadeInText(ctx, model.desc, cx, 73, easedSub(progress, model.start + 0.03, model.start + 0.12), {
        color: colors.textSecondary, font: `10px ${fonts.body}`
      });

      // Domain badge
      const domP = easedSub(progress, model.start + 0.08, model.start + 0.18);
      if (domP > 0) {
        ctx.save();
        ctx.globalAlpha = easeOut(domP);
        ctx.fillStyle = model.color + '20';
        ctx.strokeStyle = model.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx - 35, 82, 70, 18, 9);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = model.color;
        ctx.font = `bold 9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(model.domain, cx, 94);
        ctx.restore();
      }

      // Icon diagram
      const iconY = H * 0.42;
      model.drawIcon(cx, iconY, mP);

      ctx.restore();
    });

    // "Same autoregressive principle" badge at bottom
    const sameP = easedSub(progress, 0.82, 0.96, easeOutBack);
    if (sameP > 0) {
      const bx = W / 2;
      const by = H * 0.82;

      ctx.save();
      ctx.globalAlpha = sameP;

      // Connecting line
      ctx.strokeStyle = colors.accent + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.15, by);
      ctx.lineTo(W * 0.85, by);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge
      ctx.fillStyle = colors.accent + '20';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - 130, by - 14, 260, 28, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'sameIdea'), bx, by + 4);
      ctx.restore();
    }
  }
});
