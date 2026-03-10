import 'katex/dist/katex.min.css';
import katex from 'katex';
(window as any).katex = katex;

import { initOfflineBanner } from './engine/offline-banner';
import { getLang, setLang, t, applyLang } from './engine/i18n';
import {
  getLessonTitle, getLessonDesc, getLessonMeta,
  getModuleName, getModuleMeta, getQuizData,
  LESSONS, MODULES,
} from './lessons/lesson-map';
import { Renderer } from './engine/renderer';
import { FormulaManager } from './engine/animation/formula';
import { renderInlineKatex } from './engine/shared/katex-utils';
import { gradeAnswer } from './engine/quiz/quiz-grader';
import { showExportModal, checkImportHash } from './engine/config-share';
import { initTopNav } from './engine/topnav';
import type { LessonEntry, LessonExport, QuizQuestion } from './engine/types';

// ── Offline banner ──
initOfflineBanner();

// ── Check for incoming encrypted config ──
await checkImportHash();

// ── Apply static i18n ──
applyLang();

// ── Top navigation bar ──
const topnav = initTopNav('index');
// Add settings button to topnav right section
const settingsBtn = document.createElement('button');
settingsBtn.className = 'topnav-icon-btn';
settingsBtn.innerHTML = '&#9881;';
settingsBtn.title = t('index.settingsLink' as any);
settingsBtn.addEventListener('click', () => openSettings());
topnav.querySelector('.topnav-right')!.appendChild(settingsBtn);

// ══════════════════════════════════════════════════════
// Dynamic module + card generation
// ══════════════════════════════════════════════════════

const lang = getLang();
const container = document.getElementById('modules-container')!;

function createLessonCard(lesson: LessonEntry): HTMLElement {
  const tag = lesson.ready ? 'a' : 'div';
  const card = document.createElement(tag);
  card.className = 'lesson-card' + (lesson.ready ? '' : ' upcoming');
  card.dataset.lesson = lesson.id;
  if (lesson.ready) {
    (card as HTMLAnchorElement).href = `player.html?lesson=${lesson.id}`;
  }

  // Number badge
  const num = document.createElement('span');
  num.className = 'num';
  num.textContent = `#${lesson.num}`;
  card.appendChild(num);

  // Title + ready badge
  const h3 = document.createElement('h3');
  let titleHtml = getLessonTitle(lesson.id);
  if (lesson.ready) {
    titleHtml += ` <span class="badge-ready">${t('index.badgeReady')}</span>`;
  }
  h3.innerHTML = titleHtml;
  card.appendChild(h3);

  // Description
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = getLessonDesc(lesson.id);
  card.appendChild(desc);

  // Thumbnail
  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'thumbnail';
  const canvas = document.createElement('canvas');
  thumbWrap.appendChild(canvas);
  card.appendChild(thumbWrap);

  // Formula
  if (lesson.formula) {
    const formulaDiv = document.createElement('div');
    formulaDiv.className = 'formula';
    formulaDiv.dataset.formula = lesson.formula;
    card.appendChild(formulaDiv);
  }

  // Tags
  if (lesson.tags.length > 0) {
    const tagsDiv = document.createElement('div');
    tagsDiv.className = 'tags';
    for (const tag of lesson.tags) {
      const span = document.createElement('span');
      span.className = `tag tag-${tag.type}`;
      span.textContent = tag.label;
      tagsDiv.appendChild(span);
    }
    card.appendChild(tagsDiv);
  }

  // Meta (scenes/duration)
  const meta = getLessonMeta(lesson.id);
  if (meta) {
    const metaP = document.createElement('p');
    metaP.className = 'meta';
    metaP.textContent = meta;
    card.appendChild(metaP);
  }

  return card;
}

for (const mod of MODULES) {
  const modLessons = LESSONS.filter(l => l.module === mod.key);
  if (modLessons.length === 0) continue;

  const section = document.createElement('section');
  section.className = 'module';
  section.dataset.module = mod.key;

  // Header
  const header = document.createElement('div');
  header.className = 'module-header';

  const numSpan = document.createElement('span');
  numSpan.className = 'module-num';
  const modMatch = mod.key.match(/^mod(\d+)$/);
  if (modMatch) {
    numSpan.textContent = lang === 'en' ? `Module ${modMatch[1]}` : `Módulo ${modMatch[1]}`;
  } else {
    // Non-numbered modules (e.g. 'guias'): show a short extra badge
    numSpan.textContent = lang === 'en' ? 'Extra' : 'Extra';
  }
  header.appendChild(numSpan);

  const titleSpan = document.createElement('span');
  titleSpan.className = 'module-title';
  titleSpan.textContent = getModuleName(mod.key);
  header.appendChild(titleSpan);

  const metaSpan = document.createElement('span');
  metaSpan.className = 'module-meta';
  metaSpan.textContent = getModuleMeta(mod.key);
  header.appendChild(metaSpan);

  section.appendChild(header);

  // Lesson grid
  const grid = document.createElement('div');
  grid.className = 'lesson-grid';
  for (const lesson of modLessons) {
    grid.appendChild(createLessonCard(lesson));
  }
  section.appendChild(grid);

  // Quiz container
  const quizDiv = document.createElement('div');
  quizDiv.className = 'quiz';
  quizDiv.dataset.module = mod.key;
  section.appendChild(quizDiv);

  container.appendChild(section);
}

