// Energy-Based Models lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-energy';
import { scene2 } from './scene-partition';
import { scene3 } from './scene-unnormalized';
import { scene4 } from './scene-contrastive';
import { scene5 } from './scene-langevin';
import { scene6 } from './scene-short-run';
import { scene7 } from './scene-bridge-score';
import { questionScene } from '../../engine/scene-factories';

export const energyBasedModels: LessonExport = {
  id: 'energy-based-models',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Energy function
    scene2,                                                              // S2: Partition function
    scene3,                                                              // S3: Unnormalized models
    questionScene(() => questions[getLang()].afterPartition),             // Q1: energy ratio
    scene4,                                                              // S4: Contrastive Divergence
    scene5,                                                              // S5: Langevin Dynamics
    scene6,                                                              // S6: Short-Run MCMC
    scene7,                                                              // S7: Bridge to Score
    questionScene(() => questions[getLang()].afterBridge),                // Q2: score and Z
  ],
};
