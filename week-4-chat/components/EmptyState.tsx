import { Sparkles } from "lucide-react";

/**
 * Welcome placeholder shown before the first message, with a few example
 * prompts to make the empty state useful.
 */
export function EmptyState(): React.ReactElement {
  const examples = [
    "Explain how the Vercel AI SDK works",
    "Write a TypeScript function that debounces a callback",
    "Compare React Server Components with client components",
    "Give me a Markdown checklist for shipping an MVP",
  ];
  return (
    <div className="fade-up flex flex-col items-center gap-6 px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
        <Sparkles className="h-7 w-7" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Hi, I&rsquo;m Claude. What are we building?
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          Streaming, Markdown, dark mode and error handling — all wired up.
        </p>
      </div>
      <ul className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
        {examples.map((prompt) => (
          <li
            key={prompt}
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {prompt}
          </li>
        ))}
      </ul>
    </div>
  );
}
