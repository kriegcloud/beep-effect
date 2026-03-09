import { describe, expect, test } from "bun:test"
import { FileSystem, Path } from "@effect/platform"
import { BunContext } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { renderDocList, renderDocs } from "./cli"
import { DOCS } from "./docs-manifest"
import { EffectSolutionsService, GitService } from "./effect-solutions-service"
import { BrowserService, IssueService } from "./open-issue-service"

describe("effect-solutions CLI docs", () => {
  test("list output includes all docs", () => {
    const listOutput = renderDocList()
    for (const doc of DOCS) {
      expect(listOutput).toContain(doc.slug)
      expect(listOutput).toContain(doc.title)
      if (doc.description) {
        // Description might be wrapped, so check for key words instead
        const words = doc.description.split(/\s+/).filter((w) => w.length > 3)
        const hasKeyWords = words.some((word) => listOutput.includes(word))
        expect(hasKeyWords).toBe(true)
      }
    }
  })

  test("show renders multiple docs in order", () => {
    const firstTwo = DOCS.slice(0, 2)
    const slugs = firstTwo.map((doc) => doc.slug)
    const output = renderDocs(slugs)
    const firstSlug = slugs[0]
    const secondSlug = slugs[1]
    if (!firstSlug || !secondSlug) {
      throw new Error("Expected at least 2 docs")
    }
    expect(output.indexOf(firstSlug)).toBeLessThan(output.indexOf(secondSlug))
    expect(output).toContain(`(${firstSlug})`)
    expect(output).toContain(`(${secondSlug})`)
    expect(output).toContain("---")
  })

  test("show rejects unknown doc slugs", () => {
    expect(() => renderDocs(["unknown-doc"])).toThrowError(/Unknown doc slug/)
  })

  test("open issue with test layer", async () => {
    const program = Effect.gen(function* () {
      const issueService = yield* IssueService
      const result = yield* issueService.open({
        category: "Fix",
        title: "Broken link",
        description: "Example body",
      })

      expect(result.issueUrl).toContain("https://github.com/kitlangton/effect-solutions/issues/new")
    })

    await Effect.runPromise(program.pipe(Effect.provide(IssueService.layer), Effect.provide(BrowserService.testLayer)))
  })
})

describe("effect-solutions setup", () => {
  // Temp directory resource with acquire/release
  const TempDirectory = Effect.acquireRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const tmpBase = yield* fs.makeTempDirectory()
      const tmpDir = path.join(tmpBase, "effect-solutions-test")
      yield* fs.makeDirectory(tmpDir, { recursive: true })
      return tmpDir
    }),
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem
        yield* fs.remove(tmpDir, { recursive: true })
      }).pipe(Effect.orDie),
  )

  const TestLayer = EffectSolutionsService.layer.pipe(
    Layer.provide(GitService.testLayer),
    Layer.provideMerge(BunContext.layer),
  )

  test("setup creates .reference directory and updates .gitignore", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const service = yield* EffectSolutionsService

      yield* Effect.scoped(
        Effect.gen(function* () {
          const tmpDir = yield* TempDirectory

          // Run setup
          const result = yield* service.setup(tmpDir)

          // Verify result
          expect(result.created).toBe(true)
          expect(result.gitignoreUpdated).toBe(true)
          expect(result.effectDir).toBe(path.join(tmpDir, ".reference", "effect"))

          // Verify .reference/effect directory was created
          const effectDirExists = yield* fs.exists(result.effectDir)
          expect(effectDirExists).toBe(true)

          // Verify .gitignore was created with correct content
          const gitignorePath = path.join(tmpDir, ".gitignore")
          const gitignoreContent = yield* fs.readFileString(gitignorePath)
          expect(gitignoreContent).toContain(".reference/")
        }),
      )
    })

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
  })

  test("setup updates existing .gitignore without duplicating", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const service = yield* EffectSolutionsService

      yield* Effect.scoped(
        Effect.gen(function* () {
          const tmpDir = yield* TempDirectory

          // Create existing .gitignore
          const gitignorePath = path.join(tmpDir, ".gitignore")
          yield* fs.writeFileString(gitignorePath, "node_modules/\ndist/\n")

          // Run setup
          const result = yield* service.setup(tmpDir)

          expect(result.gitignoreUpdated).toBe(true)

          // Verify .gitignore has both old and new content
          const gitignoreContent = yield* fs.readFileString(gitignorePath)
          expect(gitignoreContent).toContain("node_modules/")
          expect(gitignoreContent).toContain(".reference/")
        }),
      )
    })

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
  })

  test("setup skips .gitignore update if already present", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const service = yield* EffectSolutionsService

      yield* Effect.scoped(
        Effect.gen(function* () {
          const tmpDir = yield* TempDirectory

          // Create .gitignore that already has .reference
          const gitignorePath = path.join(tmpDir, ".gitignore")
          yield* fs.writeFileString(gitignorePath, ".reference/\n")

          // Run setup
          const result = yield* service.setup(tmpDir)

          expect(result.gitignoreUpdated).toBe(false)
        }),
      )
    })

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
  })

  test("setup returns created=false when updating existing reference", async () => {
    const program = Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path
      const service = yield* EffectSolutionsService

      yield* Effect.scoped(
        Effect.gen(function* () {
          const tmpDir = yield* TempDirectory

          // Pre-create .reference/effect directory
          const effectDir = path.join(tmpDir, ".reference", "effect")
          yield* fs.makeDirectory(effectDir, { recursive: true })

          // Run setup
          const result = yield* service.setup(tmpDir)

          expect(result.created).toBe(false)
        }),
      )
    })

    await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
  })
})
