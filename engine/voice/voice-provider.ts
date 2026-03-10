// Voice provider — abstract interface

import type { VoiceHandle, VoiceProvider } from '../types';

/**
 * No-op voice provider (silent mode).
 */
export class SilentVoiceProvider implements VoiceProvider {
  speak(text: string): VoiceHandle {
    const handle: VoiceHandle = {
      pause() {},
      resume() {},
      cancel() {},
      onEnd: null,
      onReady: null,
    };
    // Fire onReady on next microtask (caller sets the callback after speak() returns)
    Promise.resolve().then(() => {
      if (handle.onReady) handle.onReady();
    });
    return handle;
  }
  stop(): void {}
}
