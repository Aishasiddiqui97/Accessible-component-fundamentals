# Streaming AI Chat (FE-06)

A production-grade, streaming AI chat interface built with **Next.js 15 (App
Router)**, **React 19**, **TypeScript** (zero `any`), **Tailwind CSS v4**, the
**Vercel AI SDK v7** and **Claude** (Anthropic).

## Features

- **Token-by-token streaming** via the AI SDK v7 UI-message stream protocol.
- **Stop / regenerate**: stop an in-flight response (partial output is kept)
  or regenerate the last assistant message.
- **Streaming-safe Markdown**: GFM tables, syntax-highlighted code blocks with
  copy buttons, and incomplete code fences buffered until they close.
- **Auto-scroll** that pins to the latest token while you are at the bottom,
  stops when you scroll up, and offers a "Jump to latest" button.
- **Persistence**: conversation + per-message timestamps restored from
  `localStorage` (versioned payload) on reload; "New chat" resets it.
- **Error handling**: aborts are silent, while API/network/timeout/auth
  failures surface as friendly, retryable banners. Server internals are never
  leaked to the browser.
- **Dark mode** (system-aware, persisted, no flash on load) and full keyboard
  support: Enter to send, Shift+Enter for a newline.
- **Accessibility**: `aria-live` for streamed responses, labelled controls,
  focus-visible rings, reduced-motion support.
- **Hardened types**: strict TS (`noUncheckedIndexedAccess`), ESLint bans
  `any` and untyped imports.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable             | Required | Default                  | Description                              |
| -------------------- | -------- | ------------------------ | ---------------------------------------- |
| `ANTHROPIC_API_KEY`  | yes      | —                        | Anthropic API key (server-side only).    |
| `AI_MODEL`           | no       | `claude-sonnet-4-6`      | Anthropic model id.                      |
| `AI_TEMPERATURE`     | no       | `0.7`                    | Sampling temperature.                    |
| `AI_MAX_TOKENS`      | no       | `2048`                   | Max output tokens per response.          |

The API key is read exclusively by the server route (`app/api/chat/route.ts`
via `lib/ai.ts`) — nothing key-related is exposed to the client.

## Scripts

| Script                | Description                       |
| --------------------- | --------------------------------- |
| `npm run dev`         | Start the dev server.             |
| `npm run build`       | Production build.                 |
| `npm run start`       | Serve the production build.       |
| `npm run typecheck`   | `tsc --noEmit` (strict).          |
| `npm run lint`        | ESLint (flat config).             |

## Project structure

```
app/
  api/chat/route.ts     Streaming SSE route handler (AI SDK v7)
  globals.css           Tailwind v4 + theme + animation primitives
  layout.tsx            Root layout (fonts, inline theme script, metadata)
  page.tsx              Renders <Chat />
components/
  Chat.tsx              Orchestrator: useChat, scroll, persistence, errors
  ChatInput.tsx         Auto-resizing composer (Enter / Shift+Enter)
  ChatMessage.tsx       Message row with streaming Markdown + timestamps
  Markdown.tsx          Streaming-safe react-markdown wrapper + code copy
  ...                   Avatar, Banner, EmptyState, JumpToLatest, ThemeToggle
hooks/
  useAutoScroll.ts      Stick-to-bottom auto-scroll with scroll-up detection
lib/
  ai.ts                 Model / temperature / tokens / system prompt config
types/
  chat.ts               ChatRole, ChatError, timestamps, persisted state
utils/
  chatStorage.ts        Versioned localStorage persistence
  errors.ts             Error → friendly ChatError classification
  markdown.ts           bufferIncompleteMarkdown (fence-aware)
  ...                   cn, scroll, message, date
```

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in Vercel (framework preset: Next.js).
3. Add the environment variables from the table above.
4. Deploy. The route exports `maxDuration = 60` to allow long generations.

## Notes

- The `playground/` folder is a leftover sandbox and is excluded from both the
  TypeScript project and ESLint.
- Conversation persistence uses a versioned payload; schema changes bump the
  version to avoid corrupt restores.
