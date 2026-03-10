// Types for the quiz grading module

export type Verdict = 'correct' | 'incorrect' | 'neutral';

export interface GradeResult {
  verdict: Verdict;
  cleanText: string;
}
