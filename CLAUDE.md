# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An animated presentation engine for teaching XCS236 Deep Generative Models concepts. Think 3Blue1Brown-style math animations rendered on HTML5 Canvas, synchronized with voice narration and subtitles, plus an AI tutor chat panel. Bilingual (Spanish/English). Built with vanilla JS + Vite, no framework.

## Commands

```bash
npm run dev      # Start dev server (opens player.html)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

### Four entry points

- **`index.html`** — Lesson catalog (grid of cards per module, quiz system with AI grading)
- **`player.html`** — Presentation player (canvas + controls + chat panel)
- **`tutor.html`** — AI tutor chat interface (WebSocket-based, connects to MCP tutor server)
- **`apuntes.html`** — Markdown notes viewer with KaTeX rendering, sidebar navigation, and search

### Interactive visualizations (`public/interactives/`)

20 standalone HTML files with Canvas 2D visualizations. Each is self-contained with its own `<script type="module">` that imports from `shared/` utilities. Registered in `public/interactives/registry.json`.

Shared libraries in `public/interactives/shared/`:
- **`canvas.js`**: `setupCanvas()` — HiDPI-aware canvas setup
- **`math.js`**: `gaussian()`, `randn()`, `klGaussian()`, etc.
- **`ui.js`**: Slider/control helpers
- **`colors.js`**: Design tokens (accent: `#e94560`, distinct from engine's `#818cf8`)
- **`theme.css`**: Shared dark theme styles

**Note:** The interactive palette (`colors.js`: accent `#e94560` red) differs intentionally from the engine palette (`design-tokens.js`: accent `#818cf8` indigo). The interactives are standalone and the red accent works well for educational highlights.

### Notes system (`apuntes-manifest.ts`, `apuntes-main.ts`)

- **`apuntes-manifest.ts`**: Registry of all markdown notes with `{id, title, path, topic}`
- **`apuntes-main.ts`**: Lightweight markdown renderer (headers, lists, tables, blockquotes, code, KaTeX) + sidebar + hash routing
- **`public/apuntes/`**: 20 concept notes + 20 exercise explanations (PS1-PS4) in Spanish markdown with LaTeX

### Engine (`engine/`)

The core rendering pipeline:

```
Timeline → Scene → Renderer (Canvas 2D) + FormulaManager (KaTeX DOM overlay)
    ↓
VoiceProvider (TTS) + SubtitleOverlay + Controls + ChatPanel
```

- **Timeline** (`timeline.js`): Orchestrates playback. Maintains `globalTime`, finds current scene, calls `scene.render(progress)` at 60fps via rAF. Emits events: `play`, `pause`, `timeupdate`, `scenechange`, `end`. Syncs with voice provider (can wait for narration to finish before advancing).
- **Scene** (`scene.js`): Single animation unit. Properties (`id`, `narration`, `topic`, `subtitleCues`) can be static values or functions (resolved lazily for i18n). Core method is `render(progress, ctx, canvas, renderer, state)` where `progress ∈ [0, 1]`.
- **Renderer** (`renderer.js`): Canvas 2D wrapper with a **data-space coordinate system**. Call `setViewport(xMin, xMax, yMin, yMax)` then use `toX()`/`toY()` to convert. Provides `drawAxes()`, `drawCurve()`, `fillBetween()`, `dot()`, `arrow()`, `label()`, `box()`, etc. HiDPI-aware via `canvas-utils.setupCanvas()`.
- **FormulaManager** (`animation/formula.js`): Manages KaTeX-rendered formula DOM elements positioned over the canvas. `formulaAppear(fm, id, latex, x, y, progress)` / `formulaDisappear()`.

### Animation primitives (`engine/animation/`)

All animation functions take a `progress ∈ [0, 1]` parameter:

| Module | Key functions |
|--------|--------------|
| `tween.js` | `subProgress(p, start, end)`, `easedSub(p, start, end, easeFn)`, `tweenValue()`, `tweenColor()`. Easings: `easeIn`, `easeOut`, `easeInOut`, `easeOutBack`, etc. |
| `graph.js` | `animateCurve()`, `animateFill()`, `animateMorph()`, `animateFillBetween()`, `animateBars()` |
| `text.js` | `fadeInText()`, `typewriterText()`, `animateLabel()` |
| `arrow.js` | `animateArrow()`, `animateBracket()` |
| `formula.js` | `formulaAppear()`, `formulaDisappear()`, `FormulaManager` class |
| `particles.js` | `animateDots()`, `animateScatter()` |

### Shared utilities (`engine/shared/`)

