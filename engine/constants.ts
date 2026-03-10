// Centralized constants — magic numbers, storage keys, model identifiers

export const TIMING = {
  TITLE_START: 0,
  TITLE_END: 0.08,
  TITLE_Y: 28,
  TITLE_FONT_SIZE: 18,
  FORMULA_HIDE_AFTER: 0.95,
} as const;

export const Z = {
  KATEX_OVERLAY: 10,
  END_SCREEN: 15,
  SUBTITLE: 20,
  VOICE_LOADING: 25,
  INTERACTION_OVERLAY: 50,
  TUTOR: 100,
  SETTINGS_BACKDROP: 1000,
  SETTINGS_PANEL: 1100,
} as const;

export const STORAGE_KEYS = {
  VOICE_PROVIDER: 'voice-provider',
  OPENAI_API_KEY: 'openai-api-key',
  ELEVENLABS_API_KEY: 'elevenlabs-api-key',
  ANTHROPIC_API_KEY: 'anthropic-api-key',
  APP_LANG: 'app-lang',
  TUTOR_CONVERSATION: 'tutor-conversation',
  TUTOR_CONVERSATIONS_INDEX: 'tutor-conversations',
  TUTOR_ACTIVE_ID: 'tutor-active-id',
  TUTOR_CONVERSATION_PREFIX: 'tutor-conv-',
} as const;

export const MODELS = {
  ANTHROPIC_CHAT: 'claude-sonnet-4-20250514',
  OPENAI_TTS: 'tts-1',
} as const;
