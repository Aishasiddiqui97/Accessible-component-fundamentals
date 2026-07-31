# Accessible Component Fundamentals (FE-05)

A React + TypeScript + Tailwind CSS playground that builds three interactive
components **from scratch** — Modal Dialog, Tabs, and Disclosure/Accordion —
following the [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).

The same two patterns are also generated with **shadcn/ui** so the two
approaches can be compared side by side. See [NOTES.md](./NOTES.md) for the
full comparison.

## Project setup

```bash
npm install     # install dependencies
npm run dev     # start the Vite dev server (http://localhost:5173)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) then produce a production build |
| `npm run typecheck` | Run the TypeScript compiler in check-only mode |
| `npm run lint` | Run oxlint over the source |
| `npm run preview` | Preview the production build locally |

## Folder structure

```
playground/
├── src/
│   ├── components/
│   │   ├── Modal/
│   │   │   └── Modal.tsx              # Accessible modal dialog (custom)
│   │   ├── Tabs/
│   │   │   └── Tabs.tsx               # Tabs / TabList / Tab / TabPanel (custom)
│   │   ├── Disclosure/
│   │   │   ├── Disclosure.tsx         # Single disclosure (custom)
│   │   │   └── Accordion.tsx          # Disclosure group with single/multiple mode
│   │   └── ui/                        # shadcn/ui generated components
│   │       ├── dialog.tsx
│   │       ├── tabs.tsx
│   │       └── button.tsx
│   ├── hooks/
│   │   ├── useFocusTrap.ts            # Traps Tab/Shift+Tab inside a container
│   │   ├── useHideBackground.ts       # aria-hidden + inert on the page behind a modal
│   │   ├── useLockBodyScroll.ts       # Prevents background scrolling
│   │   └── useDisclosure.ts           # Reusable open/close boolean state
│   ├── utils/
│   │   ├── cn.ts                      # clsx + tailwind-merge helper
│   │   └── focus.ts                   # Focusable-element selectors & queries
│   ├── App.tsx                        # Demo page showcasing every component
│   └── main.tsx
├── components.json                    # shadcn/ui configuration
├── NOTES.md                           # Custom vs shadcn/ui comparison
├── README.md
├── package.json
└── tsconfig.json
```

## Accessibility features

Every component follows the W3C APG and is annotated in code with the reasoning
behind each decision.

### Modal Dialog
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (title) and
  `aria-describedby` (description).
- Focus is **trapped** inside the dialog (Tab / Shift+Tab cycle).
- **Focus moves in** to the first focusable element (or a requested
  `initialFocusRef`) on open and **returns to the trigger** on close.
- Escape closes; backdrop click closes without closing on inner clicks.
- Background is made inert via `aria-hidden="true"` **and** the `inert`
  attribute; body scroll is locked while open.
- Rendered in a portal to `document.body` so it can never be clipped by an
  ancestor.

### Tabs
- Correct roles: `tablist` / `tab` / `tabpanel` with `aria-orientation`.
- `aria-selected` on tabs, `aria-controls` (tab → panel) and
  `aria-labelledby` (panel → tab).
- **Roving tabindex**: only the active tab is in the tab order.
- Inactive panels use the native `hidden` attribute (removed from the
  accessibility tree and tab order).
- Arrow Left/Right (horizontal) or Up/Down (vertical), Home, End.
- Enter/Space work natively because each tab is a real `<button>`.
- Automatic and manual activation modes.

### Disclosure / Accordion
- Trigger is a native `<button>` wrapped in a heading (`<h2>` by default) to
  preserve the document outline.
- `aria-expanded` and `aria-controls` on every trigger.
- Panel hidden with the native `hidden` attribute when collapsed.
- Enter/Space toggle natively; Arrow Up/Down and Home/End move between triggers.
- If focus is inside a panel that collapses, focus returns to its trigger.
- Supports single-open and multiple-open groups.

## Keyboard shortcuts

| Component | Keys | Action |
| --- | --- | --- |
| Modal | `Tab` / `Shift+Tab` | Cycle focus inside the dialog |
| Modal | `Escape` | Close the dialog |
| Modal | `Enter` | Submit / activate the focused control |
| Tabs (horizontal) | `Arrow Left` / `Arrow Right` | Move to previous / next tab |
| Tabs (vertical) | `Arrow Up` / `Arrow Down` | Move to previous / next tab |
| Tabs | `Home` | Jump to first tab |
| Tabs | `End` | Jump to last tab |
| Tabs | `Enter` / `Space` | Activate the focused tab |
| Accordion | `Enter` / `Space` | Toggle a panel |
| Accordion | `Arrow Up` / `Arrow Down` | Move between trigger buttons |
| Accordion | `Home` / `End` | Jump to first / last trigger |

## Technologies used

- **React 19** — components built with hooks only
- **TypeScript** (strict, no `any`, `verbatimModuleSyntax`)
- **Vite 8** — dev server and build tooling
- **Tailwind CSS 4** — styling via the official Vite plugin
- **shadcn/ui** — generated `Dialog` and `Tabs` (Radix primitives) for comparison
- **oxlint** — linting
- **Node.js 24** (tested on Windows)

## Try it

1. `npm run dev`
2. Open the page and **tab through everything**.
3. Open the modal and try `Tab`, `Shift+Tab` and `Escape`.
4. Focus the tab list and use the arrow keys, `Home` and `End`.
5. Listen with NVDA/VoiceOver — headings, landmarks, button states and dialog
   announcements should all be announced correctly.
