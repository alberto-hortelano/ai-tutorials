// Timeline — orchestrates scene sequence, play/pause/seek, rAF loop

import type { SubtitleCue, VoiceHandle, VoiceProvider, TimelineState } from './types';
import type { Scene } from './scene';
import type { Renderer } from './renderer';

interface TimelineOpts {
  renderer?: Renderer;
  voiceProvider?: VoiceProvider;
  onSubtitle?: (cue: SubtitleCue) => void;
}

export class Timeline {
  scenes: Scene[];
  renderer: Renderer | null;
  voiceProvider: VoiceProvider | null;
  onSubtitle: ((cue: SubtitleCue) => void) | null;
  totalDuration: number;
  state: TimelineState;

  _sceneStarts: number[];
  _currentSceneIdx: number;
  _globalTime: number;
  _playing: boolean;
  _rafId: number | null;
  _lastTs: number | null;
  _voiceHandle: VoiceHandle | null;
  _voiceWaiting: boolean;
  _voiceLoading: boolean;   // true while API TTS is fetching audio
  _firedCues: Set<number>;
  _listeners: Record<string, ((...args: any[]) => void)[]>;
  _interactionPaused: boolean;
  _interactionFiredForScene: Set<number>;

  constructor(scenes: Scene[], opts: TimelineOpts = {}) {
    this.scenes = scenes;
    this.renderer = opts.renderer || null;
    this.voiceProvider = opts.voiceProvider || null;
    this.onSubtitle = opts.onSubtitle || null;

    // Compute cumulative start times
    this._sceneStarts = [];
    let acc = 0;
    for (const s of scenes) {
      this._sceneStarts.push(acc);
      acc += s.duration;
    }
    this.totalDuration = acc;

    // State
    this._currentSceneIdx = -1;
    this._globalTime = 0;       // seconds elapsed
    this._playing = false;
    this._rafId = null;
    this._lastTs = null;
    this._voiceHandle = null;
    this._voiceWaiting = false;  // true when voice is still playing past scene duration
    this._voiceLoading = false;  // true while API TTS is fetching audio
    this._firedCues = new Set(); // subtitle cue indices already fired in current scene
    this.state = {} as TimelineState; // shared state passed to render

    // Interaction pause state
    this._interactionPaused = false;
    this._interactionFiredForScene = new Set();

    // Events
    this._listeners = {};
  }

  // --- Event emitter ---
  on(event: string, fn: (...args: any[]) => void): void {
    (this._listeners[event] ||= []).push(fn);
  }
  off(event: string, fn: (...args: any[]) => void): void {
    const list = this._listeners[event];
    if (list) this._listeners[event] = list.filter(f => f !== fn);
  }
  _emit(event: string, data?: unknown): void {
    for (const fn of (this._listeners[event] || [])) fn(data);
  }

  // --- Public API ---

  get playing(): boolean { return this._playing; }
  get currentTime(): number { return this._globalTime; }
  get currentSceneIndex(): number { return this._currentSceneIdx; }
  get currentScene(): Scene | null { return this.scenes[this._currentSceneIdx] || null; }

  /** Progress within current scene (0-1) */
  get sceneProgress(): number {
    if (this._currentSceneIdx < 0) return 0;
    const scene = this.scenes[this._currentSceneIdx];
    const sceneStart = this._sceneStarts[this._currentSceneIdx];
    const elapsed = this._globalTime - sceneStart;
    return Math.min(1, Math.max(0, elapsed / scene.duration));
  }

  /** Global progress (0-1) */
  get progress(): number {
    return this.totalDuration > 0 ? this._globalTime / this.totalDuration : 0;
  }

  play(): void {
    if (this._playing) return;
    this._playing = true;
    this._lastTs = null;

    // Enter first scene if needed
    if (this._currentSceneIdx < 0) {
      this._enterScene(0, true);
    }

    // Resume existing voice if paused, otherwise start fresh
    if (this._voiceHandle) {
      this._resumeVoice();
    } else {
      this._startVoice();
    }

    this._tick = this._tick.bind(this);
    this._rafId = requestAnimationFrame(this._tick);
    this._emit('play');
  }

