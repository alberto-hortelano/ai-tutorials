// Scene 6: Beta-VAE — three-panel latent space with beta slider

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

/** Deterministic pseudo-random for reproducible dot positions */
function seededRand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 22,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // Formula: loss = recon + beta * KL
    const formP = easedSub(progress, 0.05, 0.2);
    if (formP > 0) {
      formulaAppear(state.formulaManager, 'beta-loss',
        '\\mathcal{L} = \\mathcal{L}_{\\text{recon}} + \\beta \\cdot D_{KL}',
        50, 14, formP, { color: colors.textPrimary, fontSize: '0.9em' });
    }

    // ===== THREE PANELS =====
    const panelW = W * 0.28;
    const panelH = H * 0.42;
    const panelY = H * 0.28;
    const gap = (W - 3 * panelW) / 4;

    const panels = [
      {
        title: tx('scene6', 'panel0Title'),
        desc: tx('scene6', 'panel0Desc'),
        beta: 0,
        color: colors.error,
        spread: 3.0,       // chaotic, wide spread
        clusters: false,
        start: 0.15, end: 0.4,
      },
      {
        title: tx('scene6', 'panel1Title'),
        desc: tx('scene6', 'panel1Desc'),
        beta: 1,
        color: colors.warning,
        spread: 1.5,
        clusters: true,
        start: 0.35, end: 0.6,
      },
      {
        title: tx('scene6', 'panel2Title'),
        desc: tx('scene6', 'panel2Desc'),
        beta: 4,
        color: colors.insight,
        spread: 0.6,        // tightly organized
        clusters: true,
        start: 0.55, end: 0.8,
      },
    ];

    panels.forEach((panel, pi) => {
      const panP = easedSub(progress, panel.start, panel.end);
      if (panP <= 0) return;

      const px = gap + pi * (panelW + gap);
      const py = panelY;

      ctx.save();
      ctx.globalAlpha = panP;

      // Panel border
      ctx.strokeStyle = panel.color;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = panel.color + '08';
      ctx.beginPath();
      ctx.roundRect(px, py, panelW, panelH, 6);
      ctx.fill();
      ctx.stroke();

      // Panel title
      ctx.fillStyle = panel.color;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(panel.title, px + panelW / 2, py - 8);

      // Draw latent space dots
      const dotCx = px + panelW / 2;
      const dotCy = py + panelH / 2;
      const nDots = 60;
      const dotR = 2.5;

      // Draw axes for latent space
      ctx.strokeStyle = colors.axis + '60';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(px + 8, dotCy);
      ctx.lineTo(px + panelW - 8, dotCy);
      ctx.moveTo(dotCx, py + 8);
      ctx.lineTo(dotCx, py + panelH - 8);
      ctx.stroke();

      // z1, z2 labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `9px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText('z1', px + panelW - 6, dotCy - 4);
      ctx.textAlign = 'center';
      ctx.fillText('z2', dotCx + 8, py + 14);

      const dotProgress = easeOut(Math.min(panP * 1.5, 1));

      // Generate dots with seeded random
      const clusterColors = [series[0], series[1], series[2], series[3]];
      const nClusters = 4;

      for (let i = 0; i < nDots; i++) {
        const cluster = i % nClusters;
        let dx: number, dy: number;

        if (panel.clusters && panel.beta > 0) {
          // Clustered dots — each cluster has a center
          const clAngle = (cluster / nClusters) * Math.PI * 2;
          const clDist = panel.spread * 12;
          const clCx = clDist * Math.cos(clAngle);
          const clCy = clDist * Math.sin(clAngle);
          dx = clCx + (seededRand(i * 7 + 1) - 0.5) * panel.spread * 18;
          dy = clCy + (seededRand(i * 13 + 3) - 0.5) * panel.spread * 18;
        } else {
          // Random scatter (chaotic)
          dx = (seededRand(i * 7 + 1) - 0.5) * panel.spread * 30;
          dy = (seededRand(i * 13 + 3) - 0.5) * panel.spread * 30;
        }

        const dotX = dotCx + dx * dotProgress;
        const dotY = dotCy + dy * dotProgress;

        // Clamp to panel bounds
        if (dotX < px + 4 || dotX > px + panelW - 4 || dotY < py + 4 || dotY > py + panelH - 4) continue;

        ctx.beginPath();
        ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = panel.clusters ? clusterColors[cluster] + '90' : panel.color + '70';
        ctx.fill();
      }

      // Description label below panel
      fadeInText(ctx, panel.desc, px + panelW / 2, py + panelH + 16, easeOut(panP), {
        color: panel.color, font: `bold 11px ${fonts.body}`
      });

      ctx.restore();
    });

    // ===== BETA SLIDER =====
    const sliderP = easedSub(progress, 0.75, 0.92);
    if (sliderP > 0) {
      const slY = H * 0.88;
      const slX = W * 0.15;
      const slW = W * 0.7;

      ctx.save();
      ctx.globalAlpha = sliderP;

      // Track
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(slX, slY - 4, slW, 8, 4);
      ctx.fill();
      ctx.stroke();

      // Colored segments
      const seg1 = slW * 0.1;  // beta=0 zone
      const seg2 = slW * 0.4;  // beta=1 zone
      ctx.fillStyle = colors.error + '60';
      ctx.fillRect(slX, slY - 3, seg1, 6);
      ctx.fillStyle = colors.warning + '60';
      ctx.fillRect(slX + seg1, slY - 3, seg2 - seg1, 6);
      ctx.fillStyle = colors.insight + '60';
      ctx.fillRect(slX + seg2, slY - 3, slW - seg2, 6);

      // Animated thumb position
      const thumbT = easedSub(progress, 0.78, 0.92, easeInOut);
      const thumbX = slX + thumbT * slW;
      ctx.beginPath();
      ctx.arc(thumbX, slY, 7, 0, Math.PI * 2);
      ctx.fillStyle = colors.textPrimary;
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Beta value above thumb
      const betaVal = thumbT * 4;
      ctx.fillStyle = colors.textPrimary;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(`${tx('scene6', 'sliderLabel')} = ${betaVal.toFixed(1)}`, thumbX, slY - 16);

      // Tick labels
      ctx.fillStyle = colors.textDimmed;
      ctx.font = `9px ${fonts.body}`;
      ctx.fillText('0', slX, slY + 16);
      ctx.fillText('1', slX + slW * 0.25, slY + 16);
      ctx.fillText('4', slX + slW, slY + 16);

      ctx.restore();
    }

    // Reconstruction quality labels under panels
    const qualP = easedSub(progress, 0.82, 0.95);
    if (qualP > 0) {
      const qY = H * 0.8;
      ctx.save();
      ctx.globalAlpha = qualP;

      // Sharp label (left)
      ctx.fillStyle = colors.insight;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'sharpLabel'), gap + panelW / 2, qY);

      // Blurry label (right)
      ctx.fillStyle = colors.error;
      ctx.fillText(tx('scene6', 'blurryLabel'), gap + 2 * (panelW + gap) + panelW / 2, qY);

      // Arrow between them
      ctx.strokeStyle = colors.textDimmed;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(gap + panelW, qY);
      ctx.lineTo(gap + 2 * (panelW + gap), qY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }
});
