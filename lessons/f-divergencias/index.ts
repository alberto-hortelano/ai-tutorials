// f-Divergencias lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-family';
import { scene2 } from './scene-special-cases';
import { scene3 } from './scene-fenchel';
import { scene4 } from './scene-variational-bound';
import { scene5 } from './scene-f-gan';
import { scene6 } from './scene-fwd-rev-revisited';
import { scene7 } from './scene-landscape';
import { questionScene } from '../../engine/scene-factories';

export const fDivergencias: LessonExport = {
  id: 'f-divergencias',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: f-Divergence family
    scene2,                                                              // S2: Special cases
    scene3,                                                              // S3: Fenchel conjugate
    questionScene(() => questions[getLang()].afterScene3),                // Q1: Fenchel geometry
    scene4,                                                              // S4: Variational bound
    scene5,                                                              // S5: f-GAN framework
    scene6,                                                              // S6: Forward vs reverse KL
    questionScene(() => questions[getLang()].afterScene6),                // Q2: reverse KL behavior
    scene7,                                                              // S7: Divergence landscape
  ],
};
