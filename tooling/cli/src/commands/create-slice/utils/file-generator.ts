/**
 * @file File Generation Service for create-slice CLI
 *
 * Creates directory structure and files for a new vertical slice using
 * FsUtils and the TemplateService. Generates all sub-packages:
 * - domain: Pure business logic and entity definitions
 * - tables: Drizzle database schema
 * - server: Effect-based infrastructure (repos, services)
 * - client: SDK contracts for client consumption
 * - ui: React components
 *
 * Also creates:
 * - Entity ID files in packages/shared/domain/src/entity-ids/{slice}/
 * - tsconfig.slices/{slice}.json reference file
 *
 * @module create-slice/utils/file-generator
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { FsUtils, FsUtilsLive, RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import { FileWriteError } from "../errors.js";
import type { SliceContext } from "./template.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/create-slice/utils/file-generator");

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/**
 * Layer names for the 5 sub-packages in a vertical slice.
 */
const LAYERS = ["domain", "tables", "server", "client", "ui"] as const;
type LayerName = (typeof LAYERS)[number];

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Represents a file to be generated.
 *
 * @since 0.1.0
 * @category models
 */
export interface GeneratedFile {
  /** Absolute path where the file will be created */
  readonly path: string;
  /** Content to write to the file */
  readonly content: string;
  /** Whether this is a new file (true) or a modification (false) */
  readonly isNew: boolean;
}

/**
 * A plan describing what directories and files will be created.
 *
 * @since 0.1.0
 * @category models
 */
export interface GenerationPlan {
  /** Directories to create (in order) */
  readonly directories: readonly string[];
  /** Files to create with their content */
  readonly files: readonly GeneratedFile[];
}

// -----------------------------------------------------------------------------
// Template Content Generators
// -----------------------------------------------------------------------------

/**
 * Generates package.json content for a layer.
 */