// ── Update stats ──
const statTotal = document.querySelector<HTMLElement>('[data-stat="total"]');
const statReady = document.querySelector<HTMLElement>('[data-stat="ready"]');
const statModules = document.querySelector<HTMLElement>('[data-stat="modules"]');
if (statTotal) statTotal.textContent = String(LESSONS.length);
if (statReady) statReady.textContent = String(LESSONS.filter(l => l.ready).length);
if (statModules) statModules.textContent = String(MODULES.length);

// ── ElevenLabs audio badges ──
fetch('/audio/es/manifest.json')
  .then(r => r.ok ? r.json() : null)
  .then((manifest: { entries: Record<string, unknown> } | null) => {
    if (!manifest) return;
    // Build set of lessonIds that have at least one entry
    const lessonsWithAudio = new Set<string>();
    for (const key of Object.keys(manifest.entries)) {
      const lessonId = key.split('/')[0];
      lessonsWithAudio.add(lessonId);
    }
    for (const id of lessonsWithAudio) {
      const card = document.querySelector<HTMLElement>(`.lesson-card[data-lesson="${id}"]`);
      if (!card) continue;
      const badge = document.createElement('span');
      badge.className = 'badge-11';
      badge.textContent = '11';
      card.appendChild(badge);
    }
  })
  .catch(() => {});

// ── Render all KaTeX formulas ──
document.querySelectorAll<HTMLElement>('.formula[data-formula]').forEach(el => {
  window.katex?.render(el.dataset.formula!, el, {
    displayMode: true,
    throwOnError: false,
    trust: true,
  });
});

// ══════════════════════════════════════════════════════
// Thumbnail lazy loading via IntersectionObserver
// ══════════════════════════════════════════════════════

const lessonModules = import.meta.glob<Record<string, LessonExport>>(
  './lessons/*/index.ts',
);

const renderedThumbs = new Set<string>();

// Concurrency limiter for imports
const MAX_CONCURRENT = 3;
let activeImports = 0;
const importQueue: (() => void)[] = [];

function drainQueue(): void {
  while (activeImports < MAX_CONCURRENT && importQueue.length > 0) {
    activeImports++;
    const next = importQueue.shift()!;
    next();
  }
}

async function renderThumbnail(lessonId: string, canvas: HTMLCanvasElement): Promise<void> {
  if (renderedThumbs.has(lessonId)) return;
  renderedThumbs.add(lessonId);

  const path = `./lessons/${lessonId}/index.ts`;
  const loader = lessonModules[path];
  if (!loader) return;

  // Wait for concurrency slot
  await new Promise<void>(resolve => {
    importQueue.push(resolve);
    drainQueue();
  });

  try {
    const mod = await loader();

    // Find the LessonExport (first export with .scenes)
    let lessonExport: LessonExport | null = null;
    for (const val of Object.values(mod)) {
      if (val && typeof val === 'object' && 'scenes' in val && Array.isArray((val as LessonExport).scenes)) {
        lessonExport = val as LessonExport;
        break;
      }
    }
    if (!lessonExport || lessonExport.scenes.length === 0) return;

    // Find first non-interactive scene
    const scene = lessonExport.scenes.find(s => s.interaction === 'none') ?? lessonExport.scenes[0];

    // Create a temporary hidden overlay for FormulaManager
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:-9999px;left:-9999px;pointer-events:none;';
    document.body.appendChild(overlay);

    // Set up canvas dimensions for rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // If the canvas isn't laid out yet, use a fallback size
    const w = rect.width > 0 ? rect.width : 280;
    const h = rect.height > 0 ? rect.height : Math.round(w * 9 / 16);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const renderer = new Renderer(canvas, { left: 30, right: 15, top: 15, bottom: 20 });
    const fm = new FormulaManager(overlay);
    const state = { formulaManager: fm } as import('./engine/types').TimelineState;

    try {
      scene._render(0.35, ctx, canvas, renderer, state);
    } catch {
      // Render failed — leave canvas with dark background
    }

    fm.clear();
    overlay.remove();
  } finally {
    activeImports--;
    drainQueue();
  }
}

const thumbObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const card = entry.target as HTMLElement;
    const id = card.dataset.lesson!;
    const canvas = card.querySelector('.thumbnail canvas') as HTMLCanvasElement | null;
    if (canvas) renderThumbnail(id, canvas);
    thumbObserver.unobserve(card);
  }
}, { rootMargin: '300px 0px' });

document.querySelectorAll<HTMLElement>('.lesson-card[data-lesson]').forEach(c => {
  thumbObserver.observe(c);
});

// ══════════════════════════════════════════════════════
// Quiz system — preguntas abiertas con corrección por IA
// ══════════════════════════════════════════════════════

// ── API key — shared with player (localStorage 'anthropic-api-key') ──
function getApiKey(): string {
  return localStorage.getItem('anthropic-api-key') || '';
}

// ── Settings modal ──
const settingsModal = document.getElementById('settings-modal')!;
const cfgKeyInput = document.getElementById('cfg-anthropic-key') as HTMLInputElement;

function openSettings(): void {
  cfgKeyInput.value = getApiKey();
  settingsModal.classList.add('open');
  cfgKeyInput.focus();
}

document.getElementById('btn-open-settings')!.addEventListener('click', () => openSettings());

document.getElementById('cfg-cancel')!.addEventListener('click', () => {
  settingsModal.classList.remove('open');
});

document.getElementById('cfg-save')!.addEventListener('click', () => {
  const key = cfgKeyInput.value.trim();
  if (key) localStorage.setItem('anthropic-api-key', key);
  settingsModal.classList.remove('open');
  // Update all quiz no-key banners
  document.querySelectorAll<HTMLElement>('.quiz-nokey').forEach(el => {
    el.style.display = key ? 'none' : '';
  });
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.remove('open');
});

cfgKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('cfg-save')!.click();
});

// ── Share keys button ──
document.getElementById('btn-share-keys')!.addEventListener('click', () => {
  settingsModal.classList.remove('open');
  showExportModal();
});

// ── Call Anthropic API for correction (streaming) ──
async function evaluateAnswer(
  question: string,
  topic: string,
  moduleName: string,
  answer: string,
  feedbackEl: HTMLElement,
): Promise<string | null> {
  if (!getApiKey()) {
    openSettings();
    return null;
  }

  feedbackEl.className = 'quiz-feedback visible neutral';
  feedbackEl.innerHTML = '<div class="explanation"></div>';
  const explEl = feedbackEl.querySelector('.explanation') as HTMLElement;

  try {
    const result = await gradeAnswer({
      question,
      topic,
      moduleName,
      answer,
      onChunk: (cleanText) => {
        explEl.innerHTML = renderInlineKatex(cleanText);
      },
    });

    const verdictLabels: Record<string, string> = {
      correct: t('index.verdictCorrect'),
      incorrect: t('index.verdictImprove'),
      neutral: t('index.verdictReview'),
    };

    feedbackEl.className = `quiz-feedback visible ${result.verdict}`;
    feedbackEl.innerHTML = `<div class="verdict">${verdictLabels[result.verdict]}</div><div class="explanation">${renderInlineKatex(result.cleanText)}</div>`;

    return result.verdict;
  } catch (err: unknown) {
    feedbackEl.className = 'quiz-feedback visible neutral';
    const safeMsg = (err as Error).message.replace(/</g, '&lt;');
    feedbackEl.innerHTML = `<div class="verdict">${t('index.verdictError')}</div><div class="explanation">${safeMsg}</div>`;
    return null;
  }
}

