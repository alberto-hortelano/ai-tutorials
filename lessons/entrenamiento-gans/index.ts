// Training GANs — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-alternating';
import { scene2 } from './scene-vanishing';
import { scene3 } from './scene-non-saturating';
import { scene4 } from './scene-mode-collapse';
import { scene5 } from './scene-instability';
import { scene6 } from './scene-tricks';
import { scene7 } from './scene-evaluation';
import { questionScene } from '../../engine/scene-factories';

export const entrenamientoGans: LessonExport = {
  id: 'entrenamiento-gans',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Alternating training
    scene2,                                                              // S2: Vanishing gradients
    scene3,                                                              // S3: Non-saturating loss
    questionScene(() => questions[getLang()].afterScene3),                // Q1: non-saturating advantage
    scene4,                                                              // S4: Mode collapse
    scene5,                                                              // S5: Training instability
    questionScene(() => questions[getLang()].afterScene5),                // Q2: mode collapse symptom
    scene6,                                                              // S6: Practical tricks
    scene7,                                                              // S7: Evaluating GANs
  ],
};
