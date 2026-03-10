// ElevenLabs TTS voice provider — config-only subclass of ApiTTSProvider

import { ApiTTSProvider, type TTSRequest } from './api-tts-provider';
import { STORAGE_KEYS } from '../constants';

interface ElevenLabsTTSOpts {
  apiKey?: string;
  modelId?: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

export class ElevenLabsTTSProvider extends ApiTTSProvider {
  private _apiKey: string;
  private modelId: string;
  private voiceId: string;
  private stability: number;
  private similarityBoost: number;

  constructor(opts: ElevenLabsTTSOpts = {}) {
    super();
    this._apiKey = opts.apiKey || localStorage.getItem(STORAGE_KEYS.ELEVENLABS_API_KEY) || '';
    this.modelId = opts.modelId || 'eleven_multilingual_v2';
    this.voiceId = opts.voiceId || 'ZCh4e9eZSUf41K4cmCEL';
    this.stability = opts.stability ?? 0.5;
    this.similarityBoost = opts.similarityBoost ?? 0.75;
  }

  protected get cachePrefix(): string { return `elevenlabs:${this.modelId}:${this.voiceId}`; }
  protected get providerName(): string { return 'ElevenLabs'; }
  protected get apiKey(): string { return this._apiKey; }

  protected buildRequest(text: string): TTSRequest {
    return {
      url: `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
      headers: {
        'xi-api-key': this._apiKey,
        'Content-Type': 'application/json',
      },
      body: {
        text,
        model_id: this.modelId,
        voice_settings: {
          stability: this.stability,
          similarity_boost: this.similarityBoost,
        },
      },
    };
  }
}
