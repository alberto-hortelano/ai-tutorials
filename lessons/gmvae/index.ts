// Gaussian Mixture VAE lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-prior-problem';
import { scene2 } from './scene-mixture';
import { scene3 } from './scene-kl-problem';
import { scene4 } from './scene-mc-kl';
import { scene5 } from './scene-logsumexp';
import { scene6 } from './scene-gmvae-arch';
import { scene7 } from './scene-results';
import { questionScene } from '../../engine/scene-factories';

export const gmvae: LessonExport = {
  id: 'gmvae',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Prior problem
    scene2,                                                              // S2: Mixture of Gaussians
    scene3,                                                              // S3: KL problem
    questionScene(() => questions[getLang()].afterScene3),                // Q1: why no closed form
    scene4,                                                              // S4: Monte Carlo KL
    scene5,                                                              // S5: Log-sum-exp trick
    questionScene(() => questions[getLang()].afterScene5),                // Q2: log-sum-exp why
    scene6,                                                              // S6: GMVAE Architecture
    scene7,                                                              // S7: Results
  ],
};
