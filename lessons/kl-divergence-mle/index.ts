// KL Divergence & MLE lesson — barrel export

import { getLang } from '../../engine/i18n';
import type { LessonExport } from '../../engine/types';
import { text, questions } from './text';
import { scene1 } from './scene-surprise';
import { scene2 } from './scene-entropy';
import { scene3 } from './scene-cross-entropy';
import { scene4 } from './scene-kl-divergence';
import { scene5 } from './scene-asymmetry';
import { scene6 } from './scene-mle';
import { scene7 } from './scene-geometric';
import { questionScene, interactiveScene } from '../../engine/scene-factories';

export const klDivergenceMLE: LessonExport = {
  id: 'kl-divergence-mle',
  get title(): string { return (text[getLang()]?.lessonTitle ?? text.es.lessonTitle) as string; },
  get subtitle(): string { return (text[getLang()]?.lessonSubtitle ?? text.es.lessonSubtitle) as string; },
  scenes: [
    scene1,                                                              // S1: Event surprise
    scene2,                                                              // S2: Entropy
    scene3,                                                              // S3: Cross-entropy
    questionScene(() => questions[getLang()].afterCrossEntropy),          // Q1: surprise of die roll
    scene4,                                                              // S4: KL Divergence
    scene5,                                                              // S5: KL Asymmetry
    questionScene(() => questions[getLang()].afterAsymmetry),             // Q2: mode-covering vs seeking
    interactiveScene({ src: '/interactives/forward_vs_reverse.html',
      title: 'Forward vs Reverse KL' }),                                 // HTML1
    scene6,                                                              // S6: MLE = min KL
    scene7,                                                              // S7: Geometric view
    questionScene(() => questions[getLang()].afterGeometric),             // Q3: min KL = max what?
    interactiveScene({ src: '/interactives/gaussiana_multivariante.html',
      title: 'Multivariate Gaussian' }),                                 // HTML2
  ],
};
