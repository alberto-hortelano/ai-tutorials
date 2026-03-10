// Scene 2: Entropy

import { Scene } from '../../engine/scene';
import { colors, series } from '../../engine/shared/design-tokens';
import { easedSub } from '../../engine/animation/tween';
import { fadeInText } from '../../engine/animation/text';
import { animateArrow } from '../../engine/animation/arrow';
import { entropy } from '../../engine/shared/math-utils';
import { drawBarChart } from '../_shared/chart-helpers';
import { sceneBase, drawTitle } from '../../engine/animation/scene-helpers';
import { tx, text } from './text';
import { getLang } from '../../engine/i18n';
import type { SceneText } from './text';

const fairDie: number[] = [1/6, 1/6, 1/6, 1/6, 1/6, 1/6];
const loadedDie: number[] = [0.4, 0.2, 0.15, 0.1, 0.1, 0.05];
const dieLabels: string[] = ['1', '2', '3', '4', '5', '6'];

export { fairDie, loadedDie, dieLabels };

export const scene2 = new Scene({
  id: () => tx('scene2', 'id'),
  duration: 22,
  narration: () => tx('scene2', 'narration'),
  subtitleCues: () => (text[getLang()]?.scene2 as SceneText)?.subtitleCues ?? (text.es.scene2 as SceneText).subtitleCues,
  topic: () => tx('scene2', 'topic'),
  render(progress, ctx, canvas, r) {
    const { W, H } = sceneBase(r);

    // Title
    drawTitle(ctx, tx('scene2', 'title'), W, progress, { y: 30, start: 0, end: 0.1 });

    // Fair die
    const fairP = easedSub(progress, 0.1, 0.45);
    if (fairP > 0) {
      fadeInText(ctx, tx('scene2', 'fairDie'), W * 0.25, 65, fairP, {
        color: series[0], font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
      drawBarChart(ctx, fairDie, dieLabels, series[0],
        { x: W * 0.05, y: 80, w: W * 0.4, h: H * 0.4 }, fairP, { maxVal: 0.5 });

      const hFair = entropy(fairDie);
      fadeInText(ctx, `H(P) = ${hFair.toFixed(3)} bits`, W * 0.25, 80 + H * 0.4 + 30, easedSub(progress, 0.3, 0.45), {
        color: series[0], font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Loaded die
    const loadedP = easedSub(progress, 0.4, 0.75);
    if (loadedP > 0) {
      fadeInText(ctx, tx('scene2', 'loadedDie'), W * 0.75, 65, loadedP, {
        color: series[2], font: 'bold 13px "Segoe UI", system-ui, sans-serif'
      });
      drawBarChart(ctx, loadedDie, dieLabels, series[2],
        { x: W * 0.55, y: 80, w: W * 0.4, h: H * 0.4 }, loadedP, { maxVal: 0.5 });

      const hLoaded = entropy(loadedDie);
      fadeInText(ctx, `H(P) = ${hLoaded.toFixed(3)} bits`, W * 0.75, 80 + H * 0.4 + 30, easedSub(progress, 0.6, 0.75), {
        color: series[2], font: 'bold 12px "Segoe UI", system-ui, sans-serif'
      });
    }

    // Comparison arrow
    const compP = easedSub(progress, 0.75, 0.95);
    if (compP > 0) {
      fadeInText(ctx, tx('scene2', 'insight'), W / 2, H - 40, compP, {
        color: colors.insight, font: 'bold 14px "Segoe UI", system-ui, sans-serif'
      });
      animateArrow(ctx, W * 0.6, H - 60, W * 0.4, H - 60, compP, { color: colors.insight, headSize: 10 });
    }
  }
});
