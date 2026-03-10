/** Tiny offline/online status banner. */

let banner: HTMLDivElement | null = null;

function show(): void {
  if (banner) { banner.style.display = 'block'; return; }
  banner = document.createElement('div');
  banner.textContent = 'Sin conexión — modo offline';
  Object.assign(banner.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    zIndex: '9999',
    background: '#dc2626',
    color: '#fff',
    textAlign: 'center',
    padding: '4px 0',
    fontSize: '0.78rem',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '600',
  } as CSSStyleDeclaration);
  document.body.appendChild(banner);
}

function hide(): void {
  if (banner) banner.style.display = 'none';
}

export function initOfflineBanner(): void {
  if (!navigator.onLine) show();
  window.addEventListener('offline', show);
  window.addEventListener('online', hide);
}
