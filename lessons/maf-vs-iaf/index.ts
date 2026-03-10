// MAF vs IAF lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-autoregressive';
import { scene2 } from './scene-maf';
import { scene3 } from './scene-iaf';
import { scene4 } from './scene-tradeoff';
import { scene5 } from './scene-made';
import { scene6 } from './scene-speed-demo';
import { scene7 } from './scene-recap';
import { questionScene } from '../../engine/scene-factories';

export const mafVsIaf: LessonExport = {
  id: 'maf-vs-iaf',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Autoregressive structure
    scene2,                                                              // S2: MAF
    scene3,                                                              // S3: IAF
    scene4,                                                              // S4: The trade-off
    questionScene(() => questions[getLang()].afterTradeoff),              // Q1: which for MLE?
    scene5,                                                              // S5: MADE
    scene6,                                                              // S6: Speed demo
    questionScene(() => questions[getLang()].afterSpeedDemo),             // Q2: Parallel WaveNet
    scene7,                                                              // S7: Module summary
  ],
};
