// Lightweight markdown → HTML converter for chat messages.
// Preserves $...$ and $$...$$ delimiters so KaTeX can process them afterwards.

import { escapeHtml } from './katex-utils';

/**
 * Convert basic markdown text to HTML.
 * Handles: code blocks (```), inline code (`), **bold**, *italic*,
 * unordered lists (- ), ordered lists (1. ), and paragraphs (\n\n).
 */
export function renderMarkdown(text: string): string {
  // 1. Extract code blocks and KaTeX blocks to protect them from processing
  const placeholders: string[] = [];

  function placeholder(content: string): string {
    const idx = placeholders.length;
    placeholders.push(content);
    return `\x00PH${idx}\x00`;
  }

  // Protect display math $$...$$
  let s = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) =>
    placeholder(`$$${tex}$$`)
  );

  // Protect inline math $...$
  s = s.replace(/\$([^\n$]+?)\$/g, (_, tex) =>
    placeholder(`$${tex}$`)
  );

  // Protect fenced code blocks ```...```
  s = s.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    placeholder(`<pre><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(code.replace(/\n$/, ''))}</code></pre>`)
  );

  // Protect inline code `...`
  s = s.replace(/`([^`\n]+)`/g, (_, code) =>
    placeholder(`<code>${escapeHtml(code)}</code>`)
  );

  // 2. Escape remaining HTML
  s = escapeHtml(s);

  // Restore placeholders (they were escaped too — fix the escaping)
  s = s.replace(/\x00PH(\d+)\x00/g, (_, idx) => placeholders[Number(idx)]);
  // Also handle the escaped version (escapeHtml encodes \x00 as-is since it's
  // done via textContent, but & entities might wrap — be safe)
  s = s.replace(/\0PH(\d+)\0/g, (_, idx) => placeholders[Number(idx)]);

  // 3. Bold & italic (after escaping so ** and * are still literal)
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 4. Split into blocks by double newline
  const blocks = s.split(/\n{2,}/);
  const html: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Already an HTML block (pre, code block placeholder)?
    if (trimmed.startsWith('<pre>') || trimmed.startsWith('<div')) {
      html.push(trimmed);
      continue;
    }

    // Unordered list
    const ulLines = trimmed.split('\n');
    if (ulLines.every(l => /^\s*[-*]\s/.test(l) || !l.trim())) {
      const items = ulLines
        .filter(l => l.trim())
        .map(l => `<li>${l.replace(/^\s*[-*]\s+/, '')}</li>`)
        .join('');
      html.push(`<ul>${items}</ul>`);
      continue;
    }

    // Ordered list
    if (ulLines.every(l => /^\s*\d+[.)]\s/.test(l) || !l.trim())) {
      const items = ulLines
        .filter(l => l.trim())
        .map(l => `<li>${l.replace(/^\s*\d+[.)]\s+/, '')}</li>`)
        .join('');
      html.push(`<ol>${items}</ol>`);
      continue;
    }

    // Regular paragraph — convert single newlines to <br>
    html.push(`<p>${trimmed.replace(/\n/g, '<br>')}</p>`);
  }

  return html.join('\n');
}
