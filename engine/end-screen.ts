// End Screen — overlay shown when a lesson finishes
// Shows quiz questions for the module + next lesson navigation

import { QUIZ_DATA, MODULE_NAMES, getNextLesson, getLesson, getLessonModule, getModuleName, getQuizData } from '../lessons/lesson-map';
import { t } from './i18n';
import { getKatex, renderInlineKatex, escapeHtml } from './shared/katex-utils';
import { gradeAnswer } from './quiz/quiz-grader';
import type { QuizQuestion, LessonEntry } from './types';
import type { Timeline } from './timeline';

export class EndScreen {
  container: HTMLElement;
  timeline: Timeline;
  lessonId: string;
  _visible: boolean;
  _module: string | null;
  _nextReady: LessonEntry | null;
  _nextAny: LessonEntry | null;
  _currentLesson: LessonEntry | null;
  _quizIdx: number;
  _quizResults: (string | undefined)[];
  _streaming: boolean;
  el!: HTMLDivElement;

  constructor(container: HTMLElement, timeline: Timeline, lessonId: string) {
    this.container = container;
    this.timeline = timeline;
    this.lessonId = lessonId;
    this._visible = false;

    this._module = getLessonModule(lessonId);
    this._nextReady = getNextLesson(lessonId);
    this._nextAny = getNextLesson(lessonId, { onlyReady: false });
    this._currentLesson = getLesson(lessonId);

    this._quizIdx = 0;
    this._quizResults = [];
    this._streaming = false;

    this._build();
    this._bindTimeline();
    // Pre-load katex (should already be loaded by initMathRenderer)
    getKatex();
  }

  get _questions(): QuizQuestion[] {
    return this._module ? getQuizData(this._module) : [];
  }

  get _moduleName(): string {
    return this._module ? getModuleName(this._module) : '';
  }

  _build(): void {
    this.el = document.createElement('div') as HTMLDivElement;
    this.el.className = 'end-screen';
    this.container.appendChild(this.el);
  }

  _bindTimeline(): void {
    this.timeline.on('end', () => this.show());
    this.timeline.on('play', () => this.hide());
  }

  show(): void {
    if (this._visible) return;
    this._visible = true;
    this._quizIdx = 0;
    this._quizResults = [];
    this._streaming = false;
    this._render();
    // Force reflow before adding visible class for CSS transition
    this.el.offsetHeight;
    this.el.classList.add('visible');
  }

  hide(): void {
    if (!this._visible) return;
    this._visible = false;
    this.el.classList.remove('visible');
  }

