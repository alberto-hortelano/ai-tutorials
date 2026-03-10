import { STORAGE_KEYS } from './engine/constants';

export type StoredBlock =
  | { type: 'question'; text: string }
  | { type: 'socratic'; text: string }
  | { type: 'answer'; html: string }
  | { type: 'chart'; width: number; height: number; drawCode: string }
  | { type: 'interactive'; src: string; title: string; width: number; height: number };

export interface ConversationMeta {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  blockCount: number;
}

const MAX_CONVERSATIONS = 20;
const TITLE_MAX_LEN = 60;

const { TUTOR_CONVERSATION, TUTOR_CONVERSATIONS_INDEX, TUTOR_ACTIVE_ID, TUTOR_CONVERSATION_PREFIX } = STORAGE_KEYS;

function convKey(id: string): string {
  return `${TUTOR_CONVERSATION_PREFIX}${id}`;
}

export class ConversationManager {
  private index: ConversationMeta[] = [];
  private activeId: string | null = null;
  private blocks: StoredBlock[] = [];
  private blockIdMap = new Map<string, number>();

  constructor() {
    this.migrate();
    this.loadIndex();
    this.loadActiveBlocks();
  }

  // ── Queries ──

  getIndex(): ConversationMeta[] { return this.index; }
  getActiveId(): string | null { return this.activeId; }
  getActiveBlocks(): StoredBlock[] { return this.blocks; }

  // ── Mutations ──

  saveBlock(block: StoredBlock, blockId?: string): void {
    if (!this.activeId) this.createFirst();
    const idx = this.blocks.length;
    this.blocks.push(block);
    if (blockId) this.blockIdMap.set(blockId, idx);
    this.persistBlocks();
    this.touchActive(block);
  }

  appendToBlock(blockId: string, html: string): void {
    const idx = this.blockIdMap.get(blockId);
    if (idx === undefined) return;
    const block = this.blocks[idx];
    if (block.type !== 'answer') return;
    block.html += html;
    this.persistBlocks();
  }

  newConversation(): string {
    // Don't archive an empty conversation — just reuse it
    if (this.activeId && this.blocks.length === 0) return this.activeId;

    const id = crypto.randomUUID();
    const meta: ConversationMeta = {
      id, title: '', createdAt: Date.now(), updatedAt: Date.now(), blockCount: 0,
    };
    this.index.unshift(meta);
    this.enforceLimit();
    this.activeId = id;
    this.blocks = [];
    this.blockIdMap.clear();
    localStorage.setItem(TUTOR_ACTIVE_ID, id);
    this.saveIndex();
    return id;
  }

  switchTo(id: string): StoredBlock[] {
    if (id === this.activeId) return this.blocks;
    this.activeId = id;
    localStorage.setItem(TUTOR_ACTIVE_ID, id);
    this.loadActiveBlocks();
    return this.blocks;
  }

  deleteConversation(id: string): void {
    this.index = this.index.filter(c => c.id !== id);
    localStorage.removeItem(convKey(id));
    this.saveIndex();

    if (id === this.activeId) {
      if (this.index.length > 0) {
        this.switchTo(this.index[0].id);
      } else {
        this.activeId = null;
        this.blocks = [];
        this.blockIdMap.clear();
        localStorage.removeItem(TUTOR_ACTIVE_ID);
      }
    }
  }

  clearActive(): void {
    this.blocks = [];
    this.blockIdMap.clear();
    if (this.activeId) {
      const meta = this.index.find(c => c.id === this.activeId);
      if (meta) {
        meta.blockCount = 0;
        meta.title = '';
        meta.updatedAt = Date.now();
        this.saveIndex();
      }
      this.persistBlocks();
    }
  }

  // ── Private ──

  private migrate(): void {
    if (localStorage.getItem(TUTOR_CONVERSATIONS_INDEX)) return;
    const raw = localStorage.getItem(TUTOR_CONVERSATION);
    if (!raw) return;
    try {
      const blocks: StoredBlock[] = JSON.parse(raw);
      if (!blocks.length) { localStorage.removeItem(TUTOR_CONVERSATION); return; }
      const id = crypto.randomUUID();
      const title = this.generateTitle(blocks);
      const meta: ConversationMeta = {
        id, title, createdAt: Date.now(), updatedAt: Date.now(), blockCount: blocks.length,
      };
      localStorage.setItem(convKey(id), raw);
      localStorage.setItem(TUTOR_CONVERSATIONS_INDEX, JSON.stringify([meta]));
      localStorage.setItem(TUTOR_ACTIVE_ID, id);
      localStorage.removeItem(TUTOR_CONVERSATION);
    } catch {
      localStorage.removeItem(TUTOR_CONVERSATION);
    }
  }

  private loadIndex(): void {
    try {
      this.index = JSON.parse(localStorage.getItem(TUTOR_CONVERSATIONS_INDEX) || '[]');
    } catch { this.index = []; }
    this.activeId = localStorage.getItem(TUTOR_ACTIVE_ID) || null;
  }

  private loadActiveBlocks(): void {
    this.blocks = [];
    this.blockIdMap.clear();
    if (!this.activeId) return;
    try {
      this.blocks = JSON.parse(localStorage.getItem(convKey(this.activeId)) || '[]');
    } catch { this.blocks = []; }
  }

  private createFirst(): void {
    const id = crypto.randomUUID();
    const meta: ConversationMeta = {
      id, title: '', createdAt: Date.now(), updatedAt: Date.now(), blockCount: 0,
    };
    this.index.unshift(meta);
    this.activeId = id;
    localStorage.setItem(TUTOR_ACTIVE_ID, id);
    this.saveIndex();
  }

  private persistBlocks(): void {
    if (!this.activeId) return;
    localStorage.setItem(convKey(this.activeId), JSON.stringify(this.blocks));
  }

  private touchActive(block: StoredBlock): void {
    const meta = this.index.find(c => c.id === this.activeId);
    if (!meta) return;
    meta.blockCount = this.blocks.length;
    meta.updatedAt = Date.now();
    if (!meta.title && block.type === 'question') {
      meta.title = this.generateTitle(this.blocks);
    }
    this.saveIndex();
  }

  private saveIndex(): void {
    localStorage.setItem(TUTOR_CONVERSATIONS_INDEX, JSON.stringify(this.index));
  }

  private enforceLimit(): void {
    while (this.index.length > MAX_CONVERSATIONS) {
      const oldest = this.index.pop()!;
      localStorage.removeItem(convKey(oldest.id));
    }
  }

  private generateTitle(blocks: StoredBlock[]): string {
    const first = blocks.find(b => b.type === 'question') as { type: 'question'; text: string } | undefined;
    if (!first) return '';
    const text = first.text.trim();
    return text.length > TITLE_MAX_LEN ? text.slice(0, TITLE_MAX_LEN) + '...' : text;
  }
}
