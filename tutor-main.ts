import 'katex/dist/katex.min.css';
import { initOfflineBanner } from './engine/offline-banner';
import { colors, series } from './engine/shared/design-tokens';
import { WebSpeechProvider } from './engine/voice/web-speech-provider';
import { latexToSpeech } from './engine/voice/latex-to-speech';
import { ConversationManager, type StoredBlock } from './tutor-conversations';
import { initTopNav } from './engine/topnav';

// ── Offline banner ──
initOfflineBanner();

// ── Top navigation bar ──
const topnav = initTopNav('tutor', undefined, document.querySelector('.tutor-main') as HTMLElement);
const topnavRight = topnav.querySelector('.topnav-right')!;

// Conversations sidebar button
const sidebarBtn = document.createElement('button');
sidebarBtn.className = 'topnav-icon-btn';
sidebarBtn.id = 'btn-sidebar';
sidebarBtn.title = 'Conversations';
sidebarBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
topnavRight.appendChild(sidebarBtn);

// Voice button
const voiceBtnEl = document.createElement('button');
voiceBtnEl.className = 'topnav-icon-btn';
voiceBtnEl.id = 'btn-voice';
voiceBtnEl.title = 'Toggle voice';
voiceBtnEl.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
topnavRight.appendChild(voiceBtnEl);

// WS status dot
const statusDot = document.createElement('span');
statusDot.className = 'ws-status-dot';
statusDot.id = 'ws-status';
statusDot.title = 'Disconnected';
topnavRight.appendChild(statusDot);

// New conversation button
const newBtn = document.createElement('button');
newBtn.className = 'topnav-icon-btn';
newBtn.id = 'btn-new';
newBtn.title = 'New conversation';
newBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
topnavRight.appendChild(newBtn);

// Clear button
const clearBtn = document.createElement('button');
clearBtn.className = 'topnav-icon-btn';
clearBtn.id = 'btn-clear';
clearBtn.title = 'Clear';
clearBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
topnavRight.appendChild(clearBtn);

const content = document.getElementById('tutor-content')!;
let blockCounter = 0;

// ── Conversation manager ──
const manager = new ConversationManager();

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

// ── Voice ──
let voiceEnabled = false;
const speechProvider = new WebSpeechProvider({ rate: 1 });

voiceBtnEl.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  voiceBtnEl.classList.toggle('active', voiceEnabled);
  if (!voiceEnabled) speechProvider.stop();
});

function annotateKaTeXForVoice(el: HTMLElement): void {
  for (const katexEl of el.querySelectorAll('.katex')) {
    const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation?.textContent) {
      (katexEl as HTMLElement).dataset.voice = latexToSpeech(annotation.textContent);
    }
  }
}

function extractSpeakableText(el: HTMLElement): string {
  const parts: string[] = [];

  function walk(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.trim()) parts.push(text);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const htmlEl = node as HTMLElement;
    const tag = htmlEl.tagName.toLowerCase();
    if (tag === 'style' || tag === 'script') return;
    if (htmlEl.classList.contains('katex')) {
      const voice = htmlEl.dataset.voice;
      if (voice) parts.push(voice);
      return; // don't recurse into KaTeX internals
    }
    for (const child of htmlEl.childNodes) walk(child);
  }

  walk(el);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function speakBlock(blockId: string): void {
  if (!voiceEnabled) return;
  const el = document.getElementById(blockId);
  if (!el) return;
  const text = extractSpeakableText(el);
  if (text) speechProvider.speak(text);
}

// ── Empty state ──
function showEmpty(): void {
  content.innerHTML = '<div class="tutor-empty">Ask a question in the terminal.<br>Answers will appear here with rendered formulas and charts.</div>';
}

function clearEmpty(): void {
  const empty = content.querySelector('.tutor-empty');
  if (empty) empty.remove();
}

// ── Auto-scroll ──
function scrollToBottom(): void {
  content.scrollTop = content.scrollHeight;
}

