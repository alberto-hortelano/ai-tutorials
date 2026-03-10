/**
 * Shared top navigation bar — injected into every page.
 *
 * Usage:  import { initTopNav } from './engine/topnav';
 *         initTopNav('index');          // highlights current page
 *         initTopNav('player', slot);   // with custom slot element
 */

import { getLang, setLang, t } from './i18n';

export type PageId = 'index' | 'player' | 'apuntes' | 'tutor';

const NAV_ITEMS: { id: PageId; href: string; i18nKey: string }[] = [
  { id: 'index',   href: './index.html',   i18nKey: 'nav.lessons' },
  { id: 'apuntes', href: './apuntes.html',  i18nKey: 'nav.notes' },
  { id: 'tutor',   href: './tutor.html',    i18nKey: 'nav.tutor' },
];

/**
 * Build and insert the top navigation bar.
 * @param currentPage  Which page is active (won't be a link)
 * @param slot         Optional HTMLElement to insert in the middle (e.g. lesson title)
 * @param container    Where to prepend the nav (defaults to document.body)
 * @returns The nav element, in case the caller needs to append extra buttons
 */
export function initTopNav(currentPage: PageId, slot?: HTMLElement, container?: HTMLElement): HTMLElement {
  const nav = document.createElement('div');
  nav.className = 'topnav';

  // Brand
  const brand = document.createElement('a');
  brand.className = 'topnav-brand';
  brand.href = './index.html';
  brand.textContent = 'XCS236';
  nav.appendChild(brand);

  // Hamburger (mobile)
  const hamburger = document.createElement('button');
  hamburger.className = 'topnav-icon-btn topnav-hamburger';
  hamburger.innerHTML = '&#9776;';
  hamburger.addEventListener('click', () => linksWrap.classList.toggle('open'));
  nav.appendChild(hamburger);

  // Nav links
  const linksWrap = document.createElement('div');
  linksWrap.className = 'topnav-links';
  for (const item of NAV_ITEMS) {
    const a = document.createElement('a');
    a.className = 'topnav-link' + (item.id === currentPage ? ' active' : '');
    a.href = item.href;
    a.textContent = t(item.i18nKey as any);
    // Close mobile menu on click
    a.addEventListener('click', () => linksWrap.classList.remove('open'));
    linksWrap.appendChild(a);
  }
  nav.appendChild(linksWrap);

  // Separator + slot (if provided)
  if (slot) {
    const sep = document.createElement('div');
    sep.className = 'topnav-sep';
    nav.appendChild(sep);
    slot.classList.add('topnav-slot');
    nav.appendChild(slot);
  }

  // Spacer
  const spacer = document.createElement('div');
  spacer.className = 'topnav-spacer';
  nav.appendChild(spacer);

  // Right section
  const right = document.createElement('div');
  right.className = 'topnav-right';

  // Language selector
  const langSelect = document.createElement('select');
  langSelect.className = 'topnav-lang';
  langSelect.innerHTML = '<option value="es">ES</option><option value="en">EN</option>';
  langSelect.value = getLang();
  langSelect.addEventListener('change', () => {
    setLang(langSelect.value);
    location.reload();
  });
  right.appendChild(langSelect);

  nav.appendChild(right);

  // Insert at top of container (or body)
  (container || document.body).prepend(nav);

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target as Node)) linksWrap.classList.remove('open');
  });

  return nav;
}
