// Monte Carlo Estimation lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-expectations';
import { scene2 } from './scene-variance';
import { scene3 } from './scene-importance';
import { scene4 } from './scene-marginal';
import { scene5 } from './scene-jensen';
import { scene6 } from './scene-elbo-derivation';
import { scene7 } from './scene-bridge';
import { questionScene } from '../../engine/scene-factories';

export const estimacionMonteCarlo: LessonExport = {
  id: 'estimacion-monte-carlo',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Estimating expectations
    scene2,                                                              // S2: Variance
    scene3,                                                              // S3: Importance sampling
    questionScene(() => questions[getLang()].afterImportance),            // Q1: O(1/N) dimension independence
    scene4,                                                              // S4: Marginal likelihood
    scene5,                                                              // S5: Jensen inequality
    scene6,                                                              // S6: From Jensen to ELBO
    scene7,                                                              // S7: Bridge to VI
    questionScene(() => questions[getLang()].afterBridge),                // Q2: q = posterior → gap = 0
  ],
};
