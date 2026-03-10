// IWAE lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-gap-revisited';
import { scene2 } from './scene-multi-sample';
import { scene3 } from './scene-iwae-bound';
import { scene4 } from './scene-tightening';
import { scene5 } from './scene-weights';
import { scene6 } from './scene-snr';
import { scene7 } from './scene-practical';
import { questionScene } from '../../engine/scene-factories';

export const iwae: LessonExport = {
  id: 'iwae',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: ELBO Gap revisited
    scene2,                                                              // S2: Multiple samples
    scene3,                                                              // S3: IWAE bound
    questionScene(() => questions[getLang()].afterScene3),                // Q1: bound with K
    scene4,                                                              // S4: Tightening with K
    scene5,                                                              // S5: Importance weights
    scene6,                                                              // S6: SNR problem
    questionScene(() => questions[getLang()].afterScene6),                // Q2: SNR trade-off
    scene7,                                                              // S7: When to use IWAE
  ],
};