  _render(): void {
    const lessonTitle = this._currentLesson ? this._currentLesson.title : this.lessonId;
    const questions = this._questions;

    let html = `
      <div class="end-card">
        <div class="end-header">
          <div class="checkmark">&#10003;</div>
          <h2>${t('end.complete')}</h2>
          <div class="end-subtitle">${escapeHtml(lessonTitle)}</div>
        </div>

        <div class="end-actions">
          <button class="end-btn end-btn-secondary" data-action="replay">${t('end.replay')}</button>
          ${this._nextReady
            ? `<a href="player.html?lesson=${this._nextReady.id}" class="end-btn end-btn-primary">${t('end.next')} &#8594;</a>`
            : ''
          }
        </div>
    `;

    // Quiz section
    if (questions.length > 0) {
      html += `
        <div class="end-divider"></div>
        <div class="end-quiz-title">${t('end.quizTitle')} &mdash; ${escapeHtml(this._moduleName)}</div>
        <div class="end-quiz-area"></div>
      `;
    }

    // Next lesson card (show even if not ready, with badge)
    if (this._nextAny) {
      const n = this._nextAny;
      if (n.ready) {
        html += `
          <div class="end-divider"></div>
          <a href="player.html?lesson=${n.id}" class="end-next-lesson">
            <div class="end-next-info">
              <div class="end-next-label">${t('end.nextLesson')} (#${n.num})</div>
              <div class="end-next-title">${escapeHtml(n.title)}</div>
            </div>
            <div class="end-next-arrow">&#8594;</div>
          </a>
        `;
      } else {
        html += `
          <div class="end-divider"></div>
          <div class="end-next-lesson end-next-upcoming">
            <div class="end-next-info">
              <div class="end-next-label">${t('end.nextLesson')} (#${n.num})</div>
              <div class="end-next-title">${escapeHtml(n.title)}</div>
            </div>
            <span class="end-next-badge">${t('end.upcoming')}</span>
          </div>
        `;
      }
    }

    html += `</div>`;
    this.el.innerHTML = html;

    // Bind replay
    this.el.querySelector('[data-action="replay"]')?.addEventListener('click', () => {
      this.hide();
      this.timeline.restart();
    });

    // Render first quiz question
    if (questions.length > 0) {
      this._renderQuizQuestion();
    }
  }

  _renderQuizQuestion(): void {
    const area = this.el.querySelector('.end-quiz-area') as HTMLElement | null;
    if (!area) return;

    const questions = this._questions;

    // All questions answered — show summary
    if (this._quizIdx >= questions.length) {
      const correct = this._quizResults.filter(r => r === 'correct').length;
      const total = questions.length;
      let msg = '';
      if (correct === total) msg = t('end.summaryExcellent');
      else if (correct >= total * 0.5) msg = t('end.summaryGood');
      else msg = t('end.summaryReview');

      area.innerHTML = `
        <div class="end-quiz-summary">
          <div class="score">${correct} / ${total}</div>
          <div class="msg">${msg}</div>
          <button class="end-btn end-btn-secondary" data-action="restart-quiz">${t('end.restartQuiz')}</button>
        </div>
      `;
      area.querySelector('[data-action="restart-quiz"]')!.addEventListener('click', () => {
        this._quizIdx = 0;
        this._quizResults = [];
        this._renderQuizQuestion();
      });
      return;
    }

    const q = questions[this._quizIdx];
    const hasKey = !!localStorage.getItem('anthropic-api-key');

    area.innerHTML = `
      <div class="end-quiz-progress">${t('end.quizProgress', this._quizIdx + 1, questions.length)}</div>
      <div class="end-quiz-question"></div>
      ${!hasKey ? `
        <div class="end-quiz-nokey">
          <span>${t('end.quizNoKey')}</span>
          <button data-action="open-settings">${t('end.quizConfigure')}</button>
        </div>
      ` : ''}
      <textarea class="end-quiz-textarea" placeholder="${t('end.quizPlaceholder')}"></textarea>
      <div class="end-quiz-actions">
        <button class="end-btn end-btn-primary" data-action="grade">${t('end.grade')}</button>
        <button class="end-btn end-btn-secondary" data-action="next-q" style="display:none">${t('end.nextQ')}</button>
        <span class="end-quiz-spinner" style="display:none"></span>
      </div>
      <div class="end-quiz-feedback"></div>
    `;

    // Render question with inline KaTeX
    const questionEl = area.querySelector('.end-quiz-question') as HTMLElement;
    questionEl.innerHTML = renderInlineKatex(q.q);

    const textarea = area.querySelector('.end-quiz-textarea') as HTMLTextAreaElement;
    const gradeBtn = area.querySelector('[data-action="grade"]') as HTMLButtonElement;
    const nextBtn = area.querySelector('[data-action="next-q"]') as HTMLButtonElement;
    const spinner = area.querySelector('.end-quiz-spinner') as HTMLElement;
    const feedbackEl = area.querySelector('.end-quiz-feedback') as HTMLElement;

    // Open settings
    area.querySelector('[data-action="open-settings"]')?.addEventListener('click', () => {
      document.getElementById('settings-modal')?.classList.add('open');
    });

    // Grade
    gradeBtn.addEventListener('click', async () => {
      const answer = textarea.value.trim();
      if (!answer) { textarea.focus(); return; }

      if (!localStorage.getItem('anthropic-api-key')) {
        document.getElementById('settings-modal')?.classList.add('open');
        return;
      }

      textarea.disabled = true;
      gradeBtn.disabled = true;
      gradeBtn.textContent = t('end.grading');
      spinner.style.display = 'inline-block';

      const verdict = await this._evaluateAnswer(q, answer, feedbackEl);
      spinner.style.display = 'none';

      if (verdict === null) {
        textarea.disabled = false;
        gradeBtn.disabled = false;
        gradeBtn.textContent = t('end.grade');
        return;
      }

      gradeBtn.textContent = t('end.graded');
      this._quizResults[this._quizIdx] = verdict;
      nextBtn.style.display = '';
      nextBtn.textContent = this._quizIdx < questions.length - 1 ? t('end.nextQ') : t('end.seeResult');
    });

    // Ctrl+Enter to submit
    textarea.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !gradeBtn.disabled) {
        gradeBtn.click();
      }
    });

    // Next question
    nextBtn.addEventListener('click', () => {
      this._quizIdx++;
      this._renderQuizQuestion();
    });

    textarea.focus();
  }

  async _evaluateAnswer(question: QuizQuestion, answer: string, feedbackEl: HTMLElement): Promise<string | null> {
    feedbackEl.className = 'end-quiz-feedback visible neutral';
    feedbackEl.innerHTML = '<div class="explanation"></div>';
    const explEl = feedbackEl.querySelector('.explanation') as HTMLElement;

    try {
      const result = await gradeAnswer({
        question: question.q,
        topic: question.topic,
        moduleName: this._moduleName,
        answer,
        onChunk: (cleanText) => {
          explEl.innerHTML = renderInlineKatex(cleanText);
        },
      });

      const verdictLabels: Record<string, string> = {
        correct: t('end.verdictCorrect'),
        incorrect: t('end.verdictImprove'),
        neutral: t('end.verdictReview'),
      };

      feedbackEl.className = `end-quiz-feedback visible ${result.verdict}`;
      feedbackEl.innerHTML = `<div class="verdict">${verdictLabels[result.verdict]}</div><div class="explanation">${renderInlineKatex(result.cleanText)}</div>`;

      return result.verdict;
    } catch (err: unknown) {
      feedbackEl.className = 'end-quiz-feedback visible neutral';
      const safeMsg = (err as Error).message.replace(/</g, '&lt;');
      feedbackEl.innerHTML = `<div class="verdict">${t('end.verdictError')}</div><div class="explanation">${safeMsg}</div>`;
      return null;
    }
  }

}
