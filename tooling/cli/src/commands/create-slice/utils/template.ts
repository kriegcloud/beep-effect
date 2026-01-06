/**
 * @file Template Utility Service
 *
 * Provides Handlebars template compilation and rendering for slice scaffolding.
 * Pre-computes all case transformations for template variables and provides
 * a service for rendering templates with the slice context.
 *
 * @module create-slice/utils/template
 * @since 1.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import Handlebars from "handlebars";

// -----------------------------------------------------------------------------
// Identity
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/create-slice/utils/template");

// -----------------------------------------------------------------------------
// Slice Context
// -----------------------------------------------------------------------------

/**
 * Context variables for template rendering.
 * All case variants are pre-computed for template use.
 */
export interface SliceContext {
  /** Lowercase kebab-case slice name, e.g., "notifications" */
  readonly sliceName: string;
  /** PascalCase slice name, e.g., "Notifications" */
  readonly SliceName: string;
  /** SCREAMING_SNAKE_CASE, e.g., "NOTIFICATIONS" */
  readonly SLICE_NAME: string;
  /** snake_case, e.g., "notifications" */
  readonly slice_name: string;
  /** Description of the slice's purpose */
  readonly sliceDescription: string;
}

/**
 * Create a SliceContext with all case variants pre-computed.
 *
 * @example
 * ```ts
 * const ctx = createSliceContext("notifications", "User notification system");
 * // ctx.sliceName === "notifications"
 * // ctx.SliceName === "Notifications"
 * // ctx.SLICE_NAME === "NOTIFICATIONS"
 * // ctx.slice_name === "notifications"
 * ```
 *
 * @param sliceName - The kebab-case slice name
 * @param description - Description of the slice's purpose
 * @returns Complete SliceContext with all case variants
 *
 * @since 0.1.0
 * @category constructors
 */
export const createSliceContext = (sliceName: string, description: string): SliceContext => ({
  sliceName,
  SliceName: kebabToPascal(sliceName),
  SLICE_NAME: F.pipe(sliceName, Str.replace(/-/g, "_"), Str.toUpperCase),
  slice_name: F.pipe(sliceName, Str.replace(/-/g, "_")),
  sliceDescription: description,
});

// -----------------------------------------------------------------------------
// Case Transformation Helpers
// -----------------------------------------------------------------------------

/**
 * Convert kebab-case to PascalCase.
 *
 * @example
 * ```ts
 * kebabToPascal("user-profile") // "UserProfile"
 * kebabToPascal("notifications") // "Notifications"
 * ```
 */
const kebabToPascal = (str: string): string => {
  const parts = F.pipe(str, Str.split("-"));
  return F.pipe(
    parts,
    (arr) =>
      arr.map((part) => {
        const firstOpt = Str.charAt(part, 0);
        const first = O.isSome(firstOpt) ? firstOpt.value : "";
        const rest = F.pipe(part, Str.slice(1, part.length));
        return Str.toUpperCase(first) + rest;
      }),
    (arr) => arr.join("")
  );
};

/**
 * Convert kebab-case to camelCase.
 */
const kebabToCamel = (str: string): string => {
  const pascal = kebabToPascal(str);
  const firstOpt = Str.charAt(pascal, 0);
  const first = O.isSome(firstOpt) ? Str.toLowerCase(firstOpt.value) : "";
  const rest = F.pipe(pascal, Str.slice(1, pascal.length));
  return first + rest;
};

// -----------------------------------------------------------------------------
// Handlebars Setup
// -----------------------------------------------------------------------------

/**
 * Register custom Handlebars helpers for case transformations.
 * These are available in templates as {{pascalCase sliceName}}, etc.
 */
const registerHelpers = (): void => {
  // PascalCase: {{pascalCase value}}
  Handlebars.registerHelper("pascalCase", (str: string) => kebabToPascal(str));

  // camelCase: {{camelCase value}}
  Handlebars.registerHelper("camelCase", (str: string) => kebabToCamel(str));

  // snake_case: {{snakeCase value}}
  Handlebars.registerHelper("snakeCase", (str: string) => F.pipe(str, Str.replace(/-/g, "_")));

  // SCREAMING_SNAKE_CASE: {{screamingSnakeCase value}}
  Handlebars.registerHelper("screamingSnakeCase", (str: string) =>
    F.pipe(str, Str.replace(/-/g, "_"), Str.toUpperCase)
  );

  // Lowercase: {{lower value}}
  Handlebars.registerHelper("lower", (str: string) => Str.toLowerCase(str));

  // Uppercase: {{upper value}}
  Handlebars.registerHelper("upper", (str: string) => Str.toUpperCase(str));
};

// Initialize helpers
registerHelpers();

// -----------------------------------------------------------------------------
// Template Service
// -----------------------------------------------------------------------------

/**
 * Service interface for template rendering.
 */
export interface ITemplateService {
  /**
   * Compile a template string and render it with the given context.
   */
  readonly render: (template: string, context: SliceContext) => Effect.Effect<string, never, never>;

  /**
   * Get a pre-compiled template for a layer (domain, tables, server, client, ui).
   * Returns the rendered content for a specific file type.
   */
  readonly renderPackageJson: (layer: LayerType, context: SliceContext) => Effect.Effect<string, never, never>;

