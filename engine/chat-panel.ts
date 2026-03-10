// Chat panel — slide-in panel with AI chat, pauses timeline
import 'katex/dist/katex.min.css';
import { colors } from './shared/design-tokens';
import { t, prompt } from './i18n';
import { renderMarkdown } from './shared/markdown-light';
import type { ChatMessage, ChatProvider } from './types';
import type { Timeline } from './timeline';

// ── KaTeX lazy load (same pattern as tutor-main.ts) ──
let renderMathInElement: ((el: HTMLElement, opts: object) => void) | null = null;

async function ensureChatKaTeX(): Promise<void> {
  if (renderMathInElement) return;
  const mod = await import('katex/dist/contrib/auto-render.mjs');
  renderMathInElement = mod.default;
}

function runChatKaTeX(el: HTMLElement): void {
  if (!renderMathInElement) return;
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  });
}

export class ChatPanel {
  container: HTMLElement;
  timeline: Timeline;
  chatProvider: ChatProvider;
  _messages: ChatMessage[];
  _open: boolean;
  _streaming: boolean;
  messagesEl!: HTMLElement;
  inputEl!: HTMLTextAreaElement;
  sendBtn!: HTMLButtonElement;
  closeBtn!: HTMLButtonElement;

  constructor(container: HTMLElement, timeline: Timeline, chatProvider: ChatProvider) {
    this.container = container;
    this.timeline = timeline;
    this.chatProvider = chatProvider;
    this._messages = [];
    this._open = false;
    this._streaming = false;
    this._build();
    this._bind();
  }

  _build(): void {
    this.container.classList.add('chat-panel');
    this.container.innerHTML = `
      <div class="chat-header">
        <span class="chat-title">${t('chat.title')}</span>
        <button class="chat-close-btn" aria-label="${t('chat.close')}">&times;</button>
      </div>
      <div class="chat-messages" aria-live="polite"></div>
      <div class="chat-input-wrap">
        <textarea class="chat-input" placeholder="${t('chat.placeholder')}" rows="2"></textarea>
        <button class="chat-send-btn" aria-label="${t('chat.send')}">${t('chat.send')}</button>
      </div>
    `;

    this.messagesEl = this.container.querySelector('.chat-messages') as HTMLElement;
    this.inputEl = this.container.querySelector('.chat-input') as HTMLTextAreaElement;
    this.sendBtn = this.container.querySelector('.chat-send-btn') as HTMLButtonElement;
    this.closeBtn = this.container.querySelector('.chat-close-btn') as HTMLButtonElement;
  }

  _bind(): void {
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this._send());
    this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this._send();
      }
    });
  }

  open(): void {
    this._open = true;
    this.container.classList.add('open');
    this.timeline.pause();
    this.inputEl.focus();
    this._notifyResize();
  }

  close(): void {
    this._open = false;
    this.container.classList.remove('open');
    this._notifyResize();
  }

  /** Trigger a window resize after the CSS transition so the canvas redraws */
  _notifyResize(): void {
    setTimeout(() => window.dispatchEvent(new Event('resize')), 350);
  }

  toggle(): void {
    this._open ? this.close() : this.open();
  }

  get isOpen(): boolean { return this._open; }

  async _send(): Promise<void> {
    const text = this.inputEl.value.trim();
    if (!text || this._streaming) return;

    this.inputEl.value = '';
    this._addMessage('user', text);

    // Build system prompt with scene context
    const scene = this.timeline.currentScene;
    let system = prompt('chatSystem');
    if (scene) {
      system += `\n\n${t('chat.context')}`;
      system += `\n- ${t('chat.scene')}: "${scene.id}"`;
      if (scene.topic) system += `\n- ${t('chat.topic')}: ${scene.topic}`;
      if (scene.narration) system += `\n- ${t('chat.narration')}: ${scene.narration}`;
    }

    // Build messages array for API
    const apiMessages: ChatMessage[] = this._messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Stream response
    this._streaming = true;
    const assistantEl = this._addMessage('assistant', '');
    const contentEl = assistantEl.querySelector('.chat-msg-content') as HTMLElement;
    contentEl.classList.add('streaming');

    let fullText = '';
    try {
      for await (const chunk of this.chatProvider.sendMessage(apiMessages, system)) {
        fullText += chunk;
        contentEl.textContent = fullText;
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      }
    } catch (e: unknown) {
      fullText += `\n[Error: ${(e as Error).message}]`;
      contentEl.textContent = fullText;
    }

    // Render rich content now that streaming is done
    contentEl.classList.remove('streaming');
    await this._renderRich(contentEl, fullText);

    // Update stored message
    this._messages[this._messages.length - 1].content = fullText;
    this._streaming = false;
  }

  _addMessage(role: ChatMessage['role'], content: string): HTMLElement {
    this._messages.push({ role, content });
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${role}`;
    el.innerHTML = `<div class="chat-msg-content"></div>`;
    const contentEl = el.querySelector('.chat-msg-content') as HTMLElement;

    if (role === 'assistant' && content) {
      // Existing assistant message — render rich immediately
      this._renderRich(contentEl, content);
    } else {
      contentEl.textContent = content;
    }

    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return el;
  }

  async _renderRich(el: HTMLElement, text: string): Promise<void> {
    await ensureChatKaTeX();
    el.classList.add('rendered');
    el.innerHTML = renderMarkdown(text);
    runChatKaTeX(el);
  }
}