// ── Rendering functions ──

function addQuestion(text: string): string {
  clearEmpty();
  const id = `tutor-block-${++blockCounter}`;
  const div = document.createElement('div');
  div.className = 'tutor-question';
  div.id = id;
  div.textContent = text;
  content.appendChild(div);
  scrollToBottom();
  return id;
}

function addTutorQuestion(text: string): string {
  clearEmpty();
  const id = `tutor-block-${++blockCounter}`;
  const div = document.createElement('div');
  div.className = 'tutor-socratic';
  div.id = id;
  div.textContent = text;
  content.appendChild(div);
  scrollToBottom();
  return id;
}

async function addAnswer(html: string): Promise<string> {
  clearEmpty();
  await ensureKaTeX();
  const id = `tutor-block-${++blockCounter}`;
  const div = document.createElement('div');
  div.className = 'tutor-answer';
  div.id = id;
  div.innerHTML = html;
  runKaTeX(div);
  annotateKaTeXForVoice(div);
  content.appendChild(div);
  scrollToBottom();
  return id;
}

// ── Math utilities for tutor_chart scope ──
const mathScope = {
  gaussian: (x: number, mu: number, sigma: number) => {
    const c = 1.0 / (sigma * Math.sqrt(2 * Math.PI));
    return c * Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
  },
  sigmoid: (x: number) => x >= 0 ? 1 / (1 + Math.exp(-x)) : Math.exp(x) / (1 + Math.exp(x)),
  lerp: (a: number, b: number, t: number) => a + (b - a) * t,
  clamp: (x: number, min: number, max: number) => Math.max(min, Math.min(max, x)),
};

function addChart(width: number, height: number, drawCode: string): string {
  clearEmpty();
  const id = `tutor-block-${++blockCounter}`;
  const wrap = document.createElement('div');
  wrap.className = 'tutor-chart';
  wrap.id = id;

  const canvas = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  wrap.appendChild(canvas);
  content.appendChild(wrap);

  try {
    const drawFn = new Function('ctx', 'canvas', 'w', 'h', 'colors', 'series', 'math', drawCode);
    drawFn(ctx, canvas, width, height, colors, series, mathScope);
  } catch (e) {
    console.error('Chart draw error:', e);
  }

  scrollToBottom();
  return id;
}

function addInteractive(src: string, title: string, width: number, height: number): string {
  clearEmpty();
  const id = `tutor-block-${++blockCounter}`;
  const wrap = document.createElement('div');
  wrap.className = 'tutor-interactive';
  wrap.id = id;

  const header = document.createElement('div');
  header.className = 'tutor-interactive-header';
  header.textContent = title;

  const iframe = document.createElement('iframe');
  iframe.className = 'tutor-interactive-frame';
  iframe.src = `/interactives/${src}`;
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.sandbox.add('allow-scripts', 'allow-same-origin');

  wrap.append(header, iframe);
  content.appendChild(wrap);
  scrollToBottom();
  return id;
}

async function appendToAnswer(blockId: string, html: string): Promise<string> {
  await ensureKaTeX();
  const el = document.getElementById(blockId);
  if (!el) { console.warn(`Block not found: ${blockId}`); return blockId; }
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  runKaTeX(fragment);
  annotateKaTeXForVoice(fragment);
  while (fragment.firstChild) {
    el.appendChild(fragment.firstChild);
  }
  scrollToBottom();
  return blockId;
}

function clear(): void {
  manager.clearActive();
  speechProvider.stop();
  content.innerHTML = '';
  showEmpty();
  renderSidebar();
}

// ── WebSocket client ──

const WS_PORT = 3636;
let ws: WebSocket | null = null;
let reconnectDelay = 1000;
const MAX_RECONNECT_DELAY = 8000;

function setStatus(connected: boolean): void {
  statusDot.classList.toggle('connected', connected);
  statusDot.title = connected ? 'Connected' : 'Disconnected';
}