const generatePackageJson = (layer: LayerName, context: SliceContext, _repoDir: string): string => {
  const packageName = `@beep/${context.sliceName}-${layer}`;
  const layerDescriptions: Record<LayerName, string> = {
    domain: `${context.sliceDescription} - Domain layer`,
    tables: `${context.sliceDescription} - Database tables`,
    server: `${context.sliceDescription} - Server infrastructure`,
    client: `${context.sliceDescription} - Client SDK`,
    ui: `${context.sliceDescription} - UI components`,
  };

  const baseDeps: Record<LayerName, Record<string, Record<string, string>>> = {
    domain: {
      peerDependencies: {
        "@beep/shared-domain": "workspace:^",
        "@beep/schema": "workspace:^",
        effect: "catalog:",
        "@effect/sql": "catalog:",
      },
      devDependencies: {
        "@effect/docgen": "catalog:",
        "@beep/shared-domain": "workspace:^",
        "@beep/schema": "workspace:^",
        effect: "catalog:",
        "@effect/sql": "catalog:",
        "@total-typescript/ts-reset": "catalog:",
      },
    },
    tables: {
      peerDependencies: {
        "@beep/shared-tables": "workspace:^",
        "@beep/schema": "workspace:^",
        "@beep/shared-domain": "workspace:^",
        [`@beep/${context.sliceName}-domain`]: "workspace:^",
        "drizzle-orm": "catalog:",
      },
      devDependencies: {
        "@effect/docgen": "catalog:",
        "@beep/shared-tables": "workspace:^",
        "@beep/schema": "workspace:^",
        "@beep/shared-domain": "workspace:^",
        [`@beep/${context.sliceName}-domain`]: "workspace:^",
        "drizzle-orm": "catalog:",
        "@total-typescript/ts-reset": "catalog:",
      },
    },
    server: {
      peerDependencies: {
        "@effect/sql": "catalog:",
        "@effect/sql-drizzle": "catalog:",
        "@effect/sql-pg": "catalog:",
        "@beep/shared-server": "workspace:^",
        [`@beep/${context.sliceName}-tables`]: "workspace:^",
        "@effect/platform": "catalog:",
        "drizzle-orm": "catalog:",
        effect: "catalog:",
        "@beep/shared-domain": "workspace:^",
        [`@beep/${context.sliceName}-domain`]: "workspace:^",
        "@beep/schema": "workspace:^",
      },
      devDependencies: {
        "@effect/docgen": "catalog:",
        "@effect/sql": "catalog:",
        "@effect/sql-drizzle": "catalog:",
        "@effect/sql-pg": "catalog:",
        [`@beep/${context.sliceName}-domain`]: "workspace:^",
        [`@beep/${context.sliceName}-tables`]: "workspace:^",
        "@effect/platform": "catalog:",
        "@beep/shared-server": "workspace:^",
        "drizzle-orm": "catalog:",
        effect: "catalog:",
        "@beep/shared-domain": "workspace:^",
        "@beep/schema": "workspace:^",
        "@total-typescript/ts-reset": "catalog:",
      },
    },
    client: {
      peerDependencies: {
        effect: "catalog:",
      },
      devDependencies: {
        "@effect/docgen": "catalog:",
        "babel-plugin-transform-next-use-client": "catalog:",
        "@babel/preset-react": "catalog:",
        effect: "catalog:",
        "@total-typescript/ts-reset": "catalog:",
      },
    },
    ui: {
      peerDependencies: {
        effect: "catalog:",
      },
      devDependencies: {
        "@effect/docgen": "catalog:",
        "babel-plugin-transform-next-use-client": "catalog:",
        "@babel/preset-react": "catalog:",
        effect: "catalog:",
        "@total-typescript/ts-reset": "catalog:",
      },
    },
  };

  // Standard scripts (client/ui have slightly different babel flags)
  const isClientOrUi = layer === "client" || layer === "ui";
  const babelFlags = isClientOrUi
    ? "--plugins babel-plugin-transform-next-use-client --plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs --presets @babel/preset-react"
    : "--plugins @babel/transform-export-namespace-from --plugins @babel/transform-modules-commonjs";
  const babelAnnotateFlags = isClientOrUi
    ? "--plugins babel-plugin-transform-next-use-client --plugins annotate-pure-calls --presets @babel/preset-react"
    : "--plugins annotate-pure-calls";

  // Layer-specific exports
  const layerExports: Record<LayerName, Record<string, string>> = {
    domain: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./entities": "./src/entities/index.ts",
      "./*": "./src/*.ts",
    },
    tables: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./schema": "./src/schema.ts",
      "./*": "./src/*.ts",
    },
    server: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./db": "./src/db.ts",
      "./*": "./src/*.ts",
    },
    client: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./*": "./src/*.ts",
    },
    ui: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./*": "./src/*.ts",
    },
  };

  const pkg = {
    name: packageName,
    version: "0.0.0",
    type: "module",
    license: "MIT",
    description: layerDescriptions[layer],
    publishConfig: {
      access: "public",
      provenance: true,
      directory: "dist",
      linkDirectory: false,
    },
    exports: layerExports[layer],
    repository: {
      type: "git",
      url: "git@github.com:kriegcloud/beep-effect.git",
      directory: `packages/${context.sliceName}/${layer}`,
    },
    scripts: {
      build: "bun run build-esm && bun run build-cjs && bun run build-annotate",
      dev: isClientOrUi
        ? "bun run dotenvx -- bunx tsc -b tsconfig.build.json --watch"
        : "tsc -b tsconfig.build.json --watch",
      "build-esm": "tsc -b tsconfig.build.json",
      "build-cjs": `babel build/esm ${babelFlags} --out-dir build/cjs --source-maps`,
      "build-annotate": `babel build/esm ${babelAnnotateFlags} --out-dir build/esm --source-maps`,
      check: "tsc -b tsconfig.json",
      test: "bun test",
      coverage: "bun test --coverage",
      lint: "biome check .",
      "lint:fix": "biome check . --write",
      "lint:circular": "bunx madge -c .",
    },
    ...baseDeps[layer],
    effect: {
      generateExports: {
        include: ["**/*.ts"],
      },
      generateIndex: {
        include: ["**/*.ts"],
      },
    },
  };

  return `${JSON.stringify(pkg, null, 2)}\n`;
};

/**
 * Generates tsconfig.json content (root config for the layer).
 */
const generateTsconfigJson = (_layer: LayerName): string => {
  const config = {
    extends: "../../../tsconfig.base.jsonc",
    include: [],
    references: [{ path: "tsconfig.src.json" }, { path: "tsconfig.test.json" }],
  };
  return `${JSON.stringify(config, null, 2)}\n`;
};

/**
 * Generates tsconfig.src.json content.
 */
const generateTsconfigSrc = (layer: LayerName, _context: SliceContext): string => {
  // Build references based on layer dependencies
  const references: { path: string }[] = [];

  // All layers depend on shared/domain and common/schema
  references.push({ path: "../../shared/domain" });
  references.push({ path: "../../common/schema/tsconfig.src.json" });

  // Layer-specific dependencies
  if (layer === "tables") {
    references.push({ path: "../domain" });
    references.push({ path: "../../shared/tables/tsconfig.src.json" });
  } else if (layer === "server") {
    references.push({ path: "../domain" });
    references.push({ path: "../tables" });
    references.push({ path: "../../shared/server/tsconfig.src.json" });
  } else if (layer === "client" || layer === "ui") {
    references.push({ path: "../domain" });
  }

  const config = {
    extends: "../../../tsconfig.base.jsonc",
    include: ["src"],
    references,
    compilerOptions: {
      types: ["node", "bun"],
      outDir: "build/src",
      rootDir: "src",
      moduleResolution: "bundler",
      incremental: true,
      skipLibCheck: true,
      esModuleInterop: true,
    },
  };
  return `${JSON.stringify(config, null, 2)}\n`;
};

