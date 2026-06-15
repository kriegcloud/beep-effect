/**
 * UI-layer chat turn error toasts.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

"use client";

import { turnErrorAtom } from "@beep/agents-client/Chat.atoms";
import { toast } from "@beep/ui/components/sonner";
import { O } from "@beep/utils";
import { useAtomSet, useAtomSubscribe } from "@effect/atom-react";
import type { JSX } from "react";

/**
 * Subscribes to failed assistant turns and surfaces them through the app's
 * existing toast system. The agents client only exposes atom state; the UI
 * package stays at this app boundary.
 *
 * @example
 * ```tsx
 * import { ChatTurnErrorToasts } from "@/chat/ui/ChatTurnErrorToasts"
 *
 * console.log(ChatTurnErrorToasts.name) // "ChatTurnErrorToasts"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function ChatTurnErrorToasts(): JSX.Element | null {
  const setTurnError = useAtomSet(turnErrorAtom);

  useAtomSubscribe(
    turnErrorAtom,
    (error) => {
      if (O.isSome(error)) {
        toast.error(error.value.message);
        setTurnError(O.none());
      }
    },
    { immediate: true }
  );

  return null;
}
