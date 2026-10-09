import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { MAX_NESTING_DEPTH, parse } from "../../../effected/spdx/internal/parser.ts";

describe("SPDX parser rejection paths", () => {
  it.effect("rejects scanner errors and malformed document and license references", () => Effect.gen(function* () {
    for (const input of ["MIT +", "+", "MIT\tOR Apache-2.0", "MIT_", "DocumentRef-doc", "DocumentRef-doc:",
      "DocumentRef-doc:AND", "DocumentRef-doc:MIT", "DocumentRef-:LicenseRef-x", "DocumentRef-doc:LicenseRef-", "LicenseRef-",
      "MIT WITH", "MIT WITH AND", "MIT WITH unknown", "MIT AND", "MIT OR", "(MIT", "(MIT OR)"])
      assert.strictEqual(parse(input), undefined, input);
  }));
  it.effect("bounds recursion at each grammar entry and recovers on a fresh parse", () => Effect.gen(function* () {
    for (const operator of ["OR", "AND"])
      assert.strictEqual(parse(Array.from({ length: MAX_NESTING_DEPTH + 1 }, () => "MIT").join(` ${operator} `)), undefined);
    // A parenthesis enters Or, And and Atom in sequence. These three depths
    // target each entry guard rather than just one deeply parenthesized case.
    for (const padding of ["MIT OR ", "MIT AND ", ""])
      assert.strictEqual(parse(padding + "(".repeat(85) + "MIT" + ")".repeat(85)), undefined);
    assert.deepStrictEqual(parse("MIT"), { kind: "license", id: "MIT", plus: false });
  }));
});
