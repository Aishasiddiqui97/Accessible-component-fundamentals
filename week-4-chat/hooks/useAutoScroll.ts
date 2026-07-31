"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { isNearBottom, scrollToBottom } from "@/utils/scroll";

export interface UseAutoScrollResult {
  /** Whether the user is currently at (or near) the bottom of the list. */
  readonly isAtBottom: boolean;
  /** Re-pin to the latest message and resume auto-scrolling. */
  readonly scrollToBottomNow: (behavior?: ScrollBehavior) => void;
}

/**
 * Production-grade auto-scroll for the streaming chat list.
 *
 * Behavior contract:
 * - While the user is at the bottom, new streamed tokens keep the view pinned.
 * - The instant the user scrolls upward, auto-scrolling stops.
 * - Scrolling back to the bottom re-enables it.
 * - `scrollToBottomNow` re-pins the view (used by "Jump to latest" and when a
 *   new message is submitted).
 *
 * The `dependency` value (the messages array) triggers a scroll after every
 * render that changes it; the actual scroll is deferred to the next animation
 * frame so it happens after the browser has laid out the newly streamed token.
 */
export function useAutoScroll(
  containerRef: RefObject<HTMLElement | null>,
  dependency: unknown,
  enabled = true,
): UseAutoScrollResult {
  // Whether the latest scroll position counts as "at the bottom".
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  // Whether the view should follow new content. Kept in a ref so the content
  // effect can read it without re-subscribing.
  const stickyRef = useRef<boolean>(true);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el === null) {
      return;
    }
    const atBottom = isNearBottom(el);
    setIsAtBottom(atBottom);
    stickyRef.current = atBottom;
  }, [containerRef]);

  // Attach the scroll listener once per container.
  useEffect(() => {
    const el = containerRef.current;
    if (el === null || !enabled) {
      return;
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef, onScroll, enabled]);

  // Follow new content while the user is pinned to the bottom.
  useEffect(() => {
    if (!enabled || !stickyRef.current) {
      return;
    }
    const el = containerRef.current;
    if (el === null) {
      return;
    }
    scrollToBottom(el);
  }, [dependency, enabled, containerRef]);

  // Re-pin when the container resizes (window resize, mobile keyboard).
  useEffect(() => {
    const el = containerRef.current;
    if (el === null || !enabled) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (stickyRef.current) {
        scrollToBottom(el);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, enabled]);

  const scrollToBottomNow = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      const el = containerRef.current;
      if (el === null) {
        return;
      }
      stickyRef.current = true;
      setIsAtBottom(true);
      scrollToBottom(el, behavior);
    },
    [containerRef],
  );

  return { isAtBottom, scrollToBottomNow };
}
