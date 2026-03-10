// Diffusion Process lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-forward';
import { scene2 } from './scene-schedule';
import { scene3 } from './scene-closedform';
import { scene4 } from './scene-reverse';
import { scene5 } from './scene-training';
import { scene6 } from './scene-score';
import { scene7 } from './scene-summary';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const procesoDifusion: LessonExport = {
  id: 'proceso-difusion',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Forward process
    scene2,                                                              // S2: Noise schedule
    scene3,                                                              // S3: Closed-form forward
    questionScene(() => questions[getLang()].afterClosedForm),            // Q1: alpha-bar mixing
    scene4,                                                              // S4: Reverse process
    scene5,                                                              // S5: Training
    interactiveScene({ src: '/interactives/proceso_difusion.html',
      title: 'Diffusion Process Explorer' }),                            // HTML1
    scene6,                                                              // S6: Score connection
    questionScene(() => questions[getLang()].afterScore),                 // Q2: noise-score relation
    scene7,                                                              // S7: Full picture
  ],
};