  pause(): void {
    if (!this._playing) return;
    this._playing = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._pauseVoice();
    // Hide loading spinner while paused, but keep _voiceLoading flag
    // so timeline stays frozen on resume if audio isn't ready yet
    if (this._voiceLoading) {
      this._emit('voiceloading', false);
    }
    this._emit('pause');
  }

  toggle(): void {
    this._playing ? this.pause() : this.play();
  }

  /** Seek to a global time in seconds. */
  seek(time: number): void {
    const wasPaused = !this._playing;
    if (this._playing) this.pause();

    this._globalTime = Math.max(0, Math.min(time, this.totalDuration));

    // Find which scene we're in
    let idx = 0;
    for (let i = 0; i < this.scenes.length; i++) {
      if (this._globalTime >= this._sceneStarts[i]) idx = i;
      else break;
    }

    // If scene changed, enter the new one
    if (idx !== this._currentSceneIdx) {
      if (this._currentSceneIdx >= 0) this.scenes[this._currentSceneIdx].teardown();
      this._enterScene(idx);
    }

    // Clear voice handle so play() starts fresh after seeking
    this._stopVoice();

    // Render at the seeked position
    this._renderCurrent();
    this._emit('timeupdate', { time: this._globalTime, progress: this.progress });

    if (!wasPaused) this.play();
  }

  /** Seek by global progress (0-1). */
  seekProgress(p: number): void {
    this.seek(p * this.totalDuration);
  }

  /** Jump to a specific scene by index. */
  goToScene(idx: number): void {
    if (idx < 0 || idx >= this.scenes.length) return;
    this.seek(this._sceneStarts[idx]);
  }

  /** Restart from beginning. */
  restart(): void {
    this.seek(0);
    this.play();
  }

  /** Clean up. */
  destroy(): void {
    this.pause();
    if (this._currentSceneIdx >= 0) this.scenes[this._currentSceneIdx].teardown();
    this._stopVoice();
    this._listeners = {};
  }

  // --- Private ---

  _tick(ts: number): void {
    if (!this._playing) return;

    if (this._lastTs === null) this._lastTs = ts;
    const dt = (ts - this._lastTs) / 1000; // seconds
    this._lastTs = ts;

    // If voice is loading or still playing, freeze timeline
    if (!this._voiceWaiting && !this._voiceLoading) {
      this._globalTime += dt;
    }

    // Check if we've passed the end
    if (this._globalTime >= this.totalDuration) {
      this._globalTime = this.totalDuration;
      // Wait for voice to finish before ending
      if (this._voiceHandle) {
        this._voiceWaiting = true;
      } else {
        this._renderCurrent();
        this.pause();
        this._emit('end');
        return;
      }
    }

    // Check scene transitions
    const nextIdx = this._currentSceneIdx + 1;
    if (nextIdx < this.scenes.length && this._globalTime >= this._sceneStarts[nextIdx]) {
      if (this._voiceHandle) {
        // Voice still playing — hold current scene until narration ends
        this._voiceWaiting = true;
      } else {
        this.scenes[this._currentSceneIdx].teardown();
        this._enterScene(nextIdx, true);
        this._startVoice();
      }
    }

    // Fire subtitle cues
    this._checkSubtitles();

    // Render
    this._renderCurrent();
    this._emit('timeupdate', { time: this._globalTime, progress: this.progress });

    this._rafId = requestAnimationFrame(this._tick);
  }

