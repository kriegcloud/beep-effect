/**
 * Template rendering service for package generation.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError } from "@beep/repo-utils";
import { FileSystem } from "effect";
import * as Effect from "effect/Effect";
import Handlebars from "handlebars";

/**
 * Mapping between template source file and output file path.
 *
 * @since 0.0.0
 * @category models
 */
export interface TemplateSpec {
  readonly templateName: string;
  readonly outputPath: string;
}

/**
 * Rendered template output.
 *
 * @since 0.0.0
 * @category models
 */
export interface RenderedTemplate {
  readonly outputPath: string;
  readonly content: string;
}

/**
 * Generic request payload for template rendering.
 *
 * @since 0.0.0
 * @category models
 */
export interface TemplateRenderRequest<Context extends object> {
  readonly templateDir: string;
  readonly templates: ReadonlyArray<TemplateSpec>;
  readonly context: Context;
}

/**
 * Service contract for template rendering.
 *
 * @since 0.0.0
 * @category models
 */
export interface TemplateService {
  readonly renderTemplates: <Context extends object>(
    request: TemplateRenderRequest<Context>
  ) => Effect.Effect<ReadonlyArray<RenderedTemplate>, DomainError, FileSystem.FileSystem>;
}

const toWords = (value: string): ReadonlyArray<string> => {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();

  return normalized.length === 0 ? [] : normalized.split(/\s+/g);
};

const toCamelCase = (value: string): string => {
  const words = toWords(value);
  if (words.length === 0) {
    return "";
  }
  return (
    words[0]! +
    words
      .slice(1)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")
  );
};

const toPascalCase = (value: string): string =>
  toWords(value)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

const toKebabCase = (value: string): string => toWords(value).join("-");

const toSnakeCase = (value: string): string => toWords(value).join("_");

const createHandlebarsEnvironment = () => {
  const hbs = Handlebars.create();

  hbs.registerHelper("camelCase", (value: unknown) => toCamelCase(String(value ?? "")));
  hbs.registerHelper("pascalCase", (value: unknown) => toPascalCase(String(value ?? "")));
  hbs.registerHelper("kebabCase", (value: unknown) => toKebabCase(String(value ?? "")));
  hbs.registerHelper("snakeCase", (value: unknown) => toSnakeCase(String(value ?? "")));

  return hbs;
};

/**
 * Construct the default template service implementation.
 *
 * @returns Template renderer backed by Handlebars.
 * @since 0.0.0
 * @category constructors
 */
export const createTemplateService = (): TemplateService => {
  const hbs = createHandlebarsEnvironment();

  const renderTemplates: TemplateService["renderTemplates"] = Effect.fn(function* <Context extends object>(
    request: TemplateRenderRequest<Context>
  ) {
    const fs = yield* FileSystem.FileSystem;

    return yield* Effect.forEach(
      request.templates,
      Effect.fn(function* ({ templateName, outputPath }) {
        const raw = yield* fs.readFileString(`${request.templateDir}/${templateName}`).pipe(
          Effect.mapError(
            (cause) =>
              new DomainError({
                message: `Failed to read template "${templateName}" from "${request.templateDir}"`,
                cause,
              })
          )
        );

        const compile = hbs.compile(raw, { noEscape: true });
        return {
          outputPath,
          content: compile(request.context),
        } as const satisfies RenderedTemplate;
      })
    );
  });

  return {
    renderTemplates,
  };
};
