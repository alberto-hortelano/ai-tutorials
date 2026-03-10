// Conditional GAN lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-conditional';
import { scene2 } from './scene-cgan-arch';
import { scene3 } from './scene-embedding';
import { scene4 } from './scene-projection';
import { scene5 } from './scene-class-generation';
import { scene6 } from './scene-interpolation';
import { scene7 } from './scene-applications';
import { questionScene } from '../../engine/scene-factories';

export const conditionalGan: LessonExport = {
  id: 'conditional-gan',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Conditional generation
    scene2,                                                              // S2: cGAN architecture
    scene3,                                                              // S3: Label embedding
    scene4,                                                              // S4: Projection discriminator
    questionScene(() => questions[getLang()].afterScene4),                // Q1: D verifies two things
    scene5,                                                              // S5: Class-specific generation
    scene6,                                                              // S6: CycleGAN
    questionScene(() => questions[getLang()].afterScene6),                // Q2: cycle consistency
    scene7,                                                              // S7: Applications
  ],
};
