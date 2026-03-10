// Math renderer — initializes KaTeX and provides the FormulaManager
import { FormulaManager, ensureKaTeX } from './animation/formula';

/**
 * Initialize the math rendering system.
 * Call once at startup, returns a FormulaManager.
 */
export async function initMathRenderer(overlay: HTMLElement): Promise<FormulaManager> {
  try {
    await ensureKaTeX();
  } catch (e) {
    console.warn('KaTeX could not be loaded, formulas will render as text:', e);
  }
  return new FormulaManager(overlay);
}
