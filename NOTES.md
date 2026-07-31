# NOTES — Custom Components vs shadcn/ui

This document compares the hand-rolled, accessible components in this project with the
shadcn/ui versions generated for the same two patterns.

| | Custom (this repo) | shadcn/ui generated |
|---|---|---|
| Modal | `src/components/Modal/Modal.tsx` | `src/components/ui/dialog.tsx` |
| Tabs | `src/components/Tabs/Tabs.tsx` | `src/components/ui/tabs.tsx` (+ `button.tsx`) |
| Underlying behavior | Hand-written React + TypeScript | Thin wrappers around the `radix-ui` primitives |
| Preset | n/a | `radix-nova` (shadcn CLI 4.16.1, style `radix-nova`) |

Both implementations target the same W3C ARIA Authoring Practices (APG) patterns:
*Modal Dialog* and *Tabs (Automatic Activation)*.

---

## 1. Things shadcn handled that I missed

- **Dismissable layer with robust outside-click detection.** Radix's
  `DismissableLayer` listens on the document and uses pointer-event metadata
  (including `pointerdown` on the layer, context-menu edge cases, and layers
  that are descendants of the dialog). My implementation only closes when the
  click target *is* the backdrop element (`event.target === event.currentTarget`).
  This works for my fixed backdrop layout but is less robust for arbitrary layouts.

- **Nested / stacked dialogs.** Radix keeps a focus-scope + scroll-lock stack, so
  if a second dialog opens on top of the first, only the top one traps focus and
  locks scrolling, and closing it correctly restores the state of the one below.
  My `Modal` has no concept of nesting — two open modals would fight over focus.

- **Scroll-lock without layout shift.** Radix (`react-remove-scroll`) compensates
  for the scrollbar that disappears when `overflow: hidden` kicks in. My
  `useLockBodyScroll` sets `body.style.overflow = 'hidden'` naively, which can
  cause a horizontal layout shift. Fix: add `scrollbar-gutter: stable` on the body
  or replicate the width-compensation logic.

- **Exit (close) animations.** The shadcn `DialogContent`/`DialogOverlay` use
  `data-open:` / `data-closed:` state selectors (via `tw-animate-css`) so the
  dialog can animate *out* before unmounting. Radix defers the actual unmount
  with its `Presence` component until the exit transition finishes. My modal
  unmounts instantly — no exit animation, and no animation/`prefers-reduced-motion`
  handling.

- **`asChild` / Slot composition.** shadcn's `DialogTrigger asChild={<Button/>}`
  lets a trigger be *any* element (button, link, menu item) through Radix's
  `Slot` primitive, merging props, refs and event handlers. My `Modal` hard-codes
  the markup and gives the consumer no such escape hatch.

- **`forceMount`, `container` on Portal.** Radix's `DialogPortal` accepts a custom
  `container` and `forceMount` (to keep the dialog mounted during exit animations
  or for SSR-friendly rendering). My `createPortal(..., document.body)` is fixed.

- **`alertdialog` support.** Radix exposes `DialogContent` with a `role` that can
  be overridden to `alertdialog` (urgent dialogs) with a one-liner. Mine is
  hard-coded to `role="dialog"`.

- **Reordering/removal of tabs.** Radix's tabs resolve refs by id internally, so
  tabs can be added/removed/reordered at runtime without breaking keyboard
  navigation. My `tabRefs` array is indexed by position; if a tab unmounts, stale
  indices can point at the wrong element (defensible for a fixed demo, but not
  production-grade).

- **Disabled-tab skipping.** Radix skips `disabled` triggers during arrow-key
  navigation. My `TabList` keyboard handler does not skip disabled tabs (I do
  render them with `disabled`, but the arrows can still land on them).

---

## 2. Focus management differences

**Modal dialog**

| Concern | Custom | shadcn/Radix |
|---|---|---|
| Focus into dialog | `requestAnimationFrame` → first focusable element, requested `initialFocusRef`, or the dialog itself | `FocusScope` with `initialFocus` option; focuses content by default; also supports `initialFocusRef` on the scope |
| Trapping | Keydown listener on the dialog that computes focusable elements and wraps first/last (Tab / Shift+Tab) | `FocusScope` with `trapped`; installs a *sentinel* mechanism and keeps focus contained even when focusables change or an element is focused via scripting |
| Focus return | Manually stored `document.activeElement` at open time, restored on close | Focus-scope *stack* remembers the previously focused element; restores it after close, and degrades to `document.body` if the trigger was unmounted |
| Edge cases | None handled — e.g., an element becoming `display:none` mid-interaction, nested scopes, focus landing on an ancestor | `FocusScope` guards against focusing elements outside the scope, reacts to subtree mutations, and supports nesting |
| Timing | `requestAnimationFrame` defers focus until the portal paints | `useLayoutEffect`-driven timing tied to the presence/exit lifecycle |

The functional outcomes are the same for the happy path (open → first element,
Tab cycles, Escape closes, focus returns to the trigger), but Radix's
`FocusScope` is a hardened, reusable primitive that also covers nesting,
mutation and unmount race conditions that my version does not.

**Tabs**

- Both use **roving tabindex**: the selected tab is `tabIndex={0}`, all others
  `tabIndex={-1}`.
- Both implement Arrow Left/Right (+ Up/Down for vertical), Home, End.
- Difference: Radix also normalizes the "nothing is focused" case — if the
  tablist receives focus directly (e.g., programmatic focus), it moves focus to
  the active tab; my handler assumes focus is already on a tab.
- Radix's `activationMode="manual"` keeps arrow-key *focus* and *selection*
  separate exactly as I implemented, but it also re-focuses the selected tab
  after a panel-interior `Tab` press in the manual mode. I do not.
