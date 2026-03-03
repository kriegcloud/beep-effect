/**
 * Template rendering service for package generation.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError } from "@beep/repo-utils";
import { Effect, FileSystem, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import Handlebars from "handlebars";

/**
 * Mapping between template source file and output file path.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface TemplateSpec {
  readonly templateName: string;
  readonly outputPath: string;
}

/**
 * Rendered template output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RenderedTemplate {
  readonly outputPath: string;
  readonly content: string;
}

/**
 * Generic request payload for template rendering.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export interface TemplateService {
  readonly renderTemplates: <Context extends object>(
    request: TemplateRenderRequest<Context>
  ) => Effect.Effect<ReadonlyArray<RenderedTemplate>, DomainError, FileSystem.FileSystem>;
}

const toWords = (value: string): ReadonlyArray<string> => {
  const normalized = Str.toLowerCase(
    Str.trim(Str.replace(/[^a-zA-Z0-9]+/g, " ")(Str.replace(/([a-z0-9])([A-Z])/g, "$1 $2")(value)))
  );

  return A.filter(Str.split(/\s+/g)(normalized), Str.isNonEmpty);
};

const toCamelCase = (value: string): string => {
  const words = toWords(value);
  const firstWord = A.head(words);

  if (O.isNone(firstWord)) {
    return Str.empty;
  }

  return `${firstWord.value}${A.join(A.map(A.drop(words, 1), Str.capitalize), Str.empty)}`;
};

const toPascalCase = (value: string): string => A.join(A.map(toWords(value), Str.capitalize), Str.empty);

const toKebabCase = (value: string): string => A.join(toWords(value), "-");

const toSnakeCase = (value: string): string => A.join(toWords(value), "_");

const toHelperValue = (value: unknown): string =>
  O.match(O.fromNullishOr(value), {
    onNone: () => Str.empty,
    onSome: (inner) => `${inner}`,
  });

const createHandlebarsEnvironment = () => {
  const hbs = Handlebars.create();

  hbs.registerHelper("camelCase", (value: unknown) => toCamelCase(toHelperValue(value)));
  hbs.registerHelper("pascalCase", (value: unknown) => toPascalCase(toHelperValue(value)));
  hbs.registerHelper("kebabCase", (value: unknown) => toKebabCase(toHelperValue(value)));
  hbs.registerHelper("snakeCase", (value: unknown) => toSnakeCase(toHelperValue(value)));

  return hbs;
};

/**
 * Construct the default template service implementation.
 *
 * @returns Template renderer backed by Handlebars.
 * @since 0.0.0
 * @category DomainModel
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
