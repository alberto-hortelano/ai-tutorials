// Anthropic Claude API chat provider (streaming SSE)

import type { ChatMessage, ChatProvider } from '../types';
import { STORAGE_KEYS, MODELS } from '../constants';

interface AnthropicOpts {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export class AnthropicChatProvider implements ChatProvider {
  apiKey: string;
  model: string;
  maxTokens: number;

  constructor(opts: AnthropicOpts = {}) {
    this.apiKey = opts.apiKey || localStorage.getItem(STORAGE_KEYS.ANTHROPIC_API_KEY) || '';
    this.model = opts.model || MODELS.ANTHROPIC_CHAT;
    this.maxTokens = opts.maxTokens || 1024;
  }

  /**
   * Send messages to Claude API with streaming.
   */
  async *sendMessage(messages: ChatMessage[], system: string): AsyncGenerator<string> {
    if (!this.apiKey) {
      yield 'API key de Anthropic no configurada. Ve a Settings para añadirla.';
      return;
    }

    const body = {
      model: this.model,
      max_tokens: this.maxTokens,
      system,
      messages,
    };

    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ ...body, stream: true }),
      });
    } catch (e: unknown) {
      yield `Error de conexión: ${(e as Error).message}`;
      return;
    }

    if (!response.ok) {
      const text = await response.text();
      yield `Error API (${response.status}): ${text}`;
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop()!; // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const event = JSON.parse(data);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            yield event.delta.text;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }
}