- Radix registers refs by a generated id (`useId`) instead of array index, and
  updates the roving tabindex in a single `useEffect` on value change — my array
  indexing is equivalent for a static tab list but less robust.

---

## 3. Accessibility improvements

Adopting these from shadcn/Radix would strengthen my components:

1. **Screen-reader only labels on icon buttons.** shadcn renders
   `<span className="sr-only">Close</span>` inside the close button (text node
   that SRs can find), whereas I use `aria-label="Close dialog"`. `aria-label`
   is fine, but `sr-only` text is more forgiving (some SRs with certain settings
   read them; `aria-label` gets overridden if content exists). The generated
   `Button` also sets `aria-expanded` styling hooks and proper focus-visible
   rings.

2. **`data-state` styling hooks.** Radix adds `data-state="open|closed"`,
   `data-active`/`data-selected` on triggers, `data-orientation`, `data-slot`
   etc. These let you style behavior states in CSS/Tailwind without touching
   JavaScript and make the DOM states testable. My components expose only
   className/context, so a consumer cannot target "open" purely via CSS.

3. **`alertdialog` + `onEscapeKeyDown`/`onInteractOutside` props.** Radix lets
   consumers override dismiss behavior (e.g., require confirmation before
   closing) without forking the component.

4. **`Dialog.Title` enforcement.** Radix logs a warning when a dialog has no
   title (no accessible name). My `Modal` requires `title` and always wires
   `aria-labelledby`, but there is no dev-time warning if a consumer passes an
   empty string.

5. **Reduced-motion support.** tw-animate-css data-state animations and my
   chevron rotation should both respect `prefers-reduced-motion`. Mine doesn't
   — this is a real gap I would fix with a `motion-reduce:` variant or a
   `useReducedMotion` guard.

6. **Scrollbar-gutter compensation** (see §1) also affects low-vision users who
   rely on scroll position.

7. **`aria-controls` on disclosure triggers** is present in mine and in Radix
   tabs/dialog via `aria-controls`; good parity here. shadcn/Radix additionally
   set `aria-describedby` only when a `Description` is rendered (same as my
   conditional `describedBy`).

---

## 4. Architecture differences

| Aspect | Custom | shadcn/ui |
|---|---|---|
| Behavior layer | Inline in the component (state + effects + DOM helpers) | Delegated to Radix primitives (`radix-ui` package) |
| Styling layer | Tailwind classes hard-coded per component, merged via `cn()` | `class-variance-authority` (cva) variants + design tokens (`bg-primary`, `text-muted-foreground`) |
| Component surface | Monolithic: one `Modal` component with props | Composed: `Dialog`/`DialogTrigger`/`DialogContent`/`DialogOverlay`/`DialogHeader`/`DialogFooter`/`DialogTitle`/`DialogDescription`/`DialogClose` |
| State model | Modal: fully controlled; Tabs: controlled + uncontrolled | All controlled + uncontrolled (`defaultValue`) with `onValueChange` |
| Decoupling | Behavior and markup are coupled; consumers restyle via `className` | Behavior and markup fully decoupled; consumers restyle via variants/className |
| Data attributes | None | `data-slot`, `data-state`, `data-orientation`, `data-variant` for styling/testing |
| Package model | Zero runtime deps for the custom parts | Radix + cva + clsx + tailwind-merge + lucide-react |

shadcn's value proposition is *separation of concerns*: Radix owns all the hard
DOM/accessibility logic, and shadcn owns pure presentation. My implementation
proves those behaviors can be written by hand (which is the point of this
assignment) but necessarily couples behavior + presentation in one place.

---

## 5. Reusability improvements

1. **String-based tab identity.** shadcn's `Tabs` use a string `value`
   (`<TabsTrigger value="account">`) that is *order-independent*. My numeric
   `index` couples a tab to a panel by position — renaming/reordering means
   editing indices. Adopting string values (or at least exposing ids) would
   improve my API.

2. **`asChild` composition.** Porting Radix's `Slot` pattern (or accepting a
   render prop) would let my `Modal` trigger and close buttons be links/menu
   items/etc., not just `<button>`.

3. **Variants via cva.** Replacing my inline color strings with cva variants
   backed by the `--background`/`--primary`/`--muted` tokens would make my
   components themeable and consistent with shadcn (dark mode for free).

4. **Smaller export surface per file.** shadcn exports `TabsList`, `TabsTrigger`,
   `TabsContent` individually so a consumer imports only what they need and tree
   shaking works. My `Tabs.tsx` exports one file with five exports — fine, but
   coarser.

5. **Hooks are already reusable.** `useFocusTrap`, `useLockBodyScroll`,
   `useHideBackground` and `useDisclosure` are exported as standalone hooks —
   this is the one area where my architecture is ahead of a naive single-file
   implementation and matches how Radix structures its own internals.

6. **Expose `data-state`.** Adding `data-open`/`data-closed` (modal) and
   `data-active`/`data-orientation` (tabs) to my DOM would let other developers
   style the components from outside without editing source.

---

## Verdict

- For **learning** the APG patterns, hand-rolling is exactly right: you confront
  focus traps, roving tabindex, `aria-expanded`/`aria-controls` wiring, and
  `inert`/`aria-hidden` hiding head-on.
- For **production**, shadcn + Radix wins on edge cases (nested dialogs,
  exit animations, disabled-tab skipping, mutation-safe refs) and on
  theming/reusability (tokens, variants, `asChild`).
- If I shipped the custom components to production tomorrow, the three fixes I'd
  make first are: (1) scrollbar-gutter compensation, (2) `prefers-reduced-motion`
  handling, and (3) string-based tab identity + `data-state` hooks.
