// DDPM vs DDIM lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-ddpm';
import { scene2 } from './scene-speed';
import { scene3 } from './scene-ddim';
import { scene4 } from './scene-skipping';
import { scene5 } from './scene-quality';
import { scene6 } from './scene-interpolation';
import { scene7 } from './scene-comparison';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const ddpmVsDdim: LessonExport = {
  id: 'ddpm-vs-ddim',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: DDPM recap
    scene2,                                                              // S2: Speed problem
    scene3,                                                              // S3: DDIM deterministic
    scene4,                                                              // S4: Skipping steps
    questionScene(() => questions[getLang()].afterDDIM),                  // Q1: why DDIM is faster
    scene5,                                                              // S5: Quality vs speed
    scene6,                                                              // S6: Latent interpolation
    interactiveScene({ src: '/interactives/ddpm_vs_ddim.html',
      title: 'DDPM vs DDIM Sampler' }),                                  // HTML1
    scene7,                                                              // S7: Comparison summary
    questionScene(() => questions[getLang()].afterComparison),            // Q2: interpolation
  ],
};