function connectWs(): void {
  const url = `ws://localhost:${WS_PORT}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnectDelay = 1000;
    setStatus(true);
    console.log('[tutor] WebSocket connected');
    ws!.send(JSON.stringify({ type: 'hello' }));
  };

  ws.onclose = () => {
    setStatus(false);
    console.log(`[tutor] WebSocket closed, reconnecting in ${reconnectDelay}ms`);
    setTimeout(connectWs, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
  };

  ws.onerror = () => {
    // onclose will fire after this, triggering reconnect
  };

  ws.onmessage = async (event) => {
    try {
      const msg = JSON.parse(String(event.data));
      let blockId: string;

      switch (msg.type) {
        case 'question':
          blockId = addTutorQuestion(msg.text);
          manager.saveBlock({ type: 'socratic', text: msg.text }, blockId);
          renderSidebar();
          sendAck(msg.reqId, blockId);
          break;
        case 'answer':
          blockId = await addAnswer(msg.html);
          manager.saveBlock({ type: 'answer', html: msg.html }, blockId);
          renderSidebar();
          speakBlock(blockId);
          sendAck(msg.reqId, blockId);
          break;
        case 'chart':
          blockId = addChart(msg.width, msg.height, msg.drawCode);
          manager.saveBlock({ type: 'chart', width: msg.width, height: msg.height, drawCode: msg.drawCode }, blockId);
          renderSidebar();
          sendAck(msg.reqId, blockId);
          break;
        case 'interactive':
          blockId = addInteractive(msg.src, msg.title, msg.width ?? 800, msg.height ?? 500);
          manager.saveBlock({ type: 'interactive', src: msg.src, title: msg.title, width: msg.width ?? 800, height: msg.height ?? 500 }, blockId);
          renderSidebar();
          sendAck(msg.reqId, blockId);
          break;
        case 'append':
          blockId = await appendToAnswer(msg.blockId, msg.html);
          manager.appendToBlock(msg.blockId, msg.html);
          sendAck(msg.reqId, blockId);
          break;
        case 'clear':
          clear();
          sendAck(msg.reqId, '');
          break;
        case 'history_request': {
          const raw = JSON.stringify(manager.getActiveBlocks());
          sendAck(msg.reqId, raw);
          break;
        }
        default:
          sendError(msg.reqId, `Unknown message type: ${msg.type}`);
      }
    } catch (e) {
      try {
        const msg = JSON.parse(String(event.data));
        sendError(msg.reqId, (e as Error).message);
      } catch {
        // can't even parse reqId, nothing to ack
      }
    }
  };
}

function sendAck(reqId: string, blockId: string): void {
  ws?.send(JSON.stringify({ type: 'ack', reqId, blockId }));
}

function sendError(reqId: string, message: string): void {
  ws?.send(JSON.stringify({ type: 'error', reqId, message }));
}

// ── User input ──
const inputEl = document.getElementById('tutor-input') as HTMLInputElement;
const sendBtn = document.getElementById('btn-send')!;

function sendUserQuestion(): void {
  const text = inputEl.value.trim();
  if (!text) return;
  addQuestion(text);
  manager.saveBlock({ type: 'question', text });
  renderSidebar();
  ws?.send(JSON.stringify({ type: 'user_question', text }));
  inputEl.value = '';
}

inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendUserQuestion();
});
sendBtn.addEventListener('click', sendUserQuestion);

// ── Clear button ──
document.getElementById('btn-clear')!.addEventListener('click', () => clear());

// ── Restore conversation from manager ──
async function restoreBlocks(blocks: StoredBlock[]): Promise<void> {
  if (!blocks.length) return;
  await ensureKaTeX();
  for (const block of blocks) {
    switch (block.type) {
      case 'question': addQuestion(block.text); break;
      case 'socratic': addTutorQuestion(block.text); break;
      case 'answer': await addAnswer(block.html); break;
      case 'chart': addChart(block.width, block.height, block.drawCode); break;
      case 'interactive': addInteractive(block.src, block.title, block.width, block.height); break;
    }
  }
}

// ── Sidebar ──
const sidebar = document.getElementById('sidebar')!;
const sidebarOverlay = document.getElementById('sidebar-overlay')!;
const convList = document.getElementById('conversation-list')!;

function openSidebar(): void {
  sidebar.classList.add('open');
  sidebar.setAttribute('aria-hidden', 'false');
  sidebarOverlay.classList.add('visible');
}

function closeSidebar(): void {
  sidebar.classList.remove('open');
  sidebar.setAttribute('aria-hidden', 'true');
  sidebarOverlay.classList.remove('visible');
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function renderSidebar(): void {
  const index = manager.getIndex();
  const activeId = manager.getActiveId();
  if (!index.length) {
    convList.innerHTML = '<li class="conversation-list-empty">No conversations yet</li>';
    return;
  }
  convList.innerHTML = index.map(c => `
    <li class="conversation-item${c.id === activeId ? ' active' : ''}" data-id="${c.id}">
      <div class="conversation-item-text">
        <div class="conversation-item-title">${c.title || 'New conversation'}</div>
        <div class="conversation-item-meta">${relativeTime(c.updatedAt)}</div>
      </div>
      <button class="conversation-item-delete" data-delete="${c.id}" title="Delete">&times;</button>
    </li>
  `).join('');
}

async function switchConversation(id: string): Promise<void> {
  if (id === manager.getActiveId()) { closeSidebar(); return; }
  speechProvider.stop();
  content.innerHTML = '';
  const blocks = manager.switchTo(id);
  blockCounter = 0;
  if (blocks.length) {
    await restoreBlocks(blocks);
  } else {
    showEmpty();
  }
  renderSidebar();
  closeSidebar();
}

function startNewConversation(): void {
  manager.newConversation();
  speechProvider.stop();
  content.innerHTML = '';
  blockCounter = 0;
  showEmpty();
  renderSidebar();
}

// Sidebar event listeners
document.getElementById('btn-sidebar')!.addEventListener('click', openSidebar);
document.getElementById('btn-sidebar-close')!.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.getElementById('btn-new')!.addEventListener('click', startNewConversation);

convList.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const deleteBtn = target.closest('[data-delete]') as HTMLElement | null;
  if (deleteBtn) {
    e.stopPropagation();
    manager.deleteConversation(deleteBtn.dataset.delete!);
    if (!manager.getActiveId()) {
      content.innerHTML = '';
      blockCounter = 0;
      showEmpty();
    } else {
      content.innerHTML = '';
      blockCounter = 0;
      restoreBlocks(manager.getActiveBlocks()).then(() => {
        if (!manager.getActiveBlocks().length) showEmpty();
      });
    }
    renderSidebar();
    return;
  }
  const item = target.closest('[data-id]') as HTMLElement | null;
  if (item) switchConversation(item.dataset.id!);
});

// ── Click-to-copy LaTeX ──
content.addEventListener('click', (e) => {
  const katexEl = (e.target as HTMLElement).closest('.katex') as HTMLElement | null;
  if (!katexEl) return;
  const annotation = katexEl.querySelector('annotation[encoding="application/x-tex"]');
  if (!annotation?.textContent) return;
  const latex = annotation.textContent;
  navigator.clipboard.writeText(latex).then(() => {
    katexEl.classList.add('katex-copied');
    setTimeout(() => katexEl.classList.remove('katex-copied'), 1200);
  });
});

// ── Init ──
showEmpty();
restoreBlocks(manager.getActiveBlocks()).then(() => {
  if (manager.getActiveBlocks().length) {
    const empty = content.querySelector('.tutor-empty');
    if (empty) empty.remove();
  }
  renderSidebar();
  connectWs();
});
