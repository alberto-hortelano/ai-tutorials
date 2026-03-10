import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { WsBridge } from './ws-bridge.js';

async function main() {
  const bridge = await WsBridge.create();

  const server = new McpServer({
    name: 'tutor',
    version: '1.0.0',
  });

  server.tool(
    'tutor_question',
    'Show a question bubble in the tutor companion page',
    { text: z.string().describe('The question text to display') },
    async ({ text }) => {
      try {
        const ack = await bridge.send({ type: 'question', text });
        return { content: [{ type: 'text', text: `block: ${ack.blockId}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_answer',
    'Show an answer block with HTML and KaTeX math rendering in the tutor companion page',
    { html: z.string().describe('HTML content (supports KaTeX: $...$ for inline, $$...$$ for display math)') },
    async ({ html }) => {
      try {
        const ack = await bridge.send({ type: 'answer', html });
        return { content: [{ type: 'text', text: `block: ${ack.blockId}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_chart',
    'Draw a canvas chart in the tutor companion page. drawCode receives (ctx, canvas, w, h, colors, series).',
    {
      drawCode: z.string().describe('JS code body executed with (ctx, canvas, w, h, colors, series) in scope'),
      width: z.number().optional().default(600).describe('Chart width in CSS pixels'),
      height: z.number().optional().default(350).describe('Chart height in CSS pixels'),
    },
    async ({ drawCode, width, height }) => {
      try {
        const ack = await bridge.send({ type: 'chart', width, height, drawCode });
        return { content: [{ type: 'text', text: `block: ${ack.blockId}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_append',
    'Append HTML content to an existing answer block (for streaming or incremental updates)',
    {
      blockId: z.string().describe('The block ID returned by tutor_answer'),
      html: z.string().describe('HTML to append (supports KaTeX math)'),
    },
    async ({ blockId, html }) => {
      try {
        const ack = await bridge.send({ type: 'append', blockId, html });
        return { content: [{ type: 'text', text: `block: ${ack.blockId}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_interactive',
    'Embed an interactive HTML visualization in the tutor chat. The interactive is loaded from /interactives/<src>.',
    {
      src: z.string().describe('Interactive filename (e.g. "discriminador_optimo.html"). See registry.json for available interactives.'),
      title: z.string().describe('Title shown above the interactive'),
      width: z.number().optional().default(800).describe('Width in CSS pixels'),
      height: z.number().optional().default(500).describe('Height in CSS pixels'),
    },
    async ({ src, title, width, height }) => {
      try {
        const ack = await bridge.send({ type: 'interactive', src, title, width, height });
        return { content: [{ type: 'text', text: `block: ${ack.blockId}` }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_history',
    'Retrieve the conversation history stored in the browser. Returns JSON array of blocks with types: question, socratic, answer, chart.',
    {},
    async () => {
      try {
        const ack = await bridge.send({ type: 'history_request' });
        return { content: [{ type: 'text', text: ack.blockId }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_listen',
    'Block until the user types a question in the tutor browser page. Returns the question text. Use this in a loop to run an interactive tutor session.',
    {},
    async () => {
      try {
        const text = await bridge.waitForQuestion();
        return { content: [{ type: 'text', text }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  server.tool(
    'tutor_clear',
    'Clear all content from the tutor companion page',
    {},
    async () => {
      try {
        await bridge.send({ type: 'clear' });
        return { content: [{ type: 'text', text: 'Cleared.' }] };
      } catch (e) {
        return { content: [{ type: 'text', text: (e as Error).message }], isError: true };
      }
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[tutor-mcp] MCP server running on stdio');
}

main().catch((e) => {
  console.error('[tutor-mcp] Fatal:', e);
  process.exit(1);
});
