// Scene 6: Short-Run MCMC — K=10-100 steps instead of convergence

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape */
function energyFn(x: number): number {
  return 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
}

/** Energy gradient */
function energyGrad(x: number): number {
  const dx = 0.01;
  return (energyFn(x + dx) - energyFn(x - dx)) / (2 * dx);
}

// Short-run trajectory (K=15 steps)
function makeTrajectory(x0: number, steps: number, seed: number): number[] {
  const traj: number[] = [x0];
  let x = x0;
  let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return ((s / 0x7fffffff) - 0.5) * 2; };
  for (let i = 0; i < steps; i++) {
    x = x - 0.07 * energyGrad(x) + 0.12 * rand();
    x = Math.max(0.3, Math.min(9.7, x));
    traj.push(x);
  }
  return traj;
}

const SHORT_K = 15;
const LONG_K = 80;
const shortTrajs = [
  makeTrajectory(5.0, SHORT_K, 42),
  makeTrajectory(1.5, SHORT_K, 99),
  makeTrajectory(8.0, SHORT_K, 210),
];
const longTraj = makeTrajectory(5.0, LONG_K, 42);

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Split view: left = full chain, right = short-run
    const midX = W / 2;
    const viewTop = 60;
    const viewH = H * 0.55;

    // Dividing line
    const divP = easedSub(progress, 0.05, 0.15);
    if (divP > 0) {
      ctx.globalAlpha = divP * 0.3;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, viewTop);
      ctx.lineTo(midX, viewTop + viewH);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Labels for each side
    const labelP = easedSub(progress, 0.08, 0.2);
    if (labelP > 0) {
      fadeInText(ctx, tx('scene6', 'fullChain'), midX * 0.5, viewTop + 10, labelP, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene6', 'shortRun'), midX * 1.5, viewTop + 10, labelP, {
        color: colors.warning, font: 'bold 11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Draw energy landscape in both panels (mini)
    const drawMiniLandscape = (offsetX: number, panelW: number) => {
      ctx.save();
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const x = t * 10;
        const px = offsetX + t * panelW;
        const py = viewTop + 30 + energyFn(x) * (viewH - 50) / 4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    };

    const panelW = midX - 30;
    const landscapeP = easedSub(progress, 0.12, 0.25);
    if (landscapeP > 0) {
      ctx.globalAlpha = landscapeP;
      drawMiniLandscape(15, panelW);
      drawMiniLandscape(midX + 15, panelW);
      ctx.globalAlpha = 1;
    }

    // Full chain (left) — long trajectory running slowly
    const fullP = easedSub(progress, 0.2, 0.8);
    if (fullP > 0) {
      const steps = Math.floor(fullP * LONG_K);
      ctx.save();
      ctx.strokeStyle = series[0] + '80';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let s = 0; s <= Math.min(steps, longTraj.length - 1); s++) {
        const t = longTraj[s] / 10;
        const px = 15 + t * panelW;
        const py = viewTop + 30 + energyFn(longTraj[s]) * (viewH - 50) / 4;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // Current dot
      const si = Math.min(steps, longTraj.length - 1);
      const tx2 = longTraj[si] / 10;
      const px = 15 + tx2 * panelW;
      const py = viewTop + 30 + energyFn(longTraj[si]) * (viewH - 50) / 4;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = series[0];
      ctx.fill();
      ctx.restore();
    }

    // Short-run trajectories (right) — quick, truncated
    const shortP = easedSub(progress, 0.3, 0.65);
    if (shortP > 0) {
      const trajColors = [colors.warning, colors.info, series[1]];
      for (let ti = 0; ti < shortTrajs.length; ti++) {
        const traj = shortTrajs[ti];
        const steps = Math.floor(shortP * SHORT_K);
        ctx.save();
        ctx.strokeStyle = trajColors[ti] + '90';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 0; s <= Math.min(steps, traj.length - 1); s++) {
          const t = traj[s] / 10;
          const px = midX + 15 + t * panelW;
          const py = viewTop + 30 + energyFn(traj[s]) * (viewH - 50) / 4;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // End dot (truncated)
        const si = Math.min(steps, traj.length - 1);
        const tx3 = traj[si] / 10;
        const px = midX + 15 + tx3 * panelW;
        const py = viewTop + 30 + energyFn(traj[si]) * (viewH - 50) / 4;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = trajColors[ti];
        ctx.fill();
        ctx.restore();
      }
    }

    // Step counters
    const counterP = easedSub(progress, 0.6, 0.8);
    if (counterP > 0) {
      const fullSteps = Math.floor(easedSub(progress, 0.2, 0.8) * LONG_K);
      fadeInText(ctx, `${fullSteps} / ${LONG_K}+`, midX * 0.5, viewTop + viewH + 15, counterP, {
        color: colors.textDimmed, font: '11px "Courier New", monospace',
      });
      fadeInText(ctx, `K = ${SHORT_K}`, midX * 1.5, viewTop + viewH + 15, counterP, {
        color: colors.warning, font: 'bold 11px "Courier New", monospace',
      });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.85, 1);
    fadeInText(ctx, tx('scene6', 'biased'), W / 2, H - 25, insightP, {
      color: colors.warning, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
