// Scene 7: Posterior Collapse — all q converge to prior, decoder ignores z

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut, easeInOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { formulaAppear } from '../../engine/animation/formula';
import { gaussian } from '../../engine/shared/math-utils';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene7 = new Scene({
  id: () => tx('scene7', 'id'),
  duration: 22,
  narration: () => tx('scene7', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene7 as SceneText)?.subtitleCues ?? (text.es.scene7 as SceneText).subtitleCues,
  topic: () => tx('scene7', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene7', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // ===== GAUSSIAN CURVES CONVERGING =====
    // Show multiple q(z|x_i) distributions that start different and converge to p(z) = N(0,1)
    const curveArea = {
      x: W * 0.05,
      y: H * 0.15,
      w: W * 0.55,
      h: H * 0.45,
    };

    // Axes for distribution plot
    const axesP = easedSub(progress, 0.05, 0.15);
    if (axesP > 0) {
      ctx.save();
      ctx.globalAlpha = axesP;

      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(curveArea.x, curveArea.y + curveArea.h);
      ctx.lineTo(curveArea.x + curveArea.w, curveArea.y + curveArea.h);
      ctx.stroke();

      ctx.fillStyle = colors.textDimmed;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('z', curveArea.x + curveArea.w / 2, curveArea.y + curveArea.h + 14);

      ctx.restore();
    }

    // Individual q distributions
    const distributions = [
      { mu0: -2.0, sigma0: 0.5, color: series[0], label: 'q(z|x1)' },
      { mu0: 1.5, sigma0: 0.3, color: series[1], label: 'q(z|x2)' },
      { mu0: -0.5, sigma0: 0.8, color: series[2], label: 'q(z|x3)' },
      { mu0: 2.5, sigma0: 0.4, color: series[3], label: 'q(z|x4)' },
    ];

    // Collapse progress: distributions morph toward N(0,1)
    const collapseT = easedSub(progress, 0.15, 0.65, easeInOut);

    const zMin = -4, zMax = 4;
    const nPts = 80;

    distributions.forEach((dist, di) => {
      const distP = easedSub(progress, 0.08 + di * 0.04, 0.2 + di * 0.04);
      if (distP <= 0) return;

      // Interpolate mu toward 0, sigma toward 1
      const mu = dist.mu0 * (1 - collapseT);
      const sigma = dist.sigma0 + (1 - dist.sigma0) * collapseT;

      ctx.save();
      ctx.globalAlpha = distP;
      ctx.strokeStyle = dist.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= nPts; i++) {
        const z = zMin + (zMax - zMin) * (i / nPts);
        const pz = gaussian(z, mu, sigma);
        const px = curveArea.x + ((z - zMin) / (zMax - zMin)) * curveArea.w;
        const py = curveArea.y + curveArea.h - pz * curveArea.h * 2.5;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Label at peak (only when not yet collapsed)
      if (collapseT < 0.8) {
        const peakX = curveArea.x + ((mu - zMin) / (zMax - zMin)) * curveArea.w;
        const peakY = curveArea.y + curveArea.h - gaussian(mu, mu, sigma) * curveArea.h * 2.5;
        ctx.fillStyle = dist.color;
        ctx.font = `9px ${fonts.body}`;
        ctx.textAlign = 'center';
        ctx.fillText(dist.label, peakX, peakY - 8);
      }

      ctx.restore();
    });

    // Prior p(z) = N(0,1) as dashed reference
    const priorP = easedSub(progress, 0.1, 0.2);
    if (priorP > 0) {
      ctx.save();
      ctx.globalAlpha = priorP * 0.5;
      ctx.strokeStyle = colors.textPrimary;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      for (let i = 0; i <= nPts; i++) {
        const z = zMin + (zMax - zMin) * (i / nPts);
        const pz = gaussian(z, 0, 1);
        const px = curveArea.x + ((z - zMin) / (zMax - zMin)) * curveArea.w;
        const py = curveArea.y + curveArea.h - pz * curveArea.h * 2.5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // p(z) label
      ctx.globalAlpha = priorP;
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${fonts.body}`;
      ctx.textAlign = 'left';
      const prLabelX = curveArea.x + ((1.2 - zMin) / (zMax - zMin)) * curveArea.w;
      const prLabelY = curveArea.y + curveArea.h - gaussian(1.2, 0, 1) * curveArea.h * 2.5;
      ctx.fillText('p(z)', prLabelX + 4, prLabelY - 4);

      ctx.restore();
    }

    // "All q identical" label when collapsed
    const allSameP = easedSub(progress, 0.55, 0.7);
    if (allSameP > 0) {
      fadeInText(ctx, tx('scene7', 'allSame'), curveArea.x + curveArea.w / 2, curveArea.y - 2, allSameP, {
        color: colors.warning, font: `bold 12px ${fonts.body}`
      });
    }

    // ===== RIGHT SIDE: KL and Recon indicators =====
    const indicatorX = W * 0.68;
    const indicatorW = W * 0.28;

    // KL indicator
    const klP = easedSub(progress, 0.4, 0.6);
    if (klP > 0) {
      const klY = H * 0.22;
      const klH = H * 0.15;

      ctx.save();
      ctx.globalAlpha = klP;

      // KL box
      ctx.fillStyle = colors.insight + '15';
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(indicatorX, klY, indicatorW, klH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'klZero'), indicatorX + indicatorW / 2, klY + klH * 0.35);

      // Downward bar showing KL going to zero
      const barW = indicatorW * 0.5;
      const barX = indicatorX + (indicatorW - barW) / 2;
      const barY = klY + klH * 0.55;
      const barMaxH = klH * 0.3;
      const klVal = 1 - collapseT; // approaches 0
      ctx.fillStyle = colors.insight + '60';
      ctx.fillRect(barX, barY + barMaxH * (1 - klVal), barW, barMaxH * klVal);
      ctx.strokeStyle = colors.insight + '40';
      ctx.strokeRect(barX, barY, barW, barMaxH);

      // Check mark when KL is low
      if (collapseT > 0.7) {
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 16px ${fonts.body}`;
        ctx.fillText('\u2713', indicatorX + indicatorW - 14, klY + 14);
      }

      ctx.restore();
    }

    // Reconstruction indicator (bad!)
    const reconP = easedSub(progress, 0.55, 0.75);
    if (reconP > 0) {
      const reconY = H * 0.44;
      const reconH = H * 0.15;

      ctx.save();
      ctx.globalAlpha = reconP;

      // Recon box
      ctx.fillStyle = colors.error + '15';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(indicatorX, reconY, indicatorW, reconH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.error;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tx('scene7', 'reconBad'), indicatorX + indicatorW / 2, reconY + reconH * 0.35);

      // Rising bar showing recon loss is high
      const barW = indicatorW * 0.5;
      const barX = indicatorX + (indicatorW - barW) / 2;
      const barY = reconY + reconH * 0.55;
      const barMaxH = reconH * 0.3;
      const reconVal = 0.3 + 0.7 * collapseT; // approaches 1 (bad)
      ctx.fillStyle = colors.error + '60';
      ctx.fillRect(barX, barY + barMaxH * (1 - reconVal), barW, barMaxH * reconVal);
      ctx.strokeStyle = colors.error + '40';
      ctx.strokeRect(barX, barY, barW, barMaxH);

      // X mark
      if (collapseT > 0.7) {
        ctx.fillStyle = colors.error;
        ctx.font = `bold 16px ${fonts.body}`;
        ctx.fillText('\u2717', indicatorX + indicatorW - 14, reconY + 14);
      }

      ctx.restore();
    }

    // ===== WARNING TRIANGLE =====
    const warnP = easedSub(progress, 0.7, 0.85);
    if (warnP > 0) {
      const triCx = W * 0.5;
      const triCy = H * 0.78;
      const triSize = 28;

      ctx.save();
      ctx.globalAlpha = warnP;

      // Triangle
      ctx.fillStyle = colors.warning + '25';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(triCx, triCy - triSize);
      ctx.lineTo(triCx - triSize * 0.9, triCy + triSize * 0.6);
      ctx.lineTo(triCx + triSize * 0.9, triCy + triSize * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Exclamation mark
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 20px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', triCx, triCy + 2);

      // Warning label
      fadeInText(ctx, tx('scene7', 'warningLabel'), triCx, triCy + triSize + 18, 1, {
        color: colors.warning, font: `bold 13px ${fonts.body}`
      });

      ctx.restore();
    }

    // Decoder ignores z label
    const decIgnP = easedSub(progress, 0.82, 0.95);
    if (decIgnP > 0) {
      const dix = W / 2, diy = H - 20;
      ctx.save();
      ctx.globalAlpha = decIgnP;
      ctx.fillStyle = colors.error + '15';
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(dix - 120, diy - 13, 240, 26, 13);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene7', 'decoderIgnores'), dix, diy + 3);
      ctx.restore();
    }

    // Formula
    const fP = easedSub(progress, 0.3, 0.48);
    if (fP > 0) {
      formulaAppear(state.formulaManager, 'collapse-eq',
        'q_\\phi(z|x) \\approx p(z) \\;\\forall\\, x \\implies D_{KL} \\to 0',
        50, 68, fP, { color: colors.textPrimary, fontSize: '0.8em' });
    }
  }
});
