import * as Public from "@beep/semver";
import { Comparator, InvalidComparatorError } from "@beep/semver/Comparator";
import { InvalidRangeError, Range, UnsatisfiableConstraintError } from "@beep/semver/Range";
import { InvalidVersionError, SemVer, SemVerBump } from "@beep/semver/SemVer";
import { EmptyCacheError, UnsatisfiedRangeError, VersionCache, VersionNotFoundError } from "@beep/semver/VersionCache";
import { VersionDiff } from "@beep/semver/VersionDiff";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("the public entrypoint exposes the owned models, codecs, errors and cache unchanged", () =>
  Effect.sync(() => {
    assert.deepStrictEqual(
      { ...Public },
      {
        Comparator,
        InvalidComparatorError,
        Range,
        InvalidRangeError,
        UnsatisfiableConstraintError,
        SemVer,
        SemVerBump,
        InvalidVersionError,
        VersionCache,
        EmptyCacheError,
        VersionNotFoundError,
        UnsatisfiedRangeError,
        VersionDiff,
      }
    );
  })
);
