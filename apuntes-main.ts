import 'katex/dist/katex.min.css';
import { initOfflineBanner } from './engine/offline-banner';
import { APUNTES, type Apunte } from './apuntes-manifest';
import { initTopNav } from './engine/topnav';
import { NotesChatPanel } from './engine/notes-chat-panel';
import { AnthropicChatProvider } from './engine/chat/anthropic-provider';
import { DummyChatProvider } from './engine/chat/chat-provider';
import { STORAGE_KEYS } from './engine/constants';
import type { ChatProvider } from './engine/types';

// ── Offline banner ──
initOfflineBanner();

// ── Top navigation bar (inside .apuntes-wrap) ──
const topnav = initTopNav('apuntes', undefined, document.querySelector('.apuntes-wrap') as HTMLElement);
const topnavRight = topnav.querySelector('.topnav-right')!;

// Tutor chat button
const chatBtn = document.createElement('button');
chatBtn.className = 'topnav-icon-btn';
chatBtn.title = 'Tutor IA';
chatBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
topnavRight.appendChild(chatBtn);

// Notes sidebar toggle (right side, mobile only)
const sidebarToggleBtn = document.createElement('button');
sidebarToggleBtn.className = 'topnav-icon-btn sidebar-toggle';
sidebarToggleBtn.id = 'sidebar-toggle';
sidebarToggleBtn.innerHTML = '&#9776;';
sidebarToggleBtn.title = 'Apuntes';
topnavRight.appendChild(sidebarToggleBtn);

// ── Sidebar toggle for mobile ──
const apuntesSidebar = document.getElementById('apuntes-sidebar')!;
const sidebarOverlay = document.getElementById('sidebar-overlay')!;
function closeSidebar(): void { apuntesSidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }
sidebarToggleBtn.addEventListener('click', () => {
  const open = apuntesSidebar.classList.toggle('open');
  sidebarOverlay.classList.toggle('open', open);
});
sidebarOverlay.addEventListener('click', closeSidebar);

const sidebar = document.getElementById('sidebar-nav')!;
const contentEl = document.getElementById('apuntes-content')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;

let activeId: string | null = null;
let activeApunte: Apunte | null = null;
let activeMarkdown = '';

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

// ── Markdown rendering (lightweight, no dependency) ──
function renderMarkdown(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre><code class="language-${lang}">${escapeHtml(code.trimEnd())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr>');

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

  // Blockquotes (accumulator approach for consecutive lines)
  html = html.split('\n').reduce((acc: string[], line: string) => {
    const bqMatch = line.match(/^>\s?(.*)$/);
    const lastLine = acc[acc.length - 1] || '';
    if (bqMatch) {
      const content = bqMatch[1] || '';
      if (lastLine.endsWith('</blockquote>')) {
        acc[acc.length - 1] = lastLine.slice(0, -'</blockquote>'.length) + (content ? '<br>' + content : '<br>') + '</blockquote>';
      } else {
        acc.push(`<blockquote>${content}</blockquote>`);
      }
    } else {
      acc.push(line);
    }
    return acc;
  }, []).join('\n');

  // Tables
  html = renderTables(html);

  // Unordered lists
  html = renderLists(html);

  // Paragraphs (wrap remaining lines)
  html = html.replace(/^(?!<[a-z/])((?!\s*$).+)$/gm, '<p>$1</p>');

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

function renderTables(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let inTable = false;
  let headerDone = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if separator line
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        headerDone = true;
        continue;
      }
      if (!inTable) {
        result.push('<table>');
        inTable = true;
        headerDone = false;
      }
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      const tag = !headerDone ? 'th' : 'td';
      const row = cells.map(c => `<${tag}>${c}</${tag}>`).join('');
      result.push(`<tr>${row}</tr>`);
      if (!headerDone) headerDone = true;
    } else {
      if (inTable) {
        result.push('</table>');
        inTable = false;
        headerDone = false;
      }
      result.push(lines[i]);
    }
  }
  if (inTable) result.push('</table>');
  return result.join('\n');
}