/**
 * Generates tsconfig.build.json content.
 */
const generateTsconfigBuild = (layer: LayerName, _context: SliceContext): string => {
  // Build references based on layer dependencies
  const references: { path: string }[] = [];

  // Layer-specific build references
  references.push({ path: "../../shared/domain/tsconfig.build.json" });
  references.push({ path: "../../common/schema/tsconfig.build.json" });

  if (layer === "tables") {
    references.push({ path: "../domain/tsconfig.build.json" });
    references.push({ path: "../../shared/tables/tsconfig.build.json" });
  } else if (layer === "server") {
    references.push({ path: "../domain/tsconfig.build.json" });
    references.push({ path: "../tables/tsconfig.build.json" });
    references.push({ path: "../../shared/server/tsconfig.build.json" });
  } else if (layer === "client" || layer === "ui") {
    references.push({ path: "../domain/tsconfig.build.json" });
  }

  const config = {
    extends: "./tsconfig.src.json",
    compilerOptions: {
      types: ["node", "bun"],
      rootDir: "src",
      outDir: "build/esm",
      declarationDir: "build/dts",
      stripInternal: false,
      composite: true,
      declaration: true,
      sourceMap: true,
    },
    references,
  };
  return `${JSON.stringify(config, null, 2)}\n`;
};

/**
 * Generates tsconfig.test.json content.
 */
const generateTsconfigTest = (layer: LayerName, _context: SliceContext): string => {
  // Build references based on layer dependencies
  const references: { path: string }[] = [{ path: "tsconfig.src.json" }];

  // All layers depend on shared/domain and common/schema
  references.push({ path: "../../shared/domain" });
  references.push({ path: "../../common/schema/tsconfig.src.json" });

  // Layer-specific dependencies (duplicated for test context)
  if (layer === "tables") {
    references.push({ path: "../domain" });
    references.push({ path: "../../shared/tables/tsconfig.src.json" });
  } else if (layer === "server") {
    references.push({ path: "../domain" });
    references.push({ path: "../tables" });
    references.push({ path: "../../shared/server/tsconfig.src.json" });
  } else if (layer === "client" || layer === "ui") {
    references.push({ path: "../domain" });
  }

  const config = {
    extends: "../../../tsconfig.base.jsonc",
    include: ["test"],
    references,
    compilerOptions: {
      types: ["node", "bun"],
      tsBuildInfoFile: "./build/tsconfig.test.tsbuildinfo",
      rootDir: "test",
      noEmit: true,
      outDir: "build/test",
    },
  };
  return `${JSON.stringify(config, null, 2)}\n`;
};

/**
 * Generates reset.d.ts for TypeScript reset types.
 */
const generateResetDts = (): string => `import "@total-typescript/ts-reset";
`;

/**
 * Generates src/index.ts content based on layer.
 */
const generateSrcIndex = (layer: LayerName, context: SliceContext): string =>
  Match.value(layer).pipe(
    Match.when(
      "domain",
      () => `/**
 * @beep/${context.sliceName}-domain
 * ${context.sliceDescription} - Domain entities and value objects
 *
 * This module contains:
 * - Entity models
 * - Value objects
 * - Business rules (NO side effects)
 *
 * @module ${context.sliceName}-domain
 * @since 0.1.0
 */
export * as Entities from "./entities";
`
    ),
    Match.when(
      "tables",
      () => `/**
 * @beep/${context.sliceName}-tables
 * ${context.sliceDescription} - Drizzle ORM schemas
 *
 * @module ${context.sliceName}-tables
 * @since 0.1.0
 */
export * as ${context.SliceName}DbSchema from "./schema";
`
    ),
    Match.when(
      "server",
      () => `/**
 * @beep/${context.sliceName}-server
 * ${context.sliceDescription} - Server-side infrastructure
 *
 * This module contains:
 * - Database client (${context.SliceName}Db)
 * - Repositories
 * - Server-side services
 *
 * @module ${context.sliceName}-server
 * @since 0.1.0
 */
export * from "./db";
`
    ),
    Match.when(
      "client",
      () => `/**
 * @beep/${context.sliceName}-client
 * ${context.sliceDescription} - Client SDK
 *
 * This module contains:
 * - API contracts
 * - Client-side services
 * - Type definitions for API communication
 *
 * @module ${context.sliceName}-client
 * @since 0.1.0
 */

// Export client contracts here
// Example: export * from "./contracts";
`
    ),
    Match.when(
      "ui",
      () => `/**
 * @beep/${context.sliceName}-ui
 * ${context.sliceDescription} - React UI components
 *
 * This module contains:
 * - React components
 * - Hooks
 * - UI utilities
 *
 * @module ${context.sliceName}-ui
 * @since 0.1.0
 */

// Export UI components here
// Example: export * from "./components";
`
    ),
    Match.exhaustive
  );