  /**
   * Render a tsconfig.json for a layer.
   */
  readonly renderTsconfig: (
    layer: LayerType,
    type: "main" | "src" | "build" | "test",
    context: SliceContext
  ) => Effect.Effect<string, never, never>;

  /**
   * Render the main index.ts barrel file for a layer.
   */
  readonly renderIndexTs: (layer: LayerType, context: SliceContext) => Effect.Effect<string, never, never>;
}

/**
 * Layer types for slice sub-packages.
 */
export type LayerType = "domain" | "tables" | "server" | "client" | "ui";

/**
 * Template service tag for dependency injection.
 */
export const TemplateService = Context.GenericTag<ITemplateService>($I`TemplateService`);

// -----------------------------------------------------------------------------
// Package.json Templates
// -----------------------------------------------------------------------------

const PACKAGE_JSON_TEMPLATES: Record<LayerType, string> = {
  domain: `{
  "name": "@beep/{{sliceName}}-domain",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - Domain layer"
}`,

  tables: `{
  "name": "@beep/{{sliceName}}-tables",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - Table definitions"
}`,

  server: `{
  "name": "@beep/{{sliceName}}-server",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - Server infrastructure"
}`,

  client: `{
  "name": "@beep/{{sliceName}}-client",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - Client SDK"
}`,

  ui: `{
  "name": "@beep/{{sliceName}}-ui",
  "version": "0.0.0",
  "type": "module",
  "license": "MIT",
  "description": "{{sliceDescription}} - UI components"
}`,
};

// -----------------------------------------------------------------------------
// TSConfig Templates
// -----------------------------------------------------------------------------

const TSCONFIG_MAIN = `{
  "extends": "../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "emitDeclarationOnly": false
  },
  "include": ["src", "test"],
  "references": [{ "path": "tsconfig.src.json" }]
}`;

const TSCONFIG_SRC = `{
  "extends": "../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "build/esm",
    "declarationDir": "build/dts",
    "tsBuildInfoFile": "build/.tsbuildinfo.src"
  },
  "include": ["src"]
}`;

const TSCONFIG_BUILD = `{
  "extends": "./tsconfig.src.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}`;

const TSCONFIG_TEST = `{
  "extends": "../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "noEmit": true,
    "rootDir": ".",
    "tsBuildInfoFile": "build/.tsbuildinfo.test"
  },
  "include": ["test"],
  "references": [{ "path": "tsconfig.src.json" }]
}`;

// -----------------------------------------------------------------------------
// Index.ts Templates
// -----------------------------------------------------------------------------

const INDEX_TS_TEMPLATES: Record<LayerType, string> = {
  domain: `/**
 * @module @beep/{{sliceName}}-domain
 * @description {{sliceDescription}} - Pure domain models and business logic
 */

// Export entities when created
// export * from "./entities";

// Export value objects when created
// export * from "./value-objects";
`,

  tables: `/**
 * @module @beep/{{sliceName}}-tables
 * @description {{sliceDescription}} - Drizzle table definitions
 */

// Export table schemas when created
// export * from "./schema";

// Export relations when created
// export * from "./relations";
`,

  server: `/**
 * @module @beep/{{sliceName}}-server
 * @description {{sliceDescription}} - Server infrastructure layer
 */

// Export database client and repositories
export * from "./db";
`,

  client: `/**
 * @module @beep/{{sliceName}}-client
 * @description {{sliceDescription}} - Client SDK contracts
 */

// Export contracts when created
// export * from "./contracts";
`,

  ui: `/**
 * @module @beep/{{sliceName}}-ui
 * @description {{sliceDescription}} - React UI components
 */

// Export components when created
// export * from "./components";
`,
};

// -----------------------------------------------------------------------------
// Service Implementation
// -----------------------------------------------------------------------------

/**
 * Live implementation of the TemplateService.
 */
const makeTemplateService = (): ITemplateService => ({
  render: (template, context) =>
    Effect.sync(() => {
      const compiled = Handlebars.compile(template, { noEscape: true });
      return compiled(context);
    }),

  renderPackageJson: (layer, context) =>
    Effect.sync(() => {
      const template = PACKAGE_JSON_TEMPLATES[layer];
      const compiled = Handlebars.compile(template, { noEscape: true });
      return compiled(context);
    }),

  renderTsconfig: (_layer, type, _context) =>
    Effect.sync(() => {
      switch (type) {
        case "main":
          return TSCONFIG_MAIN;
        case "src":
          return TSCONFIG_SRC;
        case "build":
          return TSCONFIG_BUILD;
        case "test":
          return TSCONFIG_TEST;
      }
    }),

  renderIndexTs: (layer, context) =>
    Effect.sync(() => {
      const template = INDEX_TS_TEMPLATES[layer];
      const compiled = Handlebars.compile(template, { noEscape: true });
      return compiled(context);
    }),
});

/**
 * Live Layer for the TemplateService.
 *
 * @since 0.1.0
 * @category layers
 */
export const TemplateServiceLive: Layer.Layer<ITemplateService> = Layer.succeed(TemplateService, makeTemplateService());