- **`design-tokens.js`**: Canonical dark-theme color palette (`colors.accent = '#818cf8'`, `colors.insight = '#34d399'`, etc.), `series` array (5 colors for multi-curve plots), `fonts`.
- **`math-utils.js`**: `gaussian()`, `klGaussian()`, `entropy()`, `crossEntropy()`, `klDiscrete()`, `selfInformation()`, `lerp()`, `clamp()`.
- **`canvas-utils.js`**: `setupCanvas()` (HiDPI), `drawCurve()`, `fillCurve()`, `fillBetween()`, `roundRect()`.

### Voice & Chat (`engine/voice/`, `engine/chat/`)

- **VoiceProvider interface**: `speak(text) → VoiceHandle` with `pause()`, `resume()`, `cancel()`, `onEnd()`.
- **Implementations**: `SilentVoiceProvider`, `WebSpeechProvider` (browser SpeechSynthesis), `OpenAITTSProvider` (OpenAI Speech API with IndexedDB caching).
- **ChatProvider interface**: `async *sendMessage(messages, system)` → AsyncGenerator of text chunks.
- **Implementation**: `AnthropicChatProvider` (Claude API with streaming SSE).
- API keys stored in `localStorage`: `openai-api-key`, `anthropic-api-key`.

### i18n (`engine/i18n.js`)

- `getLang()` / `setLang(lang)` — reads/writes `localStorage('app-lang')`, `'es'` or `'en'`.
- `t(key, ...args)` — translate UI strings (substitutions via `$1`, `$2`).
- `prompt(key)` — get system prompts (`'chatSystem'`, `'gradeSystem'`).
- `applyLang(root)` — walks DOM applying `data-i18n`, `data-i18n-placeholder`, `data-i18n-title`, `data-i18n-html` attributes.
- Lesson content uses a separate `tx(scene, field)` pattern with inline `text` objects containing `es`/`en` keys.

### Lessons (`lessons/`)

- **`lesson-map.js`**: Central registry. Exports `LESSONS` array, `getLessonTitle()`, `getLessonDesc()`, `getQuizData()`, etc. Contains titles/descriptions in both languages and quiz questions per module.
- **Lesson files** (e.g., `kl-divergence-mle.js`): Export an object with `{ title, scenes: Scene[] }`. Each scene's `render()` uses `easedSub()` to choreograph phases within the scene's progress range.

### Styles (`styles/`)

- `presentation.css` — Player layout, controls, settings modal
- `chat-panel.css` — Chat panel slide-in
- `end-screen.css` — Completion overlay and quiz
- `index.html` has its own inline `<style>` for the catalog page

## How to Create a New Lesson

1. Create `lessons/my-lesson-id.js`:
   - Import `Scene` from `../engine/scene.js`
   - Import animation helpers from `../engine/animation/`
   - Import `design-tokens`, `math-utils` as needed
   - Define bilingual `text` object with `es`/`en` keys per scene
   - Create scenes with `render(progress, ctx, canvas, r, state)` functions
   - Export `{ title, scenes: [...] }`

2. Register in `lessons/lesson-map.js`:
   - Add entry to `_LESSONS_BASE` with `{ id, module, num, ready }`
   - Add title/description to `LESSON_TITLES` / `LESSON_DESCS` (both languages)
   - Optionally add quiz questions to `_QUIZ_DATA`

3. The index page and player route automatically pick it up via `?lesson=my-lesson-id`.

## Scene Render Pattern

```javascript
render(progress, ctx, canvas, r, state) {
  r.resize();
  r.setViewport(0, 10, 0, 1);
  r.clear();

  // Phase 1: title (0%–10%)
  fadeInText(ctx, title, px, py, easedSub(progress, 0, 0.1));

  // Phase 2: axes (5%–20%)
  const axesP = easedSub(progress, 0.05, 0.2);
  if (axesP > 0) { ctx.globalAlpha = axesP; r.drawAxes({...}); ctx.globalAlpha = 1; }

  // Phase 3: curve (15%–50%)
  if (easedSub(progress, 0.15, 0.5) > 0) animateCurve(r, fn, color, easedSub(progress, 0.15, 0.5));

  // Phase 4: formula overlay (50%–70%)
  formulaAppear(state.formulaManager, 'eq1', '...latex...', x, y, easedSub(progress, 0.5, 0.7));
}
```

## Key Conventions

- All colors come from `design-tokens.js` — never hardcode hex values
- Two coordinate systems: data-space (via `r.toX()`/`r.toY()`) and pixel-space (raw canvas)
- `subProgress(progress, start, end)` returns 0 before `start`, 1 after `end`, linear between — always gate animations with `if (p > 0)`
- Scene properties that need i18n should be functions (lazy evaluation), not static strings
- The `state` object on Timeline is shared across all scenes in a lesson (used for `formulaManager` and cross-scene state)
