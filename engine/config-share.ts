/**
 * config-share.ts — Export/import API keys via encrypted URL + QR code.
 *
 * Export: Settings → "Share keys" → passphrase → encrypted URL + QR
 * Import: Scan QR → open URL → detect #config= → passphrase → decrypt → save
 */

import QRCode from 'qrcode';
import { encryptConfig, decryptConfig } from './config-crypto';
import { t } from './i18n';

/* ── Config keys — short aliases to minimize QR payload ── */

/** localStorage key → 1-char alias for compact encrypted payload */
const KEY_TO_ALIAS: Record<string, string> = {
  'openai-api-key': 'o',
  'elevenlabs-api-key': 'e',
  'anthropic-api-key': 'a',
};

/** Reverse: alias → localStorage key */
const ALIAS_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_TO_ALIAS).map(([k, v]) => [v, k]),
);

/** Friendly display names (keyed by alias) */
const ALIAS_LABELS: Record<string, string> = {
  o: 'OpenAI',
  e: 'ElevenLabs',
  a: 'Anthropic',
};

const HASH_PREFIX = '#c=';

/* ── Helpers ── */

/** Short fingerprint for debugging: "len:first4…last4" */
function blobFingerprint(b: string): string {
  if (b.length <= 10) return `${b.length}:${b}`;
  return `${b.length}:${b.slice(0, 4)}…${b.slice(-4)}`;
}

function gatherConfig(): Record<string, string> {
  const cfg: Record<string, string> = {};
  for (const [lsKey, alias] of Object.entries(KEY_TO_ALIAS)) {
    const val = localStorage.getItem(lsKey);
    if (val) cfg[alias] = val;
  }
  return cfg;
}

function createModal(): HTMLDivElement {
  const modal = document.createElement('div');
  modal.className = 'share-modal';
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  document.body.appendChild(modal);
  // Allow Escape to close
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
  return modal;
}

/* ── Export modal ── */

export async function showExportModal(): Promise<void> {
  const cfg = gatherConfig();
  if (Object.keys(cfg).length === 0) {
    alert(t('share.noKeys'));
    return;
  }

  const modal = createModal();
  const panel = document.createElement('div');
  panel.className = 'share-panel';
  modal.appendChild(panel);

  // Phase 1: ask for passphrase
  panel.innerHTML = `
    <h2>${t('share.exportTitle')}</h2>
    <label class="share-label">${t('share.passLabel')}</label>
    <input type="text" class="share-input" id="share-pass"
           placeholder="${t('share.passPlaceholder')}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
    <div class="share-btn-row">
      <button class="btn btn-secondary share-close-btn">${t('share.close')}</button>
      <button class="btn btn-primary" id="share-gen-btn">${t('share.generate')}</button>
    </div>
  `;

  panel.querySelector('.share-close-btn')!.addEventListener('click', () => modal.remove());

  const passInput = panel.querySelector('#share-pass') as HTMLInputElement;
  const genBtn = panel.querySelector('#share-gen-btn') as HTMLButtonElement;

  passInput.focus();
  passInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') genBtn.click();
  });

  genBtn.addEventListener('click', async () => {
    const passphrase = passInput.value.trim();
    if (!passphrase) {
      passInput.focus();
      return;
    }

    genBtn.disabled = true;
    genBtn.textContent = t('share.generating');

    try {
      const blob = await encryptConfig(cfg, passphrase);
      const defaultUrl = location.origin + location.pathname + HASH_PREFIX + blob;

      // Phase 2: show URL + QR
      panel.innerHTML = `
        <h2>${t('share.exportTitle')}</h2>
        <label class="share-label">${t('share.urlLabel')}</label>
        <div class="share-url-row">
          <textarea class="share-url-text" rows="3">${defaultUrl}</textarea>
          <button class="btn btn-secondary share-copy-btn">${t('share.copy')}</button>
        </div>
        <div class="share-qr-wrap">
          <h3>${t('share.qrTitle')}</h3>
          <canvas id="share-qr-canvas"></canvas>
        </div>
        <div class="share-reminder">${t('share.reminder')}</div>
        <div class="share-debug" style="font-family:monospace;font-size:11px;color:#94a3b8;margin-top:8px;">blob: ${blobFingerprint(blob)}</div>
        <div class="share-btn-row">
          <button class="btn btn-primary share-close-btn">${t('share.close')}</button>
        </div>
      `;

      panel.querySelector('.share-close-btn')!.addEventListener('click', () => modal.remove());

      const urlText = panel.querySelector('.share-url-text') as HTMLTextAreaElement;
      const qrCanvas = panel.querySelector('#share-qr-canvas') as HTMLCanvasElement;

      // Render QR for a given URL
      async function renderQR(url: string): Promise<void> {
        qrCanvas.getContext('2d')!.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
        await QRCode.toCanvas(qrCanvas, url, {
          width: 350,
          margin: 2,
          color: { dark: '#f8fafc', light: '#1e293b' },
          errorCorrectionLevel: 'L',
        });
      }

      // Copy button — copies current textarea content
      const copyBtn = panel.querySelector('.share-copy-btn') as HTMLButtonElement;
      copyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(urlText.value);
        copyBtn.textContent = t('share.copied');
        setTimeout(() => { copyBtn.textContent = t('share.copy'); }, 2000);
      });

      // Re-generate QR when URL is edited (debounced)
      let debounceTimer: ReturnType<typeof setTimeout>;
      urlText.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const val = urlText.value.trim();
          if (val) renderQR(val);
        }, 400);
      });

      // Initial QR
      await renderQR(defaultUrl);
    } catch (err) {
      genBtn.disabled = false;
      genBtn.textContent = t('share.generate');
      console.error('Config encryption failed:', err);
    }
  });
}

