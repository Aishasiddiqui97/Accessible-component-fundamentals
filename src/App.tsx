import { useRef } from 'react'
import { Accordion } from './components/Disclosure/Accordion'
import { Disclosure } from './components/Disclosure/Disclosure'
import { Modal } from './components/Modal/Modal'
import { Tab, TabList, TabPanel, Tabs } from './components/Tabs/Tabs'
import { useDisclosure } from './hooks/useDisclosure'
import { Button } from './components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog'
import { Tabs as ShadcnTabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'

function ModalDemo() {
  const { open, setOpen } = useDisclosure()
  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <section aria-labelledby="modal-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="modal-heading" className="text-lg font-semibold text-slate-900">
        Modal Dialog
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Focus is trapped inside, Escape closes it, and focus returns to this trigger button.
      </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Open settings dialog
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Settings"
        description="Configure your preferences. Changes are saved when you confirm."
        initialFocusRef={nameInputRef}
      >
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            setOpen(false)
          }}
        >
          <div className="space-y-1">
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700">
              Display name
            </label>
            <input
              ref={nameInputRef}
              id="profile-name"
              type="text"
              defaultValue="Ada Lovelace"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              defaultValue="ada@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" defaultChecked className="rounded border-slate-300" />
            Notify me about updates
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Save changes
            </button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

function TabsDemo() {
  return (
    <section aria-labelledby="tabs-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="tabs-heading" className="text-lg font-semibold text-slate-900">
        Tabs
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Arrow keys, Home and End move between tabs. Panels announce their tab via <code>aria-labelledby</code>.
      </p>

      <Tabs defaultValue={0} className="mt-4">
        <TabList>
          <Tab index={0}>Overview</Tab>
          <Tab index={1}>Installation</Tab>
          <Tab index={2}>Usage</Tab>
        </TabList>
        <TabPanel index={0}>
          Accessible tabs follow the W3C ARIA Authoring Practices. Only the active tab is in the tab
          order (roving tabindex), and arrow keys move focus and selection together.
        </TabPanel>
        <TabPanel index={1}>
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            <code>{`npm install
npm run dev`}</code>
          </pre>
        </TabPanel>
        <TabPanel index={2}>
          Use the <code>TabList</code>, <code>Tab</code> and <code>TabPanel</code> components together.
          The <code>index</code> prop links each tab to its panel.
        </TabPanel>
      </Tabs>

      <Tabs defaultValue={0} orientation="vertical" className="mt-8">
        <div className="flex gap-4">
          <TabList className="w-40 shrink-0">
            <Tab index={0}>Appearance</Tab>
            <Tab index={1}>Privacy</Tab>
            <Tab index={2}>Notifications</Tab>
          </TabList>
          <div className="min-w-0 flex-1">
            <TabPanel index={0} className="mt-0">
              Vertical tabs use <code>aria-orientation="vertical"</code> and move focus with the Up and
              Down arrow keys instead of Left and Right.
            </TabPanel>
            <TabPanel index={1} className="mt-0">
              Inactive panels are hidden with the native <code>hidden</code> attribute so they are removed
              from the accessibility tree and the tab order.
            </TabPanel>
            <TabPanel index={2} className="mt-0">
              Enter and Space activate a tab natively because each tab renders as a real button.
            </TabPanel>
          </div>
        </div>
      </Tabs>
    </section>
  )
}

function DisclosureDemo() {
  return (
    <section aria-labelledby="disclosure-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="disclosure-heading" className="text-lg font-semibold text-slate-900">
        Disclosure & Accordion
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        The trigger is a real button inside a heading. <code>aria-expanded</code> and{' '}
        <code>aria-controls</code> keep screen readers in sync.
      </p>

      <div className="mt-4 space-y-3">
        <Disclosure title="What is a disclosure?" defaultOpen>
          A disclosure is a widget that expands or collapses a region of content. It is also commonly
          called an accordion item.
        </Disclosure>
        <Disclosure title="Why use a native button?">
          Native buttons give you Enter and Space activation, focus management and the correct
          accessibility tree for free — no extra JavaScript required.
        </Disclosure>
      </div>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Accordion · single open
      </h3>
      <Accordion
        type="single"
        defaultValue={['item-1']}
        className="mt-3"
        items={[
          {
            id: 'item-1',
            title: 'How does focus work?',
            content: 'Arrow keys move focus between triggers. Enter or Space toggles the open panel.',
          },
          {
            id: 'item-2',
            title: 'Can I open multiple panels?',
            content: 'Yes — switch this example to "multiple" mode and each item can stay open.',
          },
        ]}
      />

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Accordion · multiple open
      </h3>
      <Accordion
        type="multiple"
        className="mt-3"
        items={[
          {
            id: 'multi-1',
            title: 'First panel',
            content: 'This panel can stay open together with the next one.',
          },
          {
            id: 'multi-2',
            title: 'Second panel',
            content: 'Both panels are independent because the group uses multiple mode.',
          },
        ]}
      />
    </section>
  )
}

