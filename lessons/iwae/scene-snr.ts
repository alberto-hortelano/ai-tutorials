// Scene 6: The SNR Problem — two curves crossing: bound tightness up, encoder SNR down

import { Scene } from '../../engine/scene';
import { colors, series, fonts } from '../../engine/shared/design-tokens';
import { easedSub, easeOut } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

export const scene6 = new Scene({
  id: () => tx('scene6', 'id'),
  duration: 20,
  narration: () => tx('scene6', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene6 as SceneText)?.subtitleCues ?? (text.es.scene6 as SceneText).subtitleCues,
  topic: () => tx('scene6', 'topic'),
  render(progress, ctx, canvas, r, state) {
    r.resize();
    r.clear();
    const W = r.w, H = r.h;

    // Title
    fadeInText(ctx, tx('scene6', 'title'), W / 2, 28, easedSub(progress, 0, 0.08), {
      color: colors.textPrimary, font: `bold 18px ${fonts.body}`,
    });

    // Chart layout
    const chartLeft = W * 0.14;
    const chartRight = W * 0.88;
    const chartTop = H * 0.2;
    const chartBottom = H * 0.72;
    const chartW = chartRight - chartLeft;
    const chartH = chartBottom - chartTop;

    // Phase 1: Axes
    const axP = easedSub(progress, 0.06, 0.18);
    if (axP > 0) {
      ctx.save();
      ctx.globalAlpha = axP;

      ctx.strokeStyle = colors.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(chartLeft, chartTop);
      ctx.lineTo(chartLeft, chartBottom);
      ctx.lineTo(chartRight, chartBottom);
      ctx.stroke();

      // X label
      ctx.fillStyle = colors.textMuted;
      ctx.font = `11px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('K', chartLeft + chartW / 2, chartBottom + 8);

      // X ticks
      const kLabels = ['1', '5', '10', '20', '50', '100'];
      for (let i = 0; i < kLabels.length; i++) {
        const x = chartLeft + ((i + 0.5) / kLabels.length) * chartW;
        ctx.fillText(kLabels[i], x, chartBottom + 3);
      }

      ctx.restore();
    }

    // Phase 2: Bound tightness curve (rises and saturates)
    const c1P = easedSub(progress, 0.15, 0.5);
    if (c1P > 0) {
      const steps = 80;

      // Bound curve: rises like 1 - 1/sqrt(K)
      ctx.save();
      ctx.globalAlpha = easeOut(c1P);
      ctx.strokeStyle = colors.insight;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const drawSteps = Math.floor(steps * easeOut(c1P));
      for (let i = 0; i <= drawSteps; i++) {
        const t = i / steps;
        const k = 1 + t * 99; // K from 1 to 100
        const bound = 1 - 1 / Math.sqrt(k); // normalized 0 to ~0.9
        const x = chartLeft + t * chartW;
        const y = chartBottom - bound * chartH * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Label
      fadeInText(ctx, tx('scene6', 'boundCurveLabel'), chartRight - 5, chartTop + 15, easedSub(progress, 0.35, 0.48), {
        color: colors.insight, font: `bold 11px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });
    }

    // Phase 3: SNR curve (drops)
    const c2P = easedSub(progress, 0.42, 0.72);
    if (c2P > 0) {
      const steps = 80;

      ctx.save();
      ctx.globalAlpha = easeOut(c2P);
      ctx.strokeStyle = colors.error;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const drawSteps = Math.floor(steps * easeOut(c2P));
      for (let i = 0; i <= drawSteps; i++) {
        const t = i / steps;
        const k = 1 + t * 99;
        // SNR drops roughly as 1/sqrt(K)
        const snr = 1 / Math.sqrt(k);
        const x = chartLeft + t * chartW;
        const y = chartBottom - snr * chartH * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Label
      fadeInText(ctx, tx('scene6', 'snrCurveLabel'), chartRight - 5, chartBottom - 20, easedSub(progress, 0.58, 0.7), {
        color: colors.error, font: `bold 11px ${fonts.body}`, align: 'right' as CanvasTextAlign,
      });
    }

    // Phase 4: Crossing point highlight
    const crossP = easedSub(progress, 0.72, 0.88);
    if (crossP > 0) {
      // Curves cross around K~10 (t~0.09)
      // bound: 1 - 1/sqrt(10) ~ 0.684
      // snr: 1/sqrt(10) ~ 0.316
      // They don't actually cross at same value; we highlight the region
      const crossT = 0.09;
      const crossX = chartLeft + crossT * chartW;

      // Vertical dashed line at crossing
      ctx.save();
      ctx.globalAlpha = easeOut(crossP) * 0.6;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(crossX, chartTop);
      ctx.lineTo(crossX, chartBottom);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Trade-off label
      fadeInText(ctx, tx('scene6', 'tradeoffLabel'), crossX, chartTop - 8, crossP, {
        color: colors.warning, font: `bold 12px ${fonts.body}`,
      });

      // Highlight zone after crossing (problematic region)
      ctx.save();
      ctx.globalAlpha = easeOut(crossP) * 0.08;
      ctx.fillStyle = colors.error;
      ctx.fillRect(crossX, chartTop, chartRight - crossX, chartH);
      ctx.restore();
    }

    // Phase 5: Summary box
    const summP = easedSub(progress, 0.85, 0.97);
    if (summP > 0) {
      const boxW = W * 0.7;
      const boxH = 30;
      const boxX = (W - boxW) / 2;
      const boxY = H * 0.82;

      ctx.save();
      ctx.globalAlpha = easeOut(summP) * 0.75;
      ctx.fillStyle = colors.panelBg;
      ctx.strokeStyle = colors.warning;
      ctx.lineWidth = 1;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      fadeInText(ctx, tx('scene6', 'topic').split('.')[0], W / 2, boxY + boxH / 2, summP, {
        color: colors.warning, font: `bold 11px ${fonts.body}`,
      });
    }
  },
});
