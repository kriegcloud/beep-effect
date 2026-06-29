import { Semver, SemverFromString } from "@beep/schema/Semver";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { SemverFromString as SemverFromStringType } from "@beep/schema/Semver";
import type { Effect } from "effect";
import type * as O from "effect/Option";
import type * as Ordering from "effect/Ordering";

describe("Semver", () => {
  it("exposes the structured semantic version class from the Semver subpath", () => {
    const version = Semver.make({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: ["rc", "1"],
      build: ["build", "5"],
    });

    expect(version).type.toBe<Semver>();
    expect(version.major).type.toBe<number>();
    expect(version.minor).type.toBe<number>();
    expect(version.patch).type.toBe<number>();
    expect(version.prerelease).type.toBe<ReadonlyArray<string>>();
    expect(version.build).type.toBe<ReadonlyArray<string>>();
  });

  it("tracks the SemverFromString codec types", () => {
    expect<SemverFromStringType>().type.toBe<Semver>();
    expect<typeof SemverFromString.Encoded>().type.toBe<string>();

    const decode = S.decodeUnknownEffect(SemverFromString);
    const encode = S.encodeEffect(SemverFromString);
    const version = Semver.make({ major: 1, minor: 2, patch: 3, prerelease: [], build: [] });

    expect(decode("1.2.3")).type.toBe<Effect.Effect<Semver, S.SchemaError, never>>();
    expect(encode(version)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });

  it("exposes typed parser and ordering helpers", () => {
    expect(Semver.fromStr("v1.2.3")).type.toBe<O.Option<Semver>>();
    expect(Semver.preReleaseSegmentsFromStr("alpha.1")).type.toBe<O.Option<ReadonlyArray<string>>>();
    expect(Semver.comparePreReleaseIdentifier("alpha", "beta")).type.toBe<Ordering.Ordering>();
    expect(Semver.comparePreReleaseIdentifier("beta")).type.toBe<(left: string) => Ordering.Ordering>();
    expect(Semver.compare("1.0.0-alpha", "1.0.0")).type.toBe<Ordering.Ordering>();
    expect(Semver.compare("1.0.0")).type.toBe<(left: string | Semver) => Ordering.Ordering>();
    expect(Semver.satisfiesRange("1.2.3", "^1.0.0")).type.toBe<boolean>();
    expect(Semver.satisfiesRange("^1.0.0")).type.toBe<(rawVersion: string) => boolean>();
  });
});
