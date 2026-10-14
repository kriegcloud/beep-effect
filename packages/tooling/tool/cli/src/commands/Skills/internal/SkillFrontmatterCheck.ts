/**
 * Agent Skills frontmatter check over the installed `.claude/skills` tree.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { AgentSkillFrontmatterStrictParseOptions, decodeAgentSkillFrontmatter } from "@beep/ai-sync";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as Str from "effect/String";
import { extractFrontmatter } from "../../../internal/schema/Frontmatter.ts";
import { decodeYamlTextWith } from "../../../internal/schema/TextCodec.ts";
import {
  SKILL_BODY_LINE_LIMIT,
  SkillBodyAdvisory,
  SkillFrontmatterIssue,
  SkillFrontmatterReport,
} from "../SkillFrontmatter.schemas.ts";
import { SkillsCommandError } from "../Skills.errors.ts";

const decodeFrontmatter = decodeYamlTextWith((input: unknown) =>
  decodeAgentSkillFrontmatter(input, AgentSkillFrontmatterStrictParseOptions)
);

const countLines = (text: string): number =>
  Str.isEmpty(text) ? 0 : A.length(Str.split(text, "\n")) - (Str.endsWith("\n")(text) ? 1 : 0);

const frontmatterIssue = (skill: string, frontmatter: string): Effect.Effect<O.Option<string>> =>
  decodeFrontmatter(frontmatter).pipe(
    Effect.match({
      onFailure: (error) => O.some(error.message),
      onSuccess: (decoded) =>
        decoded.name === skill
          ? O.none()
          : O.some(`frontmatter name "${decoded.name}" must match the skill directory name "${skill}".`),
    })
  );

/**
 * Check every installed skill's `SKILL.md` against the Agent Skills format.
 *
 * **Details**
 *
 * Each skill contributes at most one issue: a missing frontmatter block, a
 * frontmatter block that fails strict decoding (unknown keys, bad name
 * grammar, over-long fields, non-string metadata), or a `name` that differs
 * from its directory. Files longer than {@link SKILL_BODY_LINE_LIMIT} lines
 * contribute an advisory, which never fails the check.
 *
 * **Example** (Check two installed skills)
 *
 * ```ts
 * import { checkInstalledSkills } from "@beep/repo-cli/test/SharedInternals"
 * import * as Effect from "effect/Effect"
 *
 * const program = checkInstalledSkills("/repo/.claude/skills", ["yeet", "closeout"])
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @param skillsDir - Absolute path of the installed skills root.
 * @param names - Installed skill directory names to check.
 * @returns The issues and advisories collected across every named skill.
 * @category validation
 * @since 0.0.0
 */
export const checkInstalledSkills = Effect.fn("Skills.checkInstalledSkills")(function* (
  skillsDir: string,
  names: ReadonlyArray<string>
): Effect.fn.Return<SkillFrontmatterReport, SkillsCommandError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const issues: Array<SkillFrontmatterIssue> = [];
  const advisories: Array<SkillBodyAdvisory> = [];

  for (const skill of names) {
    const skillFile = path.join(skillsDir, skill, "SKILL.md");
    const raw = yield* fs
      .readFileString(skillFile)
      .pipe(SkillsCommandError.mapError(`Failed to read ${skillFile}.`, skillFile, skill));
    const lines = countLines(raw);
    if (lines > SKILL_BODY_LINE_LIMIT) {
      advisories.push(SkillBodyAdvisory.make({ skill, lines, limit: SKILL_BODY_LINE_LIMIT }));
    }
    const issue = yield* O.match(extractFrontmatter(raw), {
      onNone: () => Effect.succeedSome("SKILL.md has no YAML frontmatter block."),
      onSome: (frontmatter) => frontmatterIssue(skill, frontmatter),
    });
    if (O.isSome(issue)) {
      issues.push(SkillFrontmatterIssue.make({ skill, message: issue.value }));
    }
  }

  return SkillFrontmatterReport.make({ issues, advisories });
});
