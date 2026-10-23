// Differential against npm's own name validator, `validate-npm-package-name`
// (exact catalog pin 7.0.2, a devDependency only). The W3-f rule is that every
// name `PackageName` accepts is valid for npm's `validForOldPackages`; the
// reverse does not hold, because `PackageName` is stricter (lowercase only, at
// most 214 characters, no `~'!()*`).

import { PackageName, ScopedPackageName, UnscopedPackageName } from "@beep/package-json/PackageName";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import validate from "validate-npm-package-name";

// Short strings over the characters that decide npm validity: case, the
// leading-character rules, the scope separator and the special characters.
const NameLike = S.String.check(S.isPattern(/^[@a-zA-Z0-9._~!()*'/ -]{0,12}$/));

const CORNER_CASES = [
  "",
  "a",
  "-",
  "-a",
  ".a",
  "_a",
  "node_modules",
  "favicon.ico",
  "Node_Modules",
  "http",
  "a b",
  " a",
  "a~b",
  "UPPER",
  "@scope/pkg",
  "@scope/.pkg",
  "@.scope/pkg",
  "@scope/_pkg",
  "@scope/-pkg",
  "@-scope/pkg",
  "@scope/",
  "@/pkg",
  "@scope",
  "a/b",
  Str.repeat(214)("a"),
  Str.repeat(215)("a"),
];

describe("PackageName against validate-npm-package-name@7.0.2", () => {
  it.effect.prop("every accepted generated string is validForOldPackages", [NameLike], ([name]) =>
    Effect.sync(() => {
      if (PackageName.isValid(name)) {
        assert.isTrue(validate(name).validForOldPackages, name);
      }
    })
  );

  it.effect.prop("every generated unscoped name is validForOldPackages", [UnscopedPackageName], ([name]) =>
    Effect.sync(() => {
      assert.isTrue(validate(name).validForOldPackages, name);
    })
  );

  it.effect.prop("every generated scoped name is validForOldPackages", [ScopedPackageName], ([name]) =>
    Effect.sync(() => {
      assert.isTrue(validate(name).validForOldPackages, name);
    })
  );

  it("agrees on the corner cases wherever PackageName accepts", () => {
    for (const name of CORNER_CASES) {
      if (PackageName.isValid(name)) {
        assert.isTrue(validate(name).validForOldPackages, name);
      }
    }
  });

  it("rejects exactly what npm rejects among the names the shift moved", () => {
    for (const name of ["-a", "node_modules", "favicon.ico"]) {
      assert.isFalse(validate(name).validForOldPackages, name);
      assert.isFalse(PackageName.isValid(name), name);
    }
  });
});
