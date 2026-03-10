import { randomUUID } from 'node:crypto';
import { WebSocketServer, WebSocket as WsWebSocket, type WebSocket } from 'ws';
import type { AckMsg, ClientMsg, PeerMsg, ServerMsg } from './protocol.js';

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type ServerMsgBody = DistributiveOmit<ServerMsg, 'reqId'>;

const PORT = Number(process.env.TUTOR_WS_PORT) || 3636;
const ACK_TIMEOUT_MS = 10_000;

interface PendingRequest {
  resolve: (ack: AckMsg) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class WsBridge {
  private wss: WebSocketServer;
  private client: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();

  // Question queue: browser pushes, tutor_listen pops
  private questionQueue: string[] = [];
  private questionWaiter: ((text: string) => void) | null = null;

  private constructor(wss: WebSocketServer) {
    this.wss = wss;

    this.wss.on('connection', (ws) => {
      ws.once('message', (raw) => {
        try {
          const msg: PeerMsg = JSON.parse(String(raw));
          if (msg.type === 'takeover') {
            console.error('[tutor-mcp] takeover requested — shutting down');
            this.shutdown();
            return;
          }
        } catch {
          // Not a peer message — fall through to treat as normal client
        }

        // Normal browser client — process the first message and wire up
        this.setupClient(ws);
        this.handleClientMessage(ws, raw);
      });
    });

    console.error(`[tutor-mcp] WebSocket server listening on ws://localhost:${PORT}`);
  }

  /** Factory: bind the port, performing takeover if needed. */
  static async create(): Promise<WsBridge> {
    try {
      const wss = await WsBridge.tryBind();
      return new WsBridge(wss);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') throw err;

      console.error(`[tutor-mcp] port ${PORT} in use — requesting takeover`);
      await WsBridge.requestTakeover();

      const wss = await WsBridge.tryBind();
      return new WsBridge(wss);
    }
  }

  /** Try to bind a WebSocketServer to PORT. */
  private static tryBind(): Promise<WebSocketServer> {
    return new Promise((resolve, reject) => {
      const wss = new WebSocketServer({ port: PORT });
      wss.once('listening', () => resolve(wss));
      wss.once('error', (err) => reject(err));
    });
  }

  /** Connect to the existing server, send takeover, wait for it to close. */
  private static requestTakeover(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WsWebSocket(`ws://localhost:${PORT}`);
      ws.once('open', () => {
        ws.send(JSON.stringify({ type: 'takeover' }));
      });
      ws.once('close', () => {
        // Give the OS a moment to release the port
        setTimeout(resolve, 200);
      });
      ws.once('error', (err) => reject(err));
    });
  }

  private setupClient(ws: WebSocket): void {
    this.client = ws;
    console.error(`[tutor-mcp] browser connected (port ${PORT})`);

    ws.on('message', (raw) => this.handleClientMessage(ws, raw));

    ws.on('close', () => {
      if (this.client === ws) {
        this.client = null;
        console.error('[tutor-mcp] browser disconnected');
      }
    });
  }

  private handleClientMessage(ws: WebSocket, raw: unknown): void {
    try {
      const msg: ClientMsg = JSON.parse(String(raw));

      if (msg.type === 'user_question') {
        this.enqueueQuestion(msg.text);
        return;
      }

      const req = this.pending.get(msg.reqId);
      if (!req) return;
      this.pending.delete(msg.reqId);
      clearTimeout(req.timer);

      if (msg.type === 'ack') {
        req.resolve(msg);
      } else {
        req.reject(new Error(msg.message));
      }
    } catch {
      // ignore malformed messages
    }
  }

  /** Close all connections and the server. */
  private shutdown(): void {
    // Reject all pending requests
    for (const [reqId, req] of this.pending) {
      clearTimeout(req.timer);
      req.reject(new Error('Server shutting down (takeover)'));
      this.pending.delete(reqId);
    }

    // Reject waiting question listener
    if (this.questionWaiter) {
      this.questionWaiter = null;
    }

    // Close all connected clients
    for (const ws of this.wss.clients) {
      ws.close();
    }

    this.client = null;
    this.wss.close();
  }

  private enqueueQuestion(text: string): void {
    if (this.questionWaiter) {
      const resolve = this.questionWaiter;
      this.questionWaiter = null;
      resolve(text);
    } else {
      this.questionQueue.push(text);
    }
  }

  /** Block until a user question arrives from the browser. */
  waitForQuestion(): Promise<string> {
    const queued = this.questionQueue.shift();
    if (queued !== undefined) return Promise.resolve(queued);

    return new Promise((resolve) => {
      this.questionWaiter = resolve;
    });
  }

  get connected(): boolean {
    return this.client !== null && this.client.readyState === this.client.OPEN;
  }

  /** Send a message and wait for the browser's ack. */
  send(msg: ServerMsgBody): Promise<AckMsg> {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('No browser connected. Open tutor.html in the dev server first.'));
        return;
      }

      const reqId = randomUUID();
      const fullMsg = { ...msg, reqId } as ServerMsg;

      const timer = setTimeout(() => {
        this.pending.delete(reqId);
        reject(new Error(`Timed out waiting for browser ack (reqId: ${reqId})`));
      }, ACK_TIMEOUT_MS);

      this.pending.set(reqId, { resolve, reject, timer });
      this.client!.send(JSON.stringify(fullMsg));
    });
  }
}
