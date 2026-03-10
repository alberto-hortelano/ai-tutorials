// Generative Models: the Big Idea — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-what';
import { scene2 } from './scene-tasks';
import { scene3 } from './scene-scale';
import { scene4 } from './scene-disc-vs-gen';
import { scene5 } from './scene-applications';
import { scene6 } from './scene-framework';
import { scene7 } from './scene-roadmap';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const modelosGenerativos: LessonExport = {
  id: 'modelos-generativos',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: What is a generative model?
    scene2,                                                              // S2: Three fundamental tasks
    scene3,                                                              // S3: Scale of the problem
    questionScene(() => questions[getLang()].afterScale),                 // Q1: image space size
    scene4,                                                              // S4: Discriminative vs generative
    scene5,                                                              // S5: Why do they matter?
    scene6,                                                              // S6: The learning framework
    scene7,                                                              // S7: Course roadmap
    questionScene(() => questions[getLang()].afterRoadmap),               // Q2: impossibility triangle
    interactiveScene({ src: '/interactives/mezcla_gaussianas.html',
      title: 'Gaussian Mixture' }),                                      // HTML1
  ],
};
