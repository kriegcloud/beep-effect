import { Lockfile } from "@beep/lockfiles/Lockfile";
import { importerVersionsOf, unanimousVersionOf } from "@beep/repo-workspaces/internal/importerVersions";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

it.effect("ignores absent, empty and filesystem resolutions while retaining concrete versions", () =>
  Effect.gen(function* () {
    const lockfile = yield* S.decodeUnknownEffect(Lockfile)({
      format: "pnpm",
      lockfileVersion: "9.0",
      packages: [],
      workspaceDependencies: [],
      importers: [
        {
          path: ".",
          dependencies: [
            { name: "absent", specifier: "*", depType: "dependencies" },
            ...["", "file:../local", "link:../local", "1.2.3(peer@4)", "2.0.0"].map((version, index) => ({
              name: `dep${index}`,
              specifier: "*",
              version,
              depType: "dependencies",
            })),
          ],
        },
      ],
    });
    const index = importerVersionsOf(lockfile);
    assert.deepStrictEqual(index, { ".": { dep3: "1.2.3", dep4: "2.0.0" } });
    assert.strictEqual(unanimousVersionOf("dep3")(index), "1.2.3");
  })
);
