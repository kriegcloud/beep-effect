#!/usr/bin/env bun

import { Command } from "@effect/cli"
import { FileSystem } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
// biome-ignore lint/suspicious/noShadowRestrictedNames: Effect convention
import { Array, Effect, pipe, String } from "effect"

const exec = (cmd: string) => Effect.promise(() => Bun.$`sh -c ${cmd}`.text())

const execQuiet = (cmd: string) => Effect.promise(() => Bun.$`sh -c ${cmd}`.quiet().text())

const hasChangesets = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem
  const files = yield* fs.readDirectory(".changeset")
  return files.some((f) => f.endsWith(".md") && f !== "README.md")
})

const getChangedFiles = pipe(
  execQuiet("git status --porcelain"),
  Effect.map(String.trim),
  Effect.map((s) => (s === "" ? [] : s.split("\n"))),
)

const categorizeChanges = (files: string[]) => {
  const ogImages = files.filter((f) => f.includes("public/og/"))
  const manifest = files.filter((f) => f.includes("docs-manifest"))
  const other = files.filter((f) => !f.includes("public/og/") && !f.includes("docs-manifest"))
  return { ogImages, manifest, other }
}

const formatCommitMessage = (changes: { ogImages: string[]; manifest: string[]; other: string[] }) => {
  const parts: string[] = []

  if (changes.ogImages.length > 0) {
    const count = changes.ogImages.length
    parts.push(`${count} OG image${count > 1 ? "s" : ""}`)
  }

  if (changes.manifest.length > 0) {
    parts.push("CLI manifest")
  }

  if (changes.other.length > 0) {
    parts.push(`${changes.other.length} other file${changes.other.length > 1 ? "s" : ""}`)
  }

  return `Update generated files (${parts.join(", ")})`
}

const release = Command.make("release").pipe(
  Command.withDescription("Generate assets, version, and publish"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      // Check for changesets first
      const hasChanges = yield* hasChangesets
      if (!hasChanges) {
        yield* Effect.log("⚠️  No changesets found. Create one with:")
        yield* Effect.log('   bun scripts/changeset-named.ts "description"')
        return yield* Effect.fail(new Error("No changesets"))
      }

      // Generate OG images
      yield* Effect.log("📸 Generating OG images...")
      yield* exec("cd packages/website && bun ./scripts/generate-og.ts")

      // Generate manifest
      yield* Effect.log("📦 Generating CLI manifest...")
      yield* exec("cd packages/cli && bun ./scripts/generate-manifest.ts")

      // Check for changes and commit with descriptive message
      const changedFiles = yield* getChangedFiles
      if (changedFiles.length > 0) {
        const changes = categorizeChanges(changedFiles)
        const message = formatCommitMessage(changes)

        yield* Effect.log(`📝 Committing: ${message}`)
        yield* exec("git add -A")
        yield* exec(`git commit -m "${message}"`)
      } else {
        yield* Effect.log("✓ No generated files changed")
      }

      // Push so changelog plugin can fetch GitHub info
      yield* Effect.log("⬆️  Pushing commits...")
      yield* exec("git push")

      // Version with GitHub token for changelog
      yield* Effect.log("🔖 Running changeset version...")
      const token = yield* execQuiet("gh auth token").pipe(Effect.map(String.trim))
      yield* exec(`GITHUB_TOKEN=${token} bunx changeset version`)

      // Tag
      yield* Effect.log("🏷️  Creating tags...")
      const tagOutput = yield* exec("bunx changeset tag")
      const tagMatches = tagOutput.matchAll(/New tag:\s+(\S+)/g)
      const tags = Array.fromIterable(tagMatches).map((m) => m[1])

      if (tags.length === 0) {
        yield* Effect.log("⚠️  No tags created")
        return
      }

      // Push commits first
      yield* Effect.log("⬆️  Pushing commits...")
      yield* exec("git push")

      // Push each tag individually to reliably trigger GitHub Actions
      // (git push --follow-tags doesn't always trigger workflows)
      yield* Effect.log(`🏷️  Pushing ${tags.length} tag(s)...`)
      for (const tag of tags) {
        yield* exec(`git push origin ${tag}`)
      }

      yield* Effect.log(`✅ Released: ${tags.join(", ")}`)
    }),
  ),
)

const run = Command.run(release, {
  name: "release",
  version: "0.0.0",
})

pipe(run(process.argv), Effect.provide(BunContext.layer), BunRuntime.runMain)
