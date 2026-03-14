// Centralized type definitions for the presentation engine

import type { Renderer } from './renderer';
import type { FormulaManager } from './animation/formula';

// ── Language ──

export type Lang = 'es' | 'en';

// ── Math / Animation primitives ──

export type EasingFn = (t: number) => number;
export type MathFn = (x: number) => number;
export type CoordMapper = (v: number) => number;

// ── Bilingual helpers ──

export type BilingualRecord<T> = Record<Lang, T>;

/** A string that may be static or lazily evaluated (for i18n). */
export type LazyString = string | (() => string);

// ── Subtitles ──

export interface SubtitleCue {
  time: number;
  text: string;
}

// ── Scene ──

export type SceneRenderFn = (
  progress: number,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  renderer: Renderer,
  state: TimelineState,
) => void;

export type SceneSetupFn = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  renderer: Renderer,
) => void;

// ── Interaction types ──

export type InteractionType = 'none' | 'question' | 'interactive-html';

export interface QuestionData {
  question: string;
  choices?: string[];
  correctIndex?: number;
  hint?: string;
  explanation?: string;
}

export interface InteractiveHtmlData {
  src: string;              // relative path from public/ (e.g. '/interactives/elbo_interactivo.html')
  title?: string;
}

export interface SceneConfig {
  id: LazyString;
  duration: number;
  render: SceneRenderFn;
  setup?: SceneSetupFn;
  teardown?: () => void;
  narration?: LazyString;
  subtitleCues?: SubtitleCue[] | (() => SubtitleCue[]);
  topic?: LazyString;
  interaction?: InteractionType;
  questionData?: QuestionData | (() => QuestionData);
  interactiveData?: InteractiveHtmlData | (() => InteractiveHtmlData);
}

// ── Timeline ──

export interface TimelineState {
  formulaManager: FormulaManager;
  [key: string]: unknown;
}

export interface TimelineEventMap {
  play: void;
  pause: void;
  timeupdate: { time: number; progress: number };
  scenechange: { index: number; scene: import('./scene').Scene };
  end: void;
}

export type TimelineEvent = keyof TimelineEventMap;

// ── Voice ──

export interface VoiceHandle {
  pause(): void;
  resume(): void;
  cancel(): void;
  onEnd: (() => void) | null;
  onReady: (() => void) | null;
}

export interface VoiceProvider {
  speak(text: string): VoiceHandle;
  stop(): void;
}

// ── Chat ──

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatProvider {
  sendMessage(messages: ChatMessage[], system: string): AsyncGenerator<string>;
}

// ── Lessons ──

export interface LessonTag {
  label: string;
  type: 'topic';
}

export interface LessonEntry {
  id: string;
  module: string;
  num: number;
  ready: boolean;
  formula: string;
  tags: LessonTag[];
  readonly title: string;
  readonly description: string;
}

export interface LessonExport {
  id: string;
  readonly title: string;
  readonly subtitle?: string;
  scenes: import('./scene').Scene[];
}

export interface QuizQuestion {
  q: string;
  topic: string;
}

// ── Renderer ──

export interface RendererPadding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface AxesOptions {
  xLabel?: string;
  yLabel?: string;
  xTicks?: number;
  yTicks?: number;
}

export interface LabelOptions {
  color?: string;
  align?: CanvasTextAlign;
  font?: string;
  baseline?: CanvasTextBaseline;
}

export interface VerticalLineOptions {
  dash?: number[];
  lineWidth?: number;
}

export interface ArrowOptions {
  lineWidth?: number;
  headSize?: number;
}

export interface BoxOptions {
  fill?: string;
  stroke?: string | null;
  radius?: number;
  lineWidth?: number;
}
