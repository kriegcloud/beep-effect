import { Struct } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { encodeStrictURI, wrapArray } from "./helpers.js";
import type { ResponseHeader } from "./types.js";

type DirectiveSource = string | readonly string[] | undefined;
type PluginTypes = string | readonly string[];
type Sandbox =
  | true
  | "allow-downloads-without-user-activation"
  | "allow-forms"
  | "allow-modals"
  | "allow-orientation-lock"
  | "allow-pointer-lock"
  | "allow-popups"
  | "allow-popups-to-escape-sandbox"
  | "allow-presentation"
  | "allow-same-origin"
  | "allow-scripts"
  | "allow-storage-access-by-user-activation"
  | "allow-top-navigation"
  | "allow-top-navigation-by-user-activation";

type FetchDirective = {
  readonly childSrc: DirectiveSource;
  readonly "child-src": DirectiveSource;
  readonly connectSrc: DirectiveSource;
  readonly "connect-src": DirectiveSource;
  readonly defaultSrc: DirectiveSource;
  readonly "default-src": DirectiveSource;
  readonly fontSrc: DirectiveSource;
  readonly "font-src": DirectiveSource;
  readonly frameSrc: DirectiveSource;
  readonly "frame-src": DirectiveSource;
  readonly imgSrc: DirectiveSource;
  readonly "img-src": DirectiveSource;
  readonly manifestSrc: DirectiveSource;
  readonly "manifest-src": DirectiveSource;
  readonly mediaSrc: DirectiveSource;
  readonly "media-src": DirectiveSource;
  readonly prefetchSrc: DirectiveSource;
  readonly "prefetch-src": DirectiveSource;
  readonly objectSrc: DirectiveSource;
  readonly "object-src": DirectiveSource;
  readonly scriptSrc: DirectiveSource;
  readonly "script-src": DirectiveSource;
  readonly scriptSrcElem: DirectiveSource;
  readonly "script-src-elem": DirectiveSource;
  readonly scriptSrcAttr: DirectiveSource;
  readonly "script-src-attr": DirectiveSource;
  readonly styleSrc: DirectiveSource;
  readonly "style-src": DirectiveSource;
  readonly styleSrcElem: DirectiveSource;
  readonly "style-src-elem": DirectiveSource;
  readonly styleSrcAttr: DirectiveSource;
  readonly "style-src-attr": DirectiveSource;
  readonly workerSrc: DirectiveSource;
  readonly "worker-src": DirectiveSource;
};

type DocumentDirective = {
  readonly baseURI: DirectiveSource;
  readonly "base-uri": DirectiveSource;
  readonly pluginTypes: PluginTypes;
  readonly "plugin-types": PluginTypes;
  readonly sandbox: Sandbox;
};

type NavigationDirective = {
  readonly formAction: DirectiveSource;
  readonly "form-action": DirectiveSource;
  readonly frameAncestors: DirectiveSource;
  readonly "frame-ancestors": DirectiveSource;
  readonly navigateTo: DirectiveSource;
  readonly "navigate-to": DirectiveSource;
};
type ReportingDirective = {
  readonly reportURI: string | URL | Array<string | URL>;
  readonly "report-uri": string | URL | Array<string | URL>;
  readonly reportTo: string;
  readonly "report-to": string;
};

export type ContentSecurityPolicyOption =
  | false
  | {
      readonly directives: Partial<FetchDirective> &
        Partial<DocumentDirective> &
        Partial<NavigationDirective> &
        Partial<ReportingDirective>;
      readonly reportOnly?: undefined | boolean;
    };

const headerName = "Content-Security-Policy";
const reportOnlyHeaderName = "Content-Security-Policy-Report-Only";
const directiveValueSepartor = "; ";

