# Codebase Context: semantic-web uri

This is discovery-only. The request is concrete and scoped to explicit files and queries, so it is actionable without additional clarification.

## Current Exports and Shapes

### `packages/common/semantic-web/src/uri/uri.ts`

Exports (named):
- `URIComponents` (interface)
- `URIOptions` (interface)
- `URISchemeHandler` (interface)
- `SCHEMES` (object map: `{ [scheme: string]: URISchemeHandler }`)
- `pctEncChar(chr: string): string`
- `pctDecChars(str: string): string`
- `parse` (dual signature; string + options -> `URIComponents`)
- `removeDotSegments(input: string): string`
- `serialize(components: URIComponents, options?: URIOptions): string`
- `resolveComponents(base: URIComponents, relative: URIComponents, options?: URIOptions, skipNormalization?: boolean): URIComponents`
- `resolve(baseURI: string, relativeURI: string, options?: URIOptions): string`
- `normalize(uri: string | URIComponents, options?: URIOptions): string | URIComponents`
- `equal(uriA: string | URIComponents, uriB: string | URIComponents, options?: URIOptions): boolean`
- `escapeComponent` (dual signature; string + options -> string)
- `unescapeComponent` (dual signature; string + options -> string)

Key shapes:
- `URIComponents` includes optional fields: `scheme`, `userinfo`, `host`, `port` (number|string), `path`, `query`, `fragment`, `reference`, `error`.
- `URIOptions` includes optional fields: `scheme`, `reference`, `tolerant`, `absolutePath`, `iri`, `unicodeSupport`, `domainHost`.
- `URISchemeHandler<Components, Options, ParentComponents>` includes `scheme`, `parse`, `serialize`, and optional booleans `unicodeSupport`, `domainHost`, `absolutePath`.

Notable internal logic:
- `parse` applies `SCHEMES[scheme].parse` if present; uses `idna.toASCIIResult` in parse normalization; `components.error` set on parse/reference mismatches and IDNA failures.
- `serialize` uses `SCHEMES[scheme].serialize` and `idna.toASCIIResult`/`idna.toUnicodeResult` for domainHost conversions; sets `components.error` on IDNA conversion failures.
- `removeDotSegments` uses `invariant` and can throw if an unexpected dot segment condition is hit.

Source: `packages/common/semantic-web/src/uri/uri.ts`.

### `packages/common/semantic-web/src/uri/model.ts`

Exports:
- `URIRegExps` (class) extends `S.Class<URIRegExps>` with fields of type `BS.Regex`.

Shape:
- Fields: `NOT_SCHEME`, `NOT_USERINFO`, `NOT_HOST`, `NOT_PATH`, `NOT_PATH_NOSCHEME`, `NOT_QUERY`, `NOT_FRAGMENT`, `ESCAPE`, `UNRESERVED`, `OTHER_CHARS`, `PCT_ENCODED`, `IPV4ADDRESS`, `IPV6ADDRESS`.

Source: `packages/common/semantic-web/src/uri/model.ts`.

### `packages/common/semantic-web/src/uri/schemes/index.ts`

Exports:
- Side-effect registration of default handlers into `SCHEMES` for: `http`, `https`, `ws`, `wss`, `mailto`, `urn`, `urn-uuid`.
- Re-exports types:
  - `MailtoComponents`, `MailtoHeaders` from `./mailto.ts`
  - `URNComponents`, `URNOptions` from `./urn.ts`
  - `UUIDComponents` from `./urn-uuid.ts`
  - `WSComponents` from `./ws.ts`

Source: `packages/common/semantic-web/src/uri/schemes/index.ts`.

### `packages/common/semantic-web/src/uri/schemes/*`

`http.ts`
- Default export `handler: URISchemeHandler`.
- `scheme: "http"`, `domainHost: true`.
- `parse` sets `components.error` if host missing.
- `serialize` removes default ports 80/443, ensures path `/`.

`https.ts`
- Default export `handler: URISchemeHandler`.
- `scheme: "https"`, delegates `domainHost`, `parse`, `serialize` to `http` handler.

`ws.ts`
- Exports `WSComponents` (extends `URIComponents` with `resourceName`, `secure`).
- Default export `handler: URISchemeHandler`.
- `parse` sets `secure`, derives `resourceName` from `path`/`query`, clears `path`/`query`.
- `serialize` handles default ports, scheme swapping based on `secure`, derives `path`/`query` from `resourceName`, clears `fragment`.

`wss.ts`
- Default export `handler: URISchemeHandler`.
- `scheme: "wss"`, delegates `domainHost`, `parse`, `serialize` to `ws` handler.

