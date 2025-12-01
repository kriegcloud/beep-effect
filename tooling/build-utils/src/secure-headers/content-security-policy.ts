import { Struct } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Str from "effect/String";
import { encodeStrictURI, wrapArray } from "./helpers.js";
import type { ResponseHeader } from "./types.js";

type DirectiveSource = string | string[] | undefined;
type PluginTypes = string | string[];
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
  value: T | T[],
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

export const createContentSecurityPolicyHeader = (
  option?: undefined | ContentSecurityPolicyOption,
  properHeaderNameGetter = getProperHeaderName,
  headerValueCreator = createContentSecurityPolicyOptionHeaderValue
): ResponseHeader | undefined => {
  if (option == undefined) return;
  if (option === false) return;

  const headerName = properHeaderNameGetter(option.reportOnly);
  const value = headerValueCreator(option);

  return { name: headerName, value };
};
