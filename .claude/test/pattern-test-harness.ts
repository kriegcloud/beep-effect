import { NodeServices } from "@effect/platform-node";
import { Effect } from "effect";
import { beforeAll, describe, expect, it } from "vitest";
import { findMatches, type HookInput, loadPatterns } from "../hooks/pattern-detector/core.ts";
import { provideLayerScoped } from "../internal/runtime.ts";
import type { PatternDefinition } from "../patterns/schema.ts";

let patterns: PatternDefinition[] = [];

beforeAll(async () => {
  patterns = await Effect.runPromise(Effect.scoped(provideLayerScoped(loadPatterns, NodeServices.layer)));
});

export interface PatternTestConfig {
  glob?: undefined | string;
  name: string;
  shouldMatch: string[];
  shouldNotMatch: string[];
  tag: string | string[];
}

export interface BashPatternTestConfig {
  decision: "ask" | "deny";
  name: string;
  shouldMatch: string[];
  shouldNotMatch: string[];
}

const inferFilePathFromGlob = (glob?: string): string => {
  if (glob === undefined || glob === "") return "test.ts";
  if (glob.includes("{test,spec}") || glob.includes(".test.") || glob.includes(".spec.")) {
    return "test.test.ts";
  }
  if (glob.endsWith(".tsx") || glob.includes(".tsx")) return "test.tsx";
  if (glob.endsWith(".ts") || glob.includes(".ts")) return "test.ts";
  return "test.ts";
};

export interface WritePatternTestConfig {
  decision: "ask" | "deny";
  name: string;
  shouldMatch: string[];
  shouldNotMatch: string[];
}

export const testWritePattern = (config: WritePatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (filePath) => {
      const input: HookInput = {
        hook_event_name: "PreToolUse",
        tool_name: "Write",
        tool_input: { file_path: filePath, content: "content" },
      };
      const matched = findMatches(input, patterns);
      const hasDecision = matched.some((p: PatternDefinition) => p.action === config.decision);
      expect(hasDecision).toBe(true);
    });

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (filePath) => {
        const input: HookInput = {
          hook_event_name: "PreToolUse",
          tool_name: "Write",
          tool_input: { file_path: filePath, content: "content" },
        };
        const matched = findMatches(input, patterns);
        expect(matched.length).toBe(0);
      });
    }
  });
};

export interface FilePathPatternTestConfig {
  name: string;
  shouldMatch: Array<{ code: string; filePath: string }>;
  shouldNotMatch: Array<{ code: string; filePath: string }>;
  tag: string;
}

export const testFilePathPattern = (config: FilePathPatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: $code in $filePath", ({ code, filePath }) => {
      const input: HookInput = {
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: filePath, new_string: code },
      };
      const matched = findMatches(input, patterns);
      const hasTag = matched.some((p: PatternDefinition) => p.tag === config.tag);
      expect(hasTag).toBe(true);
    });

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: $code in $filePath", ({ code, filePath }) => {
        const input: HookInput = {
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: filePath, new_string: code },
        };
        const matched = findMatches(input, patterns);
        const hasTag = matched.some((p: PatternDefinition) => p.tag === config.tag);
        expect(hasTag).toBe(false);
      });
    }
  });
};

export const testBashPattern = (config: BashPatternTestConfig) => {
  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (command) => {
      const input: HookInput = {
        hook_event_name: "PreToolUse",
        tool_name: "Bash",
        tool_input: { command },
      };
      const matched = findMatches(input, patterns);
      const hasDecision = matched.some((p: PatternDefinition) => p.action === config.decision);
      expect(hasDecision).toBe(true);
    });

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (command) => {
        const input: HookInput = {
          hook_event_name: "PreToolUse",
          tool_name: "Bash",
          tool_input: { command },
        };
        const matched = findMatches(input, patterns);
        expect(matched.length).toBe(0);
      });
    }
  });
};

export const testPattern = (config: PatternTestConfig) => {
  const tags = Array.isArray(config.tag) ? config.tag : [config.tag];
  const filePath = inferFilePathFromGlob(config.glob);

  describe(config.name, () => {
    it.each(config.shouldMatch)("should match: %s", (code) => {
      const input: HookInput = {
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: filePath, new_string: code },
      };
      const matched = findMatches(input, patterns);
      const hasTag = matched.some((p: PatternDefinition) => tags.includes(p.tag ?? ""));
      expect(hasTag).toBe(true);
    });

    if (config.shouldNotMatch.length > 0) {
      it.each(config.shouldNotMatch)("should NOT match: %s", (code) => {
        const input: HookInput = {
          hook_event_name: "PostToolUse",
          tool_name: "Edit",
          tool_input: { file_path: filePath, new_string: code },
        };
        const matched = findMatches(input, patterns);
        const hasTag = matched.some((p: PatternDefinition) => tags.includes(p.tag ?? ""));
        expect(hasTag).toBe(false);
      });
    }
  });
};