`urn.ts`
- Exports `URNComponents` (extends `URIComponents` with `nid`, `nss`).
- Exports `URNOptions` (extends `URIOptions` with `nid`).
- Default export `handler: URISchemeHandler<URNComponents, URNOptions>`.
- `parse` splits `path` by `:`; sets `nid`, `nss`, `path` undefined; dispatches to `SCHEMES["urn:<nid>"]` if present; else sets error if parse fails.
- `serialize` dispatches to `SCHEMES["urn:<nid>"]` then sets `path` as `${nid}:${nss}`.

`urn-uuid.ts`
- Exports `UUIDComponents` (extends `URNComponents` with `uuid`).
- Default export `handler: URISchemeHandler<UUIDComponents, URIOptions, URNComponents>`.
- `parse` moves `nss` to `uuid`; validates UUID unless `options.tolerant`, sets error if invalid.
- `serialize` lowercases `uuid` into `nss`.

`mailto.ts`
- Exports `MailtoHeaders` map and `MailtoComponents` (extends `URIComponents` with `to`, `headers`, `subject`, `body`).
- Default export `handler: URISchemeHandler<MailtoComponents>`.
- `parse` splits `path` into `to`, parses query into headers, unescapes subject/body, uses `idna.toASCIIResult` to normalize domains unless `unicodeSupport`.
- `serialize` encodes local part + header fields; uses `idna.toASCIIResult`/`idna.toUnicodeResult` for domain conversion; sets `components.error` on IDNA failures.

Sources: `packages/common/semantic-web/src/uri/schemes/*.ts`.

## Current Tests and Asserted Behaviors

File: `packages/common/semantic-web/test/uri/uri.test.ts`.

Coverage summary:
- `parse`: component extraction, IPv4/IPv6/zone identifiers, reference classification, and handling of control characters in fragments.
- `serialize`: host/port/path/query/fragment output, IPv6 rendering, path edge cases (double slash, colon, query).
- `resolve`: RFC 3986 normal/abnormal examples, tolerant behavior, and PAEz examples.
- `normalize`: percent-encoding normalization, IPv4/IPv6 normalization, IRI normalization.
- `equal`: canonical equivalence checks for URIs, HTTP/S specifics, URN specifics, mailto, ws/wss.
- `escapeComponent`/`unescapeComponent`: byte range and multibyte correctness.
- Scheme-specific:
  - URN/UUID parse + serialize + equality + NID override.
  - Mailto parse + serialize including headers/body and percent-encoding; IDN conversion expectations.
  - WS/WSS parse + serialize + normalize + equality.

Source: `packages/common/semantic-web/test/uri/uri.test.ts`.

## Import Sites

### `@beep/semantic-web/uri`
- No matches found in repo.

### `@beep/semantic-web/uri/*`

From `rg -n "@beep/semantic-web/uri/" -S packages`:
```txt
packages/common/semantic-web/test/uri/uri.test.ts:10:} from "@beep/semantic-web/uri/uri";
packages/common/semantic-web/test/uri/uri.test.ts:11:import "@beep/semantic-web/uri/schemes";
packages/common/semantic-web/test/uri/uri.test.ts:12:import type { MailtoComponents } from "@beep/semantic-web/uri/schemes/mailto";
packages/common/semantic-web/test/uri/uri.test.ts:13:import type { URNComponents, URNOptions } from "@beep/semantic-web/uri/schemes/urn";
packages/common/semantic-web/test/uri/uri.test.ts:14:import type { UUIDComponents } from "@beep/semantic-web/uri/schemes/urn-uuid";
packages/common/semantic-web/test/uri/uri.test.ts:15:import type { WSComponents } from "@beep/semantic-web/uri/schemes/ws";
packages/common/semantic-web/test/uri/uri.test.ts:16:import type { URIOptions } from "@beep/semantic-web/uri/uri";
```

Usage details:
- `packages/common/semantic-web/test/uri/uri.test.ts`
  - Named imports: `equal`, `escapeComponent`, `normalize`, `parse`, `resolve`, `serialize`, `unescapeComponent` from `@beep/semantic-web/uri/uri` (sync named).
  - Side-effect import: `@beep/semantic-web/uri/schemes` (registers scheme handlers).
  - Type-only named imports from scheme modules (`MailtoComponents`, `URNComponents`, `URNOptions`, `UUIDComponents`, `WSComponents`) and `URIOptions` (type-only, named, sync).

### Local imports from `packages/common/semantic-web/src/uri/*`

