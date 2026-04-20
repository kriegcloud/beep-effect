/**
 * Docs discovery command suite for command-first policy lookup.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Console, Effect, pipe, Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Argument, Command } from "effect/unstable/cli";
import { docsAggregateCommand } from "./DocsAggregate.js";

const $I = $RepoCliId.create("docs");

const DocsSectionName = LiteralKit(["laws", "skills", "policies"]).annotate(
  $I.annote("DocsSectionName", {
    description: "Name of a docs section.",
  })
);

type DocsSectionName = typeof DocsSectionName.Type;

class DocsSectionLaws extends S.Class<DocsSectionLaws>($I`DocsSectionLaws`)(
  {
    name: S.tag("laws"),
    title: S.String,
    summary: S.String,
    lines: S.Array(S.String),
    keywords: S.Array(S.String),
  },
  $I.annote("DocsSectionLaws", {
    description: "Docs section for repository laws.",
  })
) {}

class DocsSectionSkills extends S.Class<DocsSectionSkills>($I`DocsSectionSkills`)(
  {
    name: S.tag("skills"),
    title: S.String,
    summary: S.String,
    lines: S.Array(S.String),
    keywords: S.Array(S.String),
  },
  $I.annote("DocsSectionSkills", {
    description: "Docs section for agent skills.",
  })
) {}

class DocsSectionPolicies extends S.Class<DocsSectionPolicies>($I`DocsSectionPolicies`)(
  {
    name: S.tag("policies"),
    title: S.String,
    summary: S.String,
    lines: S.Array(S.String),
    keywords: S.Array(S.String),
  },
  $I.annote("DocsSectionPolicies", {
    description: "Docs section for policy gates.",
  })
) {}

/**
 * Documentation section model.
 *
 * @returns Tagged union schema keyed by `name`.
 * @category DomainModel
 * @since 0.0.0
 */
export const DocsSection = DocsSectionName.mapMembers(
  Tuple.evolve([() => DocsSectionLaws, () => DocsSectionSkills, () => DocsSectionPolicies])
)
  .pipe(S.toTaggedUnion("name"))
  .annotate(
    $I.annote("DocsSection", {
      description: "A section of documentation.",
    })
  );
/**
 * Documentation section model.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type DocsSection = typeof DocsSection.Type;

const DocsSections: ReadonlyArray<DocsSection> = [
  new DocsSectionLaws({
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
  }),
  new DocsSectionSkills({
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
  }),
  new DocsSectionPolicies({
    name: "policies",
    title: "Policy Gates",
    summary: "Operational policy checks for agent output and repo hygiene.",
    lines: [
      "Effect governance and allowlist checks are strict by default.",
      "Agent instruction surfaces must remain pathless and lightweight.",
      "Worktree runs must use isolated disposable worktrees when enabled.",
      "Run: bun run lint:effect-governance",
    ],
    keywords: ["policy", "policies", "allowlist", "worktree", "pathless", "compliance"],
  }),
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
  yield* Console.log("- bun run beep docs aggregate");
});

const findSectionByName = (name: DocsSectionName): O.Option<DocsSection> =>
  A.findFirst(DocsSections, (entry) => entry.name === name);

const docsLawsCommand = Command.make(
  "laws",
  {},
  Effect.fn(function* () {
    const section = findSectionByName("laws");
    yield* O.match(section, {
      onNone: () => Effect.void,
      onSome: printSection,
    });
  })
).pipe(Command.withDescription("Show compact repository law summary and validation commands"));

const docsSkillsCommand = Command.make(
  "skills",
  {},
  Effect.fn(function* () {
    const section = findSectionByName("skills");
    yield* O.match(section, {
      onNone: () => Effect.void,
      onSome: printSection,
    });
  })
).pipe(Command.withDescription("Show compact skill usage guidance"));

const docsPoliciesCommand = Command.make(
  "policies",
  {},
  Effect.fn(function* () {
    const section = findSectionByName("policies");
    yield* O.match(section, {
      onNone: () => Effect.void,
      onSome: printSection,
    });
  })
).pipe(Command.withDescription("Show policy gates and compliance commands"));

const docsFindCommand = Command.make(
  "find",
  {
    topic: Argument.string("topic").pipe(Argument.withDescription("Keyword to match against docs content")),
  },
  Effect.fn(function* ({ topic }) {
    const normalizedTopic = pipe(topic, Str.trim, Str.toLowerCase);
    const matches = A.filter(DocsSections, (section) => {
      if (Str.includes(normalizedTopic)(section.name)) {
        return true;
      }

      if (pipe(section.title, Str.toLowerCase, Str.includes(normalizedTopic))) {
        return true;
      }

      return A.some(section.keywords, Str.includes(normalizedTopic));
    });

    yield* A.match(matches, {
      onEmpty: Effect.fnUntraced(function* () {
        yield* Console.log(`No direct docs match for "${topic}".`);
        yield* printDocsIndex();
      }),
      onNonEmpty: Effect.fn(function* (sections) {
        for (let index = 0; index < A.length(sections); index += 1) {
          const section = sections[index];
          if (section === undefined) {
            continue;
          }
          if (index > 0) {
            yield* Console.log("");
          }
          yield* printSection(section);
        }
      }),
    });
  })
).pipe(Command.withDescription("Find matching docs section by topic"));

/**
 * Command-first docs discovery entrypoint used by agent config surfaces.
 *
 * @category UseCase
 * @since 0.0.0
 */
export const docsCommand = Command.make("docs", {}, printDocsIndex).pipe(
  Command.withDescription("Discover laws, skills, and policies without path references"),
  Command.withSubcommands([
    docsLawsCommand,
    docsSkillsCommand,
    docsPoliciesCommand,
    docsFindCommand,
    docsAggregateCommand,
  ])
);
