// VAE Encoder-Decoder lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-architecture';
import { scene2 } from './scene-gradient-problem';
import { scene3 } from './scene-reparam';
import { scene4 } from './scene-amortized';
import { scene5 } from './scene-training';
import { scene6 } from './scene-beta-vae';
import { scene7 } from './scene-collapse';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const vaeEncoderDecoder: LessonExport = {
  id: 'vae-encoder-decoder',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: VAE Architecture
    scene2,                                                              // S2: Gradient Problem
    scene3,                                                              // S3: Reparameterization Trick
    questionScene(() => questions[getLang()].afterScene3),                // Q1: reparameterization
    interactiveScene({ src: '/interactives/reparametrizacion.html',
      title: 'Reparameterization Trick' }),                              // HTML1
    scene4,                                                              // S4: Amortized Inference
    scene5,                                                              // S5: Training Loop
    scene6,                                                              // S6: Beta-VAE
    questionScene(() => questions[getLang()].afterScene6),                // Q2: posterior collapse
    scene7,                                                              // S7: Posterior Collapse
  ],
};
