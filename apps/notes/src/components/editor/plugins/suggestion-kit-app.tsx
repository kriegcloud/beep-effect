"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { suggestionPlugin as SuggestionPlugin } from "@beep/notes/registry/components/editor/plugins/suggestion-kit";
import { SuggestionLeaf, SuggestionLineBreak } from "@beep/notes/registry/ui/suggestion-node";
import type { UnsafeTypes } from "@beep/types";
import type { BaseSuggestionConfig } from "@platejs/suggestion";
import type { ExtendConfig, Path } from "platejs";
import { useEffect } from "react";

export type SuggestionConfig = ExtendConfig<
  BaseSuggestionConfig,
  {
    readonly activeId: string | null;
    readonly hoverId: string | null;
    readonly uniquePathMap: Map<string, Path>;
  }
>;

export const suggestionPlugin = SuggestionPlugin.configure({
  render: {
    belowNodes: SuggestionLineBreak as UnsafeTypes.UnsafeAny,
    node: SuggestionLeaf,
  },
  useHooks: ({ setOption }) => {
    const user = useCurrentUser();

    useEffect(() => {
      if (!user?.id) return;

      setOption("currentUserId", user.id);
    }, [setOption, user]);
  },
});

export const SuggestionKit = [suggestionPlugin];