export const getProperHeaderName = (reportOnly = false) => (reportOnly ? reportOnlyHeaderName : headerName);
export const createDirectiveValue = <const T extends string>(
  directiveName: string,
  value: T | readonly T[],
  arrayWrapper = wrapArray
) => {
  const values = arrayWrapper(value);

  return `${directiveName} ${A.join(" ")(values)}`;
};

const fetchDirectiveNamesByKey: Record<keyof FetchDirective, string> = {
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
};
export const convertFetchDirectiveToString = (directive?: Partial<FetchDirective>) => {
  if (directive == undefined) return Str.empty;

  const strings: string[] = [];
  A.forEach(Struct.entries(directive), ([key, value]) => {
    if (value == undefined) return;

    const directiveName = fetchDirectiveNamesByKey[key as keyof FetchDirective];
    if (directiveName == undefined) return;

    strings.push(createDirectiveValue(directiveName, wrapArray(value)));
  });

  return pipe(strings, A.join(directiveValueSepartor));
};

export const convertDocumentDirectiveToString = (directive?: undefined | Partial<DocumentDirective>) => {
  if (directive == undefined) return Str.empty;

  const strings: string[] = [];

  const baseURI = directive.baseURI ?? directive["base-uri"];
  if (baseURI != undefined) strings.push(createDirectiveValue("base-uri", wrapArray(baseURI)));

  const pluginTypes = directive.pluginTypes ?? directive["plugin-types"];
  if (pluginTypes != undefined) strings.push(createDirectiveValue("plugin-types", wrapArray(pluginTypes)));

  if (directive.sandbox != undefined) {
    const directiveName = "sandbox";
    const value = directive.sandbox === true ? directiveName : createDirectiveValue(directiveName, directive.sandbox);
    strings.push(value);
  }

  return pipe(strings, A.join(directiveValueSepartor));
};

export const convertNavigationDirectiveToString = (directive?: undefined | Partial<NavigationDirective>) => {
  if (directive == undefined) return Str.empty;

  const strings: string[] = [];

  const formAction = directive.formAction ?? directive["form-action"];
  if (formAction != undefined) strings.push(createDirectiveValue("form-action", wrapArray(formAction)));

  const frameAncestors = directive.frameAncestors ?? directive["frame-ancestors"];
  if (frameAncestors != undefined) strings.push(createDirectiveValue("frame-ancestors", wrapArray(frameAncestors)));

  const navigateTo = directive.navigateTo ?? directive["navigate-to"];
  if (navigateTo != undefined) strings.push(createDirectiveValue("navigate-to", wrapArray(navigateTo)));

  return pipe(strings, A.join(directiveValueSepartor));
};

export const convertReportingDirectiveToString = (directive?: undefined | Partial<ReportingDirective>) => {
  if (directive == undefined) return Str.empty;

  const strings: string[] = [];

  const reportURIValue = directive.reportURI ?? directive["report-uri"];
  if (reportURIValue != undefined) {
    const reportURI = wrapArray(reportURIValue).map(encodeStrictURI);
    strings.push(createDirectiveValue("report-uri", reportURI));
  }
  const reportTo = directive.reportTo ?? directive["report-to"];
  if (reportTo != undefined) strings.push(createDirectiveValue("report-to", reportTo));

  return pipe(strings, A.join(directiveValueSepartor));
};

export const createContentSecurityPolicyOptionHeaderValue = (
  option?: undefined | ContentSecurityPolicyOption,
  fetchDirectiveToStringConverter = convertFetchDirectiveToString,
  documentDirectiveToStringConverter = convertDocumentDirectiveToString,
  navigationDirectiveToStringConverter = convertNavigationDirectiveToString,
  reportingDirectiveToStringConverter = convertReportingDirectiveToString
): string | undefined => {
  if (option == undefined) return;
  if (option === false) return;

  return pipe(
    A.make(
      fetchDirectiveToStringConverter(option.directives),
      documentDirectiveToStringConverter(option.directives),
      navigationDirectiveToStringConverter(option.directives),
      reportingDirectiveToStringConverter(option.directives)
    ),
    A.filter((string) => string.length > 0),
    A.join(directiveValueSepartor)
  );
};

