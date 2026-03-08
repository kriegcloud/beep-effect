import { describe, expect, test } from "bun:test"
import { checkSymlink, clampPath } from "../src/SandboxPathClamp"

describe("clampPath", () => {
  const sandboxDir = "/tmp/sandbox"

  test("accepts valid relative path", () => {
    expect(clampPath("file.txt", sandboxDir)).toBe("/tmp/sandbox/file.txt")
  })

  test("accepts nested relative path", () => {
    expect(clampPath("sub/dir/file.txt", sandboxDir)).toBe("/tmp/sandbox/sub/dir/file.txt")
  })

  test("rejects absolute paths", () => {
    expect(() => clampPath("/etc/passwd", sandboxDir)).toThrow("Absolute paths not allowed")
  })

  test("rejects traversal with ../", () => {
    expect(() => clampPath("../escape", sandboxDir)).toThrow("Path escapes sandbox")
  })

  test("rejects nested traversal", () => {
    expect(() => clampPath("sub/../../escape", sandboxDir)).toThrow("Path escapes sandbox")
  })

  test("normalizes ./foo/../bar to sandboxDir/bar", () => {
    expect(clampPath("./foo/../bar", sandboxDir)).toBe("/tmp/sandbox/bar")
  })

  test("empty string resolves to sandboxDir itself", () => {
    expect(clampPath("", sandboxDir)).toBe("/tmp/sandbox")
  })

  test("dot resolves to sandboxDir itself", () => {
    expect(clampPath(".", sandboxDir)).toBe("/tmp/sandbox")
  })
})

describe("checkSymlink", () => {
  const sandboxDir = "/tmp/sandbox"

  test("passes when realPath stays within sandbox", async () => {
    await expect(
      checkSymlink("/tmp/sandbox/file.txt", sandboxDir, async () => "/tmp/sandbox/file.txt")
    ).resolves.toBeUndefined()
  })

  test("throws when symlink escapes sandbox", async () => {
    await expect(
      checkSymlink("/tmp/sandbox/link", sandboxDir, async () => "/etc/passwd")
    ).rejects.toThrow("Symlink escapes sandbox")
  })

  test("passes when realPath equals sandboxDir", async () => {
    await expect(
      checkSymlink("/tmp/sandbox", sandboxDir, async () => "/tmp/sandbox")
    ).resolves.toBeUndefined()
  })
})