  _enterScene(idx: number, checkInteraction = false): void {
    this._currentSceneIdx = idx;
    this._firedCues.clear();
    // Clear formula overlay from previous scene
    if (this.state.formulaManager) {
      this.state.formulaManager.clear();
    }
    const scene = this.scenes[idx];
    if (this.renderer) {
      scene.setup(this.renderer.ctx, this.renderer.canvas, this.renderer);
    }
    this._emit('scenechange', { index: idx, scene });

    // Fire interaction only when advancing naturally or resuming from interaction
    // NOT when seeking (checkInteraction=false by default)
    if (checkInteraction && scene.interaction !== 'none' && !this._interactionFiredForScene.has(idx)) {
      this._interactionFiredForScene.add(idx);
      this._interactionPaused = true;
      // Render frame 0
      this._renderCurrent();
      // Pause playback
      this.pause();
      // Emit interaction event
      this._emit('interaction', { type: scene.interaction, scene, index: idx });
    }
  }

  /** Resume after an interaction overlay is dismissed. */
  resumeFromInteraction(): void {
    if (!this._interactionPaused) return;
    this._interactionPaused = false;
    this._emit('interactionDone');
    // Advance to the start of the next scene
    const nextIdx = this._currentSceneIdx + 1;
    if (nextIdx < this.scenes.length) {
      this._globalTime = this._sceneStarts[nextIdx];
      this.scenes[this._currentSceneIdx].teardown();
      this._enterScene(nextIdx, true);
      // If next scene fired its own interaction, don't resume playback
      if (this._interactionPaused) return;
      this._startVoice();
    }
    this.play();
  }

  _renderCurrent(): void {
    if (this._currentSceneIdx < 0 || !this.renderer) return;
    const scene = this.scenes[this._currentSceneIdx];
    const progress = this.sceneProgress;
    try {
      scene.render(progress, this.renderer.ctx, this.renderer.canvas, this.renderer, this.state);
    } catch (err) {
      console.error(`[Timeline] Scene ${this._currentSceneIdx} render error:`, err);
    }
  }

  _checkSubtitles(): void {
    if (!this.onSubtitle || this._currentSceneIdx < 0) return;
    const scene = this.scenes[this._currentSceneIdx];
    const progress = this.sceneProgress;
    scene.subtitleCues.forEach((cue: SubtitleCue, i: number) => {
      if (!this._firedCues.has(i) && progress >= cue.time) {
        this._firedCues.add(i);
        this.onSubtitle!(cue);
      }
    });
  }

  // --- Voice integration ---

  _startVoice(): void {
    if (!this.voiceProvider || this._currentSceneIdx < 0) return;
    const scene = this.scenes[this._currentSceneIdx];
    if (!scene.narration) return;

    this._stopVoice();
    this._voiceWaiting = false;
    this._voiceLoading = true;
    this._emit('voiceloading', true);

    this._voiceHandle = this.voiceProvider.speak(scene.narration);
    if (this._voiceHandle) {
      this._voiceHandle.onReady = () => {
        this._voiceLoading = false;
        this._emit('voiceloading', false);
      };
      this._voiceHandle.onEnd = () => {
        this._voiceWaiting = false;
        this._voiceLoading = false;
        this._voiceHandle = null;
        this._emit('voiceloading', false);
      };
    }
  }

  _pauseVoice(): void {
    if (this._voiceHandle && this._voiceHandle.pause) {
      this._voiceHandle.pause();
    }
  }

  _resumeVoice(): void {
    if (this._voiceHandle) {
      this._voiceHandle.resume();
    }
    // Re-show spinner if audio was still loading when paused
    if (this._voiceLoading) {
      this._emit('voiceloading', true);
    }
  }

  _stopVoice(): void {
    if (this._voiceHandle) {
      // Clear callbacks before cancel to prevent race conditions
      // (e.g. Web Speech onerror firing and nulling a new handle)
      this._voiceHandle.onEnd = null;
      this._voiceHandle.onReady = null;
      if (this._voiceHandle.cancel) this._voiceHandle.cancel();
      this._voiceHandle = null;
    }
    this._voiceWaiting = false;
    if (this._voiceLoading) {
      this._voiceLoading = false;
      this._emit('voiceloading', false);
    }
  }
}
