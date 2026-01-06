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
    exports: {
      ".": "./src/index.ts",
      "./package.json": "./package.json",
      "./*": "./src/*.ts",
    },
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
    extends: "./tsconfig.src.json",
    include: [],
    references: [{ path: "tsconfig.src.json" }, { path: "tsconfig.test.json" }],
  };
  return JSON.stringify(config, null, 2) + "\n";
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
const generateSrcIndex = (layer: LayerName, context: SliceContext): string => {
  switch (layer) {
    case "domain":
      return `export * as Entities from "./entities/index.js";
`;
    case "tables":
      return `export * as ${context.SliceName}DbSchema from "./schema.js";
`;
    case "server":
      return `export * from "./db/index.js";
`;
    case "client":
      return `// ${context.SliceName} Client SDK exports
export {};
`;
    case "ui":
      return `// ${context.SliceName} UI components
export const beep = "beep";
`;
    default:
      return `export {};
`;
  }
};

/**
 * Generates domain/src/entities/index.ts.
 */
const generateEntitiesIndex = (context: SliceContext): string =>
  `// ${context.SliceName} domain entities
// Add entity exports here as they are created
export {};
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
export * from "./tables/index.js";
export * from "./relations.js";
`;

/**
 * Generates tables/src/tables/index.ts.
 */
const generateTablesTablesIndex = (context: SliceContext): string =>
  `// ${context.SliceName} table definitions
// Add table exports here as they are created
export {};
`;

/**
 * Generates tables/src/relations.ts.
 */
const generateTablesRelations = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} table relations
 *
 * Define Drizzle relations between tables here.
 */
import { relations } from "drizzle-orm";
// Import tables here when created
// import { myTable } from "./tables/my-table.table.js";

// Define relations here
// export const myTableRelations = relations(myTable, ({ one, many }) => ({
//   // relations
// }));
`;

/**
 * Generates server/src/db/index.ts.
 */
const generateServerDbIndex = (_context: SliceContext): string =>
  `export * from "./Db/index.js";
export * from "./repositories.js";
`;

/**
 * Generates server/src/db/Db/index.ts.
 */
const generateServerDbDbIndex = (_context: SliceContext): string =>
  `export * from "./Db.js";
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
const generateServerReposIndex = (context: SliceContext): string =>
  `// ${context.SliceName} repository exports
// Add repository exports here as they are created
export {};
`;

/**
 * Generates server/src/db/repositories.ts (combined layer).
 */
const generateServerRepositories = (context: SliceContext): string =>
  `/**
 * ${context.SliceName} Repositories
 *
 * Combined layer providing all ${context.sliceName} repositories.
 */
import * as Layer from "effect/Layer";
// Import repos here when created
// import { MyEntityRepo } from "./repos/MyEntity.repo.js";

// Export individual repos for direct usage
export * from "./repos/index.js";

/**
 * Requirements for the ${context.SliceName} repositories layer.
 */
export type Requirements = never; // Add requirements as repos are created

/**
 * All ${context.sliceName} repositories.
 */
export type Repos = never; // Add repo types as created

/**
 * Combined layer providing all ${context.sliceName} repositories.
 */
export const layer = Layer.mergeAll(
  // Add repo layers here as they are created
);
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
  `import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/ids");

// Add entity IDs here using EntityId.make()
// Example:
// export const MyEntityId = EntityId.make("my_entity", {
//   brand: "MyEntityId",
// }).annotations(
//   $I.annotations("MyEntityId", {
//     description: "A unique identifier for MyEntity",
//   })
// );
//
// export declare namespace MyEntityId {
//   export type Type = S.Schema.Type<typeof MyEntityId>;
//   export type Encoded = S.Schema.Encoded<typeof MyEntityId>;
// }
`;

/**
 * Generates entity-ids/{slice}/any-id.ts.
 */
const generateEntityAnyIdTs = (context: SliceContext): string =>
  `import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
// Import entity IDs when created
// import * as Ids from "./ids.js";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/any-id");

/**
 * Union of all ${context.sliceName} entity IDs.
 *
 * Add entity IDs to this union as they are created.
 */
export class AnyId extends S.Union(
  // Add entity IDs here, e.g.: Ids.MyEntityId
  S.Never, // Placeholder - remove when adding first entity
).annotations(
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
  `import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
// Import entity IDs when created
// import * as Ids from "./ids.js";

const $I = $SharedDomainId.create("entity-ids/${context.sliceName}/table-names");

/**
 * Table names for ${context.sliceName} slice.
 *
 * Add table names here as entity IDs are created.
 */
export class TableName extends BS.StringLiteralKit(
  // Add table names here, e.g.: Ids.MyEntityId.tableName
  "" as const, // Placeholder - replace when adding first entity
).annotations(
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
  `export * from "./any-id.js";
export * from "./ids.js";
export * from "./table-name.js";
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
            files.push({
              path: path.join(layerDir, "src/relations.ts"),
              content: generateTablesRelations(context),
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
            files.push({
              path: path.join(layerDir, "src/db/repositories.ts"),
              content: generateServerRepositories(context),
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
