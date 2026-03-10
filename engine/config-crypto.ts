/**
 * config-crypto.ts — Encrypt/decrypt config objects with AES-GCM + PBKDF2.
 * Pure Web Crypto API, zero external dependencies.
 *
 * Binary format: [salt:16][iv:12][ciphertext+tag] → base64url
 */

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

/* ── base64url helpers ── */

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (base64.length % 4)) % 4;
  const binary = atob(base64 + '='.repeat(pad));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* ── Key derivation ── */

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/* ── Public API ── */

export async function encryptConfig(
  config: Record<string, string>,
  passphrase: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);

  const plaintext = new TextEncoder().encode(JSON.stringify(config));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  // Concatenate: salt | iv | ciphertext+tag
  const blob = new Uint8Array(SALT_BYTES + IV_BYTES + ciphertext.byteLength);
  blob.set(salt, 0);
  blob.set(iv, SALT_BYTES);
  blob.set(new Uint8Array(ciphertext), SALT_BYTES + IV_BYTES);

  return toBase64Url(blob.buffer);
}

export async function decryptConfig(
  blob: string,
  passphrase: string,
): Promise<Record<string, string>> {
  const data = fromBase64Url(blob);
  if (data.length < SALT_BYTES + IV_BYTES + 1) {
    throw new Error('Invalid encrypted data');
  }

  const salt = data.slice(0, SALT_BYTES);
  const iv = data.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ciphertext = data.slice(SALT_BYTES + IV_BYTES);
  const key = await deriveKey(passphrase, salt);

  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
