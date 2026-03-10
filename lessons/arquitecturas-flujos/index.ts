// Flow Architectures lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-bottleneck';
import { scene2 } from './scene-planar-flow';
import { scene3 } from './scene-coupling-idea';
import { scene4 } from './scene-nice';
import { scene5 } from './scene-realnvp';
import { scene6 } from './scene-alternating';
import { scene7 } from './scene-gallery';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const arquitecturasFlujos: LessonExport = {
  id: 'arquitecturas-flujos',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: The bottleneck
    scene2,                                                              // S2: Planar flow
    scene3,                                                              // S3: Coupling idea
    scene4,                                                              // S4: NICE
    questionScene(() => questions[getLang()].afterNice),                  // Q1: why det=1 in NICE?
    scene5,                                                              // S5: RealNVP
    scene6,                                                              // S6: Alternating masks
    scene7,                                                              // S7: Gallery
    questionScene(() => questions[getLang()].afterGallery),               // Q2: flow vs VAE density
    interactiveScene({ src: '/interactives/composicion_flujos.html',
      title: 'Flow Composition' }),                                      // HTML1: interactive
  ],
};
