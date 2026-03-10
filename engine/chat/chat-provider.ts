// Chat provider — abstract interface

import type { ChatMessage, ChatProvider } from '../types';

/**
 * No-op chat provider.
 */
export class DummyChatProvider implements ChatProvider {
  async *sendMessage(messages: ChatMessage[], system: string): AsyncGenerator<string> {
    yield 'Chat no configurado. Añade tu API key en Settings.';
  }
}
