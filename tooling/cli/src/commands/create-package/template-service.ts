/**
 * Template rendering service for package generation.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { thunkEmptyStr } from "@beep/utils";
import { Effect, FileSystem, flow } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import Handlebars from "handlebars";

const $I = $RepoCliId.create("create-package/template-service");

/**
 * Mapping between template source file and output file path.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TemplateSpec extends S.Class<TemplateSpec>($I`TemplateSpec`)(
  {
    templateName: S.String,
    outputPath: S.String,
  },
  $I.annote("TemplateSpec", {
    description: "Mapping between template source file and output file path.",
  })
) {}

/**
 * Rendered template output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RenderedTemplate extends S.Class<RenderedTemplate>($I`RenderedTemplate`)(
  {
    outputPath: S.String,
    content: S.String,
  },
  $I.annote("RenderedTemplate", {
    description: "Rendered template output.",
  })
) {}

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

const toHelperValue = (value: unknown): string =>
  O.match(O.fromNullishOr(value), {
    onNone: thunkEmptyStr,
    onSome: (inner) => `${inner}`,
  });

const createHandlebarsEnvironment = () => {
  const hbs = Handlebars.create();

  hbs.registerHelper("camelCase", flow(toHelperValue, Str.camelCase));
  hbs.registerHelper("pascalCase", flow(toHelperValue, Str.pascalCase));
  hbs.registerHelper("kebabCase", flow(toHelperValue, Str.kebabCase));
  hbs.registerHelper("snakeCase", flow(toHelperValue, Str.snakeCase));

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
