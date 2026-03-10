// ELBO lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-goal';
import { scene2 } from './scene-insert-q';
import { scene3 } from './scene-jensen';
import { scene4 } from './scene-decompose';
import { scene5 } from './scene-two-forces';
import { scene6 } from './scene-gap';
import { scene7 } from './scene-architecture';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const elbo: LessonExport = {
  id: 'elbo',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: The goal
    scene2,                                                              // S2: Introduce q(z|x)
    scene3,                                                              // S3: Apply Jensen
    questionScene(() => questions[getLang()].afterScene3),                // Q1: Jensen inequality
    scene4,                                                              // S4: Reconstruction vs KL
    scene5,                                                              // S5: The two forces
    questionScene(() => questions[getLang()].afterScene5),                // Q2: two forces tension
    interactiveScene({ src: '/interactives/elbo_interactivo.html',
      title: 'ELBO Interactive' }),                                      // HTML1
    scene6,                                                              // S6: The gap
    scene7,                                                              // S7: Summary
  ],
};