/**
 * Generates domain/src/entities.ts barrel file.
 */
const generateEntitiesBarrel = (): string => `export * from "./entities/index";
`;

/**
 * Generates domain/src/value-objects/index.ts.
 */
const generateValueObjectsIndex = (context: SliceContext): string =>
  `/**
 * Value objects for the ${context.sliceName} domain.
 *
 * Add value objects here as needed.
 */
export {};
`;

/**
 * Generates domain/src/entities/index.ts.
 */
const generateEntitiesIndex = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} domain entity exports
 *
 * @module ${context.sliceName}-domain/entities
 * @since 0.1.0
 */
export * as Placeholder from "./Placeholder";

// Export domain entities here
// Example: export * as MyEntity from "./MyEntity";
`;

/**
 * Generates domain/src/entities/Placeholder/index.ts.
 */
const generatePlaceholderEntityIndex = (context: SliceContext): string =>
  `/**
 * Placeholder entity exports
 *
 * @module ${context.sliceName}-domain/entities/Placeholder
 * @since 0.1.0
 */
export * from "./Placeholder.model";
`;

/**
 * Generates domain/src/entities/Placeholder/Placeholder.model.ts.
 */
const generatePlaceholderModel = (context: SliceContext): string =>
  `/**
 * Placeholder entity model for ${context.SliceName} slice
 *
 * This is a starter entity to demonstrate the pattern.
 * Rename or replace with your actual domain entities.
 *
 * @module ${context.sliceName}-domain/entities/Placeholder
 * @since 0.1.0
 */
import { $${context.SliceName}DomainId } from "@beep/identity/packages";
import { ${context.SliceName}EntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $${context.SliceName}DomainId.create("entities/Placeholder");

/**
 * Placeholder model for the ${context.sliceName} slice.
 *
 * Replace this with your actual domain entity model.
 *
 * @example
 * \`\`\`ts
 * import { Entities } from "@beep/${context.sliceName}-domain";
 *
 * const placeholder = Entities.Placeholder.Model.make({
 *   id: ${context.SliceName}EntityIds.PlaceholderId.make("placeholder__123"),
 *   name: "Example",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 * \`\`\`
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I\`PlaceholderModel\`)(
  makeFields(${context.SliceName}EntityIds.PlaceholderId, {
    name: S.NonEmptyTrimmedString.annotations({
      title: "Name",
      description: "The name of the placeholder entity",
    }),
    description: S.OptionFromNullOr(S.String).annotations({
      title: "Description",
      description: "Optional description of the placeholder entity",
    }),
  }),
  $I.annotations("PlaceholderModel", {
    description: "Placeholder model for the ${context.sliceName} domain context.",
  })
) {
  static readonly utils = modelKit(Model);
}
`;

/**
 * Generates tables/src/schema.ts.
 */
const generateTablesSchema = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} tables schema
 *
 * Re-exports all table definitions from the tables directory.
 */
export * from "./tables";
export * from "./relations";
`;

/**
 * Generates tables/src/tables/index.ts.
 */
const generateTablesTablesIndex = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} table exports
 *
 * @module ${context.sliceName}-tables/tables
 * @since 0.1.0
 */
export * from "./placeholder.table";

// Export table definitions here
// Example: export * from "./my-entity.table";
`;

/**
 * Generates tables/src/tables/placeholder.table.ts.
 */
const generatePlaceholderTable = (context: SliceContext): string =>
  `/**
 * Placeholder table definition for ${context.SliceName} slice
 *
 * Defines the database table schema for the Placeholder entity.
 * Replace or rename with your actual domain table definitions.
 *
 * @module ${context.sliceName}-tables/tables/placeholder
 * @since 0.1.0
 */
import { ${context.SliceName}EntityIds } from "@beep/shared-domain";
import { Table } from "@beep/shared-tables";
import * as pg from "drizzle-orm/pg-core";

/**
 * Placeholder table for the ${context.sliceName} slice.
 *
 * Uses Table.make factory to include standard audit columns
 * (id, createdAt, updatedAt).
 *
 * @since 0.1.0
 * @category tables
 */
export const placeholder = Table.make(${context.SliceName}EntityIds.PlaceholderId)(
  {
    name: pg.text("name").notNull(),
    description: pg.text("description"),
  },
  (t) => [pg.index("${context.slice_name}_placeholder_name_idx").on(t.name)]
);
`;

