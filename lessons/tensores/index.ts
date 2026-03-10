// Tensores lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-what';
import { scene2 } from './scene-shapes';
import { scene3 } from './scene-ops';
import { scene4 } from './scene-reshape';
import { scene5 } from './scene-broadcast';
import { scene6 } from './scene-mnist';
import { scene7 } from './scene-batch';
import { scene8 } from './scene-network';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const tensores: LessonExport = {
  id: 'tensores',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: What is a tensor?
    scene2,                                                              // S2: Shapes & dimensions
    questionScene(() => questions[getLang()].afterShapes),                // Q1: numel calculation
    scene3,                                                              // S3: Element-wise ops
    scene4,                                                              // S4: Reshape
    scene5,                                                              // S5: Broadcasting
    questionScene(() => questions[getLang()].afterBroadcast),             // Q2: broadcasting shapes
    interactiveScene({ src: '/interactives/tensores_tutorial.html',
      title: 'Explorador Interactivo de Tensores' }),                    // Interactive
    scene6,                                                              // S6: Tensors as images
    scene7,                                                              // S7: Batches
    scene8,                                                              // S8: Network pipeline
    questionScene(() => questions[getLang()].afterNetwork),               // Q3: weight matrix shape
  ],
};
