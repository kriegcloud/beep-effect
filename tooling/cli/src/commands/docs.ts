/**
 * Docs discovery command suite for command-first policy lookup.
 *
 * @since 0.0.0
 * @module
 */

import { Console, Effect } from "effect";
import { Argument, Command } from "effect/unstable/cli";

interface DocsSection {
  readonly name: "laws" | "skills" | "policies";
  readonly title: string;
  readonly summary: string;
  readonly lines: ReadonlyArray<string>;
  readonly keywords: ReadonlyArray<string>;
}

const DocsSections: ReadonlyArray<DocsSection> = [
  {
    name: "laws",
    title: "Codebase Laws",
    summary: "Effect-first quality law summary and validation entry points.",
    lines: [
      "Use Effect-first APIs and aliases defined by repository law.",
      "Reject unsafe typing escapes and untyped runtime errors.",
      "Keep domain logic free of native mutable runtime containers.",
      "Finish only when check, lint, test, and docgen pass.",
      "Run: bun run check",
      "Run: bun run lint",
      "Run: bun run test",
      "Run: bun run docgen",
    ],
    keywords: ["effect", "law", "laws", "quality", "lint", "check", "test", "docgen"],
  },
  {
    name: "skills",
    title: "Agent Skills",
    summary: "High-signal skills and usage expectations for coding agents.",
    lines: [
      "Use focused skills when a task clearly matches a specialized domain.",
      "Prefer minimal skill sets that directly match requested outcomes.",
      "Keep context tight and avoid broad, unfocused skill loading.",
      "Pair skills with verification commands before completion.",
      "Run: bun run beep docs find effect",
    ],
    keywords: ["skill", "skills", "agent", "workflow", "context"],
  },
  {
    name: "policies",
    title: "Policy Gates",
    summary: "Operational policy checks for agent output and repo hygiene.",
    lines: [
      "Benchmark compliance and allowlist checks are strict by default.",
      "Agent instruction surfaces must remain pathless and lightweight.",
      "Worktree runs must use isolated disposable worktrees when enabled.",
      "Run: bun run agents:check",
      "Run: bun run agents:pathless:check",
      "Run: bun run lint:effect-laws:strict",
    ],
    keywords: ["policy", "policies", "allowlist", "worktree", "pathless", "compliance"],
  },
];

const printSection = Effect.fn(function* (section: DocsSection) {
  yield* Console.log(`${section.title}`);
  yield* Console.log(`${section.summary}`);
  for (const line of section.lines) {
    yield* Console.log(`- ${line}`);
  }
});

const printDocsIndex = Effect.fn(function* () {
  yield* Console.log("Docs discovery commands:");
  yield* Console.log("- bun run beep docs laws");
  yield* Console.log("- bun run beep docs skills");
  yield* Console.log("- bun run beep docs policies");
  yield* Console.log("- bun run beep docs find <topic>");
});

const docsLawsCommand = Command.make(
  "laws",
  {},
  Effect.fn(function* () {
    const section = DocsSections.find((entry) => entry.name === "laws");
    if (section !== undefined) {
      yield* printSection(section);
    }
  })
).pipe(Command.withDescription("Show compact repository law summary and validation commands"));

const docsSkillsCommand = Command.make(
  "skills",
  {},
  Effect.fn(function* () {
    const section = DocsSections.find((entry) => entry.name === "skills");
    if (section !== undefined) {
      yield* printSection(section);
    }
  })
).pipe(Command.withDescription("Show compact skill usage guidance"));

const docsPoliciesCommand = Command.make(
  "policies",
  {},
  Effect.fn(function* () {
    const section = DocsSections.find((entry) => entry.name === "policies");
    if (section !== undefined) {
      yield* printSection(section);
    }
  })
).pipe(Command.withDescription("Show policy gates and compliance commands"));

const docsFindCommand = Command.make(
  "find",
  {
    topic: Argument.string("topic").pipe(Argument.withDescription("Keyword to match against docs content")),
  },
  Effect.fn(function* ({ topic }) {
    const normalizedTopic = topic.trim().toLowerCase();
    const matches = DocsSections.filter((section) => {
      if (section.name.includes(normalizedTopic)) {
        return true;
      }

      if (section.title.toLowerCase().includes(normalizedTopic)) {
        return true;
      }

      return section.keywords.some((keyword) => keyword.includes(normalizedTopic));
    });

    if (matches.length === 0) {
      yield* Console.log(`No direct docs match for "${topic}".`);
      yield* printDocsIndex();
      return;
    }

    for (let index = 0; index < matches.length; index += 1) {
      const section = matches[index];
      if (section === undefined) {
        continue;
      }
      if (index > 0) {
        yield* Console.log("");
      }
      yield* printSection(section);
    }
  })
).pipe(Command.withDescription("Find matching docs section by topic"));

/**
 * Command-first docs discovery entrypoint used by agent config surfaces.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const docsCommand = Command.make(
  "docs",
  {},
  Effect.fn(function* () {
    yield* printDocsIndex();
  })
).pipe(
  Command.withDescription("Discover laws, skills, and policies without path references"),
  Command.withSubcommands([docsLawsCommand, docsSkillsCommand, docsPoliciesCommand, docsFindCommand])
);
