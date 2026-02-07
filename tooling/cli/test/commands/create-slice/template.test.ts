/**
 * @file Template Service Tests
 *
 * Tests for the TemplateService Handlebars rendering functionality.
 *
 * @module create-slice/test/template
 * @since 0.1.0
 */

import { describe, expect, it } from "bun:test";
import * as Effect from "effect/Effect";
import {
  createSliceContext,
  type ITemplateService,
  type LayerType,
  TemplateService,
  TemplateServiceLive,
} from "../../../src/commands/create-slice/utils/template.js";

// -----------------------------------------------------------------------------
// Test Helpers
// -----------------------------------------------------------------------------

/**
 * Run an Effect test with the TemplateService layer.
 */
const runTemplate = <A>(effect: Effect.Effect<A, never, ITemplateService>): Promise<A> =>
  Effect.runPromise(Effect.provide(effect, TemplateServiceLive));

// -----------------------------------------------------------------------------
// Basic Rendering Tests
// -----------------------------------------------------------------------------

describe("TemplateService", () => {
  describe("render", () => {
    it("should render simple variable substitution", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("notifications", "Push notifications");

          return yield* template.render("Package: @beep/{{sliceName}}-domain", context);
        })
      );

      expect(result).toBe("Package: @beep/notifications-domain");
    });

    it("should render PascalCase variable", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("user-profile", "User profile management");

          return yield* template.render("class {{SliceName}}Db {}", context);
        })
      );

      expect(result).toBe("class UserProfileDb {}");
    });

    it("should render SCREAMING_SNAKE_CASE variable", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("my-feature", "My feature description");

          return yield* template.render("export const {{SLICE_NAME}}_CONFIG = {};", context);
        })
      );

      expect(result).toBe("export const MY_FEATURE_CONFIG = {};");
    });

    it("should render snake_case variable", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("user-settings", "User settings");

          return yield* template.render("const table_name = '{{slice_name}}';", context);
        })
      );

      expect(result).toBe("const table_name = 'user_settings';");
    });

    it("should render description variable", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("notifications", "Push notifications for users");

          return yield* template.render("// {{sliceDescription}}", context);
        })
      );

      expect(result).toBe("// Push notifications for users");
    });

    it("should render multiple variables in same template", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("billing", "Billing system");

          return yield* template.render(
            "export class {{SliceName}}Service { name = '{{sliceName}}'; TABLE = '{{SLICE_NAME}}'; }",
            context
          );
        })
      );

      expect(result).toBe("export class BillingService { name = 'billing'; TABLE = 'BILLING'; }");
    });

    it("should handle multiline templates", async () => {
      const template = `{
  "name": "@beep/{{sliceName}}-domain",
  "description": "{{sliceDescription}}"
}`;

      const result = await runTemplate(
        Effect.gen(function* () {
          const templateSvc = yield* TemplateService;
          const context = createSliceContext("auth", "Authentication");

          return yield* templateSvc.render(template, context);
        })
      );

      expect(result).toBe(`{
  "name": "@beep/auth-domain",
  "description": "Authentication"
}`);
    });

    it("should not escape HTML characters", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", 'Description with <html> & "quotes"');

          return yield* template.render("// {{sliceDescription}}", context);
        })
      );

      // noEscape: true should preserve special characters
      expect(result).toBe('// Description with <html> & "quotes"');
    });

    it("should render template with no variables unchanged", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.render("static content", context);
        })
      );

      expect(result).toBe("static content");
    });
  });

  describe("Handlebars helpers", () => {
    it("should support pascalCase helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("my-slice", "Test");

          return yield* template.render("{{pascalCase sliceName}}", context);
        })
      );

      expect(result).toBe("MySlice");
    });

    it("should support camelCase helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("my-slice", "Test");

          return yield* template.render("{{camelCase sliceName}}", context);
        })
      );

      expect(result).toBe("mySlice");
    });

    it("should support snakeCase helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("my-slice", "Test");

          return yield* template.render("{{snakeCase sliceName}}", context);
        })
      );

      expect(result).toBe("my_slice");
    });

    it("should support screamingSnakeCase helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("my-slice", "Test");

          return yield* template.render("{{screamingSnakeCase sliceName}}", context);
        })
      );

      expect(result).toBe("MY_SLICE");
    });

    it("should support lower helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.render("{{lower SliceName}}", context);
        })
      );

      expect(result).toBe("test");
    });

    it("should support upper helper", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.render("{{upper sliceName}}", context);
        })
      );

      expect(result).toBe("TEST");
    });
  });

  describe("renderPackageJson", () => {
    it("should render domain package.json", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("notifications", "Push notifications");

          return yield* template.renderPackageJson("domain", context);
        })
      );

      expect(result).toContain('"name": "@beep/notifications-domain"');
      expect(result).toContain('"description": "Push notifications - Domain layer"');
    });

    it("should render tables package.json", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("billing", "Billing system");

          return yield* template.renderPackageJson("tables", context);
        })
      );

      expect(result).toContain('"name": "@beep/billing-tables"');
      expect(result).toContain("Table definitions");
    });

    it("should render server package.json", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("auth", "Authentication");

          return yield* template.renderPackageJson("server", context);
        })
      );

      expect(result).toContain('"name": "@beep/auth-server"');
      expect(result).toContain("Server infrastructure");
    });

    it("should render client package.json", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("api", "API access");

          return yield* template.renderPackageJson("client", context);
        })
      );

      expect(result).toContain('"name": "@beep/api-client"');
      expect(result).toContain("Client SDK");
    });

    it("should render ui package.json", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("dashboard", "Dashboard");

          return yield* template.renderPackageJson("ui", context);
        })
      );

      expect(result).toContain('"name": "@beep/dashboard-ui"');
      expect(result).toContain("UI components");
    });

    it("should render all layer types", async () => {
      const layers: LayerType[] = ["domain", "tables", "server", "client", "ui"];

      await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test slice");

          yield* Effect.forEach(
            layers,
            (layer) =>
              Effect.gen(function* () {
                const result = yield* template.renderPackageJson(layer, context);
                expect(result).toContain(`"name": "@beep/test-${layer}"`);
              }),
            { concurrency: "unbounded" }
          );
        })
      );
    });
  });

  describe("renderTsconfig", () => {
    it("should render main tsconfig", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.renderTsconfig("domain", "main", context);
        })
      );

      expect(result).toContain("tsconfig.base.jsonc");
      expect(result).toContain("tsconfig.src.json");
    });

    it("should render src tsconfig", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.renderTsconfig("domain", "src", context);
        })
      );

      expect(result).toContain("composite");
      expect(result).toContain("build/esm");
    });

    it("should render build tsconfig", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.renderTsconfig("domain", "build", context);
        })
      );

      expect(result).toContain("declaration");
      expect(result).toContain("declarationMap");
    });

    it("should render test tsconfig", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("test", "Test");

          return yield* template.renderTsconfig("domain", "test", context);
        })
      );

      expect(result).toContain("noEmit");
    });
  });

  describe("renderIndexTs", () => {
    it("should render domain index.ts", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("billing", "Billing");

          return yield* template.renderIndexTs("domain", context);
        })
      );

      expect(result).toContain("@beep/billing-domain");
      expect(result).toContain("Pure domain");
    });

    it("should render tables index.ts", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("auth", "Auth");

          return yield* template.renderIndexTs("tables", context);
        })
      );

      expect(result).toContain("@beep/auth-tables");
      expect(result).toContain("Drizzle table");
    });

    it("should render server index.ts", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("api", "API");

          return yield* template.renderIndexTs("server", context);
        })
      );

      expect(result).toContain("@beep/api-server");
      expect(result).toContain("Server infrastructure");
      expect(result).toContain("./db");
    });

    it("should render client index.ts", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("sdk", "SDK");

          return yield* template.renderIndexTs("client", context);
        })
      );

      expect(result).toContain("@beep/sdk-client");
      expect(result).toContain("Client SDK");
    });

    it("should render ui index.ts", async () => {
      const result = await runTemplate(
        Effect.gen(function* () {
          const template = yield* TemplateService;
          const context = createSliceContext("dashboard", "Dashboard");

          return yield* template.renderIndexTs("ui", context);
        })
      );

      expect(result).toContain("@beep/dashboard-ui");
      expect(result).toContain("React UI");
    });
  });
});

