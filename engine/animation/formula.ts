// Formula animation — appearance, highlighting of terms
import { easeOut, easeInOut, subProgress } from './tween';

/**
 * Manage KaTeX formula elements in the DOM overlay.
 * This module handles creating/positioning/animating KaTeX-rendered formulas
 * on top of the canvas.
 */

export interface FormulaItem {
  el: HTMLDivElement;
  latex: string | null;
}

export interface FormulaShowOptions {
  scale?: number;
  color?: string;
  displayMode?: boolean;
  fontSize?: string;
}

let katexLoaded: boolean = false;
let katexPromise: Promise<void> | null = null;

/** Ensure KaTeX is loaded (imported dynamically). */
export async function ensureKaTeX(): Promise<void> {
  if (katexLoaded) return;
  if (katexPromise) return katexPromise;
  katexPromise = (async () => {
    // KaTeX should be installed via npm
    const katexModule = await import('katex');
    // Attach to window so FormulaManager.show() can use it
    (window as any).katex = katexModule.default || katexModule;
    // Load CSS
    if (!document.querySelector('link[href*="katex"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/node_modules/katex/dist/katex.min.css';
      document.head.appendChild(link);
    }
    katexLoaded = true;
  })() as unknown as Promise<void>;
  return katexPromise;
}

/**
 * FormulaManager — creates and positions KaTeX formulas over the canvas.
 */
export class FormulaManager {
  overlay: HTMLElement;
  _items: Map<string, FormulaItem>;

  constructor(overlay: HTMLElement) {
    this.overlay = overlay;
    this._items = new Map();
  }

  /**
   * Show a formula at given position with animation.
   */
  show(id: string, latex: string, x: number, y: number, opacity: number, opts: FormulaShowOptions = {}): void {
    const { scale = 1, color = '#f8fafc', displayMode = true, fontSize = '1.2em' } = opts;

    let item = this._items.get(id);
    if (!item) {
      const el = document.createElement('div');
      el.className = 'katex-item';
      this.overlay.appendChild(el);
      item = { el, latex: null };
      this._items.set(id, item);
    }

    // Re-render if latex changed
    if (item.latex !== latex) {
      try {
        // Use the global katex if available, otherwise try to render via innerHTML
        if (window.katex) {
          window.katex.render(latex, item.el, { displayMode, throwOnError: false });
        } else {
          item.el.textContent = latex; // fallback
        }
      } catch (e) {
        console.warn(`[FormulaManager] KaTeX render failed for "${id}":`, e);
        item.el.textContent = latex;
      }
      item.latex = latex;
    }

    item.el.style.left = `${x}%`;
    item.el.style.top = `${y}%`;
    item.el.style.transform = `translate(-50%, -50%) scale(${scale})`;
    item.el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    item.el.style.color = color;
    item.el.style.fontSize = fontSize;
  }

  /** Hide a formula by id. */
  hide(id: string): void {
    const item = this._items.get(id);
    if (item) item.el.style.opacity = '0';
  }

  /** Remove all formulas. */
  clear(): void {
    for (const [, item] of this._items) {
      item.el.remove();
    }
    this._items.clear();
  }

  /** Remove a specific formula. */
  remove(id: string): void {
    const item = this._items.get(id);
    if (item) {
      item.el.remove();
      this._items.delete(id);
    }
  }
}

/**
 * Animate a formula appearing (fade + scale up).
 * Call this in scene.render() each frame.
 */
export function formulaAppear(fm: FormulaManager, id: string, latex: string, x: number, y: number, progress: number, opts: FormulaShowOptions = {}): void {
  const t = easeOut(Math.min(Math.max(progress, 0), 1));
  fm.show(id, latex, x, y, t, {
    ...opts,
    scale: 0.85 + 0.15 * t,
  });
}

/**
 * Animate formula disappearing.
 */
export function formulaDisappear(fm: FormulaManager, id: string, latex: string, x: number, y: number, progress: number, opts: FormulaShowOptions = {}): void {
  const t = 1 - easeOut(Math.min(Math.max(progress, 0), 1));
  fm.show(id, latex, x, y, t, {
    ...opts,
    scale: 0.85 + 0.15 * t,
  });
}
