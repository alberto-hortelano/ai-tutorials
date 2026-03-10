// Barrel — collects per-module quiz data

import { getLang } from '../../engine/i18n';
import type { QuizQuestion } from '../../engine/types';

import { mod1 } from './mod1';
import { mod2 } from './mod2';
import { mod3 } from './mod3';
import { mod4 } from './mod4';
import { mod5 } from './mod5';
import { mod6 } from './mod6';

const allQuizzes: Record<string, Record<string, QuizQuestion[]>> = {
  mod1, mod2, mod3, mod4, mod5, mod6,
};

export function getQuizData(key: string): QuizQuestion[] {
  const lang = getLang();
  return allQuizzes[key]?.[lang] ?? allQuizzes[key]?.es ?? [];
}
