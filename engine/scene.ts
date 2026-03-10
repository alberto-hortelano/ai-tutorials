// Scene — single unit of a presentation timeline

import type { SceneConfig, SceneRenderFn, SceneSetupFn, SubtitleCue, TimelineState, LazyString, InteractionType, QuestionData, InteractiveHtmlData } from './types';
import type { Renderer } from './renderer';
import { narrationToCues } from './subtitle';

export class Scene {
  _config: SceneConfig;
  duration: number;
  _setup: SceneSetupFn | null;
  _render: SceneRenderFn;
  _teardown: (() => void) | null;

  constructor(config: SceneConfig) {
    this._config = config;
    this.duration = config.duration;
    this._setup = config.setup || null;
    this._render = config.render;
    this._teardown = config.teardown || null;
  }

  get id(): string { return typeof this._config.id === 'function' ? this._config.id() : this._config.id; }
  get narration(): string { return typeof this._config.narration === 'function' ? this._config.narration() : (this._config.narration || ''); }
  get subtitleCues(): SubtitleCue[] {
    const narr = this.narration;
    if (narr) return narrationToCues(narr);
    return typeof this._config.subtitleCues === 'function'
      ? this._config.subtitleCues()
      : (this._config.subtitleCues || []);
  }
  get topic(): string { return typeof this._config.topic === 'function' ? this._config.topic() : (this._config.topic || ''); }
  get interaction(): InteractionType { return this._config.interaction || 'none'; }
  get questionData(): QuestionData | null {
    const d = this._config.questionData;
    if (!d) return null;
    return typeof d === 'function' ? d() : d;
  }
  get interactiveData(): InteractiveHtmlData | null {
    const d = this._config.interactiveData;
    if (!d) return null;
    return typeof d === 'function' ? d() : d;
  }

  setup(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, renderer: Renderer): void {
    if (this._setup) this._setup(ctx, canvas, renderer);
  }

  render(progress: number, ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, renderer: Renderer, state: TimelineState): void {
    this._render(progress, ctx, canvas, renderer, state);
  }

  teardown(): void {
    if (this._teardown) this._teardown();
  }
}
