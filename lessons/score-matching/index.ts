// Score Matching lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-score-fn';
import { scene2 } from './scene-no-partition';
import { scene3 } from './scene-objective';
import { scene4 } from './scene-hyvarinen';
import { scene5 } from './scene-sliced';
import { scene6 } from './scene-denoising';
import { scene7 } from './scene-multi-scale';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const scoreMatching: LessonExport = {
  id: 'score-matching',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Score function
    scene2,                                                              // S2: No partition needed
    scene3,                                                              // S3: Objective
    scene4,                                                              // S4: Hyvarinen trick
    questionScene(() => questions[getLang()].afterHyvarinen),             // Q1: Hyvarinen objective
    scene5,                                                              // S5: Sliced SM
    scene6,                                                              // S6: Denoising SM
    interactiveScene({ src: '/interactives/campo_score.html',
      title: 'Score Field Explorer' }),                                  // HTML1
    scene7,                                                              // S7: Multi-scale noise
    questionScene(() => questions[getLang()].afterMultiScale),            // Q2: DSM direction
  ],
};