/* ── Import: detect #config= on page load ── */

export async function checkImportHash(): Promise<boolean> {
  const hash = location.hash;
  let blob: string;
  if (hash.startsWith(HASH_PREFIX)) {
    blob = hash.slice(HASH_PREFIX.length);
  } else if (hash.startsWith('#config=')) {
    blob = hash.slice('#config='.length); // backward compat
  } else {
    return false;
  }
  // Clean URL immediately
  history.replaceState(null, '', location.pathname + location.search);

  if (!blob) return false;

  return new Promise<boolean>((resolve) => {
    const modal = createModal();
    const panel = document.createElement('div');
    panel.className = 'share-panel';
    modal.appendChild(panel);

    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    function renderPassForm(errorMsg?: string): void {
      panel.innerHTML = `
        <h2>${t('share.importTitle')}</h2>
        <p class="share-import-msg">${t('share.importMsg')}</p>
        <div class="share-debug" style="font-family:monospace;font-size:11px;color:#94a3b8;margin-bottom:8px;">blob: ${blobFingerprint(blob)}</div>
        ${errorMsg ? `<div class="share-error">${errorMsg}</div>` : ''}
        <label class="share-label">${t('share.importPass')}</label>
        <input type="text" class="share-input" id="share-import-pass"
               placeholder="${t('share.importPassPlaceholder')}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        <div class="share-btn-row">
          <button class="btn btn-secondary share-dismiss-btn">${t('share.dismiss')}</button>
          <button class="btn btn-primary" id="share-decrypt-btn">${t('share.decrypt')}</button>
        </div>
      `;

      panel.querySelector('.share-dismiss-btn')!.addEventListener('click', () => {
        modal.remove();
        resolve(false);
      });

      const passInput = panel.querySelector('#share-import-pass') as HTMLInputElement;
      const decryptBtn = panel.querySelector('#share-decrypt-btn') as HTMLButtonElement;
      passInput.focus();

      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') decryptBtn.click();
      });

      decryptBtn.addEventListener('click', async () => {
        const passphrase = passInput.value.trim();
        if (!passphrase) {
          passInput.focus();
          return;
        }

        decryptBtn.disabled = true;
        decryptBtn.textContent = t('share.decrypting');

        try {
          const config = await decryptConfig(blob, passphrase);
          // Save all keys — resolve aliases to full localStorage keys
          const imported: string[] = [];
          for (const [k, v] of Object.entries(config)) {
            if (typeof v === 'string' && v) {
              const lsKey = ALIAS_TO_KEY[k] || k; // alias → full key, or keep as-is
              localStorage.setItem(lsKey, v);
              imported.push(ALIAS_LABELS[k] || k);
            }
          }
          renderSuccess(imported);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error('Decrypt failed:', err);
          attempts++;
          if (attempts >= MAX_ATTEMPTS) {
            panel.innerHTML = `
              <h2>${t('share.importTitle')}</h2>
              <div class="share-error">${t('share.tooManyAttempts')}</div>
              <div class="share-btn-row">
                <button class="btn btn-primary share-dismiss-btn">${t('share.dismiss')}</button>
              </div>
            `;
            panel.querySelector('.share-dismiss-btn')!.addEventListener('click', () => {
              modal.remove();
              resolve(false);
            });
          } else {
            renderPassForm(`${t('share.wrongPass')} [${errMsg}]`);
          }
        }
      });
    }

    function renderSuccess(imported: string[]): void {
      const list = imported.map(k => `<li>${k}</li>`).join('');
      panel.innerHTML = `
        <h2>${t('share.importTitle')}</h2>
        <div class="share-success">
          <p>${t('share.importSuccess')}</p>
          <ul class="share-success-list">${list}</ul>
        </div>
        <div class="share-btn-row">
          <button class="btn btn-secondary share-dismiss-btn">${t('share.dismiss')}</button>
          <button class="btn btn-primary share-reload-btn">${t('share.reload')}</button>
        </div>
      `;

      panel.querySelector('.share-dismiss-btn')!.addEventListener('click', () => {
        modal.remove();
        resolve(true);
      });

      panel.querySelector('.share-reload-btn')!.addEventListener('click', () => {
        location.reload();
      });
    }

    renderPassForm();
  });
}
