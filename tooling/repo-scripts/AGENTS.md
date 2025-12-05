**Purpose & Fit**
- Orchestrates repo-wide maintenance CLIs (bootstrap, env scaffolding, asset/locales generators, TS reference sync, Iconify registry flows) that hydrate other workspaces without duplicating Effect wiring.
- Provides the canonical `@effect/cli` + Bun runtime patterns for long-lived utilities; most scripts layer `FsUtils`, `RepoUtils`, or network clients so downstream packages can rely on generated artifacts (`@beep/constants`, `@beep/ui-core`, etc.).
- Hosts shared schemas and helpers (`utils/asset-path.schema.ts`, `iconify/schema.ts`) that gatekeep file-system outputs before they reach user-facing bundles.

**Surface Map**
- `src/bootstrap.ts` – interactive infra bootstrapper (Docker, migrations, `.env` copy) showcasing multi-stage terminal UX.
- `src/generate-env-secrets.ts` – secure secret hydrator; uses Effect `Random`, encoding, and `.env` preservation helpers.
- `src/generate-asset-paths.ts` & `src/utils/convert-to-nextgen.ts` – public asset crawler + AVIF converter enforcing schema compliance via `AssetPaths`.
- `src/generate-locales.ts` & `src/i18n/cldr.ts` – CLDR fetch + generator producing `packages/common/constants/src/_generated/ALL_LOCALES.generated.ts`.
- `src/sync-ts-references.ts` – wraps `update-ts-references` with auto-detection of repo tsconfig variants.
- `src/utils/asset-path.schema.ts` – schema definitions for asset path validation.
- `src/utils/convert-to-nextgen.ts` – AVIF/WebP image conversion utilities.
- `src/templates/package/*.hbs` – Turbo-ready workspace scaffolding templates.
- `test/ts-fence.test.ts` – Test coverage for TypeScript reference fencing.

**Usage Snapshots**
- Root `package.json` scripts expose the bootstrap flow and generators to contributors.
- `gen:secrets` and `gen:beep-paths` invoke `generate-env-secrets.ts` and `generate-asset-paths.ts`.
- `packages/common/constants/src/_generated/ALL_LOCALES.generated.ts` – generated header documents `generate-locales.ts` as the single source of truth.
- `test/ts-fence.test.ts` – demonstrates test patterns for TypeScript reference validation.

**Verifications**
- Run generators through root scripts to inherit `dotenvx`: `bun run gen:secrets`, `bun run gen:beep-paths`, `bun run execute` (prints locale payload), `bun run bootstrap`.
- Focused lint/type sweeps from package root: `bun run lint`, `bun run check`, `bun run test`, `bun run coverage`.

**Authoring Guardrails**
- Respect global Effect rules: namespace imports (`import * as Effect from "effect/Effect"`), rely on `A.*`, `Str.*`, `HashMap.*`, `HashSet.*`, `R.*`; no native `Array` / `String` helpers or loops in new code.
- Compose layers explicitly. Scripts that touch the filesystem must provide `FsUtilsLive` and `Path.Path` rather than hitting Bun APIs directly. Mirror `generate-locales.ts` layering patterns when adding new clients.
- Keep generator targets in `_generated/` folders idempotent and schema-validated (e.g., `AssetPaths`); always guard writes with decode + structured errors (`DomainError`).
- Prefer `FsUtils.modifyFile` / `existsOrThrow` for IO; avoid `node:fs` unless working inside `utils` where necessary (document the escape hatch).
- When new scripts need prompts or command args, centralize parsing in `@effect/cli` commands, keep handlers effectful, and expose test exports for test coverage.

**Quick Recipes**

```ts
import * as Effect from "effect/Effect";
import * as Command from "@effect/cli/Command";
import * as Console from "effect/Console";
import * as Layer from "effect/Layer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunContext from "@effect/platform-bun/BunContext";

const helloCommand = Command.make("hello", {}, () =>
  Effect.gen(function* () {
    yield* Console.log("👋 from repo-scripts");
  })
);

const cli = Command.run(helloCommand, { name: "hello", version: "0.1.0" });

BunRuntime.runMain(
  cli(process.argv).pipe(
    Effect.provide(Layer.mergeAll(BunContext.layer)),
    Effect.catchAll((error) => Console.log(`💥 ${String(error)}`))
  )
);
```

```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { AssetPaths } from "@beep/repo-scripts/utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as S from "effect/Schema";

const ensureGeneratedAssets = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const raw = yield* fs.readFileString("./apps/web/public/paths.txt");
  const paths = F.pipe(Str.split("\n")(raw), A.filter(Str.isNonEmpty));
  return yield* S.decodeUnknown(AssetPaths)(paths);
});
```

```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";

const processMarkdownFiles = Effect.gen(function* () {
  const fs = yield* FsUtils;
  const files = yield* fs.globFiles("docs/**/*.md");
  yield* Effect.forEach(files, (file) =>
    fs.modifyFile(file, (content) => F.pipe(content, Str.trim))
  );
}).pipe(Effect.provide(FsUtilsLive));
```

**Verifications**
- Fast feedback: `bun run lint --filter @beep/repo-scripts`, `bun run check --filter @beep/repo-scripts`, `bun run test --filter @beep/repo-scripts`.
- Asset/locales smoke tests: `bun run gen:beep-paths`, `bun run execute` (prints locale payload) – validate diffs before committing.
- For tsconfig sync, prefer check mode: `bunx turbo run sync-ts --filter=@beep/repo-scripts -- --check`.

**Contributor Checklist**
- Confirm generators target only `_generated/` files and run schema validations before writing.
- Update or extend test coverage under `tooling/repo-scripts/test` when changing CLI handlers or logic.
- Wire new scripts into root `package.json` if they must be globally available; document invocation here.
- Reuse `AssetPaths`, `DomainError`, and other shared types—avoid redefining ad-hoc schemas.
- Document new behaviors or guardrails in relevant package guides when they affect other slices.
- After code changes, ensure `bun run lint` / `bun run check` / `bun run test` pass before committing.
