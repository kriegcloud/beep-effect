// The toml-test compliance gate: one test per vendored corpus case, no skip
// list. Every valid pair must decode to its tagged expected value; every
// invalid file must fail through the typed error channel (TomlParseError,
// any code) — never as a defect, crash or hang.
//
// Fixtures arrive as raw UTF-8 text (NO newline normalization, see
// ../corpus.ts): several cases deliberately carry CRLF / lone-CR bytes — in
// both directions, valid CRLF documents and invalid bare-CR ones — protected
// by a scoped .gitattributes in the fixture tree.

import { Toml, TomlParseError } from "@beep/toml/Toml";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { invalidCases, readInvalid, readValid, readValidExpected, validCases } from "../corpus.ts";
import { expectFailure } from "../expectFailure.ts";
import { assertMatchesTagged } from "./taggedJson.ts";

const TaggedJson = S.fromJsonString(S.Unknown);

// Counts recorded in the fixture README — guards against a silently-empty walk.
const README_VALID_COUNT = 214;
const README_INVALID_COUNT = 467;

describe("toml-test compliance", () => {
  it("discovers the full vendored corpus", () => {
    assert.isAtLeast(validCases.length, README_VALID_COUNT, "valid corpus walk came up short");
    assert.isAtLeast(invalidCases.length, README_INVALID_COUNT, "invalid corpus walk came up short");
  });

  describe("valid", () => {
    for (const relPath of validCases) {
      it.effect(relPath, () =>
        Effect.gen(function* () {
          const source = readValid(relPath);
          const expected = yield* S.decodeEffect(TaggedJson)(readValidExpected(relPath));
          const actual = yield* Toml.parse(source);
          assertMatchesTagged(actual, expected, "$");
        })
      );
    }
  });

  describe("invalid", () => {
    for (const relPath of invalidCases) {
      it.effect(relPath, () =>
        Effect.gen(function* () {
          const source = readInvalid(relPath);
          const error = yield* expectFailure(Toml.parse(source));
          assert.instanceOf(error, TomlParseError);
        })
      );
    }
  });
});
