import {
  buildEffectSteeringBlock,
  buildKgContextBlock,
  extractKeywords,
  findMatchingSkills,
  matchesWordBoundary,
  type SkillMetadata,
  scoreSkill,
  shouldShowEffectSteering,
} from "@beep/claude/hooks/skill-suggester/index";
import * as TestClaude from "@beep/claude/test/TestClaude";
import { BunServices } from "@effect/platform-bun";
import { Effect, FileSystem } from "effect";
import { describe, expect, it } from "vitest";
import { provideLayerScoped } from "../../internal/runtime.ts";

const runWithBun = <A, E>(effect: Effect.Effect<A, E, FileSystem.FileSystem>) =>
  Effect.runPromise(Effect.scoped(provideLayerScoped(effect, BunServices.layer)));

const writeSnapshotFile = (filePath: string, content: string) =>
  runWithBun(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const lastSlash = filePath.lastIndexOf("/");
      const directory = lastSlash === -1 ? "." : filePath.slice(0, lastSlash);
      yield* fs.makeDirectory(directory, { recursive: true });
      yield* fs.writeFileString(filePath, content);
    })
  );

const removeDirectory = (directory: string) =>
  runWithBun(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.remove(directory, { recursive: true, force: true });
    })
  );

describe("skill-suggester", () => {
  describe("TestClaude.UserPromptSubmit", () => {
    it("creates properly shaped UserPromptSubmit hook input", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "test-session",
        transcript_path: "/tmp/transcript.json",
        cwd: "/project",
        permission_mode: "ask",
        prompt: "help me write tests with vitest",
      });

      expect(input.hook_event_name).toBe("UserPromptSubmit");
      expect(input.prompt).toBe("help me write tests with vitest");
      expect(input.session_id).toBe("test-session");
      expect(input.cwd).toBe("/project");
      expect(input.permission_mode).toBe("ask");
      expect(input.transcript_path).toBe("/tmp/transcript.json");
    });

    it("automatically sets hook_event_name", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "test",
        transcript_path: "/tmp/transcript.json",
        cwd: "/project",
        permission_mode: "ask",
        prompt: "test prompt",
      });

      expect(input.hook_event_name).toBe("UserPromptSubmit");
    });

    it("preserves all input fields", () => {
      const input = TestClaude.UserPromptSubmit({
        session_id: "session-123",
        transcript_path: "/path/to/transcript.json",
        cwd: "/workspace/project",
        permission_mode: "allow",
        prompt: "help with editor configuration",
      });

      expect(input).toEqual({
        hook_event_name: "UserPromptSubmit",
        session_id: "session-123",
        transcript_path: "/path/to/transcript.json",
        cwd: "/workspace/project",
        permission_mode: "allow",
        prompt: "help with editor configuration",
      });
    });
  });

  describe("TestClaude.HookOutput", () => {
    it("validates output shape with additionalContext", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<system-hints>\n<skills>effect-testing</skills>\n</system-hints>",
        },
      };

      expect(output.hookSpecificOutput.hookEventName).toBe("UserPromptSubmit");
      expect(output.hookSpecificOutput.additionalContext).toBeTruthy();
    });

    it("allows optional permission fields", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<tip>Use parallel tool calls</tip>",
        },
      };

      expect(output.hookSpecificOutput.permissionDecision).toBeUndefined();
      expect(output.hookSpecificOutput.permissionDecisionReason).toBeUndefined();
    });

    it("supports all optional fields", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "allow",
          permissionDecisionReason: "Safe operation",
          additionalContext: "<context>Additional info</context>",
        },
      };

      expect(output.hookSpecificOutput.permissionDecision).toBe("allow");
      expect(output.hookSpecificOutput.permissionDecisionReason).toBe("Safe operation");
      expect(output.hookSpecificOutput.additionalContext).toBe("<context>Additional info</context>");
    });
  });

  describe("TestClaude output helpers", () => {
    it("isAllow identifies allow decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "allow",
        },
      };

      expect(TestClaude.isAllow(output)).toBe(true);
      expect(TestClaude.isAsk(output)).toBe(false);
      expect(TestClaude.isDeny(output)).toBe(false);
    });

    it("isAsk identifies ask decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "ask",
        },
      };

      expect(TestClaude.isAsk(output)).toBe(true);
      expect(TestClaude.isAllow(output)).toBe(false);
      expect(TestClaude.isDeny(output)).toBe(false);
    });

    it("isDeny identifies deny decision", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "deny",
        },
      };

      expect(TestClaude.isDeny(output)).toBe(true);
      expect(TestClaude.isAllow(output)).toBe(false);
      expect(TestClaude.isAsk(output)).toBe(false);
    });

    it("reason extracts permissionDecisionReason", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          permissionDecision: "deny",
          permissionDecisionReason: "Dangerous operation",
        },
      };

      expect(TestClaude.reason(output)).toBe("Dangerous operation");
    });

    it("context extracts additionalContext", () => {
      const output: TestClaude.HookOutput = {
        hookSpecificOutput: {
          hookEventName: "UserPromptSubmit",
          additionalContext: "<skills>effect-testing</skills>",
        },
      };

      expect(TestClaude.context(output)).toBe("<skills>effect-testing</skills>");
    });

    it("helpers handle null input", () => {
      expect(TestClaude.isAllow(null)).toBe(false);
      expect(TestClaude.isAsk(null)).toBe(false);
      expect(TestClaude.isDeny(null)).toBe(false);
      expect(TestClaude.reason(null)).toBeUndefined();
      expect(TestClaude.context(null)).toBeUndefined();
    });
  });

  describe("extractKeywords", () => {
    it("extracts words from text, lowercased", () => {
      const keywords = extractKeywords("Layer Testing Atom");
      expect(keywords).toContain("layer");
      expect(keywords).toContain("testing");
      expect(keywords).toContain("atom");
    });

    it("splits on spaces, commas, dots, and hyphens", () => {
      const keywords = extractKeywords("react-vm,atom.state testing");
      expect(keywords).toContain("react");
      expect(keywords).toContain("atom");
      expect(keywords).toContain("state");
      expect(keywords).toContain("testing");
    });

    it("filters words shorter than 3 characters", () => {
      const keywords = extractKeywords("a vm do it now");
      expect(keywords).not.toContain("a");
      expect(keywords).not.toContain("vm");
      expect(keywords).not.toContain("do");
      expect(keywords).not.toContain("it");
      expect(keywords).toContain("now");
    });

    it("filters stopwords from the expanded set", () => {
      const keywords = extractKeywords(
        "effect service implement design pattern code type build handle write module define"
      );
      expect(keywords).toHaveLength(0);
    });

    it("filters original stopwords", () => {
      const keywords = extractKeywords("the and for with using that this from are can will use create run");
      expect(keywords).toHaveLength(0);
    });

    it("returns empty for empty string", () => {
      expect(extractKeywords("")).toHaveLength(0);
    });
  });

  describe("matchesWordBoundary", () => {
    it("matches exact word in prompt", () => {
      expect(matchesWordBoundary("help me test this", "test")).toBe(true);
    });

    it("does not match substring of longer word", () => {
      expect(matchesWordBoundary("help me with testing", "test")).toBe(false);
    });

    it("does not match prefix of longer word", () => {
      expect(matchesWordBoundary("contest the results", "test")).toBe(false);
    });

    it("matches at start of prompt", () => {
      expect(matchesWordBoundary("test the thing", "test")).toBe(true);
    });

    it("matches at end of prompt", () => {
      expect(matchesWordBoundary("run the test", "test")).toBe(true);
    });

    it("is case insensitive", () => {
      expect(matchesWordBoundary("Run Layer Tests", "layer")).toBe(true);
      expect(matchesWordBoundary("run layer tests", "Layer")).toBe(true);
    });

    it("handles special regex characters in keyword", () => {
      expect(matchesWordBoundary("use effect.gen for this", "effect.gen")).toBe(true);
    });
  });

  describe("scoreSkill", () => {
    it("gives +3 per name segment that matches as a word", () => {
      const skill: SkillMetadata = { name: "effect-testing", keywords: [] };
      const score = scoreSkill("help with testing", skill);
      expect(score).toBe(3);
    });

    it("gives +3 for each matching name segment", () => {
      const skill: SkillMetadata = { name: "atom-state", keywords: [] };
      const score = scoreSkill("update the atom state", skill);
      expect(score).toBe(6);
    });

    it("gives +1 per keyword match", () => {
      const skill: SkillMetadata = { name: "some-skill", keywords: ["layer", "atom", "registry"] };
      const score = scoreSkill("configure the layer and atom", skill);
      expect(score).toBe(2);
    });

    it("combines name and keyword scores", () => {
      const skill: SkillMetadata = { name: "atom-state", keywords: ["registry", "reactive"] };
      const score = scoreSkill("update the atom state with registry and reactive bindings", skill);
      expect(score).toBe(6 + 2);
    });

    it("returns 0 when nothing matches", () => {
      const skill: SkillMetadata = { name: "effect-testing", keywords: ["vitest", "layer"] };
      const score = scoreSkill("deploy to production", skill);
      expect(score).toBe(0);
    });

    it("does not count name segments shorter than 3 chars", () => {
      const skill: SkillMetadata = { name: "a-vm-x", keywords: [] };
      const score = scoreSkill("a vm x", skill);
      expect(score).toBe(0);
    });

    it("name match does not count substring matches", () => {
      const skill: SkillMetadata = { name: "test-skill", keywords: [] };
      const score = scoreSkill("this is a testing ground", skill);
      expect(score).toBe(0);
    });
  });

  describe("findMatchingSkills", () => {
    const skills: ReadonlyArray<SkillMetadata> = [
      { name: "effect-testing", keywords: ["vitest", "layer", "mock"] },
      { name: "react-vm", keywords: ["registry", "atom", "viewmodel"] },
      { name: "atom-state", keywords: ["subscription", "derived", "reactive"] },
      { name: "schema-validation", keywords: ["decode", "encode", "tagged"] },
      { name: "layer-composition", keywords: ["dependency", "injection", "provide"] },
    ];

    it("suggests a skill when its name matches as a word", () => {
      const result = findMatchingSkills("help me with testing", skills);
      expect(result).toContain("effect-testing");
    });

    it("suggests a skill when enough keywords match", () => {
      const result = findMatchingSkills("set up vitest with layer mocking", skills);
      expect(result).toContain("effect-testing");
    });

    it("does not suggest a skill with only 1 keyword hit (score=1, below threshold)", () => {
      const result = findMatchingSkills("I need to decode something", skills);
      expect(result).not.toContain("schema-validation");
    });

    it("ranks name-match skills higher than keyword-only matches", () => {
      const testSkills: ReadonlyArray<SkillMetadata> = [
        { name: "unrelated-tool", keywords: ["atom", "registry"] },
        { name: "atom-state", keywords: ["registry"] },
      ];
      const result = findMatchingSkills("update the atom state registry", testSkills);
      expect(result[0]).toBe("atom-state");
      expect(result).toContain("unrelated-tool");
    });

    it("returns at most 5 skills", () => {
      const manySkills: ReadonlyArray<SkillMetadata> = [
        { name: "skill-alpha", keywords: ["shared", "common"] },
        { name: "skill-bravo", keywords: ["shared", "common"] },
        { name: "skill-charlie", keywords: ["shared", "common"] },
        { name: "skill-delta", keywords: ["shared", "common"] },
        { name: "skill-echo", keywords: ["shared", "common"] },
        { name: "skill-foxtrot", keywords: ["shared", "common"] },
        { name: "skill-golf", keywords: ["shared", "common"] },
      ];
      const result = findMatchingSkills("shared common infrastructure", manySkills);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it("returns empty for empty prompt", () => {
      const result = findMatchingSkills("", skills);
      expect(result).toHaveLength(0);
    });

    it("returns empty when prompt contains only stopwords", () => {
      const result = findMatchingSkills("the and for with using this that from", skills);
      expect(result).toHaveLength(0);
    });

    it("does not match via substring (word boundary enforcement)", () => {
      const substringSkills: ReadonlyArray<SkillMetadata> = [{ name: "contest-winner", keywords: ["testing"] }];
      const result = findMatchingSkills("run the test suite", substringSkills);
      expect(result).not.toContain("contest-winner");
    });

    it("basic regression: skill with matching name gets suggested", () => {
      const result = findMatchingSkills("configure the react vm layer", skills);
      expect(result).toContain("react-vm");
    });

    it("sorts results by score descending", () => {
      const scoredSkills: ReadonlyArray<SkillMetadata> = [
        { name: "low-scorer", keywords: ["atom", "registry"] },
        { name: "atom-state", keywords: ["atom", "registry", "reactive"] },
      ];
      const result = findMatchingSkills("atom registry reactive state", scoredSkills);
      expect(result[0]).toBe("atom-state");
    });

    it("excludes skills below score threshold even with partial matches", () => {
      const edgeSkills: ReadonlyArray<SkillMetadata> = [{ name: "obscure-tool", keywords: ["rare"] }];
      const result = findMatchingSkills("a rare occurrence", edgeSkills);
      expect(result).not.toContain("obscure-tool");
    });
  });

  describe("effect steering block", () => {
    it("shows effect steering for effect-first prompts", () => {
      expect(shouldShowEffectSteering("Please refactor this Effect Option flow")).toBe(true);

      const block = buildEffectSteeringBlock("Please refactor this Effect Option flow");
      expect(block._tag).toBe("Some");
      if (block._tag === "Some") {
        expect(block.value).toContain("<effect-steering>");
        expect(block.value).toContain("Before O.match(...)");
        expect(block.value).toContain("R.getSomes({...})");
        expect(block.value).toContain("O.all({...})");
        expect(block.value).toContain("S.OptionFrom*");
        expect(block.value).toContain("Match.type<T>().pipe(...)");
        expect(block.value).toContain("nested Bool.match(...)");
      }
    });

    it("skips effect steering for unrelated prompts", () => {
      expect(shouldShowEffectSteering("deploy the desktop app")).toBe(false);
      expect(buildEffectSteeringBlock("deploy the desktop app")._tag).toBe("None");
    });
  });

  describe("buildKgContextBlock", () => {
    it("returns none when snapshots are unavailable", () => {
      const none = buildKgContextBlock("/tmp/does-not-exist", "find module");
      expect(none._tag).toBe("None");
    });

    it("builds bounded kg-context block from latest snapshot", async () => {
      const cwd = `${process.cwd()}/.claude/_test-kg-hook-${Date.now()}`;
      const snapshotRoot = `${cwd}/tooling/ast-kg/.cache/snapshots`;
      await writeSnapshotFile(
        `${snapshotRoot}/test-commit.jsonl`,
        [
          JSON.stringify({
            file: "packages/fixture/src/index.ts",
            nodeCount: 4,
            edgeCount: 3,
          }),
          JSON.stringify({
            file: "packages/fixture/src/dep.ts",
            nodeCount: 2,
            edgeCount: 1,
          }),
        ].join("\n")
      );

      const context = buildKgContextBlock(cwd, "update fixture index module");
      expect(context._tag).toBe("Some");
      if (context._tag === "Some") {
        expect(context.value).toContain('<kg-context version="1">');
        expect(context.value).toContain("<symbols>");
        expect(context.value).toContain("<relationships>");
        expect(context.value).toContain("<confidence overall=");
        expect(context.value).toContain('<provenance local-cache="true"');
      }

      await removeDirectory(cwd);
    });

    it("escapes XML-like content from snapshot filenames", async () => {
      const cwd = `${process.cwd()}/.claude/_test-kg-hook-escape-${Date.now()}`;
      const snapshotRoot = `${cwd}/tooling/ast-kg/.cache/snapshots`;
      await writeSnapshotFile(
        `${snapshotRoot}/escape-commit.jsonl`,
        JSON.stringify({
          file: 'packages/<evil>"module"&.ts',
          nodeCount: 1,
          edgeCount: 0,
        })
      );

      const context = buildKgContextBlock(cwd, 'update evil "module"');
      expect(context._tag).toBe("Some");
      if (context._tag === "Some") {
        expect(context.value).toContain("&lt;evil&gt;");
        expect(context.value).toContain("&quot;module&quot;");
        expect(context.value).toContain("&amp;");
        expect(context.value).not.toContain('id="beep-effect::packages/<evil>"module"&.ts');
        expect(context.value).not.toContain('to="packages/<evil>"module"&.ts#nodes:1#edges:0"');
      }

      await removeDirectory(cwd);
    });
  });
});
