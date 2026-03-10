// Subtitle overlay — displays text synced with timeline

import type { SubtitleCue } from './types';

/** Divide un texto de narración en SubtitleCue[] distribuidos proporcionalmente por longitud */
export function narrationToCues(narration: string): SubtitleCue[] {
  if (!narration?.trim()) return [];
  const sentences = narration.match(/[^.!?:]+[.!?:]*/g)?.map(s => s.trim()).filter(Boolean) || [narration];
  const totalLen = sentences.reduce((s, sent) => s + sent.length, 0);
  const cues: SubtitleCue[] = [];
  let cumLen = 0;
  for (const sent of sentences) {
    cues.push({ time: cumLen / totalLen, text: sent });
    cumLen += sent.length;
  }
  return cues;
}

export class SubtitleOverlay {
  container: HTMLElement;
  _currentText: string;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.classList.add('pres-subtitle-stack');
    this._currentText = '';
  }

  /** Show a subtitle cue. Previous cue stays visible above until next one arrives. */
  show(text: string, durationMs: number = 4000): void {
    this._currentText = text;

    // Items already "risen" (previous-previous) → fade out now
    for (const child of Array.from(this.container.querySelectorAll('.risen'))) {
      child.classList.add('exiting');
      setTimeout(() => child.remove(), 600);
    }

    // Current visible item → slide up, stay readable
    for (const child of Array.from(this.container.querySelectorAll('.pres-subtitle.visible:not(.risen)'))) {
      child.classList.add('risen');
    }

    // Create new subtitle element
    const el = document.createElement('div');
    el.className = 'pres-subtitle';
    el.textContent = text;
    this.container.appendChild(el);
    // Force reflow so the transition triggers
    el.offsetHeight;
    el.classList.add('visible');

    // Auto-hide after duration (only if no new cue replaces it)
    setTimeout(() => {
      if (el.parentNode && !el.classList.contains('risen')) {
        el.classList.add('exiting');
        setTimeout(() => el.remove(), 600);
      }
    }, durationMs);
  }

  /** Clear all subtitles immediately. */
  clear(): void {
    this.container.innerHTML = '';
    this._currentText = '';
  }

  destroy(): void {
    this.clear();
  }
}
