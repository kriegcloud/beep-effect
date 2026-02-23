#!/usr/bin/env bun
/**
 * UserPromptSubmit Hook - Skill Suggester
 *
 * This hook runs when a user submits a prompt.
 * It dynamically reads skill files and analyzes the prompt for keywords.
 *
 * @category Hooks
 * @since 1.0.0
 */

import { Effect, Console, pipe, Array, Record, Option, String } from "effect"
import { Terminal, FileSystem, Path } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { UserPromptInput } from "./schemas"
import * as Schema from "effect/Schema"


/**
 * Skill metadata extracted from skill files
 */
interface SkillMetadata {
  readonly name: string
  readonly keywords: ReadonlyArray<string>
}

/**
 * Parse frontmatter from markdown file
 */
const parseFrontmatter = (content: string): Record.ReadonlyRecord<string, string> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) return Record.empty()

  const frontmatter = match[1]
  const lines = String.split(frontmatter, "\n")

  const entries = Array.filterMap(lines, (line) =>
    pipe(
      line,
      String.indexOf(":"),
      Option.flatMap(colonIndex => {
        const key = pipe(line, String.slice(0, colonIndex), String.trim)
        const value = pipe(line, String.slice(colonIndex + 1), String.trim)

        return String.isNonEmpty(key) && String.isNonEmpty(value)
          ? Option.some([key, value] as const)
          : Option.none()
      })
    )
  )

  return Record.fromEntries(entries)
}

/**
 * Extract keywords from description
 * Extracts meaningful words (3+ chars) and common technical terms
 */
const extractKeywords = (text: string): ReadonlyArray<string> => {
  // Remove common words and extract meaningful terms
  const commonWords = new Set([
    "the", "and", "for", "with", "using", "that", "this", "from",
    "are", "can", "will", "use", "used", "make", "makes", "create"
  ])

  const lowercased = String.toLowerCase(text)
  const words = String.split(lowercased, /[\s,.-]+/)

  return Array.filter(words, word =>
    String.length(word) >= 3 && !commonWords.has(word)
  )
}

/**
 * Output schema for skill suggestions
 * Following Claude Code's UserPromptSubmit hook format
 */
const SkillSuggestion = Schema.Struct({
  hookSpecificOutput: Schema.Struct({
    hookEventName: Schema.Literal("UserPromptSubmit"),
    additionalContext: Schema.String,
  }),
})

/**
 * Read a single skill file and extract metadata
 */
const readSkillFile = (skillPath: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    const content = yield* fs.readFileString(skillPath)
    const frontmatter = parseFrontmatter(content)
    const name = frontmatter.name || path.basename(path.dirname(skillPath))
    const description = frontmatter.description || ""

    // Extract keywords from both name and description
    const nameKeywords = extractKeywords(name)
    const descKeywords = extractKeywords(description)
    const keywords = Array.dedupe(
      Array.appendAll(nameKeywords, descKeywords)
    )

    return { name, keywords }
  })

/**
 * Load all skills from the skills directory
 */
const loadSkills = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const path = yield* Path.Path

  const skillsDir = path.join(".claude", "skills")

  const exists = yield* fs.exists(skillsDir)

  if (!exists) { return Array.empty<SkillMetadata>() }

  // Read all subdirectories
  const entries = yield* fs.readDirectory(skillsDir)

  // Read SKILL.md from each subdirectory using filterMap pattern
  const skillEffects = Array.map(entries, entry =>
    Effect.option(readSkillFile(path.join(skillsDir, entry, "SKILL.md")))
  )


  const skillOptions = yield* Effect.all(skillEffects, { concurrency: "unbounded" })

  return Array.getSomes(skillOptions)
})

/**
 * Case-insensitive keyword matching
 *
 * @category Utilities
 * @since 1.0.0
 */
const matchesKeyword = (prompt: string, keyword: string): boolean =>
  pipe(
    String.toLowerCase(prompt),
    String.includes(String.toLowerCase(keyword))
  )

/**
 * Find all matching skills for a prompt
 *
 * @category Business Logic
 * @since 1.0.0
 */
const findMatchingSkills = (
  prompt: string,
  skills: ReadonlyArray<SkillMetadata>
): ReadonlyArray<string> =>
  Array.filterMap(skills, skill =>
    Array.some(skill.keywords, keyword => matchesKeyword(prompt, keyword))
      ? Option.some(skill.name)
      : Option.none()
  )

/**
 * Format skill suggestions as context reminder
 *
 * @category Business Logic
 * @since 1.0.0
 */
const formatSkillSuggestion = (
  skills: ReadonlyArray<string>
) =>
  pipe(
    {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit" as const,
        additionalContext: `💡 Relevant skills: ${skills.join(", ")}`,
      },
    },
    Schema.encode(Schema.parseJson(SkillSuggestion))
  )
/**
 * Main program - orchestrates skill suggestion pipeline
 *
 * @category Main
 * @since .0.0
 *
 * @example
 * ```typescript
 * // Input (stdin):
 * // {"prompt": "Help me create a service with dependency injection"}
 * //
 * // Output (stdout):
 * // {
 * //   "hookSpecificOutput": {
 * //     "hookEventName": "UserPromptSubmit",
 * //     "additionalContext": "💡 Relevant skills: service-implementation, layer-design"
 * //   }
 * // }
 * ```
 */
const program = Effect.gen(function* () {
  // Load all available skills
  const skills = yield* loadSkills
  const terminal = yield* Terminal.Terminal

  // Read and parse stdin
  const stdin = yield* terminal.readLine
  const input = yield* Schema.decode(Schema.parseJson(UserPromptInput))(stdin)

  // Find matching skills
  const matchingSkills = findMatchingSkills(input.prompt, skills)

  // Output suggestion if skills found (otherwise exit silently)
  if (Array.isNonEmptyReadonlyArray(matchingSkills)) {
    const formatted = yield* formatSkillSuggestion(matchingSkills)
    yield* Console.log(formatted)
  }
})

/**
 * Runnable program with graceful error handling
 *
 * Exits with code 0 even on errors to avoid disrupting the hook system
 */
const runnable = pipe(
  program,
  Effect.provide(BunContext.layer),
  Effect.catchAll((error) =>
    Console.error(`Skill suggester encountered an error: ${error.message}`)
  )
)

/**
 * Execute the Effect program using BunRuntime
 */
BunRuntime.runMain(runnable)
