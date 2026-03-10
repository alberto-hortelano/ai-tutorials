// GANs: the Min-Max Game — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-paradigm';
import { scene2 } from './scene-generator';
import { scene3 } from './scene-discriminator';
import { scene4 } from './scene-minimax';
import { scene5 } from './scene-optimal-d';
import { scene6 } from './scene-jsd';
import { scene7 } from './scene-convergence';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const gansMinMax: LessonExport = {
  id: 'gans-min-max',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: New paradigm
    scene2,                                                              // S2: Generator
    scene3,                                                              // S3: Discriminator
    scene4,                                                              // S4: Minimax objective
    questionScene(() => questions[getLang()].afterScene4),                // Q1: vanishing gradients
    scene5,                                                              // S5: Optimal discriminator
    scene6,                                                              // S6: Connection to JSD
    questionScene(() => questions[getLang()].afterScene6),                // Q2: V at optimum
    interactiveScene({ src: '/interactives/gan_juego_minimax.html',
      title: 'GAN Minimax Game' }),                                      // HTML1: interactive
    scene7,                                                              // S7: Convergence
  ],
};
