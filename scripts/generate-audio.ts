#!/usr/bin/env tsx
// Pre-generate ElevenLabs audio files for all lesson narrations (Spanish).
// Usage: ELEVENLABS_API_KEY=... npx tsx scripts/generate-audio.ts [--dry-run] [--lesson <id>] [--force]

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ── Shim browser globals so lesson text.ts imports work in Node ──

const _storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => _storage.get(k) ?? null,
  setItem: (k: string, v: string) => _storage.set(k, v),
  removeItem: (k: string) => _storage.delete(k),
  clear: () => _storage.clear(),
  get length() { return _storage.size; },
  key: () => null,
};
if (typeof (globalThis as any).document === 'undefined') {
  (globalThis as any).document = { documentElement: { lang: 'es' } };
}

// ── Constants ──

const MODEL_ID = 'eleven_multilingual_v2';
const VOICE_ID = 'ZCh4e9eZSUf41K4cmCEL';
const STABILITY = 0.5;
const SIMILARITY_BOOST = 0.75;
const RATE_LIMIT_MS = 500;

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AUDIO_DIR = resolve(ROOT, 'public/audio/es');
const MANIFEST_PATH = resolve(AUDIO_DIR, 'manifest.json');
const LESSONS_DIR = resolve(ROOT, 'lessons');

// ── Types ──

interface ManifestEntry {
  hash: string;
  file: string;
}

interface Manifest {
  model: string;
  voiceId: string;
  generated: string;
  entries: Record<string, ManifestEntry>;
}

interface SceneTextLike {
  narration: string;
  [key: string]: unknown;
}

// ── Helpers ──

function sha256Short(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

function loadManifest(): Manifest {
  if (existsSync(MANIFEST_PATH)) {
    try {
      return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
    } catch { /* corrupt — start fresh */ }
  }
  return { model: MODEL_ID, voiceId: VOICE_ID, generated: '', entries: {} };
}

function saveManifest(manifest: Manifest): void {
  manifest.generated = new Date().toISOString();
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
}

function isSceneText(val: unknown): val is SceneTextLike {
  return val != null && typeof val === 'object' && typeof (val as any).narration === 'string';
}

async function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function callElevenLabs(text: string, apiKey: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: { stability: STABILITY, similarity_boost: SIMILARITY_BOOST },
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    if (body.includes('quota_exceeded')) {
      throw Object.assign(new Error('quota_exceeded'), { quota: true });
    }
    throw new Error(`ElevenLabs API error ${resp.status}: ${body}`);
  }

  return Buffer.from(await resp.arrayBuffer());
}

// ── Parse CLI args ──

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const lessonFlagIdx = args.indexOf('--lesson');
const onlyLesson = lessonFlagIdx !== -1 ? args[lessonFlagIdx + 1] : null;

if (!dryRun) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Set ELEVENLABS_API_KEY environment variable (or use --dry-run)');
    process.exit(1);
  }
}

// ── Main ──

async function main(): Promise<void> {
  const apiKey = process.env.ELEVENLABS_API_KEY || '';
  const manifest = loadManifest();

  // Discover lesson directories
  const { readdirSync } = await import('node:fs');
  const dirs = readdirSync(LESSONS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_'))
    .map(d => d.name)
    .filter(name => !onlyLesson || name === onlyLesson);

  if (onlyLesson && dirs.length === 0) {
    console.error(`Lesson "${onlyLesson}" not found in ${LESSONS_DIR}`);
    process.exit(1);
  }

  // Set lang to 'es' in shim
  _storage.set('app-lang', 'es');

  let totalNarrations = 0;
  let toGenerate = 0;
  let generated = 0;
  let skipped = 0;

  for (const lessonId of dirs) {
    // Try to import text.ts
    const textPath = resolve(LESSONS_DIR, lessonId, 'text.ts');
    if (!existsSync(textPath)) continue;

    let textModule: Record<string, unknown>;
    try {
      textModule = await import(textPath);
    } catch (e) {
      console.warn(`  SKIP ${lessonId}/text.ts — import error: ${(e as Error).message}`);
      continue;
    }

    // Get the bilingual text object
    const textObj = textModule.text as Record<string, Record<string, unknown>> | undefined;
    if (!textObj?.es) {
      console.warn(`  SKIP ${lessonId} — no text.es export`);
      continue;
    }

    const esText = textObj.es;

    // Extract scenes with narrations
    const scenes: Array<{ key: string; narration: string }> = [];
    for (const [key, val] of Object.entries(esText)) {
      if (isSceneText(val) && val.narration.trim()) {
        scenes.push({ key, narration: val.narration });
      }
    }

    if (scenes.length === 0) continue;

    console.log(`\n${lessonId} (${scenes.length} narrations)`);

    for (const { key, narration } of scenes) {
      totalNarrations++;
      const entryKey = `${lessonId}/${key}`;
      const hash = sha256Short(narration);
      const existing = manifest.entries[entryKey];
      const filePath = `${lessonId}/${key}.mp3`;
      const absPath = resolve(AUDIO_DIR, filePath);

      const hashMatch = existing?.hash === hash;
      const fileExists = existsSync(absPath);
      const needsGen = force || !hashMatch || !fileExists;

      if (!needsGen) {
        skipped++;
        if (dryRun) console.log(`  ✓ ${entryKey} [up to date]`);
        continue;
      }

      toGenerate++;
      const reason = !fileExists ? 'new' : !hashMatch ? 'stale' : 'forced';

      if (dryRun) {
        console.log(`  → ${entryKey} [${reason}] hash=${hash}`);
        console.log(`    "${narration.slice(0, 80)}${narration.length > 80 ? '...' : ''}"`);
        continue;
      }

      // Generate audio
      console.log(`  → ${entryKey} [${reason}]`);
      try {
        mkdirSync(dirname(absPath), { recursive: true });
        const audio = await callElevenLabs(narration, apiKey);
        writeFileSync(absPath, audio);
        manifest.entries[entryKey] = { hash, file: filePath };
        saveManifest(manifest);
        generated++;
        console.log(`    ✓ ${(audio.length / 1024).toFixed(1)} KB`);
      } catch (e: any) {
        console.error(`    ✗ ${e.message}`);
        if (e.quota) {
          console.error('\n⛔ Quota exceeded — stopping. Re-run tomorrow to continue.');
          saveManifest(manifest);
          console.log(`\nSummary: ${totalNarrations} narrations seen, ${skipped} up-to-date, ${generated} generated this run`);
          process.exit(0);
        }
      }

      await sleep(RATE_LIMIT_MS);
    }
  }

  // Save manifest (even in dry-run to show what it would look like)
  if (!dryRun) {
    saveManifest(manifest);
    console.log(`\nManifest saved: ${MANIFEST_PATH}`);
  }

  console.log(`\nSummary: ${totalNarrations} narrations, ${skipped} up-to-date, ${toGenerate} to generate, ${generated} generated`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
