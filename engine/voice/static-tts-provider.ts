// Static TTS provider — serves pre-generated audio from /audio/es/
// Falls back to a wrapped VoiceProvider when no static audio matches.
// If the fallback also fails (e.g. quota), uses WebSpeech and shows a toast.

import type { VoiceHandle, VoiceProvider } from '../types';
import { WebSpeechProvider } from './web-speech-provider';

// ── Pure-JS SHA-256 (fallback for insecure contexts where crypto.subtle is unavailable) ──

function sha256Sync(message: string): string {
  const K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));

  // UTF-8 encode
  const bytes: number[] = [];
  for (let i = 0; i < message.length; i++) {
    let c = message.charCodeAt(i);
    if (c < 0x80) { bytes.push(c); }
    else if (c < 0x800) { bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else if (c >= 0xd800 && c < 0xdc00 && i + 1 < message.length) {
      const c2 = message.charCodeAt(++i);
      const cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      bytes.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else { bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }

  // Padding
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Append 64-bit big-endian length
  for (let i = 56; i >= 0; i -= 8) bytes.push((bitLen / 2 ** i) & 0xff);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  for (let off = 0; off < bytes.length; off += 64) {
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) |
             (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]) ^ rotr(18, w[i - 15]) ^ (w[i - 15] >>> 3);
      const s1 = rotr(17, w[i - 2]) ^ rotr(19, w[i - 2]) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
}

interface ManifestEntry {
  hash: string;
  file: string;
}

interface Manifest {
  entries: Record<string, ManifestEntry>;
}

interface StaticHandle extends VoiceHandle {
  _endCallback: (() => void) | null;
  _readyCallback: (() => void) | null;
  _audio: HTMLAudioElement | null;
  _paused: boolean;
  _delegated: VoiceHandle | null;
}

// ── Toast helper ──

let _toastShown = false;

function showToast(message: string): void {
  if (_toastShown) return;
  _toastShown = true;

  const el = document.createElement('div');
  el.className = 'voice-toast';
  el.textContent = message;
  document.body.appendChild(el);
  // Trigger reflow then animate in
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    el.addEventListener('transitionend', () => el.remove());
  }, 5000);
}