function renderLists(html: string): string {
  const lines = html.split('\n');
  const result: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    const ulMatch = line.match(/^(\s*)[-*] (.+)$/);
    const olMatch = line.match(/^(\s*)\d+\. (.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        if (listType) result.push(`</${listType}>`);
        result.push('<ul>');
        listType = 'ul';
      }
      result.push(`<li>${ulMatch[2]}</li>`);
    } else if (olMatch) {
      if (listType !== 'ol') {
        if (listType) result.push(`</${listType}>`);
        result.push('<ol>');
        listType = 'ol';
      }
      result.push(`<li>${olMatch[2]}</li>`);
    } else {
      if (listType) { result.push(`</${listType}>`); listType = null; }
      result.push(line);
    }
  }
  if (listType) result.push(`</${listType}>`);
  return result.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Sidebar rendering ──
function renderSidebar(filter = ''): void {
  const lower = filter.toLowerCase();
  const filtered = lower
    ? APUNTES.filter(a => a.title.toLowerCase().includes(lower) || a.topic.toLowerCase().includes(lower))
    : APUNTES;

  // Group by topic
  const groups = new Map<string, Apunte[]>();
  for (const a of filtered) {
    if (!groups.has(a.topic)) groups.set(a.topic, []);
    groups.get(a.topic)!.push(a);
  }

  // Build id->title lookup for prereqs
  const titleById = new Map<string, string>();
  for (const a of APUNTES) titleById.set(a.id, a.title);

  sidebar.innerHTML = '';
  for (const [topic, items] of groups) {
    const topicEl = document.createElement('div');
    topicEl.className = 'sidebar-topic';
    topicEl.textContent = topic;
    sidebar.appendChild(topicEl);

    for (const item of items) {
      const el = document.createElement('a');
      el.className = 'sidebar-item' + (item.id === activeId ? ' active' : '');
      el.href = `#${item.id}`;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        loadApunte(item);
        closeSidebar();
      });
      const titleSpan = document.createElement('span');
      titleSpan.className = 'sidebar-item-title';
      titleSpan.textContent = item.title;
      el.appendChild(titleSpan);
      if (item.prereqs && item.prereqs.length > 0) {
        const prereqSpan = document.createElement('span');
        prereqSpan.className = 'sidebar-prereqs';
        const names = item.prereqs.map(id => titleById.get(id) || id);
        prereqSpan.textContent = `Requiere: ${names.join(', ')}`;
        el.appendChild(prereqSpan);
      }
      sidebar.appendChild(el);
    }
  }
}

// ── Load and render a single apunte ──
async function loadApunte(apunte: Apunte): Promise<void> {
  activeId = apunte.id;
  activeApunte = apunte;
  window.location.hash = apunte.id;
  renderSidebar(searchInput.value);

  contentEl.innerHTML = '<div class="apuntes-empty">Cargando...</div>';

  try {
    const resp = await fetch(import.meta.env.BASE_URL + apunte.path.replace(/^\//, ''));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const md = await resp.text();
    activeMarkdown = md;
    await ensureKaTeX();
    contentEl.innerHTML = renderMarkdown(md);
    runKaTeX(contentEl);
    contentEl.scrollTop = 0;
  } catch (e) {
    activeMarkdown = '';
    contentEl.innerHTML = `<div class="apuntes-empty">Error: ${(e as Error).message}</div>`;
  }
}

// ── Search ──
searchInput.addEventListener('input', () => {
  renderSidebar(searchInput.value);
});

// ── Hash routing ──
function loadFromHash(): void {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const apunte = APUNTES.find(a => a.id === hash);
    if (apunte) { loadApunte(apunte); return; }
  }
  contentEl.innerHTML = '<div class="apuntes-empty">Selecciona un apunte del menu lateral</div>';
}

// ── Chat panel (tutor with note context) ──
function createChatProvider(): ChatProvider {
  const key = localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY);
  if (key) return new AnthropicChatProvider({ apiKey: key });
  return new DummyChatProvider();
}

const chatPanel = new NotesChatPanel(
  document.getElementById('chat-panel')!,
  createChatProvider(),
  () => activeApunte
    ? { title: activeApunte.title, topic: activeApunte.topic, content: activeMarkdown }
    : null,
);
chatBtn.addEventListener('click', () => chatPanel.toggle());

// ── Init ──
renderSidebar();
loadFromHash();
window.addEventListener('hashchange', loadFromHash);
