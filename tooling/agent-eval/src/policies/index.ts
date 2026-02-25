/**
 * Adaptive policy loading and deterministic skill selection.
 *
 * @since 0.0.0
 * @module
 */

import { Effect, FileSystem, Path } from "effect";
import * as S from "effect/Schema";
import { AgentEvalDecodeError } from "../errors.js";
import { resolveFromCwd } from "../io.js";
import type { BenchCondition, TaskCategory } from "../schemas/index.js";

/**
 * Policy overlay configuration loaded from `.agents/policies`.
 *
 * @since 0.0.0
 * @category models
 */
export interface PolicyOverlay {
  readonly id: string;
  readonly description: string;
  readonly conditions: ReadonlyArray<BenchCondition>;
  readonly categories: ReadonlyArray<TaskCategory>;
  readonly priority: number;
  readonly maxSkills: number;
  readonly maxFacts: number;
  readonly maxChars: number;
  readonly keywords: ReadonlyArray<string>;
}

/**
 * Selected packet constraints after applying overlays.
 *
 * @since 0.0.0
 * @category models
 */
export interface PolicyPacket {
  readonly selectedPolicyIds: ReadonlyArray<string>;
  readonly maxSkills: number;
  readonly maxFacts: number;
  readonly maxChars: number;
}

/**
 * Skill candidate metadata used by deterministic selection.
 *
 * @since 0.0.0
 * @category models
 */
export interface SkillCandidate {
  readonly name: string;
  readonly keywords: ReadonlyArray<string>;
  readonly categories: ReadonlyArray<TaskCategory>;
}

const PolicyOverlaySchema = S.Struct({
  id: S.NonEmptyString,
  description: S.NonEmptyString,
  conditions: S.Array(S.Literals(["current", "minimal", "adaptive", "adaptive_kg"])),
  categories: S.Array(S.Literals(["apps_web", "tooling_cli", "package_lib"])),
  priority: S.Int,
  maxSkills: S.Int,
  maxFacts: S.Int,
  maxChars: S.Int,
  keywords: S.Array(S.NonEmptyString),
});

const decodeOverlay = S.decodeUnknownSync(S.fromJsonString(PolicyOverlaySchema));

/**
 * Deterministic skill candidates for focused Effect v4 guidance.
 *
 * @since 0.0.0
 * @category constants
 */
export const SkillCandidates: ReadonlyArray<SkillCandidate> = [
  {
    name: "effect-v4-services",
    keywords: ["service", "layer", "servicemap", "dependency", "constructor", "tagged"],
    categories: ["tooling_cli", "package_lib"],
  },
  {
    name: "effect-v4-errors",
    keywords: ["error", "catch", "match", "option", "typed", "taggederrorclass"],
    categories: ["apps_web", "tooling_cli", "package_lib"],
  },
  {
    name: "effect-v4-imports",
    keywords: ["import", "schema", "context", "array", "predicate", "record"],
    categories: ["apps_web", "tooling_cli", "package_lib"],
  },
  {
    name: "effect-v4-http-ai",
    keywords: ["chat", "tool", "http", "router", "stream", "openai", "graph"],
    categories: ["apps_web"],
  },
];

/**
 * Load policy overlays from a directory of JSON files.
 *
 * @since 0.0.0
 * @category functions
 */
export const loadPolicyOverlays = (policyDirectory: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const absoluteDirectory = yield* resolveFromCwd(policyDirectory);

    const entries = yield* fs.readDirectory(absoluteDirectory).pipe(Effect.orElseSucceed(() => []));

    const jsonFiles = entries.filter((entry) => entry.endsWith(".json"));
    const overlays = yield* Effect.forEach(jsonFiles, (entry) =>
      Effect.gen(function* () {
        const filePath = path.join(absoluteDirectory, entry);
        const content = yield* fs.readFileString(filePath, "utf8");
        return yield* Effect.try({
          try: () => decodeOverlay(content),
          catch: (cause) =>
            new AgentEvalDecodeError({
              source: filePath,
              message: `Invalid policy overlay in ${filePath}`,
              cause,
            }),
        });
      })
    );

    return overlays.sort((left, right) => right.priority - left.priority);
  });

/**
 * Resolve merged policy constraints for one run tuple.
 *
 * @since 0.0.0
 * @category functions
 */
export const selectPolicyPacket = (
  overlays: ReadonlyArray<PolicyOverlay>,
  condition: BenchCondition,
  category: TaskCategory
): PolicyPacket => {
  const active = overlays.filter(
    (overlay) => overlay.conditions.includes(condition) && overlay.categories.includes(category)
  );

  let maxSkills = 3;
  let maxFacts = 6;
  let maxChars = 2200;

  for (const overlay of active) {
    maxSkills = Math.min(maxSkills, overlay.maxSkills);
    maxFacts = Math.min(maxFacts, overlay.maxFacts);
    maxChars = Math.min(maxChars, overlay.maxChars);
  }

  return {
    selectedPolicyIds: active.map((overlay) => overlay.id),
    maxSkills,
    maxFacts,
    maxChars,
  };
};

const keywordScore = (prompt: string, keywords: ReadonlyArray<string>): number => {
  const loweredPrompt = prompt.toLowerCase();
  let score = 0;
  for (const keyword of keywords) {
    if (loweredPrompt.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }
  return score;
};

/**
 * Deterministically select focused skill modules with a strict max cap.
 *
 * @since 0.0.0
 * @category functions
 */
export const selectFocusedSkills = (
  prompt: string,
  category: TaskCategory,
  maxSkills: number
): ReadonlyArray<string> => {
  const scored = SkillCandidates.filter((candidate) => candidate.categories.includes(category))
    .map((candidate) => ({
      name: candidate.name,
      score: keywordScore(prompt, candidate.keywords),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return left.name.localeCompare(right.name);
    });

  return scored.slice(0, maxSkills).map((item) => item.name);
};

/**
 * Validate that the strict max-skills cap is honored.
 *
 * @since 0.0.0
 * @category functions
 */
export const hasValidSkillCap = (skills: ReadonlyArray<string>, maxSkills: number): boolean =>
  skills.length <= maxSkills;