// Inject toast styles once
const TOAST_CSS = `
.voice-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #1e293b;
  border: 1px solid #f87171;
  color: #f8fafc;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none;
  max-width: 90vw;
  text-align: center;
}
.voice-toast.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = TOAST_CSS;
  document.head.appendChild(style);
}

// ── Provider ──

export class StaticTTSProvider implements VoiceProvider {
  private fallback: VoiceProvider;
  private _webSpeech: WebSpeechProvider | null = null;
  private _manifestPromise: Promise<Manifest | null> | null = null;
  private _reverseIndex: Map<string, ManifestEntry> | null = null;
  private _currentAudio: HTMLAudioElement | null = null;
  private _fallbackBroken = false;

  constructor(fallback: VoiceProvider) {
    this.fallback = fallback;
  }

  speak(text: string): VoiceHandle {
    const handle: StaticHandle = {
      _endCallback: null,
      _readyCallback: null,
      _audio: null,
      _paused: false,
      _delegated: null,
      pause() {
        this._paused = true;
        if (this._audio) this._audio.pause();
        if (this._delegated) this._delegated.pause();
      },
      resume() {
        this._paused = false;
        if (this._audio) this._audio.play();
        if (this._delegated) this._delegated.resume();
      },
      cancel() {
        if (this._audio) { this._audio.pause(); this._audio.currentTime = 0; }
        if (this._delegated) this._delegated.cancel();
      },
      set onEnd(cb: (() => void) | null) { this._endCallback = cb; },
      get onEnd(): (() => void) | null { return this._endCallback; },
      set onReady(cb: (() => void) | null) { this._readyCallback = cb; },
      get onReady(): (() => void) | null { return this._readyCallback; },
    };

    this._resolve(text, handle);
    return handle;
  }

  stop(): void {
    if (this._currentAudio) {
      this._currentAudio.pause();
      this._currentAudio.currentTime = 0;
      this._currentAudio = null;
    }
    this.fallback.stop();
    this._webSpeech?.stop();
  }

  private async _resolve(text: string, handle: StaticHandle): Promise<void> {
    try {
      const manifest = await this._loadManifest();
      if (!manifest) {
        this._delegate(text, handle);
        return;
      }

      const hash = await this._hash(text);
      const index = this._getReverseIndex(manifest);
      const entry = index.get(hash);

      if (!entry) {
        this._delegate(text, handle);
        return;
      }

      // Serve static file
      const resp = await fetch(`${import.meta.env.BASE_URL}audio/es/${entry.file}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
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

      if (!handle._paused) {
        audio.play().catch(() => {
          if (handle._endCallback) handle._endCallback();
        });
      }
    } catch (e) {
      console.warn('StaticTTS: resolve failed, delegating to fallback', e);
      this._delegate(text, handle);
    }
  }

  private _delegate(text: string, handle: StaticHandle): void {
    // If we already know the API fallback is broken, go straight to WebSpeech
    if (this._fallbackBroken) {
      this._delegateWebSpeech(text, handle);
      return;
    }

    // Intercept the fallback's error behavior by monkey-patching the API fetch.
    // ApiTTSProvider fires onReady+onEnd immediately when it fails — but we
    // can't distinguish "no API key" from "quota exceeded" from the handle alone.
    // Instead, we temporarily hook console.error to detect the failure, then
    // fall back to WebSpeech.
    //
    // Simpler approach: try the fallback. If onReady fires instantly (within
    // one microtask) AND no audio is set, it likely failed — use WebSpeech.
    const inner = this.fallback.speak(text);
    handle._delegated = inner;

    let readyFired = false;
    let endFired = false;

    inner.onReady = () => {
      readyFired = true;
      // Defer to check if end also fires immediately (= silent failure)
      Promise.resolve().then(() => {
        if (endFired) {
          // Both fired instantly — fallback failed silently, use WebSpeech
          this._fallbackBroken = true;
          showToast('ElevenLabs no disponible — usando voz del navegador');
          handle._delegated = null;
          this._delegateWebSpeech(text, handle);
        } else {
          if (handle._readyCallback) handle._readyCallback();
        }
      });
    };

    inner.onEnd = () => {
      endFired = true;
      // If ready hasn't fired yet or they both fire instantly, wait for the check above
      if (!readyFired) return;
      // Normal end after successful playback
      Promise.resolve().then(() => {
        if (!this._fallbackBroken) {
          if (handle._endCallback) handle._endCallback();
        }
      });
    };

    if (handle._paused) inner.pause();
  }

  private _delegateWebSpeech(text: string, handle: StaticHandle): void {
    if (!this._webSpeech) this._webSpeech = new WebSpeechProvider();
    const inner = this._webSpeech.speak(text);
    handle._delegated = inner;

    inner.onEnd = () => { if (handle._endCallback) handle._endCallback(); };
    inner.onReady = () => { if (handle._readyCallback) handle._readyCallback(); };

    if (handle._paused) inner.pause();
  }

  private _loadManifest(): Promise<Manifest | null> {
    if (!this._manifestPromise) {
      this._manifestPromise = fetch(`${import.meta.env.BASE_URL}audio/es/manifest.json`)
        .then(r => r.ok ? r.json() as Promise<Manifest> : null)
        .catch(() => null);
    }
    return this._manifestPromise;
  }

  private _getReverseIndex(manifest: Manifest): Map<string, ManifestEntry> {
    if (!this._reverseIndex) {
      this._reverseIndex = new Map();
      for (const entry of Object.values(manifest.entries)) {
        this._reverseIndex.set(entry.hash, entry);
      }
    }
    return this._reverseIndex;
  }

  private async _hash(text: string): Promise<string> {
    // Prefer crypto.subtle (secure contexts: HTTPS / localhost)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', data);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    }
    // Fallback: pure-JS SHA-256 (works on HTTP / insecure contexts)
    return sha256Sync(text).slice(0, 16);
  }
}