No repo-wide matches for direct path imports like `packages/common/semantic-web/src/uri/*`.
Internal module imports (within uri module itself):
- `packages/common/semantic-web/src/uri/uri.ts` imports `./model.ts`, `./regex-iri`, `./regex-uri`.
- `packages/common/semantic-web/src/uri/schemes/index.ts` imports `../uri.ts` and each scheme module, registers into `SCHEMES`.
- Scheme modules import `../uri.ts` and `./urn.ts` as needed.

## Error Flows

### `components.error` assignments
From `rg -n "components\.error" packages/common/semantic-web/src/uri -S`:
```txt
packages/common/semantic-web/src/uri/uri.ts:352:        components.error = components.error || `URI is not a ${options.reference} reference.`;
packages/common/semantic-web/src/uri/uri.ts:361:            components.error =
packages/common/semantic-web/src/uri/uri.ts:379:      components.error = components.error || "URI can not be parsed.";
packages/common/semantic-web/src/uri/uri.ts:462:        components.error =
packages/common/semantic-web/src/uri/schemes/urn.ts:40:      urnComponents.error = urnComponents.error || "URN can not be parsed.";
packages/common/semantic-web/src/uri/schemes/mailto.ts:105:          mailtoComponents.error =
packages/common/semantic-web/src/uri/schemes/mailto.ts:144:          components.error =
packages/common/semantic-web/src/uri/schemes/http.ts:11:      components.error = components.error || "HTTP URIs must have a host.";
packages/common/semantic-web/src/uri/schemes/urn-uuid.ts:20:      uuidComponents.error = uuidComponents.error || "UUID is not valid.";
```

Details:
- `uri.ts`
  - Reference mismatch error when `options.reference` does not match computed reference.
  - IDNA conversion failure sets error with formatted issue details.
  - Parse failure sets "URI can not be parsed."
- `schemes/urn.ts`
  - Parse failure sets "URN can not be parsed."
- `schemes/mailto.ts`
  - IDNA conversion failure sets error for email domain conversions.
- `schemes/http.ts`
  - Missing host sets "HTTP URIs must have a host."
- `schemes/urn-uuid.ts`
  - Invalid UUID sets "UUID is not valid." when `options.tolerant` is false.

### Exceptions and implicit throws
From `rg -n "invariant|throw|try|catch" packages/common/semantic-web/src/uri/uri.ts -S`:
```txt
37:import { invariant } from "@beep/invariant";
432:      invariant(O.isSome(im), "Unexpected dot segment condition", {
```

- `removeDotSegments` calls `invariant(...)` and can throw if the dot-segment regex match fails unexpectedly.
- No explicit `throw`, `try`, or `catch` blocks were found in uri or scheme files.

## IDNA Usage in URI Code Paths

From `rg -n "idna" packages/common/semantic-web/src/uri -S`:
```txt
packages/common/semantic-web/src/uri/uri.ts:38:import idna from "@beep/semantic-web/idna";
packages/common/semantic-web/src/uri/uri.ts:359:          const r = idna.toASCIIResult(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
packages/common/semantic-web/src/uri/uri.ts:459:        ? idna.toASCIIResult(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase())
packages/common/semantic-web/src/uri/uri.ts:460:        : idna.toUnicodeResult(components.host);
packages/common/semantic-web/src/uri/schemes/mailto.ts:1:import idna from "@beep/semantic-web/idna";
packages/common/semantic-web/src/uri/schemes/mailto.ts:103:        const r = idna.toASCIIResult(Str.toLowerCase(unescapeComponent(domainPart, options)));
packages/common/semantic-web/src/uri/schemes/mailto.ts:141:          ? idna.toASCIIResult(Str.toLowerCase(unescapeComponent(domain, options)))
packages/common/semantic-web/src/uri/schemes/mailto.ts:142:          : idna.toUnicodeResult(domain);
```

Handling behavior:
- `uri.ts`:
  - Parse path: when `domainHost` is enabled, calls `idna.toASCIIResult(...)` and sets `components.error` if `_tag === "Left"`; otherwise assigns ASCII host.
  - Serialize path: for `domainHost`, uses `toASCIIResult` or `toUnicodeResult` depending on `options.iri`; sets `components.error` if `_tag === "Left"`.
  - No try/catch around IDNA; relies on `Either`-like result object.
- `mailto.ts`:
  - Parse path: uses `toASCIIResult` for domain normalization when `unicodeSupport` is false; on `Left`, sets `mailtoComponents.error`.
  - Serialize path: uses `toASCIIResult` or `toUnicodeResult` based on `options.iri`; on `Left`, sets `components.error`.

