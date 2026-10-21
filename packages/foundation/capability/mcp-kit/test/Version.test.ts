/**
 * `VERSION` mirrors the package.json `version` field.
 *
 * @since 0.0.0
 */
import { VERSION } from "@beep/mcp-kit/Version";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const PackageJson = S.Struct({ version: S.String });
const decodePackageJson = S.decodeUnknownEffect(S.fromJsonString(PackageJson));

describe("@beep/mcp-kit VERSION", () => {
  it.effect("matches the package.json version", () =>
    Effect.gen(function* () {
      const packageJson = yield* Effect.promise(() =>
        Bun.file(new URL("../package.json", import.meta.url)).text()
      ).pipe(Effect.flatMap(decodePackageJson));

      expect(VERSION).toBe(packageJson.version);
    })
  );
});
