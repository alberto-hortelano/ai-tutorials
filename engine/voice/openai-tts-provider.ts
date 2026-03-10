// OpenAI TTS voice provider — config-only subclass of ApiTTSProvider

import { ApiTTSProvider, type TTSRequest } from './api-tts-provider';
import { STORAGE_KEYS, MODELS } from '../constants';

interface OpenAITTSOpts {
  apiKey?: string;
  model?: string;
  voice?: string;
}

export class OpenAITTSProvider extends ApiTTSProvider {
  private _apiKey: string;
  private model: string;
  private voice: string;

  constructor(opts: OpenAITTSOpts = {}) {
    super();
    this._apiKey = opts.apiKey || localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '';
    this.model = opts.model || MODELS.OPENAI_TTS;
    this.voice = opts.voice || 'nova';
  }

  protected get cachePrefix(): string { return `${this.model}:${this.voice}`; }
  protected get providerName(): string { return 'OpenAI'; }
  protected get apiKey(): string { return this._apiKey; }

  protected buildRequest(text: string): TTSRequest {
    return {
      url: 'https://api.openai.com/v1/audio/speech',
      headers: {
        'Authorization': `Bearer ${this._apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model: this.model,
        voice: this.voice,
        input: text,
      },
    };
  }
}