/**
 * Generates tables/src/relations.ts.
 */
const generateTablesRelations = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} table relations
 *
 * Defines Drizzle relations between tables in this slice.
 *
 * @module ${context.sliceName}-tables/relations
 * @since 0.1.0
 */
import * as d from "drizzle-orm";
import { placeholder } from "./tables/placeholder.table";

/**
 * Placeholder table relations.
 *
 * Add foreign key relationships here as needed.
 *
 * @since 0.1.0
 * @category relations
 */
export const placeholderRelations = d.relations(placeholder, (_) => ({
  // Define foreign key relationships here
  // Example:
  // user: one(user, {
  //   fields: [placeholder.userId],
  //   references: [user.id],
  // }),
}));

// Define relations here
// Example: import { myEntityTable } from "./tables/my-entity.table";
// export const myEntityRelations = d.relations(myEntityTable, ({ one, many }) => ({
//   // Define foreign key relationships
// }));
`;

/**
 * Generates tables/src/_check.ts for type verification.
 */
const generateTablesCheck = (context: SliceContext): string =>
  `/**
 * Type verification file for ${context.SliceName} tables
 *
 * This file ensures compile-time alignment between domain models
 * and Drizzle table definitions. Add type assertions here when you
 * create real entities to verify model/table schema alignment.
 *
 * @example
 * \`\`\`ts
 * import type { MyEntity } from "@beep/${context.sliceName}-domain/entities";
 * import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
 * import type * as tables from "./schema";
 *
 * export const _checkSelectMyEntity: typeof MyEntity.Model.select.Encoded =
 *   {} as InferSelectModel<typeof tables.myEntity>;
 * \`\`\`
 *
 * @module ${context.sliceName}-tables/_check
 * @since 0.1.0
 */

// Add type verification checks when you create real entities
// See JSDoc example above for the pattern to use
export {};
`;

/**
 * Generates server/src/db/index.ts.
 */
const generateServerDbIndex = (context: SliceContext): string =>
  `export * from "./Db";
export * from "./repos";
export * as ${context.SliceName}Repos from "./repositories";
`;

/**
 * Generates server/src/db/Db/index.ts.
 */
const generateServerDbDbIndex = (context: SliceContext): string =>
  `export * as ${context.SliceName}Db from "./Db";
`;

/**
 * Generates server/src/db/Db/Db.ts.
 */
const generateServerDbDbTs = (context: SliceContext): string =>
  `import * as DbSchema from "@beep/${context.sliceName}-tables/schema";
import { $${context.SliceName}ServerId } from "@beep/identity/packages";
import { DbClient } from "@beep/shared-server";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = $${context.SliceName}ServerId.create("db/Db");

const serviceEffect: DbClient.PgClientServiceEffect<typeof DbSchema> = DbClient.make({
  schema: DbSchema,
});

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag($I\`Db\`)<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> = Layer.scoped(Db, serviceEffect);
`;

/**
 * Generates server/src/db/repos/index.ts.
 */
const generateServerReposIndex = (_context: SliceContext): string =>
  `export * from "./Placeholder.repo";
`;

/**
 * Generates server/src/db/repos/_common.ts.
 */
const generateServerReposCommon = (context: SliceContext): string =>
  `/**
 * Common repository dependencies for ${context.SliceName} slice
 *
 * Shared dependencies injected into all repositories in this slice.
 *
 * @module ${context.sliceName}-server/db/repos/_common
 * @since 0.1.0
 */
import { ${context.SliceName}Db } from "@beep/${context.sliceName}-server/db";

/**
 * Common dependencies for all ${context.sliceName} repositories.
 *
 * All repos in this slice should use these dependencies
 * to ensure consistent database access.
 */
export const dependencies = [${context.SliceName}Db.layer] as const;
`;

/**
 * Generates server/src/db/repos/Placeholder.repo.ts.
 */
const generatePlaceholderRepo = (context: SliceContext): string =>
  `import { Entities } from "@beep/${context.sliceName}-domain";
import { ${context.SliceName}Db } from "@beep/${context.sliceName}-server/db";
import { $${context.SliceName}ServerId } from "@beep/identity/packages";
import { ${context.SliceName}EntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $${context.SliceName}ServerId.create("db/repos/PlaceholderRepo");

export class PlaceholderRepo extends Effect.Service<PlaceholderRepo>()($I\`PlaceholderRepo\`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* ${context.SliceName}Db.Db;

    return yield* DbRepo.make(${context.SliceName}EntityIds.PlaceholderId, Entities.Placeholder.Model, Effect.succeed({}));
  }),
}) {}
`;

/**
 * Generates server/src/db/repositories.ts (combined layer).
 */
const generateServerRepositories = (context: SliceContext): string =>
  `import type { ${context.SliceName}Db } from "@beep/${context.sliceName}-server/db";
import type { DbClient } from "@beep/shared-server";
import * as Layer from "effect/Layer";
import * as repos from "./repos";

export type Repos = repos.PlaceholderRepo;

export type ReposLayer = Layer.Layer<Repos, never, DbClient.SliceDbRequirements | ${context.SliceName}Db.Db>;

export const layer: ReposLayer = Layer.mergeAll(repos.PlaceholderRepo.Default);

export * from "./repos";
`;

/**
 * Generates test/Dummy.test.ts.
 */
const generateDummyTest = (context: SliceContext, layer: LayerName): string =>
  `import { describe, expect, it } from "bun:test";

describe("@beep/${context.sliceName}-${layer}", () => {
  it("should be defined", () => {
    expect(true).toBe(true);
  });
});
`;

// -----------------------------------------------------------------------------
// Entity ID File Generators
// -----------------------------------------------------------------------------

/**
 * Generates entity-ids/{slice}/ids.ts.
 */
const generateEntityIdsTs = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} entity IDs
 *
 * Defines branded entity identifiers for the ${context.sliceName} slice.
 *
 * @module ${context.sliceName}/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/ids");

