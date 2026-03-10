import { initOfflineBanner } from './engine/offline-banner';
import { Renderer } from './engine/renderer';
import { Timeline } from './engine/timeline';
import { Controls } from './engine/controls';
import { SubtitleOverlay } from './engine/subtitle';
import { ChatPanel } from './engine/chat-panel';
import { initMathRenderer } from './engine/math-renderer';
import { SilentVoiceProvider } from './engine/voice/voice-provider';
import { WebSpeechProvider } from './engine/voice/web-speech-provider';
import { OpenAITTSProvider } from './engine/voice/openai-tts-provider';
import { ElevenLabsTTSProvider } from './engine/voice/elevenlabs-tts-provider';
import { StaticTTSProvider } from './engine/voice/static-tts-provider';
import { DummyChatProvider } from './engine/chat/chat-provider';
import { AnthropicChatProvider } from './engine/chat/anthropic-provider';
import { EndScreen } from './engine/end-screen';
import { OverlayManager } from './engine/overlay-manager';
import { getLang, setLang, t, applyLang } from './engine/i18n';
import { showExportModal, checkImportHash } from './engine/config-share';
import { initTopNav } from './engine/topnav';
import { STORAGE_KEYS } from './engine/constants';
import type { VoiceProvider, ChatProvider, LessonExport } from './engine/types';

// ── Offline banner ──
initOfflineBanner();

// ── Check for incoming encrypted config (before anything else) ──
await checkImportHash();

// ── Apply i18n to static DOM ──
applyLang();

// ── Top navigation bar with lesson title slot ──
const lessonTitleEl = document.createElement('span');
lessonTitleEl.className = 'topnav-slot-title';
lessonTitleEl.id = 'lesson-title';
lessonTitleEl.textContent = t('player.loading' as any);
const slotEl = document.createElement('div');
slotEl.appendChild(lessonTitleEl);
const topnav = initTopNav('player', slotEl, document.querySelector('.player-wrap') as HTMLElement);

// Add player-specific buttons to topnav right
const topnavRight = topnav.querySelector('.topnav-right')!;

// Chat/Tutor button
const chatBtn = document.createElement('button');
chatBtn.className = 'topnav-icon-btn';
chatBtn.id = 'btn-chat';
chatBtn.title = t('player.chatTooltip' as any);
chatBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
topnavRight.appendChild(chatBtn);

// Fullscreen button
const fullscreenBtn = document.createElement('button');
fullscreenBtn.className = 'topnav-icon-btn';
fullscreenBtn.id = 'btn-fullscreen';
fullscreenBtn.title = t('player.fullscreen' as any);
fullscreenBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
topnavRight.appendChild(fullscreenBtn);

// Settings button
const settingsNavBtn = document.createElement('button');
settingsNavBtn.className = 'topnav-icon-btn';
settingsNavBtn.id = 'btn-settings';
settingsNavBtn.innerHTML = '&#9881;';
topnavRight.appendChild(settingsNavBtn);

// ── Load lesson from URL params ──
const params = new URLSearchParams(location.search);
const lessonId = params.get('lesson') || 'kl-divergence-mle';

// Dynamic import of lesson (supports both directory and single-file layouts)
let lesson: LessonExport;
try {
  let mod: Record<string, unknown>;
  try {
    mod = await import(`./lessons/${lessonId}/index.ts`);
  } catch {
    mod = await import(`./lessons/${lessonId}.ts`);
  }
  // Find the exported lesson object (first export with .scenes)
  const found = Object.values(mod).find(
    (v): v is LessonExport => v != null && typeof v === 'object' && 'scenes' in (v as object),
  );
  if (!found) throw new Error('No lesson found in module');
  lesson = found;
} catch (e) {
  document.getElementById('lesson-title')!.textContent = t('player.error', lessonId);
  console.error(e);
  throw e;
}

document.getElementById('lesson-title')!.textContent = lesson.title;
document.title = `${lesson.title} — XCS236`;

// ── Initialize voice provider ──
function createVoiceProvider(): VoiceProvider {
  const voiceType = localStorage.getItem(STORAGE_KEYS.VOICE_PROVIDER) || 'web-speech';
  switch (voiceType) {
    case 'openai-tts':
      return new OpenAITTSProvider({
        apiKey: localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '',
      });
    case 'elevenlabs-tts': {
      const eleven = new ElevenLabsTTSProvider({
        apiKey: localStorage.getItem(STORAGE_KEYS.ELEVENLABS_API_KEY) || '',
      });
      return new StaticTTSProvider(eleven);
    }
    case 'web-speech':
      return new WebSpeechProvider();
    default:
      return new SilentVoiceProvider();
  }
}

// ── Initialize chat provider ──
function createChatProvider(): ChatProvider {
  const key = localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY);
  if (key) return new AnthropicChatProvider({ apiKey: key });
  return new DummyChatProvider();
}

