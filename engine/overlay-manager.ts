// OverlayManager — manages DOM overlays for questions and interactive iframes
import type { QuestionData, InteractiveHtmlData } from './types';
import { t } from './i18n';

export class OverlayManager {
  container: HTMLElement;
  _current: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  showQuestion(data: QuestionData, onDone: () => void): void {
    this.dismiss();
    const card = document.createElement('div');
    card.className = 'interaction-overlay interaction-question';

    const q = document.createElement('p');
    q.className = 'interaction-question-text';
    q.textContent = data.question;
    card.appendChild(q);

    const feedback = document.createElement('div');
    feedback.className = 'interaction-feedback';
    feedback.style.display = 'none';

    if (data.choices && data.choices.length > 0) {
      // Multiple choice
      const choicesWrap = document.createElement('div');
      choicesWrap.className = 'interaction-choices';
      data.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'interaction-choice-btn';
        btn.textContent = choice;
        btn.addEventListener('click', () => {
          // Disable all choice buttons
          choicesWrap.querySelectorAll('button').forEach(b => {
            (b as HTMLButtonElement).disabled = true;
            b.classList.remove('selected', 'correct', 'incorrect');
          });
          if (data.correctIndex !== undefined) {
            if (i === data.correctIndex) {
              btn.classList.add('correct');
              feedback.innerHTML = `<span class="interaction-correct">${t('interaction.correct')}</span>`;
            } else {
              btn.classList.add('incorrect');
              const correctBtn = choicesWrap.children[data.correctIndex] as HTMLElement;
              if (correctBtn) correctBtn.classList.add('correct');
              feedback.innerHTML = `<span class="interaction-incorrect">${t('interaction.incorrect')}</span>`;
            }
          }
          if (data.explanation) {
            feedback.innerHTML += `<p class="interaction-explanation">${data.explanation}</p>`;
          }
          feedback.style.display = 'block';
          continueBtn.style.display = 'inline-block';
        });
        choicesWrap.appendChild(btn);
      });
      card.appendChild(choicesWrap);
    }

    if (data.hint) {
      const hintEl = document.createElement('p');
      hintEl.className = 'interaction-hint';
      hintEl.textContent = `${t('interaction.hint')}: ${data.hint}`;
      card.appendChild(hintEl);
    }

    card.appendChild(feedback);

    const continueBtn = document.createElement('button');
    continueBtn.className = 'interaction-continue-btn';
    continueBtn.textContent = t('interaction.continue');
    continueBtn.style.display = data.choices && data.choices.length > 0 ? 'none' : 'inline-block';
    continueBtn.addEventListener('click', () => {
      this.dismiss();
      onDone();
    });
    card.appendChild(continueBtn);

    // Skip button
    const skipBtn = document.createElement('button');
    skipBtn.className = 'interaction-skip-btn';
    skipBtn.textContent = t('interaction.skip');
    skipBtn.addEventListener('click', () => {
      this.dismiss();
      onDone();
    });
    card.appendChild(skipBtn);

    this._current = card;
    this.container.appendChild(card);
  }

  showInteractiveHtml(data: InteractiveHtmlData, onDone: () => void): void {
    this.dismiss();
    const wrap = document.createElement('div');
    wrap.className = 'interaction-overlay interaction-iframe-wrap';

    // Title bar
    const titleBar = document.createElement('div');
    titleBar.className = 'interaction-iframe-titlebar';

    const titleText = document.createElement('span');
    titleText.textContent = data.title || t('interaction.exploreTitle');
    titleBar.appendChild(titleText);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'interaction-iframe-close';
    closeBtn.textContent = t('interaction.closeInteractive');
    closeBtn.addEventListener('click', () => {
      this.dismiss();
      onDone();
    });
    titleBar.appendChild(closeBtn);
    wrap.appendChild(titleBar);

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'interaction-iframe';
    iframe.src = data.src;
    iframe.sandbox.add('allow-scripts', 'allow-same-origin');
    wrap.appendChild(iframe);

    this._current = wrap;
    this.container.appendChild(wrap);
  }

  dismiss(): void {
    if (this._current) {
      this._current.remove();
      this._current = null;
    }
  }
}
