// Shared KaTeX rendering utilities used by quiz grading (end-screen + index)

import { ensureKaTeX } from '../animation/formula';

// Cache the katex module once loaded
let _katex: any = null;

export async function getKatex(): Promise<any> {
  if (_katex) return _katex;
  try {
    await ensureKaTeX();
    _katex = (await import('katex')).default;
  } catch { /* KaTeX unavailable */ }
  return _katex;
}

/**
 * Replace $...$ with KaTeX-rendered spans.
 * Works with a pre-loaded katex instance or falls back to <em> tags.
 */
export function renderInlineKatex(text: string, katex?: any): string {
  const k = katex ?? _katex;
  if (!k) {
    return escapeHtml(text).replace(/\$([^$]+)\$/g, '<em>$1</em>');
  }
  return text.replace(/\$([^$]+)\$/g, (_: string, tex: string) => {
    const span = document.createElement('span');
    try {
      k.render(tex, span, { displayMode: false, throwOnError: false });
      return span.innerHTML;
    } catch {
      return `<em>${escapeHtml(tex)}</em>`;
    }
  });
}

/**
 * Escape HTML special characters for safe insertion.
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
