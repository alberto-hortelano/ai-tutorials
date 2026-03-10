// Wasserstein GAN lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-disjoint';
import { scene2 } from './scene-earth-mover';
import { scene3 } from './scene-wgan-objective';
import { scene4 } from './scene-lipschitz';
import { scene5 } from './scene-weight-clip';
import { scene6 } from './scene-gradient-penalty';
import { scene7 } from './scene-comparison';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const wassersteinGan: LessonExport = {
  id: 'wasserstein-gan',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Disjoint support problem
    scene2,                                                              // S2: Earth Mover distance
    scene3,                                                              // S3: WGAN objective
    scene4,                                                              // S4: Lipschitz constraint
    questionScene(() => questions[getLang()].afterScene4),                // Q1: W vs KL vs JSD
    scene5,                                                              // S5: Weight clipping
    scene6,                                                              // S6: Gradient penalty
    questionScene(() => questions[getLang()].afterScene6),                // Q2: why gradient penalty
    interactiveScene({ src: '/interactives/wasserstein_vs_kl.html',
      title: 'Wasserstein vs KL' }),                                     // HTML1: interactive
    scene7,                                                              // S7: WGAN vs standard GAN
  ],
};
