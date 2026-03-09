#!/usr/bin/env bun

import { Args, Command, Options } from "@effect/cli"
import { FileSystem } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Effect, pipe } from "effect"

const PACKAGES = {
  website: "@effect-best-practices/website",
  cli: "effect-solutions",
} as const

type PackageKey = keyof typeof PACKAGES
type BumpType = "patch" | "minor" | "major"

const isPackageKey = (value: string): value is PackageKey => value in PACKAGES

const isBumpType = (value: string): value is BumpType => ["patch", "minor", "major"].includes(value)

const changeset = Command.make("changeset", {
  description: Args.text({ name: "description" }).pipe(Args.withDescription("Changeset description")),
  package: Options.text("package").pipe(
    Options.withAlias("p"),
    Options.withDescription("Package: website or cli"),
    Options.withDefault("website"),
  ),
  bump: Options.text("bump").pipe(
    Options.withAlias("b"),
    Options.withDescription("Bump type: patch, minor, or major"),
    Options.withDefault("patch"),
  ),
}).pipe(
  Command.withDescription("Create a named changeset file"),
  Command.withHandler(({ description, package: pkg, bump }) =>
    Effect.gen(function* () {
      if (!isPackageKey(pkg)) {
        return yield* Effect.fail(new Error(`Invalid package: ${pkg}. Use: website or cli`))
      }
      if (!isBumpType(bump)) {
        return yield* Effect.fail(new Error(`Invalid bump: ${bump}. Use: patch, minor, or major`))
      }

      const fs = yield* FileSystem.FileSystem
      const packageName = PACKAGES[pkg]
      const kebabName = description.replace(/\s+/g, "-").toLowerCase()
      const fileName = `${kebabName}.md`
      const filePath = `.changeset/${fileName}`

      const content = `---
"${packageName}": ${bump}
---

${description}
`

      yield* fs.writeFileString(filePath, content)
      yield* Effect.log(`✅ Created changeset: ${fileName}`)
    }),
  ),
)

const run = Command.run(changeset, {
  name: "changeset-named",
  version: "0.0.0",
})

pipe(run(process.argv), Effect.provide(BunContext.layer), BunRuntime.runMain)
