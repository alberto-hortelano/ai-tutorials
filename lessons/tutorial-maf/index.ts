// Tutorial MAF lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-context';
import { scene2 } from './scene-eq1';
import { scene3 } from './scene-alpha';
import { scene4 } from './scene-mappings';
import { scene5 } from './scene-asymmetry';
import { scene6 } from './scene-eq2';
import { sceneJacobianIntuition } from './scene-jacobian-intuition';
import { scene7 } from './scene-eq3';
import { scene8 } from './scene-architecture';
import { scene9 } from './scene-recap';
import { questionScene } from '../../engine/scene-factories';

export const tutorialMaf: LessonExport = {
  id: 'tutorial-maf',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                        // S1: Context
    scene2,                                                        // S2: Eq.1 factorization
    scene3,                                                        // S3: What is αᵢ
    scene4,                                                        // S4: Forward & Inverse
    scene5,                                                        // S5: Sequential vs Parallel
    questionScene(() => questions[getLang()].afterAsymmetry),       // Q1: which mapping for log p(x)?
    scene6,                                                        // S6: Eq.2 change of variables
    sceneJacobianIntuition,                                        // Jacobian intuition (stretching analogy)
    scene7,                                                        // S7: Eq.3 triangular Jacobian
    questionScene(() => questions[getLang()].afterJacobian),        // Q2: triangular advantage
    scene8,                                                        // S8: MAF architecture
    scene9,                                                        // S9: Recap
  ],
};
