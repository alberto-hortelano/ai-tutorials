// Scene 7: Evaluating GANs — FID, feature space clusters drifting together

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateDots } from '../../engine/animation/particles';
import { animateArrow } from '../../engine/animation/arrow';
import { lerp } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

// Pre-generate two clusters in feature space
const REAL_CLUSTER: { x: number; y: number }[] = [];
const FAKE_CLUSTER_START: { x: number; y: number }[] = [];
const FAKE_CLUSTER_END: { x: number; y: number }[] = [];
for (let i = 0; i < 25; i++) {
  const angle = (i / 25) * Math.PI * 2 + i * 0.7;
  const r1 = 0.3 + 0.4 * Math.abs(Math.sin(i * 2.1));
  REAL_CLUSTER.push({
    x: -0.5 + Math.cos(angle) * r1 * 0.8,
    y: Math.sin(angle) * r1 * 0.8
  });

  // Start position (far from real)
  const r2 = 0.3 + 0.35 * Math.abs(Math.cos(i * 1.9));
  FAKE_CLUSTER_START.push({
    x: 1.5 + Math.cos(angle + 0.5) * r2 * 0.7,
    y: 0.3 + Math.sin(angle + 0.5) * r2 * 0.7
  });

  // End position (close to real)
  FAKE_CLUSTER_END.push({
    x: -0.3 + Math.cos(angle + 0.3) * r1 * 0.9,
    y: 0.1 + Math.sin(angle + 0.3) * r1 * 0.9
  });
}

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
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 30, easedSub(progress, 0, 0.1), {
      color: colors.textPrimary, font: 'bold 18px "Segoe UI", system-ui, sans-serif'
    });

    // "No likelihood!" callout
    const noLikP = easedSub(progress, 0.06, 0.18);
    if (noLikP > 0) {
      fadeInText(ctx, tx('scene7', 'noLikelihood'), W / 2, 52, noLikP, {
        color: colors.error, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });
    }

    // FID label
    const fidP = easedSub(progress, 0.15, 0.3);
    if (fidP > 0) {
      fadeInText(ctx, tx('scene7', 'fidLabel'), W / 2, 72, fidP, {
        color: colors.accent, font: '12px "Courier New", monospace'
      });
    }

    // Feature space background
    const centerX = W / 2;
    const centerY = H * 0.52;
    const scaleR = Math.min(W, H) * 0.28;

    const spaceP = easedSub(progress, 0.2, 0.35);
    if (spaceP > 0) {
      // Subtle grid
      ctx.save();
      ctx.globalAlpha = spaceP * 0.1;
      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 0.5;
      for (let gx = centerX - scaleR * 1.5; gx <= centerX + scaleR * 1.5; gx += 30) {
        ctx.beginPath();
        ctx.moveTo(gx, centerY - scaleR * 1.3);
        ctx.lineTo(gx, centerY + scaleR * 1.3);
        ctx.stroke();
      }
      for (let gy = centerY - scaleR * 1.3; gy <= centerY + scaleR * 1.3; gy += 30) {
        ctx.beginPath();
        ctx.moveTo(centerX - scaleR * 1.5, gy);
        ctx.lineTo(centerX + scaleR * 1.5, gy);
        ctx.stroke();
      }
      ctx.restore();

      fadeInText(ctx, tx('scene7', 'featureSpace'), centerX + scaleR * 1.2, centerY - scaleR * 1.1, spaceP, {
        color: colors.textDimmed, font: '9px "Segoe UI", system-ui, sans-serif', align: 'right'
      });
    }

    // Real cluster (blue, static)
    const realP = easedSub(progress, 0.28, 0.45);
    if (realP > 0) {
      const realPx = REAL_CLUSTER.map(d => ({
        x: centerX + d.x * scaleR,
        y: centerY + d.y * scaleR
      }));
      animateDots(ctx, realPx, realP, {
        color: series[0], radius: 5, sequential: false
      });

      if (realP > 0.5) {
        fadeInText(ctx, tx('scene7', 'realCloud'), centerX + REAL_CLUSTER[0].x * scaleR, centerY - scaleR * 0.6, (realP - 0.5) * 2, {
          color: series[0], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
        });
      }
    }

    // Fake cluster (red, drifting toward real)
    const fakeP = easedSub(progress, 0.35, 0.55);
    const driftT = easedSub(progress, 0.5, 0.85);
    if (fakeP > 0) {
      const fakePx = FAKE_CLUSTER_START.map((start, i) => {
        const end = FAKE_CLUSTER_END[i];
        return {
          x: centerX + lerp(start.x, end.x, driftT) * scaleR,
          y: centerY + lerp(start.y, end.y, driftT) * scaleR
        };
      });
      animateDots(ctx, fakePx, fakeP, {
        color: series[2], radius: 5, sequential: false
      });

      if (fakeP > 0.5) {
        const labelX = lerp(1.5, -0.3, driftT);
        const labelY = lerp(0.3, 0.1, driftT);
        fadeInText(ctx, tx('scene7', 'fakeCloud'), centerX + labelX * scaleR, centerY + (labelY - 0.55) * scaleR, (fakeP - 0.5) * 2, {
          color: series[2], font: 'bold 11px "Segoe UI", system-ui, sans-serif'
        });
      }
    }

    // FID arrow between cluster centers
    const fidArrP = easedSub(progress, 0.45, 0.65);
    if (fidArrP > 0) {
      const realCX = centerX + (-0.5) * scaleR;
      const realCY = centerY;
      const fakeCX = centerX + lerp(1.5, -0.3, driftT) * scaleR;
      const fakeCY = centerY + lerp(0.3, 0.1, driftT) * scaleR;

      ctx.save();
      ctx.globalAlpha = fidArrP * 0.7;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(realCX, realCY);
      ctx.lineTo(fakeCX, fakeCY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const midX = (realCX + fakeCX) / 2;
      const midY = (realCY + fakeCY) / 2;
      fadeInText(ctx, 'FID', midX, midY - 12, fidArrP, {
        color: colors.warning, font: 'bold 12px "Courier New", monospace'
      });
    }

    // Lower FID = better quality
    const insP = easedSub(progress, 0.85, 0.97);
    if (insP > 0) {
      fadeInText(ctx, tx('scene7', 'lowerBetter'), W / 2, H - 25, insP, {
        color: colors.insight, font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
    }
  }
});
