// Change of Variables lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-stretching';
import { scene2 } from './scene-1d-formula';
import { scene3 } from './scene-jacobian';
import { scene4 } from './scene-determinant';
import { scene5 } from './scene-composition';
import { scene6 } from './scene-flow-idea';
import { scene7 } from './scene-training';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const cambioDeVariables: LessonExport = {
  id: 'cambio-de-variables',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Stretching space
    scene2,                                                              // S2: 1D formula
    scene3,                                                              // S3: The Jacobian
    scene4,                                                              // S4: The determinant
    questionScene(() => questions[getLang()].afterDeterminant),           // Q1: 1D density calculation
    scene5,                                                              // S5: Composition
    scene6,                                                              // S6: The flow idea
    questionScene(() => questions[getLang()].afterFlowIdea),              // Q2: det = 0 consequence
    interactiveScene({ src: '/interactives/cambio_variables.html',
      title: 'Change of Variables' }),                                   // HTML1: interactive
    scene7,                                                              // S7: Training
  ],
};