// Schema definitions

/**
 * Schema for directive source values (string or array of strings).
 */
const DirectiveSourceSchema = S.UndefinedOr(S.Union(S.String, S.Array(S.String)));

/**
 * Schema for plugin types.
 */
const PluginTypesSchema = S.Union(S.String, S.Array(S.String));

/**
 * Schema for sandbox values.
 */
const SandboxSchema = S.Union(
  S.Literal(true),
  S.Literal("allow-downloads-without-user-activation"),
  S.Literal("allow-forms"),
  S.Literal("allow-modals"),
  S.Literal("allow-orientation-lock"),
  S.Literal("allow-pointer-lock"),
  S.Literal("allow-popups"),
  S.Literal("allow-popups-to-escape-sandbox"),
  S.Literal("allow-presentation"),
  S.Literal("allow-same-origin"),
  S.Literal("allow-scripts"),
  S.Literal("allow-storage-access-by-user-activation"),
  S.Literal("allow-top-navigation"),
  S.Literal("allow-top-navigation-by-user-activation")
);

/**
 * Schema for report URI value.
 */
const ReportURIValueSchema = S.Union(S.String, S.instanceOf(URL), S.Array(S.Union(S.String, S.instanceOf(URL))));

/**
 * Schema for CSP directives (combination of all directive types).
 */
const CSPDirectivesSchema = S.partial(
  S.Struct({
    // Fetch directives
    childSrc: DirectiveSourceSchema,
    "child-src": DirectiveSourceSchema,
    connectSrc: DirectiveSourceSchema,
    "connect-src": DirectiveSourceSchema,
    defaultSrc: DirectiveSourceSchema,
    "default-src": DirectiveSourceSchema,
    fontSrc: DirectiveSourceSchema,
    "font-src": DirectiveSourceSchema,
    frameSrc: DirectiveSourceSchema,
    "frame-src": DirectiveSourceSchema,
    imgSrc: DirectiveSourceSchema,
    "img-src": DirectiveSourceSchema,
    manifestSrc: DirectiveSourceSchema,
    "manifest-src": DirectiveSourceSchema,
    mediaSrc: DirectiveSourceSchema,
    "media-src": DirectiveSourceSchema,
    prefetchSrc: DirectiveSourceSchema,
    "prefetch-src": DirectiveSourceSchema,
    objectSrc: DirectiveSourceSchema,
    "object-src": DirectiveSourceSchema,
    scriptSrc: DirectiveSourceSchema,
    "script-src": DirectiveSourceSchema,
    scriptSrcElem: DirectiveSourceSchema,
    "script-src-elem": DirectiveSourceSchema,
    scriptSrcAttr: DirectiveSourceSchema,
    "script-src-attr": DirectiveSourceSchema,
    styleSrc: DirectiveSourceSchema,
    "style-src": DirectiveSourceSchema,
    styleSrcElem: DirectiveSourceSchema,
    "style-src-elem": DirectiveSourceSchema,
    styleSrcAttr: DirectiveSourceSchema,
    "style-src-attr": DirectiveSourceSchema,
    workerSrc: DirectiveSourceSchema,
    "worker-src": DirectiveSourceSchema,
    // Document directives
    baseURI: DirectiveSourceSchema,
    "base-uri": DirectiveSourceSchema,
    pluginTypes: S.optional(PluginTypesSchema),
    "plugin-types": S.optional(PluginTypesSchema),
    sandbox: S.optional(SandboxSchema),
    // Navigation directives
    formAction: DirectiveSourceSchema,
    "form-action": DirectiveSourceSchema,
    frameAncestors: DirectiveSourceSchema,
    "frame-ancestors": DirectiveSourceSchema,
    navigateTo: DirectiveSourceSchema,
    "navigate-to": DirectiveSourceSchema,
    // Reporting directives
    reportURI: S.optional(ReportURIValueSchema),
    "report-uri": S.optional(ReportURIValueSchema),
    reportTo: S.optional(S.String),
    "report-to": S.optional(S.String),
  })
);