// -----------------------------------------------------------------------------
// Edge Cases and Error Handling
// -----------------------------------------------------------------------------

describe("TemplateService edge cases", () => {
  it("should handle empty template string", async () => {
    const result = await runTemplate(
      Effect.gen(function* () {
        const template = yield* TemplateService;
        const context = createSliceContext("test", "Test");

        return yield* template.render("", context);
      })
    );

    expect(result).toBe("");
  });

  it("should handle template with only whitespace", async () => {
    const result = await runTemplate(
      Effect.gen(function* () {
        const template = yield* TemplateService;
        const context = createSliceContext("test", "Test");

        return yield* template.render("   \n\t  ", context);
      })
    );

    expect(result).toBe("   \n\t  ");
  });

  it("should handle undefined variables gracefully", async () => {
    // Handlebars renders undefined/missing variables as empty string
    const result = await runTemplate(
      Effect.gen(function* () {
        const template = yield* TemplateService;
        const context = createSliceContext("test", "Test");

        return yield* template.render("{{nonExistentVar}}", context);
      })
    );

    expect(result).toBe("");
  });

  it("should preserve Handlebars comments", async () => {
    const result = await runTemplate(
      Effect.gen(function* () {
        const template = yield* TemplateService;
        const context = createSliceContext("test", "Test");

        return yield* template.render("before{{! comment }}after", context);
      })
    );

    expect(result).toBe("beforeafter");
  });
});
