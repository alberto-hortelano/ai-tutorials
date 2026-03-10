# AI Tutorials

An animated presentation engine for teaching **Deep Generative Models** (Stanford XCS236). 3Blue1Brown-style math animations rendered on HTML5 Canvas, synchronized with voice narration and subtitles, plus an AI tutor chat panel. Bilingual (Spanish/English).

Built with vanilla TypeScript + Vite — no framework.

## Features

- **Animated lessons** — 25+ lessons covering VAEs, GANs, normalizing flows, diffusion models, score matching, energy-based models, and more
- **Interactive visualizations** — 20 standalone Canvas 2D demos (KL divergence, diffusion processes, Langevin dynamics, ELBO, Wasserstein distance, etc.)
- **AI tutor chat** — Ask questions mid-lesson via Claude API (streaming)
- **Voice narration** — OpenAI TTS with IndexedDB caching, or browser SpeechSynthesis
- **Quizzes** — AI-graded quizzes per module
- **Math rendering** — KaTeX formulas overlaid on canvas animations
- **Notes viewer** — Markdown notes with LaTeX, sidebar navigation, and search
- **Bilingual** — Full Spanish/English support (UI, narration, notes)

## Getting Started

```bash
npm install
npm run dev
```

This opens the lesson catalog at `index.html`. Click any lesson to launch the player.

### Other commands

```bash
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm run test       # Run tests
npm run typecheck  # TypeScript type checking
```

## Architecture

### Entry points

| Page | Purpose |
|------|---------|
| `index.html` | Lesson catalog — grid of cards per module, quiz system |
| `player.html` | Presentation player — canvas + controls + chat panel |
| `tutor.html` | AI tutor chat interface (WebSocket, MCP tutor server) |
| `apuntes.html` | Markdown notes viewer with KaTeX and search |

### Engine (`engine/`)

```
Timeline → Scene → Renderer (Canvas 2D) + FormulaManager (KaTeX overlay)
    ↓
VoiceProvider (TTS) + SubtitleOverlay + Controls + ChatPanel
```

- **Timeline** — Orchestrates playback at 60fps, syncs voice narration with scene progress
- **Scene** — Single animation unit; `render(progress)` where `progress ∈ [0, 1]`
- **Renderer** — Canvas 2D wrapper with data-space coordinate system (axes, curves, fills, dots, arrows, labels)
- **Animation primitives** — Tweens, easing, curve morphing, text effects, particle systems, formula appear/disappear

### Lessons (`lessons/`)

Each lesson exports `{ title, scenes }`. Scenes use `easedSub(progress, start, end)` to choreograph animation phases within a normalized progress range.

### Interactive visualizations (`public/interactives/`)

20 standalone HTML files with live Canvas 2D demos — each self-contained with shared math, canvas, and UI utilities.

## API Keys

The app uses browser `localStorage` for optional API keys:

- `openai-api-key` — OpenAI TTS for voice narration
- `anthropic-api-key` — Claude API for the AI tutor chat panel

These can be configured in the player settings modal. The app works without them (silent mode, no chat).

## Tech Stack

- **TypeScript** + **Vite**
- **HTML5 Canvas 2D** for all animations
- **KaTeX** for math rendering
- **OpenAI Speech API** for TTS
- **Claude API** for AI tutor

## License

All rights reserved.
