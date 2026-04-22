/**
 * Template rendering service for package generation.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { Str as CommonStr, thunkEmptyRecord, thunkEmptyStr } from "@beep/utils";
import { Context, Effect, FileSystem, flow, identity, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import Handlebars from "handlebars";

const $I = $RepoCliId.create("commands/CreatePackage/TemplateService");

/**
 * Mapping between template source file and output file path.
 *
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * Request payload for template rendering.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TemplateRenderRequest extends S.Class<TemplateRenderRequest>($I`TemplateRenderRequest`)(
  {
    templateDir: S.String,
    templates: S.Array(TemplateSpec),
    context: S.Record(S.String, S.Unknown).pipe(
      S.withConstructorDefault(Effect.succeed(thunkEmptyRecord<string, unknown>())),
      S.withDecodingDefault(Effect.succeed(thunkEmptyRecord<string, unknown>()))
    ),
  },
  $I.annote("TemplateRenderRequest", {
    description: "Request payload for template rendering.",
  })
) {}

/**
 * Service contract for template rendering.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type TemplateServiceShape = {
  readonly renderTemplates: (
    request: TemplateRenderRequest
  ) => Effect.Effect<ReadonlyArray<RenderedTemplate>, DomainError, FileSystem.FileSystem>;
};

/**
 * Service tag for template rendering.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class TemplateService extends Context.Service<TemplateService, TemplateServiceShape>()($I`TemplateService`) {}

const UnknownToTemplateHelperString = S.Unknown.pipe(
  S.decodeTo(
    S.String,
    SchemaTransformation.transform({
      decode: (value) => O.fromNullishOr(value).pipe(O.map(String), O.getOrElse(thunkEmptyStr)),
      encode: identity,
    })
  ),
  S.annotate(
    $I.annote("UnknownToTemplateHelperString", {
      description: "Schema transformation that normalizes helper arguments to template-safe strings.",
    })
  )
);

const decodeTemplateHelperString = S.decodeUnknownSync(UnknownToTemplateHelperString);
const toHelperValue = (value: unknown): string => decodeTemplateHelperString(value);

const createHandlebarsEnvironment = () => {
  const hbs = Handlebars.create();

  hbs.registerHelper("camelCase", flow(toHelperValue, CommonStr.camelCase));
  hbs.registerHelper("pascalCase", flow(toHelperValue, CommonStr.pascalCase));
  hbs.registerHelper("kebabCase", flow(toHelperValue, CommonStr.kebabCase));
  hbs.registerHelper("snakeCase", flow(toHelperValue, CommonStr.snakeCase));

  return hbs;
};

/**
 * Construct the default template service implementation.
 *
 * @returns Template renderer backed by Handlebars.
 * @category DomainModel
 * @since 0.0.0
 */
export const createTemplateService = (): TemplateServiceShape => {
  const hbs = createHandlebarsEnvironment();

  const renderTemplates: TemplateServiceShape["renderTemplates"] = Effect.fn(function* (
    request: TemplateRenderRequest
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
        return new RenderedTemplate({
          outputPath,
          content: compile(request.context),
        });
      })
    );
  });

  return {
    renderTemplates,
  };
};