// ── Build quiz UI for each module ──
document.querySelectorAll<HTMLElement>('.quiz[data-module]').forEach(quizContainer => {
  const modKey = quizContainer.dataset.module!;
  const questions: QuizQuestion[] = getQuizData(modKey);
  const moduleName: string = getModuleName(modKey);
  if (!questions || questions.length === 0) return;

  // State
  let currentIdx = 0;
  let results: (string | null)[] = [];

  // Toggle button
  const toggle = document.createElement('button');
  toggle.className = 'quiz-toggle';
  toggle.innerHTML = `<span class="arrow">&#9654;</span> ${t('index.quizToggle')} <span class="q-count">${t('index.quizCount', questions.length)}</span>`;
  quizContainer.appendChild(toggle);

  // Body
  const body = document.createElement('div');
  body.className = 'quiz-body';
  quizContainer.appendChild(body);

  toggle.addEventListener('click', () => {
    const open = body.classList.toggle('open');
    toggle.classList.toggle('open', open);
  });

  // No-key warning banner (hidden if key exists)
  const noKeyBanner = document.createElement('div');
  noKeyBanner.className = 'quiz-nokey';
  noKeyBanner.style.display = getApiKey() ? 'none' : '';
  noKeyBanner.innerHTML = `
    <span class="nokey-text">${t('index.quizNoKey')}</span>
    <button class="nokey-btn">${t('index.quizConfigure')}</button>
  `;
  noKeyBanner.querySelector('.nokey-btn')!.addEventListener('click', openSettings);
  body.appendChild(noKeyBanner);

  // Progress
  const progressText = document.createElement('div');
  progressText.className = 'quiz-progress';
  body.appendChild(progressText);

  const progressBar = document.createElement('div');
  progressBar.className = 'quiz-progress-bar';
  progressBar.innerHTML = '<div class="quiz-progress-fill"></div>';
  body.appendChild(progressBar);

  // Question
  const questionEl = document.createElement('div');
  questionEl.className = 'quiz-question';
  body.appendChild(questionEl);

  // Textarea
  const textarea = document.createElement('textarea');
  textarea.className = 'quiz-textarea';
  textarea.placeholder = t('index.quizPlaceholder');
  body.appendChild(textarea);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'quiz-actions';
  body.appendChild(actions);

  const submitBtn = document.createElement('button');
  submitBtn.className = 'quiz-btn quiz-btn-primary';
  submitBtn.textContent = t('index.grade');
  actions.appendChild(submitBtn);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'quiz-btn quiz-btn-secondary';
  nextBtn.textContent = t('index.nextQ');
  nextBtn.style.display = 'none';
  actions.appendChild(nextBtn);

  const spinnerEl = document.createElement('span');
  spinnerEl.className = 'quiz-spinner';
  spinnerEl.style.display = 'none';
  actions.appendChild(spinnerEl);

  // Feedback
  const feedbackEl = document.createElement('div');
  feedbackEl.className = 'quiz-feedback';
  body.appendChild(feedbackEl);

  // Summary
  const summaryEl = document.createElement('div');
  summaryEl.className = 'quiz-summary';
  summaryEl.style.display = 'none';
  body.appendChild(summaryEl);

  function renderQuestion(): void {
    if (currentIdx >= questions.length) {
      // Show summary
      questionEl.style.display = 'none';
      textarea.style.display = 'none';
      actions.style.display = 'none';
      feedbackEl.className = 'quiz-feedback';
      progressText.style.display = 'none';
      progressBar.style.display = 'none';

      const correct = results.filter(r => r === 'correct').length;
      const total = questions.length;
      let msg = '';
      if (correct === total) msg = t('index.summaryExcellent');
      else if (correct >= total * 0.5) msg = t('index.summaryGood');
      else msg = t('index.summaryReview');

      summaryEl.style.display = 'block';
      summaryEl.innerHTML = `
        <div class="score">${correct} / ${total}</div>
        <div class="msg">${msg}</div>
        <button class="quiz-btn quiz-btn-secondary restart-btn">${t('index.restart')}</button>
      `;
      summaryEl.querySelector('.restart-btn')!.addEventListener('click', () => {
        currentIdx = 0;
        results = [];
        summaryEl.style.display = 'none';
        questionEl.style.display = '';
        textarea.style.display = '';
        actions.style.display = '';
        progressText.style.display = '';
        progressBar.style.display = '';
        renderQuestion();
      });
      return;
    }

    const q = questions[currentIdx];
    progressText.textContent = t('index.quizProgress', currentIdx + 1, questions.length);
    (progressBar.querySelector('.quiz-progress-fill') as HTMLElement).style.width = `${((currentIdx) / questions.length) * 100}%`;
    questionEl.innerHTML = renderInlineKatex(q.q);
    textarea.value = '';
    textarea.disabled = false;
    submitBtn.disabled = false;
    submitBtn.textContent = t('index.grade');
    nextBtn.style.display = 'none';
    feedbackEl.className = 'quiz-feedback';
    feedbackEl.innerHTML = '';
  }

  submitBtn.addEventListener('click', async () => {
    const answer = textarea.value.trim();
    if (!answer) {
      textarea.focus();
      return;
    }

    // If no key, open settings and don't lock the UI
    if (!getApiKey()) {
      openSettings();
      return;
    }

    textarea.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = t('index.grading');
    spinnerEl.style.display = 'inline-block';

    const q = questions[currentIdx];
    const verdict = await evaluateAnswer(q.q, q.topic, moduleName, answer, feedbackEl);

    spinnerEl.style.display = 'none';

    if (verdict === null) {
      // API call failed or was cancelled — re-enable
      textarea.disabled = false;
      submitBtn.disabled = false;
      submitBtn.textContent = t('index.grade');
      return;
    }

    submitBtn.textContent = t('index.graded');
    results[currentIdx] = verdict;

    nextBtn.style.display = '';
    nextBtn.textContent = currentIdx < questions.length - 1 ? t('index.nextQ') : t('index.seeResult');
  });

  // Allow Ctrl+Enter to submit
  textarea.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !submitBtn.disabled) {
      submitBtn.click();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentIdx++;
    renderQuestion();
  });

  renderQuestion();
});
