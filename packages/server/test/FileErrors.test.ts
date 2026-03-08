import { describe, expect, it } from "@effect/vitest"
import {
  isFileNotFoundError,
  isReadLinkUnsupportedError
} from "../src/tools/file/FileErrors.js"

describe("FileErrors helpers", () => {
  it("detects not-found across platform error shapes", () => {
    expect(
      isFileNotFoundError({
        _tag: "PlatformError",
        reason: { _tag: "NotFound" }
      })
    ).toBe(true)

    expect(
      isFileNotFoundError({
        _tag: "PlatformError",
        reason: {
          _tag: "Unknown",
          cause: {
            code: "ENOENT"
          }
        }
      })
    ).toBe(true)

    expect(
      isFileNotFoundError({
        _tag: "SystemError",
        reason: "NotFound"
      })
    ).toBe(true)

    expect(
      isFileNotFoundError({
        code: "ENOENT"
      })
    ).toBe(true)

    expect(isFileNotFoundError({ message: "no such file or directory" })).toBe(true)
    expect(isFileNotFoundError({ message: "permission denied" })).toBe(false)
  })

  it("detects readLink unsupported/non-symlink shapes", () => {
    expect(
      isReadLinkUnsupportedError({
        _tag: "PlatformError",
        reason: { _tag: "BadResource" }
      })
    ).toBe(true)

    expect(
      isReadLinkUnsupportedError({
        _tag: "PlatformError",
        reason: {
          _tag: "Unknown",
          cause: {
            code: "EINVAL"
          }
        }
      })
    ).toBe(true)

    expect(
      isReadLinkUnsupportedError({
        _tag: "SystemError",
        reason: "InvalidData"
      })
    ).toBe(true)

    expect(
      isReadLinkUnsupportedError({
        code: "EINVAL"
      })
    ).toBe(true)

    expect(isReadLinkUnsupportedError({ message: "not a symbolic link" })).toBe(true)
    expect(isReadLinkUnsupportedError({ message: "operation not permitted" })).toBe(false)
  })
})
