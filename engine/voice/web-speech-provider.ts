// Web Speech API voice provider
import { getLang } from '../i18n';
import type { VoiceHandle, VoiceProvider } from '../types';

interface WebSpeechHandle extends VoiceHandle {
  _endCallback: (() => void) | null;
  _readyCallback: (() => void) | null;
}

interface WebSpeechOpts {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export class WebSpeechProvider implements VoiceProvider {
  lang: string;
  rate: number;
  pitch: number;
  _currentUtterance: SpeechSynthesisUtterance | null;

  constructor(opts: WebSpeechOpts = {}) {
    this.lang = opts.lang || (getLang() === 'en' ? 'en-US' : 'es-ES');
    this.rate = opts.rate ?? 0.95;
    this.pitch = opts.pitch ?? 1;
    this._currentUtterance = null;
  }

  /**
   * Speak text using the browser's SpeechSynthesis API.
   */
  speak(text: string): VoiceHandle {
    if (!window.speechSynthesis) {
      console.warn('SpeechSynthesis not available');
      return { pause() {}, resume() {}, cancel() {}, onEnd: null, onReady: null };
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Try to pick a good voice matching the current language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = this.lang.slice(0, 2); // 'es' or 'en'
    const preferred = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes('Google'))
      || voices.find(v => v.lang.startsWith(langPrefix))
      || voices[0];
    if (preferred) utterance.voice = preferred;

    this._currentUtterance = utterance;

    const handle: WebSpeechHandle = {
      _endCallback: null,
      _readyCallback: null,
      pause() { window.speechSynthesis.pause(); },
      resume() { window.speechSynthesis.resume(); },
      cancel() { window.speechSynthesis.cancel(); },
      set onEnd(cb: (() => void) | null) { this._endCallback = cb; },
      get onEnd(): (() => void) | null { return this._endCallback; },
      set onReady(cb: (() => void) | null) { this._readyCallback = cb; },
      get onReady(): (() => void) | null { return this._readyCallback; },
    };

    utterance.onend = () => {
      if (handle._endCallback) handle._endCallback();
    };

    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      if (e.error !== 'canceled') console.warn('Speech error:', e.error);
      if (handle._endCallback) handle._endCallback();
    };

    window.speechSynthesis.speak(utterance);

    // Fire onReady on next microtask (caller sets the callback after speak() returns)
    Promise.resolve().then(() => {
      if (handle._readyCallback) handle._readyCallback();
    });

    return handle;
  }

  stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}
