import { Bot, User } from "lucide-react";
import type { ChatRole } from "@/types/chat";
import { cn } from "@/utils/cn";

interface AvatarProps {
  readonly role: ChatRole;
  readonly className?: string;
}

/** Decorative avatar placeholder. Hidden from screen readers (aria-hidden). */
export function Avatar({ role, className }: AvatarProps): React.ReactElement {
  const isUser = role === "user";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
        isUser
          ? "border-neutral-300 bg-neutral-100 text-neutral-600 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          : "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
        className,
      )}
    >
      {isUser ? <User className="h-4 w-4" aria-hidden="true" /> : <Bot className="h-4 w-4" aria-hidden="true" />}
    </span>
  );
}