function ShadcnReferenceDemo() {
  return (
    <section aria-labelledby="shadcn-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="shadcn-heading" className="text-lg font-semibold text-slate-900">
        shadcn/ui reference
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        The same two patterns generated by shadcn/ui (Radix primitives). Compare them with the custom
        implementations above — see NOTES.md for the full analysis.
      </p>

      <div className="mt-4 flex flex-wrap items-start gap-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open shadcn dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>shadcn dialog</DialogTitle>
              <DialogDescription>
                Radix handles the focus trap, Escape, focus return, scroll lock and aria wiring for us.
              </DialogDescription>
            </DialogHeader>
            <Button className="justify-self-start">Do something</Button>
            <DialogFooter>
              <Button type="button">Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ShadcnTabs defaultValue="account" className="w-full max-w-sm">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="rounded-lg border border-border p-4">
            Account settings live here.
          </TabsContent>
          <TabsContent value="password" className="rounded-lg border border-border p-4">
            Password settings live here.
          </TabsContent>
        </ShadcnTabs>
      </div>
    </section>
  )
}

function KeyboardShortcuts() {
  const shortcuts: Array<{ component: string; keys: string; action: string }> = [
    { component: 'Modal', keys: 'Tab / Shift+Tab', action: 'Cycle focus inside the dialog' },
    { component: 'Modal', keys: 'Escape', action: 'Close the dialog' },
    { component: 'Tabs', keys: 'Arrow Left / Right', action: 'Switch tab (horizontal)' },
    { component: 'Tabs', keys: 'Arrow Up / Down', action: 'Switch tab (vertical)' },
    { component: 'Tabs', keys: 'Home / End', action: 'Jump to first / last tab' },
    { component: 'Tabs', keys: 'Enter / Space', action: 'Activate the focused tab' },
    { component: 'Accordion', keys: 'Enter / Space', action: 'Toggle a panel' },
    { component: 'Accordion', keys: 'Arrow Up / Down', action: 'Move between triggers' },
    { component: 'Accordion', keys: 'Home / End', action: 'Jump to first / last trigger' },
  ]

  return (
    <section aria-labelledby="shortcuts-heading" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 id="shortcuts-heading" className="text-lg font-semibold text-slate-900">
        Keyboard shortcuts
      </h2>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th scope="col" className="py-2 pr-4">
              Component
            </th>
            <th scope="col" className="py-2 pr-4">
              Keys
            </th>
            <th scope="col" className="py-2">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {shortcuts.map((row) => (
            <tr key={`${row.component}-${row.keys}-${row.action}`} className="border-b border-slate-100 last:border-0">
              <td className="py-2 pr-4 font-medium text-slate-800">{row.component}</td>
              <td className="py-2 pr-4">
                <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                  {row.keys}
                </kbd>
              </td>
              <td className="py-2 text-slate-600">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">FE-05 · Week 4</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Accessible Component Fundamentals
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Modal Dialog, Tabs and Disclosure/Accordion built from scratch in React + TypeScript,
            following the W3C ARIA Authoring Practices — no component libraries.
          </p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        <ModalDemo />
        <TabsDemo />
        <DisclosureDemo />
        <ShadcnReferenceDemo />
        <KeyboardShortcuts />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <p className="mx-auto max-w-3xl px-6 py-6 text-center text-xs text-slate-400">
          Built with React, TypeScript and Tailwind CSS. Test with a screen reader (NVDA / VoiceOver)
          or tab through with a keyboard.
        </p>
      </footer>
    </div>
  )
}