// ── Setup canvas and renderer ──
const canvas = document.getElementById('main-canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);

// ── Setup KaTeX ──
const formulaManager = await initMathRenderer(document.getElementById('katex-overlay')!);

// ── Create timeline ──
const subtitle = new SubtitleOverlay(document.getElementById('subtitle')!);
const voiceProvider = createVoiceProvider();

const timeline = new Timeline(lesson.scenes, {
  renderer,
  voiceProvider,
  onSubtitle: (cue) => {
    const dur = Math.max(2000, Math.min(8000, cue.text.length * 60));
    subtitle.show(cue.text, dur);
  },
});

// ── Expose formulaManager to scenes via state ──
timeline.state.formulaManager = formulaManager;

// ── Canvas aria-label: update on scene change ──
timeline.on('scenechange', ({ scene }: { scene: import('./engine/scene').Scene }) => {
  canvas.setAttribute('aria-label', scene.topic || '');
});

// ── Voice loading indicator ──
const voiceLoadingEl = document.getElementById('voice-loading')!;
timeline.on('voiceloading', (loading: boolean) => {
  voiceLoadingEl.classList.toggle('visible', loading);
});

// ── Controls ──
const _controls = new Controls(document.getElementById('controls')!, timeline);

// ── Interaction overlay ──
const overlayManager = new OverlayManager(document.getElementById('interaction-overlay')!);
timeline.on('interaction', ({ type, scene }: { type: string; scene: import('./engine/scene').Scene }) => {
  if (type === 'question' && scene.questionData) {
    overlayManager.showQuestion(scene.questionData, () => timeline.resumeFromInteraction());
  } else if (type === 'interactive-html' && scene.interactiveData) {
    overlayManager.showInteractiveHtml(scene.interactiveData, () => timeline.resumeFromInteraction());
  }
});

// Keyboard: Enter to continue, Escape to skip
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
  if (e.code === 'Enter' || e.code === 'Escape') {
    if (overlayManager._current) {
      e.preventDefault();
      overlayManager.dismiss();
      timeline.resumeFromInteraction();
    }
  }
});

// ── Chat ──
const chatProvider = createChatProvider();
const chatPanel = new ChatPanel(document.getElementById('chat-panel')!, timeline, chatProvider);
document.getElementById('btn-chat')!.addEventListener('click', () => chatPanel.toggle());

// ── Fullscreen (mobile) ──
const appLayout = document.getElementById('app-layout')!;

fullscreenBtn.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    appLayout.requestFullscreen().catch(() => {});
  }
});

// Swap icon between expand/compress
document.addEventListener('fullscreenchange', () => {
  const isFs = !!document.fullscreenElement;
  fullscreenBtn.innerHTML = isFs
    ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
});

// ── End screen ──
const _endScreen = new EndScreen(document.querySelector('.player-stage')!, timeline, lessonId);

// ── Settings ──
const settingsModal = document.getElementById('settings-modal')!;
const voiceSelect = document.getElementById('voice-select') as HTMLSelectElement;
const openaiKeyInput = document.getElementById('openai-key') as HTMLInputElement;
const elevenlabsKeyInput = document.getElementById('elevenlabs-key') as HTMLInputElement;
const anthropicKeyInput = document.getElementById('anthropic-key') as HTMLInputElement;

// Load saved settings
voiceSelect.value = localStorage.getItem(STORAGE_KEYS.VOICE_PROVIDER) || 'web-speech';
openaiKeyInput.value = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY) || '';
elevenlabsKeyInput.value = localStorage.getItem(STORAGE_KEYS.ELEVENLABS_API_KEY) || '';
anthropicKeyInput.value = localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY) || '';

let previousFocus: HTMLElement | null = null;

function openSettings(): void {
  previousFocus = document.activeElement as HTMLElement;
  settingsModal.classList.add('open');
  // Focus first focusable element
  const first = settingsModal.querySelector<HTMLElement>('select, input, button');
  first?.focus();
}

function closeSettings(): void {
  settingsModal.classList.remove('open');
  previousFocus?.focus();
  previousFocus = null;
}

document.getElementById('btn-settings')!.addEventListener('click', openSettings);

document.getElementById('btn-settings-cancel')!.addEventListener('click', closeSettings);

document.getElementById('btn-settings-save')!.addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEYS.VOICE_PROVIDER, voiceSelect.value);
  localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, openaiKeyInput.value);
  localStorage.setItem(STORAGE_KEYS.ELEVENLABS_API_KEY, elevenlabsKeyInput.value);
  localStorage.setItem(STORAGE_KEYS.ANTHROPIC_API_KEY, anthropicKeyInput.value);

  closeSettings();
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettings();
});

// ── Settings focus trap ──
settingsModal.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeSettings();
    return;
  }
  if (e.key !== 'Tab') return;
  const focusable = settingsModal.querySelectorAll<HTMLElement>(
    'select, input, button, [tabindex]:not([tabindex="-1"])',
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

// ── Share keys button ──
document.getElementById('btn-share-keys')!.addEventListener('click', () => {
  closeSettings();
  showExportModal();
});

// ── Handle resize (ResizeObserver catches both window resize and chat push-aside) ──
const stageEl = document.querySelector('.player-stage')!;
const resizeObs = new ResizeObserver(() => {
  renderer.resize();
  if (!timeline.playing) {
    const scene = timeline.currentScene;
    if (scene) {
      scene.render(timeline.sceneProgress, renderer.ctx, renderer.canvas, renderer, timeline.state);
    }
  }
});
resizeObs.observe(stageEl);

// ── Render first frame (small offset so title + axes visible) ──
timeline.seek(2);
