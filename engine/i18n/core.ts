// i18n core — language management, translation lookup, DOM walker

import type { Lang } from '../types';
import { STORAGE_KEYS } from '../constants';
import { ui, type UiKey } from './strings-ui';
import { prompts, type PromptKey } from './strings-prompts';

const SUPPORTED: readonly Lang[] = ['es', 'en'];

export function getLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEYS.APP_LANG);
  return SUPPORTED.includes(stored as Lang) ? (stored as Lang) : 'es';
}

export function setLang(lang: string): void {
  if (SUPPORTED.includes(lang as Lang)) localStorage.setItem(STORAGE_KEYS.APP_LANG, lang);
}

/**
 * Translate a UI key, with optional $1/$2/... substitutions.
 * Falls back to Spanish if key is missing in current language.
 */
export function t(key: UiKey, ...args: (string | number)[]): string {
  const lang = getLang();
  let str: string = ui[lang]?.[key] ?? ui.es[key] ?? key;
  args.forEach((arg, i) => {
    str = str.replace(`$${i + 1}`, String(arg));
  });
  return str;
}

/**
 * Get a system prompt by key (e.g. 'chatSystem', 'gradeSystem').
 */
export function prompt(key: PromptKey): string {
  const lang = getLang();
  return prompts[lang]?.[key] ?? prompts.es[key] ?? '';
}

/**
 * Walk the DOM setting textContent / attributes from data-i18n* attributes.
 *   data-i18n="key"            -> el.textContent = t(key)
 *   data-i18n-placeholder="key" -> el.placeholder = t(key)
 *   data-i18n-title="key"      -> el.title = t(key)
 *   data-i18n-aria-label="key" -> el.setAttribute('aria-label', t(key))
 *   data-i18n-html="key"       -> el.innerHTML = t(key) (use sparingly)
 */
export function applyLang(root: Document | HTMLElement = document): void {
  root.querySelectorAll<HTMLElement>('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n! as UiKey);
  });
  root.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder! as UiKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle! as UiKey);
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel! as UiKey));
  });
  root.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml! as UiKey);
  });

  // Set html lang attribute
  document.documentElement.lang = getLang() === 'en' ? 'en' : 'es';
}
