/**
 * Chat panel for the Apuntes page — same look as the player chat,
 * but gets context from the currently loaded note instead of a Timeline.
 */
import 'katex/dist/katex.min.css';
import { t, prompt } from './i18n';
import { renderMarkdown } from './shared/markdown-light';
import type { ChatMessage, ChatProvider } from './types';

// ── KaTeX lazy load ──
let renderMathInElement: ((el: HTMLElement, opts: object) => void) | null = null;

async function ensureKaTeX(): Promise<void> {
  if (renderMathInElement) return;
  const mod = await import('katex/dist/contrib/auto-render.mjs');
  renderMathInElement = mod.default;
}

function runKaTeX(el: HTMLElement): void {
  if (!renderMathInElement) return;
  renderMathInElement(el, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  });
}

export type ContextFn = () => { title: string; topic: string; content: string } | null;

export class NotesChatPanel {
  private container: HTMLElement;
  private chatProvider: ChatProvider;
  private getContext: ContextFn;
  private messages: ChatMessage[] = [];
  private _open = false;
  private _streaming = false;
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;
  private closeBtn!: HTMLButtonElement;

  constructor(container: HTMLElement, chatProvider: ChatProvider, getContext: ContextFn) {
    this.container = container;
    this.chatProvider = chatProvider;
    this.getContext = getContext;
    this.build();
    this.bind();
  }

  private build(): void {
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

  private bind(): void {
    this.closeBtn.addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.send());
    this.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.send();
      }
    });
  }

  open(): void {
    this._open = true;
    this.container.classList.add('open');
    this.inputEl.focus();
  }

  close(): void {
    this._open = false;
    this.container.classList.remove('open');
  }

  toggle(): void {
    this._open ? this.close() : this.open();
  }

  get isOpen(): boolean { return this._open; }

  private async send(): Promise<void> {
    const text = this.inputEl.value.trim();
    if (!text || this._streaming) return;

    this.inputEl.value = '';
    this.addMessage('user', text);

    // Build system prompt with note context
    let system = prompt('chatSystem');
    const ctx = this.getContext();
    if (ctx) {
      system += `\n\nEl estudiante está leyendo los apuntes de "${ctx.title}" (tema: ${ctx.topic}).`;
      system += `\nContenido del apunte (primeros 2000 caracteres):\n${ctx.content.slice(0, 2000)}`;
    }

    const apiMessages: ChatMessage[] = this.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    this._streaming = true;
    const assistantEl = this.addMessage('assistant', '');
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

    contentEl.classList.remove('streaming');
    await this.renderRich(contentEl, fullText);
    this.messages[this.messages.length - 1].content = fullText;
    this._streaming = false;
  }

  private addMessage(role: ChatMessage['role'], content: string): HTMLElement {
    this.messages.push({ role, content });
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg-${role}`;
    el.innerHTML = '<div class="chat-msg-content"></div>';
    const contentEl = el.querySelector('.chat-msg-content') as HTMLElement;

    if (role === 'assistant' && content) {
      this.renderRich(contentEl, content);
    } else {
      contentEl.textContent = content;
    }

    this.messagesEl.appendChild(el);
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    return el;
  }

  private async renderRich(el: HTMLElement, text: string): Promise<void> {
    await ensureKaTeX();
    el.classList.add('rendered');
    el.innerHTML = renderMarkdown(text);
    runKaTeX(el);
  }
}
