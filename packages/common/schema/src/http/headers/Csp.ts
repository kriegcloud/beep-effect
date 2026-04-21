/**
 * CSP header schema & constructor's
 * @since 0.0.0
 * @module
 */
import { $SchemaId } from "@beep/identity";
import { Struct } from "@beep/utils";
import { Effect, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { wrapArray } from "./_internal/index.ts";
import { CspError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/Csp");

/**
 * @since 0.0.0
 */
export const DirectiveSource = S.Union([...internal.ArrayOfStrOrStr.members, S.Undefined]).pipe(
  $I.annoteSchema("DirectiveSource", {
    description: "A CSP directive source",
  })
);

/**
 * @since 0.0.0
 */
export type DirectiveSource = typeof DirectiveSource.Type;

const headerName = "Content-Security-Policy";
const reportOnlyHeaderName = "Content-Security-Policy-Report-Only";
const directiveValueSeparator = "; ";

const ContentSecurityPolicyHeaderNameBase = LiteralKit([headerName, reportOnlyHeaderName]);

/**
 * @since 0.0.0
 */
export const ContentSecurityPolicyHeaderName = ContentSecurityPolicyHeaderNameBase.pipe(
  $I.annoteSchema("ContentSecurityPolicyHeaderName", {
    description: "The valid `Content-Security-Policy` response header names.",
  }),
  SchemaUtils.withLiteralKitStatics(ContentSecurityPolicyHeaderNameBase)
);

/**
 * @since 0.0.0
 */
export type ContentSecurityPolicyHeaderName = typeof ContentSecurityPolicyHeaderName.Type;

type DirectiveInput<T extends object> = Partial<{
  readonly [K in keyof T]: T[K] | O.Option<T[K]>;
}>;

const unwrapDirectiveValue = <T>(value: undefined | T | O.Option<T>): T | undefined =>
  O.isOption(value) ? O.getOrUndefined(value) : value;

/**
 * Get proper header name for CSP
 *
 * @example
 * ```ts
 * import {
 *
 * } from "@beep/schema/http/headers/Csp";
 *
 * // Get standard CSP header name
 * const standardHeader = getProperHeaderName();
 * void standardHeader;
 * // => "Content-Security-Policy"
 *
 * // Get report-only CSP header name
 * const reportOnlyHeader = getProperHeaderName(true);
 * void reportOnlyHeader;
 * // => "Content-Security-Policy-Report-Only"
 * ```
 *
 * @category utility
 * @since 0.0.0
 * @param reportOnly - Whether to return the report-only header name.
 * @returns The matching content security policy header name.
 */
export const getProperHeaderName = (reportOnly = false): ContentSecurityPolicyHeaderName =>
  reportOnly ? reportOnlyHeaderName : headerName;

/**
 * Create a serialized directive string from a directive name and one or more values.
 *
 * @category utility
 * @since 0.0.0
 * @template T
 * @param directiveName - Directive name to serialize.
 * @param value - Directive value or values to serialize.
 * @param arrayWrapper - Wrapper used to normalize singular and array values.
 * @returns A serialized directive string.
 */
export const createDirectiveValue = <const T extends string>(
  directiveName: string,
  value: T | readonly T[],
  arrayWrapper: <T>(value: ReadonlyArray<T> | T) => readonly T[] = wrapArray
): `${string} ${string}` => {
  const values = arrayWrapper(value);

  return `${directiveName} ${A.join(" ")(values)}` as const;
};

/**
 * @since 0.0.0
 */
export const PluginTypes = internal.ArrayOfStrOrStr.pipe(
  $I.annoteSchema("PluginTypes", {
    description: "A CSP plugin-types source",
  })
);

/**
 * @since 0.0.0
 */
export type PluginTypes = typeof PluginTypes.Type;

const SandboxBase = LiteralKit([
  true,
  "allow-downloads-without-user-activation",
  "allow-forms",
  "allow-modals",
  "allow-orientation-lock",
  "allow-pointer-lock",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-presentation",
  "allow-same-origin",
  "allow-scripts",
  "allow-storage-access-by-user-activation",
  "allow-top-navigation",
  "allow-top-navigation-by-user-activation",
]);

/**
 * @since 0.0.0
 */
export const Sandbox = SandboxBase.pipe(
  $I.annoteSchema("Sandbox", {
    description: "A CSP sandbox directive",
  }),
  SchemaUtils.withLiteralKitStatics(SandboxBase)
);

/**
 * @since 0.0.0
 */
export type Sandbox = typeof Sandbox.Type;

const fetchDirectiveNamesByKey = {
  childSrc: "child-src",
  "child-src": "child-src",
  connectSrc: "connect-src",
  "connect-src": "connect-src",
  defaultSrc: "default-src",
  "default-src": "default-src",
  fontSrc: "font-src",
  "font-src": "font-src",
  frameSrc: "frame-src",
  "frame-src": "frame-src",
  imgSrc: "img-src",
  "img-src": "img-src",
  manifestSrc: "manifest-src",
  "manifest-src": "manifest-src",
  mediaSrc: "media-src",
  "media-src": "media-src",
  prefetchSrc: "prefetch-src",
  "prefetch-src": "prefetch-src",
  objectSrc: "object-src",
  "object-src": "object-src",
  scriptSrc: "script-src",
  "script-src": "script-src",
  scriptSrcElem: "script-src-elem",
  "script-src-elem": "script-src-elem",
  scriptSrcAttr: "script-src-attr",
  "script-src-attr": "script-src-attr",
  styleSrc: "style-src",
  "style-src": "style-src",
  styleSrcElem: "style-src-elem",
  "style-src-elem": "style-src-elem",
  styleSrcAttr: "style-src-attr",
  "style-src-attr": "style-src-attr",
  workerSrc: "worker-src",
  "worker-src": "worker-src",
} as const;

/**
 * @since 0.0.0
 */
export class FetchDirective extends S.Class<FetchDirective>($I`FetchDirective`)(
  {
    childSrc: DirectiveSource,
    "child-src": DirectiveSource,
    connectSrc: DirectiveSource,
    "connect-src": DirectiveSource,
    defaultSrc: DirectiveSource,
    "default-src": DirectiveSource,
    fontSrc: DirectiveSource,
    "font-src": DirectiveSource,
    frameSrc: DirectiveSource,
    "frame-src": DirectiveSource,
    imgSrc: DirectiveSource,
    "img-src": DirectiveSource,
    manifestSrc: DirectiveSource,
    "manifest-src": DirectiveSource,
    mediaSrc: DirectiveSource,
    "media-src": DirectiveSource,
    prefetchSrc: DirectiveSource,
    "prefetch-src": DirectiveSource,
    objectSrc: DirectiveSource,
    "object-src": DirectiveSource,
    scriptSrc: DirectiveSource,
    "script-src": DirectiveSource,
    scriptSrcElem: DirectiveSource,
    "script-src-elem": DirectiveSource,
    scriptSrcAttr: DirectiveSource,
    "script-src-attr": DirectiveSource,
    styleSrc: DirectiveSource,
    "style-src": DirectiveSource,
    styleSrcElem: DirectiveSource,
    "style-src-elem": DirectiveSource,
    styleSrcAttr: DirectiveSource,
    "style-src-attr": DirectiveSource,
    workerSrc: DirectiveSource,
    "worker-src": DirectiveSource,
  },
  $I.annote("FetchDirective", {
    description: "A CSP fetch directive",
  })
) {
  static readonly convertToString = (directive?: undefined | DirectiveInput<FetchDirective>) => {
    if (P.isUndefined(directive)) {
      return Str.empty;
    }

    const strings = A.empty<string>();
    A.forEach(Struct.entries(directive), ([key, value]) => {
      const directiveValue = unwrapDirectiveValue(value);
      if (P.isUndefined(directiveValue)) {
        return;
      }

      const directiveName = fetchDirectiveNamesByKey[key];
      if (P.isUndefined(directiveName)) {
        return;
      }

      strings.push(createDirectiveValue(directiveName, wrapArray(directiveValue)));
    });

    return A.join(strings, directiveValueSeparator);
  };
}

/**
 * @since 0.0.0
 */
export class DocumentDirective extends S.Class<DocumentDirective>($I`DocumentDirective`)(
  {
    baseURI: DirectiveSource,
    "base-uri": DirectiveSource,
    pluginTypes: PluginTypes,
    "plugin-types": PluginTypes,
    sandbox: Sandbox,
  },
  $I.annote("DocumentDirective", {
    description: "A CSP document directive",
  })
) {
  static readonly convertToString = (directive?: undefined | DirectiveInput<DocumentDirective>) => {
    if (P.isUndefined(directive)) {
      return Str.empty;
    }

    const strings = A.empty<string>();

    const baseURI = unwrapDirectiveValue(directive.baseURI) ?? unwrapDirectiveValue(directive["base-uri"]);
    if (baseURI != undefined) {
      strings.push(createDirectiveValue("base-uri", wrapArray(baseURI)));
    }

    const pluginTypes = unwrapDirectiveValue(directive.pluginTypes) ?? unwrapDirectiveValue(directive["plugin-types"]);
    if (P.isNotUndefined(pluginTypes)) {
      strings.push(createDirectiveValue("plugin-types", wrapArray(pluginTypes)));
    }

    const sandbox = unwrapDirectiveValue(directive.sandbox);
    if (P.isNotUndefined(sandbox)) {
      const directiveName = "sandbox";
      const value = sandbox === true ? directiveName : createDirectiveValue(directiveName, sandbox);
      strings.push(value);
    }

    return pipe(strings, A.join(directiveValueSeparator));
  };
}

/**
 * @since 0.0.0
 */
export class NavigationDirective extends S.Class<NavigationDirective>($I`NavigationDirective`)(
  {
    formAction: DirectiveSource,
    "form-action": DirectiveSource,
    frameAncestors: DirectiveSource,
    "frame-ancestors": DirectiveSource,
    navigateTo: DirectiveSource,
    "navigate-to": DirectiveSource,
  },
  $I.annote("NavigationDirective", {
    description: "A CSP navigation directive",
  })
) {
  static readonly convertToString = (directive?: undefined | DirectiveInput<NavigationDirective>) => {
    if (directive == undefined) {
      return Str.empty;
    }

    const strings = A.empty<string>();

    const formAction = unwrapDirectiveValue(directive.formAction) ?? unwrapDirectiveValue(directive["form-action"]);
    if (formAction != undefined) {
      strings.push(createDirectiveValue("form-action", wrapArray(formAction)));
    }

    const frameAncestors =
      unwrapDirectiveValue(directive.frameAncestors) ?? unwrapDirectiveValue(directive["frame-ancestors"]);
    if (frameAncestors != undefined) {
      strings.push(createDirectiveValue("frame-ancestors", wrapArray(frameAncestors)));
    }

    const navigateTo = unwrapDirectiveValue(directive.navigateTo) ?? unwrapDirectiveValue(directive["navigate-to"]);
    if (navigateTo != undefined) {
      strings.push(createDirectiveValue("navigate-to", wrapArray(navigateTo)));
    }

    return pipe(strings, A.join(directiveValueSeparator));
  };
}

/**
 * @since 0.0.0
 */
export const ReportURI = S.Union([...internal.StringOrUrl.members, S.Array(internal.StringOrUrl)]).pipe(
  $I.annoteSchema("ReportURI", {
    description: "A CSP report-uri",
  })
);

/**
 * @since 0.0.0
 */
export class ReportingDirective extends S.Class<ReportingDirective>($I`ReportingDirective`)(
  {
    reportURI: ReportURI,
    "report-uri": ReportURI,
    reportTo: S.String,
    "report-to": S.String,
  },
  $I.annote("ReportingDirective", {
    description: "A CSP reporting directive",
  })
) {
  static readonly convertToString = (directive?: undefined | DirectiveInput<ReportingDirective>) => {
    if (directive == undefined) {
      return Str.empty;
    }

    const strings = A.empty<string>();

    const reportURIValue = unwrapDirectiveValue(directive.reportURI) ?? unwrapDirectiveValue(directive["report-uri"]);
    if (reportURIValue != undefined) {
      const reportURI = A.map(wrapArray(reportURIValue), (i) => internal.encodeStrictURI(i));
      strings.push(createDirectiveValue("report-uri", reportURI));
    }
    const reportTo = unwrapDirectiveValue(directive.reportTo) ?? unwrapDirectiveValue(directive["report-to"]);
    if (reportTo != undefined) {
      strings.push(createDirectiveValue("report-to", reportTo));
    }

    return pipe(strings, A.join(directiveValueSeparator));
  };
}

/**
 * @since 0.0.0
 */
export const CspDirectives = S.Struct({
  ...FetchDirective.fields,
  ...DocumentDirective.fields,
  ...NavigationDirective.fields,
  ...ReportingDirective.fields,
}).pipe(
  $I.annoteSchema("CspDirectives", {
    description: "A CSP directives",
  })
);

/**
 * @since 0.0.0
 */
export class ContentSecurityPolicyOptionStruct extends S.Class<ContentSecurityPolicyOptionStruct>(
  $I`ContentSecurityPolicyOptionStruct`
)(
  {
    directives: CspDirectives.mapFields((fields) => {
      const evolve = pipe(
        Struct.entries(fields),
        A.reduce(
          {} as {
            readonly [K in keyof typeof fields]: (field: (typeof fields)[K]) => S.optionalKey<(typeof fields)[K]>;
          },
          (acc, [key]) =>
            ({
              ...acc,
              [key]: S.optionalKey,
            }) as const
        )
      );

      return pipe(fields, Struct.evolve(evolve));
    }),
    reportOnly: S.optionalKey(S.Boolean),
  },
  $I.annote("ContentSecurityPolicyOptionStruct", {
    description: "A CSP option struct",
  })
) {}

/**
 * @since 0.0.0
 */
export const ContentSecurityPolicyOption = S.Union([S.Literal(false), ContentSecurityPolicyOptionStruct]).pipe(
  $I.annoteSchema("ContentSecurityPolicyOption", {
    description: "A CSP option",
  })
);

/**
 * @since 0.0.0
 */
export type ContentSecurityPolicyOption = typeof ContentSecurityPolicyOption.Type;

/**
 * @since 0.0.0
 */
export class ContentSecurityPolicyResponseHeader extends S.Class<ContentSecurityPolicyResponseHeader>(
  $I`ContentSecurityPolicyResponseHeader`
)(
  {
    name: ContentSecurityPolicyHeaderName,
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("ContentSecurityPolicyResponseHeader", {
    description: "The `Content-Security-Policy` response header.",
  })
) {}

type ContentSecurityPolicyResponseHeaderEncoded = typeof ContentSecurityPolicyResponseHeader.Encoded;

const createContentSecurityPolicyValue = (
  option: ContentSecurityPolicyOptionStruct
): Effect.Effect<O.Option<string>, CspError> =>
  Effect.try({
    try: () => createContentSecurityPolicyOptionHeaderValue(option),
    catch: (cause) =>
      new CspError({
        message: P.isError(cause) ? cause.message : `Invalid value for ${headerName}`,
        cause: O.none(),
      }),
  }).pipe(Effect.map((value) => (P.isUndefined(value) || Str.isEmpty(value) ? O.none<string>() : O.some(value))));

const decodeContentSecurityPolicyHeader = (
  input: ContentSecurityPolicyOption | undefined
): Effect.Effect<ContentSecurityPolicyResponseHeaderEncoded, SchemaIssue.Issue> =>
  Effect.gen(function* () {
    if (P.isUndefined(input) || input === false) {
      return {
        name: headerName,
        value: undefined,
      } as const;
    }

    const value = yield* createContentSecurityPolicyValue(input).pipe(
      Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
    );

    if (O.isNone(value)) {
      return yield* Effect.fail(
        new SchemaIssue.InvalidValue(O.some(input), {
          message: "Invalid Content-Security-Policy configuration",
        })
      );
    }

    return {
      name: getProperHeaderName(Boolean(input.reportOnly)),
      value: value.value,
    } as const;
  });

/**
 * @since 0.0.0
 */
export const createContentSecurityPolicyOptionHeaderValue = (
  option?: undefined | ContentSecurityPolicyOption,
  fetchDirectiveToStringConverter = FetchDirective.convertToString,
  documentDirectiveToStringConverter = DocumentDirective.convertToString,
  navigationDirectiveToStringConverter = NavigationDirective.convertToString,
  reportingDirectiveToStringConverter = ReportingDirective.convertToString
): string | undefined => {
  if (P.isUndefined(option)) return;
  if (option === false) return;

  return pipe(
    A.make(
      fetchDirectiveToStringConverter(option.directives),
      documentDirectiveToStringConverter(option.directives),
      navigationDirectiveToStringConverter(option.directives),
      reportingDirectiveToStringConverter(option.directives)
    ),
    A.filter(Str.isNonEmpty),
    A.join(directiveValueSeparator)
  );
};

/**
 * @since 0.0.0
 */
export const ContentSecurityPolicyHeader = S.Union([ContentSecurityPolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    ContentSecurityPolicyResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: decodeContentSecurityPolicyHeader,
      encode: internal.makeHeaderEncodeForbidden("ContentSecurityPolicyHeader"),
    })
  ),
  $I.annoteSchema("ContentSecurityPolicyHeader", {
    description: "A one-way schema that decodes `Content-Security-Policy` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | ContentSecurityPolicyOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ContentSecurityPolicyOption
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<string>();
      }

      const decodedOption = yield* S.decodeUnknownEffect(ContentSecurityPolicyOptionStruct)(option).pipe(
        Effect.mapError(
          (cause) =>
            new CspError({
              message: cause.message,
              cause: O.none(),
            })
        )
      );

      return yield* createContentSecurityPolicyValue(decodedOption);
    });

    const create: (
      option?: undefined | ContentSecurityPolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ContentSecurityPolicyOption,
      headerValueCreator: typeof createValue = createValue
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<internal.ResponseHeader>();
      }

      const value = yield* headerValueCreator(option);

      return O.map(
        value,
        (headerValue) =>
          new internal.ResponseHeader({
            name: getProperHeaderName(Boolean(option.reportOnly)),
            value: O.some(headerValue),
          })
      );
    });

    return {
      createValue,
      create,
    };
  })
);

/**
 * @since 0.0.0
 */
export type ContentSecurityPolicyHeader = typeof ContentSecurityPolicyHeader.Type;
