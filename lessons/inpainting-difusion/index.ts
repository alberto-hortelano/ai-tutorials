// Inpainting with Diffusion lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-what';
import { scene2 } from './scene-mask';
import { scene3 } from './scene-constrained';
import { scene4 } from './scene-matching';
import { scene5 } from './scene-algorithm';
import { scene6 } from './scene-repaint';
import { scene7 } from './scene-beyond';
import { questionScene } from '../../engine/scene-factories';

export const inpaintingDifusion: LessonExport = {
  id: 'inpainting-difusion',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: What is inpainting
    scene2,                                                              // S2: Binary mask
    scene3,                                                              // S3: Constrained reverse
    scene4,                                                              // S4: Noise level matching
    questionScene(() => questions[getLang()].afterMatching),              // Q1: noise matching
    scene5,                                                              // S5: Complete algorithm
    scene6,                                                              // S6: RePaint
    scene7,                                                              // S7: Beyond inpainting
    questionScene(() => questions[getLang()].afterBeyond),                // Q2: RePaint technique
  ],
};
