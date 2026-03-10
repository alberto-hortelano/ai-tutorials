// Latent Variables lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-hidden';
import { scene2 } from './scene-joint';
import { scene3 } from './scene-marginal';
import { scene4 } from './scene-intractable';
import { scene5 } from './scene-posterior';
import { scene6 } from './scene-variational';
import { scene7 } from './scene-ingredients';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const variablesLatentes: LessonExport = {
  id: 'variables-latentes',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Hidden causes
    scene2,                                                              // S2: Joint distribution
    scene3,                                                              // S3: Marginalize z
    questionScene(() => questions[getLang()].afterScene3),                // Q1: why intractable?
    scene4,                                                              // S4: Intractability
    scene5,                                                              // S5: Posterior p(z|x)
    scene6,                                                              // S6: Variational idea
    questionScene(() => questions[getLang()].afterScene6),                // Q2: gap goes to zero
    interactiveScene({ src: '/interactives/mezcla_gaussianas.html',
      title: 'Gaussian Mixture' }),                                      // HTML1
    scene7,                                                              // S7: Road to ELBO
  ],
};
