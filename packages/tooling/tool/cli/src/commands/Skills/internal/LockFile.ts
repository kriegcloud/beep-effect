/**
 * Reading `skills-lock.json` from a repository root.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Sha256HexFromBytes } from "@beep/schema";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SkillsCommandError, SkillsLockWriteRefusal } from "../Skills.errors.ts";
import type { Sha256Hex } from "@beep/schema";
import type * as Crypto from "effect/Crypto";

const textEncoder = new TextEncoder();
const decodeSha256HexFromBytes = S.decodeUnknownEffect(Sha256HexFromBytes);

/**
 * Repo-relative path of the skills lock.
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const SKILLS_LOCK_PATH = "skills-lock.json";

/**
 * Reads the lock's text, failing typed when it cannot be read.
 *
 * @internal
 * @category queries
 * @since 0.0.0
 */
export const readSkillsLockText = Effect.fn("SkillsLock.readSkillsLockText")(function* (
  repoRoot: string
): Effect.fn.Return<
  { readonly lockPath: string; readonly text: string },
  SkillsCommandError,
  FileSystem.FileSystem | Path.Path
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const lockPath = path.join(repoRoot, SKILLS_LOCK_PATH);
  const text = yield* fs
    .readFileString(lockPath)
    .pipe(SkillsCommandError.mapError(`Failed to read ${SKILLS_LOCK_PATH}.`, lockPath));
  return { lockPath, text };
});

/**
 * SHA-256 of the lock text's UTF-8 bytes: the digest a plan seals as `lockSha256`.
 *
 * @internal
 * @param text - The lock document text exactly as read or rendered.
 * @param label - The path or label named in a hashing failure.
 * @returns The lowercase hex digest of the text's UTF-8 bytes.
 * @category utilities
 * @since 0.0.0
 */
export const skillsLockTextSha256 = Effect.fn("SkillsLock.skillsLockTextSha256")(function* (
  text: string,
  label: string
): Effect.fn.Return<Sha256Hex, SkillsCommandError, Crypto.Crypto> {
  return yield* decodeSha256HexFromBytes(textEncoder.encode(text)).pipe(
    SkillsCommandError.mapError(`Failed to compute SHA-256 for ${label}.`, label)
  );
});

/**
 * Re-reads the lock and refuses with `lock-changed` unless it still hashes to `expected`.
 *
 * @internal
 * @category validation
 * @since 0.0.0
 */
export const requireSkillsLockUnchanged = Effect.fn("SkillsLock.requireLockUnchanged")(function* (
  lockPath: string,
  expected: Sha256Hex
): Effect.fn.Return<void, SkillsCommandError | SkillsLockWriteRefusal, FileSystem.FileSystem | Crypto.Crypto> {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs
    .readFileString(lockPath)
    .pipe(SkillsCommandError.mapError(`Failed to re-read ${SKILLS_LOCK_PATH}.`, lockPath));
  const actual = yield* skillsLockTextSha256(text, lockPath);
  if (!Str.Equivalence(actual, expected)) {
    return yield* SkillsLockWriteRefusal.make({
      reason: "lock-changed",
      message: `${SKILLS_LOCK_PATH} changed since planning (${expected} -> ${actual}); re-plan and review again.`,
    });
  }
});

/**
 * Publishes new lock text atomically: stage beside the lock (exclusive create),
 * re-check the lock bytes against `expected`, then rename over it.
 *
 * **Details**
 *
 * A leftover stage from a crashed run refuses instead of being overwritten,
 * and any failure removes this run's stage, so a refused or failed publish
 * leaves `skills-lock.json` byte for byte as it was.
 *
 * @internal
 * @category commands
 * @since 0.0.0
 */
export const publishSkillsLockText = Effect.fn("SkillsLock.publishSkillsLockText")(function* (
  repoRoot: string,
  lockText: string,
  expected: Sha256Hex,
  tag: string
): Effect.fn.Return<
  void,
  SkillsCommandError | SkillsLockWriteRefusal,
  FileSystem.FileSystem | Path.Path | Crypto.Crypto
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const lockPath = path.join(repoRoot, SKILLS_LOCK_PATH);
  const stage = `${lockPath}.staging-${tag}`;
  yield* fs
    .writeFileString(stage, lockText, { flag: "wx" })
    .pipe(SkillsCommandError.mapError(`Refusing to stage: ${stage} already exists.`, stage));
  yield* requireSkillsLockUnchanged(lockPath, expected).pipe(
    Effect.andThen(
      fs.rename(stage, lockPath).pipe(SkillsCommandError.mapError(`Failed to publish ${SKILLS_LOCK_PATH}.`, lockPath))
    ),
    Effect.onError(() => fs.remove(stage, { force: true }).pipe(Effect.ignore))
  );
});
