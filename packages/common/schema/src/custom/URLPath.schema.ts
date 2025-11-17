import { makeBranded } from "@beep/schema/utils";
import type { StringTypes } from "@beep/types";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { CustomId } from "./_id";

const Id = CustomId.compose("custom");
/**
 * Schema for validating NextJS pathnames including static assets and optional query strings.
 * Supports: /icons/navbar/ic-lock.svg, /api/users/[id], /_next/static/..., /auth/verify/email?token=abc
 *
 * Pattern explanation:
 * - ^\/: Must start with forward slash
 * - (?:[\w\-\.]+\/)*: Zero or more directory segments (word chars, hyphens, dots)
 * - (?:[\w\-\.]*)?$: Optional filename at the end
 */
export class URLPath extends S.TemplateLiteral("/", S.String)
  .pipe(
    S.pattern(/^\/(?:[\w\-.]+\/)*(?:[\w\-.]*)?(?:\?(?:[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]*))?$/),
    S.annotations({
      title: "NextJS Path",
      description: "A valid NextJS pathname including static assets, API routes, and pages",
      examples: [
        "/icons/navbar/ic-lock.svg",
        "/api/users/123",
        "/dashboard/settings",
        "/_next/static/chunks/123.js",
        "/",
        "/auth/verify/email?token=example",
      ],
      arbitrary: () => (fc) => {
        // Generate realistic NextJS paths for testing
        const segments = fc.array(
          fc.oneof(
            fc.constantFrom("icons", "api", "dashboard", "users", "_next", "static"),
            fc.stringMatching(/^[\w\-.]+$/).filter((s) => s.length > 0 && s.length < 20)
          ),
          { minLength: 0, maxLength: 4 }
        );

        const filename = fc.option(
          fc.oneof(
            fc.constantFrom("ic-lock.svg", "favicon.ico", "index.js", "page.tsx"),
            fc.stringMatching(/^[\w-]+\.\w+$/).filter((s) => s.length < 30)
          ),
          { nil: undefined }
        );

        const queryParams = fc.option(
          fc
            .array(
              fc
                .record({
                  key: fc.stringMatching(/^[A-Za-z0-9_-]+$/).filter((s) => s.length > 0 && s.length < 20),
                  value: fc
                    .stringMatching(/^[A-Za-z0-9\-._~!$&'()*+,;=:@/?%]+$/)
                    .filter((s) => s.length > 0 && s.length < 50),
                })
                .map(({ key, value }) => `${key}=${value}`),
              { minLength: 1, maxLength: 3 }
            )
            .map((params) => params.join("&")),
          { nil: undefined }
        );

        return fc.tuple(segments, filename, queryParams).map(([segs, file, query]) => {
          const path = Str.concat(`${A.join("/")(segs)}${segs.length > 0 && file ? "/" : ""}${file || ""}`)(`/`);
          const normalizedPath = path === "//" ? "/" : path;
          return makeBranded(query ? `${normalizedPath}?${query}` : normalizedPath);
        });
      },
    }),
    S.brand("URLPath")
  )
  .annotations(
    Id.annotations("URLPath", {
      description: "A valid NextJS pathname including static assets, API routes, and pages",
    })
  ) {
  static readonly is = (input: unknown): input is URLPath.Type => S.is(URLPath)(input);
}

export declare namespace URLPath {
  /** URL path type (branded). */
  export type Type = typeof URLPath.Type;
  export type Encoded = typeof URLPath.Encoded;

  export type Branded<T extends StringTypes.NonEmptyString> = B.Branded<T, "URLPath">;
}
