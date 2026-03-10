// Scene 6: Speed demo — animated "race" for sampling + distillation mention
// Enhanced: concrete sampling timeline race, Parallel WaveNet connection

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

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

    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`
    });

    // --- Sampling Race ---
    const raceP = easedSub(progress, 0.05, 0.12);
    fadeInText(ctx, tx('scene6', 'raceTitle'), W / 2, 52, raceP, {
      color: colors.warning, font: `bold 14px ${fonts.body}`
    });

    const trackLeft = W * 0.15;
    const trackRight = W * 0.85;
    const trackW = trackRight - trackLeft;
    const barH = 28;

    // MAF track (top) — slow, sequential
    const mafY = 80;
    const mafTrackP = easedSub(progress, 0.08, 0.15);
    if (mafTrackP > 0) {
      ctx.save();
      ctx.globalAlpha = mafTrackP;

      // Label
      ctx.fillStyle = colors.error;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene6', 'mafLabel'), trackLeft - 10, mafY + barH / 2 + 4);

      // Track background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(trackLeft, mafY, trackW, barH, barH / 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // MAF progress bar — crawls slowly
    const mafProgress = easedSub(progress, 0.12, 0.6);
    if (mafProgress > 0) {
      const fillW = Math.max(trackW * mafProgress, barH);
      ctx.save();
      ctx.fillStyle = colors.error + '70';
      ctx.beginPath();
      ctx.roundRect(trackLeft, mafY, fillW, barH, barH / 2);
      ctx.fill();

      // Step counter
      const step = Math.floor(mafProgress * 784);
      ctx.fillStyle = colors.error;
      ctx.font = `bold 10px ${fonts.mono}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${tx('scene6', 'mafSteps')} ${step}/784`, trackLeft + fillW + 8, mafY + barH / 2 + 3);

      // Progress ticks showing sequential nature
      const nTicks = 20;
      const ticksShown = Math.floor(mafProgress * nTicks);
      for (let i = 0; i < ticksShown; i++) {
        const tx_ = trackLeft + (i / nTicks) * trackW * mafProgress + 5;
        ctx.fillStyle = colors.error + '40';
        ctx.fillRect(tx_, mafY + 4, 2, barH - 8);
      }

      ctx.restore();
    }

    // IAF track (bottom) — fast, parallel
    const iafY = mafY + barH + 25;
    const iafTrackP = easedSub(progress, 0.08, 0.15);
    if (iafTrackP > 0) {
      ctx.save();
      ctx.globalAlpha = iafTrackP;

      // Label
      ctx.fillStyle = colors.insight;
      ctx.font = `bold 13px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene6', 'iafLabel'), trackLeft - 10, iafY + barH / 2 + 4);

      // Track background
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(trackLeft, iafY, trackW, barH, barH / 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    // IAF finishes immediately
    const iafProgress = easedSub(progress, 0.12, 0.18);
    if (iafProgress > 0) {
      const fillW = trackW;
      ctx.save();
      ctx.globalAlpha = easeOut(iafProgress);
      ctx.fillStyle = colors.insight + '70';
      ctx.beginPath();
      ctx.roundRect(trackLeft, iafY, fillW * easeOut(iafProgress), barH, barH / 2);
      ctx.fill();

      // "Done!" label
      if (iafProgress > 0.5) {
        ctx.globalAlpha = (iafProgress - 0.5) * 2;
        ctx.fillStyle = colors.insight;
        ctx.font = `bold 11px ${fonts.body}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene6', 'iafDone'), trackRight + 8, iafY + barH / 2 + 4);
      }

      ctx.restore();
    }

    // "784x" dramatic callout when MAF is still going
    const diffP = easedSub(progress, 0.25, 0.4);
    if (diffP > 0) {
      ctx.save();
      ctx.globalAlpha = diffP;
      const bx = W / 2, by = iafY + barH + 30;
      ctx.fillStyle = colors.warning + '20';
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bx - 80, by - 14, 160, 28, 14);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colors.warning;
      ctx.font = `bold 14px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText('784\u00D7', bx, by + 5);
      ctx.restore();
    }

    // --- Density race (reverse) ---
    const densTitleP = easedSub(progress, 0.42, 0.5);
    fadeInText(ctx, tx('scene6', 'densityLabel'), W / 2, H * 0.42, densTitleP, {
      color: colors.textPrimary, font: `bold 14px ${fonts.body}`
    });

    const densTrackY = H * 0.47;

    // MAF density (fast)
    const mafDensP = easedSub(progress, 0.48, 0.58);
    if (mafDensP > 0) {
      ctx.save();
      ctx.globalAlpha = mafDensP;

      ctx.fillStyle = colors.insight;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene6', 'mafLabel'), trackLeft - 10, densTrackY + barH / 2 + 4);

      // Track
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(trackLeft, densTrackY, trackW, barH, barH / 2);
      ctx.fill();
      ctx.stroke();

      // MAF fills fast
      const fillT = easedSub(progress, 0.5, 0.55);
      if (fillT > 0) {
        ctx.fillStyle = colors.insight + '70';
        ctx.beginPath();
        ctx.roundRect(trackLeft, densTrackY, trackW * easeOut(fillT), barH, barH / 2);
        ctx.fill();
        if (fillT > 0.5) {
          ctx.fillStyle = colors.insight;
          ctx.font = `bold 10px ${fonts.body}`;
          ctx.textAlign = 'left';
          ctx.fillText(tx('scene6', 'passes1'), trackRight + 8, densTrackY + barH / 2 + 3);
        }
      }

      ctx.restore();
    }

    // IAF density (slow)
    const iafDensY = densTrackY + barH + 15;
    const iafDensP = easedSub(progress, 0.5, 0.7);
    if (iafDensP > 0) {
      ctx.save();
      ctx.globalAlpha = iafDensP;

      ctx.fillStyle = colors.error;
      ctx.font = `bold 12px ${fonts.body}`;
      ctx.textAlign = 'right';
      ctx.fillText(tx('scene6', 'iafLabel'), trackLeft - 10, iafDensY + barH / 2 + 4);

      // Track
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(trackLeft, iafDensY, trackW, barH, barH / 2);
      ctx.fill();
      ctx.stroke();

      // IAF crawls
      const fillT = easedSub(progress, 0.52, 0.7);
      if (fillT > 0) {
        const fillW = Math.max(trackW * fillT, barH);
        ctx.fillStyle = colors.error + '70';
        ctx.beginPath();
        ctx.roundRect(trackLeft, iafDensY, fillW, barH, barH / 2);
        ctx.fill();

        ctx.fillStyle = colors.error;
        ctx.font = `bold 10px ${fonts.mono}`;
        ctx.textAlign = 'left';
        ctx.fillText(tx('scene6', 'passesD'), trackLeft + fillW + 8, iafDensY + barH / 2 + 3);
      }

      ctx.restore();
    }

    // --- Parallel WaveNet distillation callout ---
    const distP = easedSub(progress, 0.75, 0.92);
    if (distP > 0) {
      ctx.save();
      ctx.globalAlpha = distP;

      const bx = W / 2, by = H * 0.84;
      const bw = W * 0.65, bh = 35;

      ctx.fillStyle = colors.accent + '15';
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx - bw / 2, by - bh / 2, bw, bh, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.accent;
      ctx.font = `bold 11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.fillText(tx('scene6', 'distillation'), bx, by + 4);

      ctx.restore();
    }
  }
});