/**
 * Schema for the CSP configuration object.
 */
const CSPConfigSchema = S.Struct({
  directives: CSPDirectivesSchema,
  reportOnly: S.optional(S.Boolean),
});

/**
 * Schema for the Content-Security-Policy option value.
 * Accepts:
 * - `false` to disable
 * - `{ directives: {...}, reportOnly?: boolean }` for configuration
 */
export const ContentSecurityPolicyOptionSchema = S.Union(S.Literal(false), CSPConfigSchema);

export type ContentSecurityPolicyOptionFromSchema = typeof ContentSecurityPolicyOptionSchema.Type;

/**
 * Schema for the Content-Security-Policy response header output.
 */
const CSPResponseHeaderSchema = S.Struct({
  name: S.String,
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Content-Security-Policy response header.
 * Transforms a ContentSecurityPolicyOption input into a ResponseHeader output.
 *
 * - `undefined` → decodes to `{ name: "Content-Security-Policy", value: undefined }`
 * - `false` → decodes to `{ name: "Content-Security-Policy", value: undefined }`
 * - `{ directives, reportOnly }` → decodes to `{ name: "Content-Security-Policy[-Report-Only]", value: "<directives>" }`
 */
export const ContentSecurityPolicyHeaderSchema = S.transformOrFail(
  S.Union(ContentSecurityPolicyOptionSchema, S.Undefined),
  CSPResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName, value: undefined });
      }

      const name = getProperHeaderName(option.reportOnly);
      const value = createContentSecurityPolicyOptionHeaderValue(option as ContentSecurityPolicyOption);

      if (!value || !name) {
        return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid CSP configuration`));
      }

      return ParseResult.succeed({ name, value });
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }

      // Parsing CSP header back to options is complex - return a minimal representation
      // This is a simplified encode that preserves the header value but doesn't fully reconstruct directives
      const isReportOnly = header.name === reportOnlyHeaderName;

      // Parse directives from the header value
      const directives: Record<string, string | string[]> = {};
      const parts = header.value.split(directiveValueSepartor);

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;

        const spaceIndex = trimmed.indexOf(" ");
        if (spaceIndex === -1) {
          // Directive with no value (like "sandbox")
          directives[trimmed] = "";
        } else {
          const directiveName = trimmed.slice(0, spaceIndex);
          const directiveValue = trimmed.slice(spaceIndex + 1);
          const values = directiveValue.split(" ").filter((v) => v.length > 0);
          directives[directiveName] = values.length === 1 ? values[0]! : values;
        }
      }

      if (Object.keys(directives).length === 0) {
        return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode empty CSP header`));
      }

      return ParseResult.succeed({
        directives,
        ...(isReportOnly && { reportOnly: true }),
      });
    },
  }
).annotations({ identifier: "ContentSecurityPolicyHeaderSchema" });

export type ContentSecurityPolicyHeader = typeof ContentSecurityPolicyHeaderSchema.Type;

export const createContentSecurityPolicyHeader = (
  option?: undefined | ContentSecurityPolicyOption,
  properHeaderNameGetter = getProperHeaderName,
  headerValueCreator = createContentSecurityPolicyOptionHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, never, never> =>
  Effect.gen(function* () {
    if (option == undefined) return O.none<ResponseHeader>();
    if (option === false) return O.none<ResponseHeader>();

    const name = properHeaderNameGetter(option.reportOnly);
    const value = headerValueCreator(option);

    if (!value || !name) return O.none<ResponseHeader>();
    return O.some({ name, value });
  }).pipe(Effect.withSpan("createContentSecurityPolicyHeader"));
