// Autoregressive Models lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-idea';
import { scene2 } from './scene-fvsbn';
import { scene3 } from './scene-nade';
import { scene4 } from './scene-density';
import { scene5 } from './scene-sampling';
import { scene6 } from './scene-tradeoff';
import { scene7 } from './scene-modern';
import { questionScene } from '../../engine/scene-factories';

export const modelosAutoregresivos: LessonExport = {
  id: 'modelos-autoregresivos',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: The autoregressive idea
    scene2,                                                              // S2: FVSBN
    scene3,                                                              // S3: NADE
    scene4,                                                              // S4: Fast density
    questionScene(() => questions[getLang()].afterDensity),               // Q1: density vs sampling speed
    scene5,                                                              // S5: Slow sampling
    scene6,                                                              // S6: Fundamental trade-off
    scene7,                                                              // S7: Beyond the basics
    questionScene(() => questions[getLang()].afterModern),                // Q2: what do modern AR share
  ],
};
