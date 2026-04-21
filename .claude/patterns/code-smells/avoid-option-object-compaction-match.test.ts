import { NodeServices } from "@effect/platform-node";
import { Effect } from "effect";
import { beforeAll, describe, expect, it } from "vitest";
import { findMatches, type HookInput, loadPatterns } from "../../hooks/pattern-detector/core.ts";
import { provideLayerScoped } from "../../internal/runtime.ts";
import type { PatternDefinition } from "../schema.ts";

let patterns: PatternDefinition[] = [];

beforeAll(async () => {
  patterns = await Effect.runPromise(Effect.scoped(provideLayerScoped(loadPatterns, NodeServices.layer)));
});

const matchCode = (code: string): PatternDefinition[] => {
  const input: HookInput = {
    hook_event_name: "PostToolUse",
    tool_name: "Edit",
    tool_input: { file_path: "test.ts", new_string: code },
  };

  return findMatches(input, patterns);
};

describe("avoid-option-object-compaction-match", () => {
  it("matches empty-object Option match object compaction", () => {
    const matched = matchCode(
      [
        "export const runtime = pipe(",
        "  maybeParse,",
        "  O.match({",
        "    onNone: () => ({}),",
        "    onSome: (parse) => ({ Bun: { YAML: { parse } } }),",
        "  })",
        ");",
      ].join("\n")
    );

    const pattern = matched.find((candidate) => candidate.tag === "avoid-option-object-compaction-match");

    expect(pattern).toBeDefined();
    expect(pattern?.body).toContain("O.map(...)");
    expect(pattern?.body).toContain("O.getOrElse(() => ({}))");
    expect(pattern?.body).toContain("R.getSomes({...})");
    expect(pattern?.body).toContain("S.OptionFromOptionalKey");
  });

  it("does not match already-flat Option object helpers or schema boundary helpers", () => {
    expect(matchCode("const options = R.getSomes({ package: selector })")).not.toContainEqual(
      expect.objectContaining({ tag: "avoid-option-object-compaction-match" })
    );
    expect(matchCode("const field = S.OptionFromOptionalKey(S.String)")).not.toContainEqual(
      expect.objectContaining({ tag: "avoid-option-object-compaction-match" })
    );
  });
});