/**
 * Placeholder entity ID.
 *
 * Replace or rename with your actual entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export const PlaceholderId = EntityId.make("${context.slice_name}_placeholder", {
  brand: "PlaceholderId",
}).annotations(
  $I.annotations("PlaceholderId", {
    description: "A unique identifier for a Placeholder entity",
  })
);

export declare namespace PlaceholderId {
  export type Type = S.Schema.Type<typeof PlaceholderId>;
  export type Encoded = S.Schema.Encoded<typeof PlaceholderId>;
}
`;

/**
 * Generates entity-ids/{slice}/any-id.ts.
 */
const generateEntityAnyIdTs = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} any entity ID union
 *
 * @module ${context.sliceName}/entity-ids/any-id
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/any-id");

/**
 * Union of all ${context.sliceName} entity IDs.
 *
 * @since 0.1.0
 * @category ids
 */
export class AnyId extends S.Union(Ids.PlaceholderId).annotations(
  $I.annotations("Any${context.SliceName}Id", {
    description: "Any entity id within the ${context.sliceName} domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
`;

/**
 * Generates entity-ids/{slice}/table-name.ts.
 */
const generateEntityTableNameTs = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} table names union
 *
 * @module ${context.sliceName}/entity-ids/table-name
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/table-names");

/**
 * Table names for ${context.sliceName} slice.
 *
 * @since 0.1.0
 * @category ids
 */
export class TableName extends BS.StringLiteralKit(Ids.PlaceholderId.tableName).annotations(
  $I.annotations("${context.SliceName}TableName", {
    description: "A sql table name for an entity within the ${context.sliceName} domain context",
  })
) {}

export declare namespace TableName {
  export type Type = S.Schema.Type<typeof TableName>;
  export type Encoded = S.Schema.Encoded<typeof TableName>;
}
`;

/**
 * Generates entity-ids/{slice}/index.ts.
 */
const generateEntityIndexTs = (): string =>
  `export * from "./any-id";
export * from "./ids";
export * from "./table-name";
`;

// -----------------------------------------------------------------------------
// tsconfig.slices Generator
// -----------------------------------------------------------------------------

/**
 * Generates tsconfig.slices/{slice}.json.
 */
const generateSliceTsconfig = (context: SliceContext): string => {
  const config = {
    files: [],
    references: F.pipe(
      LAYERS,
      A.map((layer) => ({ path: `../packages/${context.sliceName}/${layer}/tsconfig.build.json` }))
    ),
  };
  return `${JSON.stringify(config, null, 2)}\n`;
};

// -----------------------------------------------------------------------------
// FileGeneratorService
// -----------------------------------------------------------------------------

/**
 * Service for generating directory structure and files for new slices.
 *
 * Creates all necessary directories and files for a complete vertical slice,
 * including sub-packages (domain, tables, server, client, ui), entity ID files,
 * and tsconfig references.
 *
 * @example
 * ```ts
 * import { FileGeneratorService } from "./utils/file-generator.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const generator = yield* FileGeneratorService
 *   const context = { sliceName: "notifications", ... }
 *   const plan = yield* generator.createPlan(context)
 *
 *   // Preview what will be created
 *   const preview = yield* generator.previewPlan(plan)
 *   console.log(preview)
 *
 *   // Execute the plan
 *   yield* generator.executePlan(plan)
 * })
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class FileGeneratorService extends Effect.Service<FileGeneratorService>()($I`FileGeneratorService`, {
  dependencies: [FsUtilsLive, RepoUtilsLive],
  effect: Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const repo = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const repoRoot = repo.REPOSITORY_ROOT;

    /**
     * Creates a generation plan for all directories and files.
     */
    const createPlan = (context: SliceContext): Effect.Effect<GenerationPlan, FileWriteError> =>
      Effect.gen(function* () {
        const sliceDir = path.join(repoRoot, "packages", context.sliceName);
        const entityIdDir = path.join(repoRoot, "packages/shared/domain/src/entity-ids", context.sliceName);
        const tsconfigSlicesDir = path.join(repoRoot, "tsconfig.slices");

        const directories: string[] = [];
        const files: GeneratedFile[] = [];

        // 1. Create directories for each layer
        for (const layer of LAYERS) {
          const layerDir = path.join(sliceDir, layer);
          directories.push(layerDir);
          directories.push(path.join(layerDir, "src"));
          directories.push(path.join(layerDir, "test"));

          // Layer-specific subdirectories
          if (layer === "domain") {
            directories.push(path.join(layerDir, "src/entities"));
            directories.push(path.join(layerDir, "src/entities/Placeholder"));
            directories.push(path.join(layerDir, "src/value-objects"));
          } else if (layer === "tables") {
            directories.push(path.join(layerDir, "src/tables"));
          } else if (layer === "server") {
            directories.push(path.join(layerDir, "src/db"));
            directories.push(path.join(layerDir, "src/db/Db"));
            directories.push(path.join(layerDir, "src/db/repos"));
          }
        }

        // 2. Entity IDs directory
        directories.push(entityIdDir);

        // 3. Generate files for each layer
        for (const layer of LAYERS) {
          const layerDir = path.join(sliceDir, layer);

          // package.json
          files.push({
            path: path.join(layerDir, "package.json"),
            content: generatePackageJson(layer, context, repoRoot),
            isNew: true,
          });

          // tsconfig files
          files.push({
            path: path.join(layerDir, "tsconfig.json"),
            content: generateTsconfigJson(layer),
            isNew: true,
          });
          files.push({
            path: path.join(layerDir, "tsconfig.src.json"),
            content: generateTsconfigSrc(layer, context),
            isNew: true,
          });
          files.push({
            path: path.join(layerDir, "tsconfig.build.json"),
            content: generateTsconfigBuild(layer, context),
            isNew: true,
          });
          files.push({
            path: path.join(layerDir, "tsconfig.test.json"),
            content: generateTsconfigTest(layer, context),
            isNew: true,
          });

          // reset.d.ts
          files.push({
            path: path.join(layerDir, "reset.d.ts"),
            content: generateResetDts(),
            isNew: true,
          });

          // src/index.ts
          files.push({
            path: path.join(layerDir, "src/index.ts"),
            content: generateSrcIndex(layer, context),
            isNew: true,
          });

          // test/Dummy.test.ts
          files.push({
            path: path.join(layerDir, "test/Dummy.test.ts"),
            content: generateDummyTest(context, layer),
            isNew: true,
          });

          // Layer-specific files
          if (layer === "domain") {
            files.push({
              path: path.join(layerDir, "src/entities/index.ts"),
              content: generateEntitiesIndex(context),
              isNew: true,
            });
            // Placeholder entity files
            files.push({
              path: path.join(layerDir, "src/entities/Placeholder/index.ts"),
              content: generatePlaceholderEntityIndex(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/entities/Placeholder/Placeholder.model.ts"),
              content: generatePlaceholderModel(context),
              isNew: true,
            });
            // entities.ts barrel file
            files.push({
              path: path.join(layerDir, "src/entities.ts"),
              content: generateEntitiesBarrel(),
              isNew: true,
            });
            // value-objects/index.ts
            files.push({
              path: path.join(layerDir, "src/value-objects/index.ts"),
              content: generateValueObjectsIndex(context),
              isNew: true,
            });
          } else if (layer === "tables") {
            files.push({
              path: path.join(layerDir, "src/schema.ts"),
              content: generateTablesSchema(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/tables/index.ts"),
              content: generateTablesTablesIndex(context),
              isNew: true,
            });
            // Placeholder table file
            files.push({
              path: path.join(layerDir, "src/tables/placeholder.table.ts"),
              content: generatePlaceholderTable(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/relations.ts"),
              content: generateTablesRelations(context),
              isNew: true,
            });
            // Type verification file
            files.push({
              path: path.join(layerDir, "src/_check.ts"),
              content: generateTablesCheck(context),
              isNew: true,
            });
          } else if (layer === "server") {
            files.push({
              path: path.join(layerDir, "src/db/index.ts"),
              content: generateServerDbIndex(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/db/Db/index.ts"),
              content: generateServerDbDbIndex(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/db/Db/Db.ts"),
              content: generateServerDbDbTs(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/db/repos/index.ts"),
              content: generateServerReposIndex(context),
              isNew: true,
            });
            // Placeholder repo files
            files.push({
              path: path.join(layerDir, "src/db/repos/_common.ts"),
              content: generateServerReposCommon(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/db/repos/Placeholder.repo.ts"),
              content: generatePlaceholderRepo(context),
              isNew: true,
            });
            files.push({
              path: path.join(layerDir, "src/db/repositories.ts"),
              content: generateServerRepositories(context),
              isNew: true,
            });
            // db.ts re-export file for @beep/slice-server/db path resolution
            files.push({
              path: path.join(layerDir, "src/db.ts"),
              content: `export * from "./db/index";\n`,
              isNew: true,
            });
          }
        }

        // 4. Entity ID files
        files.push({
          path: path.join(entityIdDir, "ids.ts"),
          content: generateEntityIdsTs(context),
          isNew: true,
        });
        files.push({
          path: path.join(entityIdDir, "any-id.ts"),
          content: generateEntityAnyIdTs(context),
          isNew: true,
        });
        files.push({
          path: path.join(entityIdDir, "table-name.ts"),
          content: generateEntityTableNameTs(context),
          isNew: true,
        });
        files.push({
          path: path.join(entityIdDir, "index.ts"),
          content: generateEntityIndexTs(),
          isNew: true,
        });

        // 5. tsconfig.slices file
        files.push({
          path: path.join(tsconfigSlicesDir, `${context.sliceName}.json`),
          content: generateSliceTsconfig(context),
          isNew: true,
        });

        return { directories, files };
      }).pipe(Effect.withSpan("FileGeneratorService.createPlan"));

    /**
     * Executes a generation plan, creating directories and files.
     */
    const executePlan = (plan: GenerationPlan): Effect.Effect<void, FileWriteError> =>
      Effect.gen(function* () {
        // Create directories first (sequential to ensure parent dirs exist)
        yield* Effect.forEach(
          plan.directories,
          (dir) =>
            fsUtils.mkdirCached(dir).pipe(
              Effect.mapError(
                (cause): FileWriteError =>
                  new FileWriteError({
                    filePath: dir,
                    cause,
                  })
              )
            ),
          { concurrency: 1 }
        );

        // Write files (can be parallelized)
        yield* Effect.forEach(
          plan.files,
          (file) =>
            fs.writeFileString(file.path, file.content).pipe(
              Effect.mapError(
                (cause): FileWriteError =>
                  new FileWriteError({
                    filePath: file.path,
                    cause,
                  })
              )
            ),
          { concurrency: 10 }
        );
      }).pipe(Effect.withSpan("FileGeneratorService.executePlan"));

    /**
     * Creates a preview string for dry-run mode.
     */
    const previewPlan = (plan: GenerationPlan): Effect.Effect<string> =>
      Effect.sync(() => {
        const lines: string[] = [
          "=== DRY RUN - No files will be created ===",
          "",
          "Directories to create:",
          ...F.pipe(
            plan.directories,
            A.map((d) => `  [DIR]  ${d}`)
          ),
          "",
          "Files to create:",
          ...F.pipe(
            plan.files,
            A.map((f) => `  [FILE] ${f.path}`)
          ),
          "",
          `Summary: ${A.length(plan.directories)} directories, ${A.length(plan.files)} files`,
        ];
        return F.pipe(lines, A.join("\n"));
      });

    /**
     * Check if a slice already exists.
     */
    const sliceExists = (sliceName: string): Effect.Effect<boolean, never> =>
      Effect.gen(function* () {
        const sliceDir = path.join(repoRoot, "packages", sliceName);
        return yield* fsUtils.isDirectory(sliceDir).pipe(Effect.catchAll(() => Effect.succeed(false as boolean)));
      });

    return {
      /** The 5 layer names */
      LAYERS,
      /** Repository root path */
      repoRoot,
      /** Create a generation plan from context */
      createPlan,
      /** Execute a generation plan */
      executePlan,
      /** Preview a plan for dry-run mode */
      previewPlan,
      /** Check if a slice already exists */
      sliceExists,
    };
  }),
}) {}

/**
 * Live layer for FileGeneratorService.
 *
 * @since 0.1.0
 * @category layers
 */
export const FileGeneratorServiceLive = FileGeneratorService.Default;
