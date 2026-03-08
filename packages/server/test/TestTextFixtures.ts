import { mkdirSync, rmSync } from "node:fs"
import { basename, join } from "node:path"

export interface TextFixture {
  readonly root: string
  readonly relativeRoot: string
  readonly absolute: (...segments: ReadonlyArray<string>) => string
  readonly relative: (...segments: ReadonlyArray<string>) => string
}

export const makeTextFixture = (name: string): TextFixture => {
  const root = join(process.cwd(), "tmp", `${name}-${crypto.randomUUID()}`)
  mkdirSync(root, { recursive: true })
  const relativeRoot = join("tmp", basename(root))

  return {
    root,
    relativeRoot,
    absolute: (...segments) => join(root, ...segments),
    relative: (...segments) => join(relativeRoot, ...segments)
  }
}

export const cleanupTextFixture = (fixture: TextFixture): void => {
  rmSync(fixture.root, { recursive: true, force: true })
}
