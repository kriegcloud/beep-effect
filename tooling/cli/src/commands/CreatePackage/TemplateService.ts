/**
 * Template rendering service for package generation.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { Str as CommonStr, thunkEmptyRecord, thunkEmptyStr, thunkSomeEmptyRecord } from "@beep/utils";
import { Effect, FileSystem, flow, identity, SchemaTransformation, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import Handlebars from "handlebars";

const $I = $RepoCliId.create("commands/CreatePackage/TemplateService");

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
 * Request payload for template rendering.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TemplateRenderRequest extends S.Class<TemplateRenderRequest>($I`TemplateRenderRequest`)(
  {
    templateDir: S.String,
    templates: S.Array(TemplateSpec),
    context: S.Record(S.String, S.Unknown).pipe(
      S.withConstructorDefault(thunkSomeEmptyRecord<string, unknown>),
      S.withDecodingDefault(thunkEmptyRecord<string, unknown>)
    ),
  },
  $I.annote("TemplateRenderRequest", {
    description: "Request payload for template rendering.",
  })
) {}

/**
 * Service contract for template rendering.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TemplateServiceShape = {
  readonly renderTemplates: (
    request: TemplateRenderRequest
  ) => Effect.Effect<ReadonlyArray<RenderedTemplate>, DomainError, FileSystem.FileSystem>;
};

/**
 * Service tag for template rendering.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class TemplateService extends ServiceMap.Service<TemplateService, TemplateServiceShape>()($I`TemplateService`) {}

const UnknownToTemplateHelperString = S.Unknown.pipe(
  S.decodeTo(
    S.String,
    SchemaTransformation.transform({
      decode: (value) =>
        O.match(O.fromNullishOr(value), {
          onNone: thunkEmptyStr,
          onSome: (inner) => `${inner}`,
        }),
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
 * @since 0.0.0
 * @category DomainModel
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
