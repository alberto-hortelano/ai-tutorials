// Semi-Supervised VAE lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-setting';
import { scene2 } from './scene-gen-model';
import { scene3 } from './scene-labeled-elbo';
import { scene4 } from './scene-unlabeled-elbo';
import { scene5 } from './scene-classifier';
import { scene6 } from './scene-full-objective';
import { scene7 } from './scene-results';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const ssvae: LessonExport = {
  id: 'ssvae',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Semi-supervised setting
    scene2,                                                              // S2: Generative model
    scene3,                                                              // S3: Labeled ELBO
    scene4,                                                              // S4: Unlabeled ELBO
    questionScene(() => questions[getLang()].afterScene4),                // Q1: marginalization
    scene5,                                                              // S5: Emergent classifier
    scene6,                                                              // S6: Full objective
    questionScene(() => questions[getLang()].afterScene6),                // Q2: alpha term
    interactiveScene({ src: '/interactives/ssvae_semi_supervisado.html',
      title: 'Semi-Supervised VAE' }),                                   // HTML1
    scene7,                                                              // S7: Results
  ],
};
