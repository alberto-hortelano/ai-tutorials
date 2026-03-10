// Conditional Independence lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-curse';
import { scene2 } from './scene-chain-rule';
import { scene3 } from './scene-bayesian-nets';
import { scene4 } from './scene-factorization';
import { scene5 } from './scene-savings';
import { scene6 } from './scene-structures';
import { scene7 } from './scene-preview';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const independenciaCondicional: LessonExport = {
  id: 'independencia-condicional',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Curse of joint distributions
    scene2,                                                              // S2: Chain rule
    scene3,                                                              // S3: Bayesian networks
    scene4,                                                              // S4: Factorization from graph
    scene5,                                                              // S5: Parameter savings
    questionScene(() => questions[getLang()].afterSavings),               // Q1: conditional table size
    scene6,                                                              // S6: Common graph structures
    questionScene(() => questions[getLang()].afterStructures),            // Q2: explaining away
    scene7,                                                              // S7: Why this matters
    interactiveScene({ src: '/interactives/gaussiana_conjunta_3d.html',
      title: '3D Joint Gaussian' }),                                     // HTML1
  ],
};
