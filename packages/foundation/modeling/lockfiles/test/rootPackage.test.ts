// `Lockfile#rootPackage` per format, and the alias-aware
// `ResolvedPackage#installName` the bun parser records. The repo-cli
// consumers (`RootCatalog`, `CatalogUsage`) read the root bun.lock through
// these two members.

import { Lockfile } from "@beep/lockfiles/Lockfile";
import { ResolvedPackage } from "@beep/lockfiles/ResolvedPackage";
import { describe, it } from "@effect/vitest";
import { assertFalse, assertNone, assertSome, assertTrue, strictEqual } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { fixture } from "./support/fixtures.ts";
import type { LockfileFormat } from "@beep/lockfiles/LockfileFormat";

const parseFixture = (relative: string, format: LockfileFormat) => Lockfile.parse(fixture(relative), { format });

const versionOf = (pkg: O.Option<ResolvedPackage>): O.Option<string> => O.map(pkg, (resolved) => resolved.version);

const ALIASED_BUN = `{
  "lockfileVersion": 1,
  "workspaces": { "": { "name": "alias-root", "dependencies": { "string-width-cjs": "npm:string-width@^4.2.0" } } },
  "packages": {
    "string-width": ["string-width@5.1.2", "", {}],
    "string-width-cjs": ["string-width@4.2.3", "", {}],
    "string-width-cjs/@scope/inner": ["@scope/real@1.0.0", "", {}],
  }
}`;

const PEERED_PNPM = `lockfileVersion: '9.0'

importers:

  .:
    dependencies:
      react:
        specifier: 18.3.1
        version: 18.3.1
      react-dom:
        specifier: 18.3.1
        version: 18.3.1(react@18.3.1)

packages:

  react@18.3.1:
    resolution: {tarball: https://example.test/react-18.3.1.tgz}

  react-dom@18.3.1:
    resolution: {tarball: https://example.test/react-dom-18.3.1.tgz}
    peerDependencies:
      react: ^18.3.1

snapshots:

  react@18.3.1: {}

  react-dom@18.3.1(react@18.3.1):
    dependencies:
      react: 18.3.1
`;

const LINKED_PNPM = `lockfileVersion: '9.0'

importers:

  .:
    dependencies:
      '@local/lib':
        specifier: workspace:*
        version: link:packages/lib
      react:
        specifier: 18.3.1
        version: 18.3.1

  packages/lib: {}

packages:

  react@18.3.1:
    resolution: {tarball: https://example.test/react-18.3.1.tgz}

snapshots:

  react@18.3.1: {}
`;

describe("Lockfile#rootPackage", () => {
  it.effect("bun: the instance keyed by the bare install name, not a nested one", () =>
    Effect.gen(function* () {
      const lockfile = yield* parseFixture("bun/nested/bun.lock", "bun");
      assertSome(versionOf(lockfile.rootPackage("react")), "17.0.2");
      assertTrue(O.exists(lockfile.rootPackage("@nested/lib"), (pkg) => pkg.isWorkspace));
      assertNone(lockfile.rootPackage("absent"));
    })
  );

  it.effect("bun: an aliased install answers to its alias and keeps its real name", () =>
    Effect.gen(function* () {
      const lockfile = yield* Lockfile.parse(ALIASED_BUN, { format: "bun" });
      const aliased = O.getOrThrow(lockfile.rootPackage("string-width-cjs"));
      strictEqual(aliased.name, "string-width");
      strictEqual(aliased.version, "4.2.3");
      strictEqual(aliased.installName, "string-width-cjs");
      assertSome(versionOf(lockfile.rootPackage("string-width")), "5.1.2");
    })
  );

  it.effect("npm: the instance at node_modules/<name>", () =>
    Effect.gen(function* () {
      const lockfile = yield* parseFixture("npm/nested/package-lock.json", "npm");
      assertSome(
        O.map(lockfile.rootPackage("react"), (pkg) => pkg.instanceId),
        "node_modules/react"
      );
      assertNone(lockfile.rootPackage("absent"));
    })
  );

  it.effect("pnpm: the root importer's version composes the snapshot id, peer suffix included", () =>
    Effect.gen(function* () {
      const lockfile = yield* Lockfile.parse(PEERED_PNPM, { format: "pnpm" });
      assertSome(
        O.map(lockfile.rootPackage("react-dom"), (pkg) => pkg.instanceId),
        "react-dom@18.3.1(react@18.3.1)"
      );
      assertSome(versionOf(lockfile.rootPackage("react")), "18.3.1");
      assertNone(lockfile.rootPackage("absent"));
    })
  );

  it.effect("pnpm: an aliased root dependency resolves through its recorded <real>@<version>", () =>
    Effect.gen(function* () {
      const lockfile = yield* parseFixture("pnpm/alias/pnpm-lock.yaml", "pnpm");
      assertSome(versionOf(lockfile.rootPackage("glob")), "10.4.5");
      const aliased = O.getOrThrow(lockfile.rootPackage("semver-classic"));
      strictEqual(aliased.name, "semver");
      strictEqual(aliased.version, "7.6.3");
    })
  );

  it.effect("pnpm: a workspace root dependency recorded as link:<path> answers None", () =>
    Effect.gen(function* () {
      const lockfile = yield* Lockfile.parse(LINKED_PNPM, { format: "pnpm" });
      assertNone(lockfile.rootPackage("@local/lib"));
      assertSome(versionOf(lockfile.rootPackage("react")), "18.3.1");
    })
  );

  it.effect("yarn: no importers, so no root resolution", () =>
    Effect.gen(function* () {
      const lockfile = yield* parseFixture("yarn/v1/yarn.lock", "yarn");
      assertTrue(A.isReadonlyArrayNonEmpty(lockfile.packages));
      assertNone(lockfile.rootPackage(O.getOrThrow(A.head(lockfile.packages)).name));
    })
  );
});

describe("ResolvedPackage#installName", () => {
  it.effect("bun records an alias only where the install name differs from the real name", () =>
    Effect.gen(function* () {
      const lockfile = yield* Lockfile.parse(ALIASED_BUN, { format: "bun" });
      const byInstance = (id: string) => O.getOrThrow(lockfile.packageByInstanceId(id));
      strictEqual(byInstance("string-width").alias, undefined);
      strictEqual(byInstance("string-width").installName, "string-width");
      strictEqual(byInstance("string-width-cjs").alias, "string-width-cjs");
      // A nested scoped install keeps both scope segments of its install name.
      strictEqual(byInstance("string-width-cjs/@scope/inner").installName, "@scope/inner");
      strictEqual(byInstance("string-width-cjs/@scope/inner").name, "@scope/real");
    })
  );

  it("falls back to the name, and survives a rename", () => {
    const plain = ResolvedPackage.make({ name: "effect", version: "4.0.2", instanceId: "effect", isWorkspace: false });
    strictEqual(plain.installName, "effect");
    const aliased = ResolvedPackage.make({
      name: "string-width",
      alias: "string-width-cjs",
      version: "4.2.3",
      instanceId: "string-width-cjs",
      isWorkspace: false,
    });
    strictEqual(aliased.withName("renamed").installName, "string-width-cjs");
    assertFalse(aliased.installName === aliased.name);
  });
});
