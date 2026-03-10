// Quiz grading service — streaming Anthropic API call with verdict extraction

import { prompt } from '../i18n';
import { VERDICT_RE, PARTIAL_RE, INCORRECT_RE, ALL_VERDICT_RE } from '../i18n';
import { STORAGE_KEYS, MODELS } from '../constants';
import type { Verdict, GradeResult } from './quiz-types';

export type { Verdict, GradeResult };

export interface GradeAnswerOpts {
  question: string;
  topic: string;
  moduleName: string;
  answer: string;
  /** Called on each streaming chunk with the full accumulated text (verdicts stripped). */
  onChunk?: (cleanText: string) => void;
}

/**
 * Grade a student answer via the Anthropic API (streaming).
 * Returns the verdict + clean explanation text, or null on failure.
 * Throws on network / API errors (caller should handle).
 */
export async function gradeAnswer(opts: GradeAnswerOpts): Promise<GradeResult> {
  const apiKey = localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY);
  if (!apiKey) throw new Error('No API key');

  const systemPrompt = prompt('gradeSystem');

  const userMsg = `${opts.moduleName}
${opts.topic}

${opts.question.replace(/\$([^$]+)\$/g, '$1')}

${opts.answer}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODELS.ANTHROPIC_CHAT,
      max_tokens: 512,
      system: systemPrompt,
      stream: true,
      messages: [{ role: 'user', content: userMsg }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  // Stream SSE
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!;

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') continue;
      try {
        const evt = JSON.parse(data);
        if (evt.type === 'content_block_delta' && evt.delta?.text) {
          fullText += evt.delta.text;
          if (opts.onChunk) {
            opts.onChunk(fullText.replace(ALL_VERDICT_RE, ''));
          }
        }
      } catch { /* skip malformed JSON */ }
    }
  }

  // Determine verdict
  let verdict: Verdict = 'neutral';
  if (VERDICT_RE.test(fullText)) verdict = 'correct';
  else if (PARTIAL_RE.test(fullText)) verdict = 'incorrect';
  else if (INCORRECT_RE.test(fullText)) verdict = 'incorrect';

  const cleanText = fullText.replace(ALL_VERDICT_RE, '');
  return { verdict, cleanText };
}
