// Scene 5: Langevin Dynamics — x_{t+1} = x_t - (ε/2)∇E(x_t) + √ε·η

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { animateCurve } from '../../engine/animation/graph';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Energy landscape */
function energyFn(x: number): number {
  return 1.5 + 1.2 * Math.sin(x * 1.1) + 0.5 * Math.cos(x * 2.3);
}

/** Energy gradient (numerical) */
function energyGrad(x: number): number {
  const dx = 0.01;
  return (energyFn(x + dx) - energyFn(x - dx)) / (2 * dx);
}

// Pre-compute Langevin trajectories for particles using seeded pseudo-random
function makeLangevinTrajectory(x0: number, steps: number, eps: number, seed: number): number[] {
  const traj: number[] = [x0];
  let x = x0;
  // Simple pseudo-random noise (deterministic for consistent rendering)
  let s = seed;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return ((s / 0x7fffffff) - 0.5) * 2; };
  for (let i = 0; i < steps; i++) {
    const grad = energyGrad(x);
    x = x - (eps / 2) * grad + Math.sqrt(eps) * rand() * 0.5;
    x = Math.max(0.2, Math.min(9.8, x));
    traj.push(x);
  }
  return traj;
}

const STEPS = 60;
const EPS = 0.15;
const trajectories = [
  makeLangevinTrajectory(1.0, STEPS, EPS, 42),
  makeLangevinTrajectory(5.0, STEPS, EPS, 137),
  makeLangevinTrajectory(8.5, STEPS, EPS, 271),
  makeLangevinTrajectory(6.5, STEPS, EPS, 523),
];
const particleColors = [colors.warning, colors.info, series[1], series[4]];

export const scene5 = new Scene({
  id: () => tx('scene5', 'id'),
  duration: 25,
  narration: () => tx('scene5', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene5 as SceneText)?.subtitleCues ?? (text.es.scene5 as SceneText).subtitleCues,
  topic: () => tx('scene5', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene5', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif',
    });

    // Formula
    const formulaP = easedSub(progress, 0.05, 0.2);
    if (formulaP > 0) {
      formulaAppear(state.formulaManager, 'ebm-langevin',
        'x_{t+1} = x_t - \\frac{\\varepsilon}{2} \\nabla E(x_t) + \\sqrt{\\varepsilon}\\, \\eta',
        50, 14, formulaP, { color: colors.accent, fontSize: '1.05em' });
    }

    // Energy landscape
    r.setViewport(0, 10, 0, 4);
    const axesP = easedSub(progress, 0.08, 0.2);
    if (axesP > 0) {
      ctx.globalAlpha = axesP;
      r.drawAxes({ xLabel: 'x', yLabel: 'E(x)', xTicks: 5, yTicks: 4 });
      ctx.globalAlpha = 1;
    }

    const curveP = easedSub(progress, 0.12, 0.28);
    if (curveP > 0) {
      animateCurve(r, energyFn, colors.textMuted, curveP, 2);
    }

    // Particles rolling down the landscape with trails
    const particleP = easedSub(progress, 0.25, 0.9);
    if (particleP > 0) {
      const stepIdx = Math.floor(particleP * STEPS);

      for (let pi = 0; pi < trajectories.length; pi++) {
        const traj = trajectories[pi];
        const col = particleColors[pi];

        // Draw trail
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let s = 0; s <= Math.min(stepIdx, traj.length - 1); s++) {
          const px = r.toX(traj[s]);
          const py = r.toY(energyFn(traj[s]));
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.restore();

        // Draw current particle
        const si = Math.min(stepIdx, traj.length - 1);
        const curX = traj[si];
        const curE = energyFn(curX);
        ctx.save();
        ctx.shadowColor = col;
        ctx.shadowBlur = 6;
        r.dot(curX, curE, 6, col);
        ctx.restore();
      }
    }

    // Labels
    const labelP = easedSub(progress, 0.5, 0.65);
    if (labelP > 0) {
      fadeInText(ctx, tx('scene5', 'gradient'), W * 0.15, H - 50, labelP, {
        color: colors.textMuted, font: '11px "Segoe UI", system-ui, sans-serif',
      });
      fadeInText(ctx, tx('scene5', 'noise'), W * 0.5, H - 50, labelP, {
        color: colors.info, font: '11px "Segoe UI", system-ui, sans-serif',
      });
    }

    // Bottom insight
    const insightP = easedSub(progress, 0.88, 1);
    fadeInText(ctx, tx('scene5', 'converge'), W / 2, H - 25, insightP, {
      color: colors.insight, font: 'bold 12px "Segoe UI", system-ui, sans-serif',
    });
  },
});
