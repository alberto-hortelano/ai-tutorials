// Abstract base class for cloud TTS providers (OpenAI, ElevenLabs, etc.)
// Handles: VoiceHandle creation, cache lookup, audio playback, stop.
// Subclasses only provide: cachePrefix, buildRequest, providerName.

import { getCached, setCache } from './audio-cache';
import type { VoiceHandle, VoiceProvider } from '../types';

interface TTSHandle extends VoiceHandle {
  _endCallback: (() => void) | null;
  _readyCallback: (() => void) | null;
  _audio: HTMLAudioElement | null;
  _paused: boolean;
}

export interface TTSRequest {
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

export abstract class ApiTTSProvider implements VoiceProvider {
  _currentAudio: HTMLAudioElement | null = null;

  protected abstract get cachePrefix(): string;
  protected abstract get providerName(): string;
  protected abstract get apiKey(): string;
  protected abstract buildRequest(text: string): TTSRequest;

  speak(text: string): VoiceHandle {
    const handle: TTSHandle = {
      _endCallback: null,
      _readyCallback: null,
      _audio: null,
      _paused: false,
      pause() { this._paused = true; if (this._audio) this._audio.pause(); },
      resume() { this._paused = false; if (this._audio) this._audio.play(); },
      cancel() { if (this._audio) { this._audio.pause(); this._audio.currentTime = 0; } },
      set onEnd(cb: (() => void) | null) { this._endCallback = cb; },
      get onEnd(): (() => void) | null { return this._endCallback; },
      set onReady(cb: (() => void) | null) { this._readyCallback = cb; },
      get onReady(): (() => void) | null { return this._readyCallback; },
    };

    this._generate(text, handle);
    return handle;
  }

  private async _generate(text: string, handle: TTSHandle): Promise<void> {
    const cacheKey = `${this.cachePrefix}:${text}`;

    let blob = await getCached(cacheKey);

    if (!blob) {
      if (!this.apiKey) {
        console.warn(`${this.providerName} API key not set`);
        if (handle._readyCallback) handle._readyCallback();
        if (handle._endCallback) handle._endCallback();
        return;
      }

      try {
        const req = this.buildRequest(text);
        const resp = await fetch(req.url, {
          method: 'POST',
          headers: req.headers,
          body: JSON.stringify(req.body),
        });

        if (!resp.ok) {
          console.error(`${this.providerName} TTS error:`, resp.status, await resp.text());
          if (handle._readyCallback) handle._readyCallback();
          if (handle._endCallback) handle._endCallback();
          return;
        }

        blob = await resp.blob();
        await setCache(cacheKey, blob);
      } catch (e) {
        console.error(`${this.providerName} TTS fetch error:`, e);
        if (handle._readyCallback) handle._readyCallback();
        if (handle._endCallback) handle._endCallback();
        return;
      }
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    handle._audio = audio;
    this._currentAudio = audio;

    audio.onended = () => {
      URL.revokeObjectURL(url);
      if (handle._endCallback) handle._endCallback();
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      if (handle._endCallback) handle._endCallback();
    };

    if (handle._readyCallback) handle._readyCallback();

    // Don't auto-play if user paused while we were fetching
    if (!handle._paused) {
      audio.play().catch(() => {
        if (handle._endCallback) handle._endCallback();
      });
    }
  }

  stop(): void {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      this._currentAudio = null;
    }
  }
}
