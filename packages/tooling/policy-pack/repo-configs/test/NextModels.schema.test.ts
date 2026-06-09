import {
  FileSizeSuffix,
  Header,
  LoggingConfig,
  Middleware,
  Redirect,
  Rewrite,
  RouteHas,
  SassOptions,
  SizeLimit,
} from "@beep/repo-configs/next";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";
import { describe, expect, it } from "vitest";

const decodeFileSizeSuffix = S.decodeUnknownEffect(FileSizeSuffix);
const decodeSizeLimit = S.decodeUnknownEffect(SizeLimit);
const decodeRouteHas = S.decodeUnknownEffect(RouteHas);
const decodeRewrite = S.decodeUnknownEffect(Rewrite);
const decodeHeader = S.decodeUnknownEffect(Header);
const decodeRedirect = S.decodeUnknownEffect(Redirect);
const decodeMiddleware = S.decodeUnknownEffect(Middleware);
const decodeLoggingConfig = S.decodeUnknownEffect(LoggingConfig);
const decodeSassOptions = S.decodeUnknownEffect(SassOptions);

const exit = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(Effect.exit(effect));

describe("Next shared schemas", () => {
  it("accepts Next.js file size suffixes and size limits", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(yield* decodeFileSizeSuffix("kb")).toBe("kb");
        expect(yield* decodeFileSizeSuffix("MB")).toBe("MB");
        expect(yield* decodeSizeLimit(1024)).toBe(1024);
        expect(yield* decodeSizeLimit("1.5gb")).toBe("1.5gb");
      })
    ));

  it("rejects malformed size suffixes and size limit strings", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeFileSizeSuffix("xb")))))).toBe(
          true
        );
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeFileSizeSuffix("mbps")))))).toBe(
          true
        );
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSizeLimit(-1)))))).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSizeLimit("-2KB")))))).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSizeLimit("1")))))).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSizeLimit("1xb")))))).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSizeLimit("mb")))))).toBe(true);
      })
    ));
});

describe("Next route schemas", () => {
  const routeHasArbitrary = S.toArbitrary(RouteHas);

  it("accepts route predicates and public route config shapes", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(yield* decodeRouteHas({ type: "header", key: "x-beep", value: "1" })).toEqual({
          type: "header",
          key: "x-beep",
          value: "1",
        });
        expect(yield* decodeRouteHas({ type: "host", value: "example.com" })).toEqual({
          type: "host",
          value: "example.com",
        });
        expect(
          yield* decodeRewrite({
            source: "/old",
            destination: "/new",
            has: [{ type: "query", key: "draft" }],
            internal: true,
            regex: "^/old$",
          })
        ).toEqual({
          source: "/old",
          destination: "/new",
          has: [{ type: "query", key: "draft" }],
        });
        expect(
          yield* decodeHeader({
            source: "/secure",
            headers: [{ key: "x-frame-options", value: "deny" }],
            internal: true,
          })
        ).toEqual({
          source: "/secure",
          headers: [{ key: "x-frame-options", value: "deny" }],
        });
        expect(yield* decodeRedirect({ source: "/old", destination: "/new", permanent: true })).toEqual({
          source: "/old",
          destination: "/new",
          permanent: true,
        });
        expect(yield* decodeRedirect({ source: "/old", destination: "/new", statusCode: 307 })).toEqual({
          source: "/old",
          destination: "/new",
          statusCode: 307,
        });
        expect(yield* decodeMiddleware({ source: "/admin/:path*", locale: false })).toEqual({
          source: "/admin/:path*",
          locale: false,
        });
      })
    ));

  it("decodes schema-derived route predicates", () => {
    const decodeRouteHasSync = S.decodeUnknownSync(RouteHas);
    fc.assert(
      fc.property(routeHasArbitrary, (predicate) => {
        const decoded = decodeRouteHasSync(predicate);

        expect(decoded).toEqual(predicate);
      }),
      { numRuns: 25 }
    );
  });

  it("rejects invalid route discriminators and redirect mode mixing", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(
          Exit.isFailure(
            yield* Effect.promise(() =>
              Promise.resolve(exit(decodeRouteHas({ type: "host", key: "host", value: "example.com" })))
            )
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() =>
              Promise.resolve(exit(decodeRewrite({ source: "/old", destination: "/new", basePath: true })))
            )
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() =>
              Promise.resolve(
                exit(decodeRedirect({ source: "/old", destination: "/new", permanent: true, statusCode: 308 }))
              )
            )
          )
        ).toBe(true);
      })
    ));
});

describe("Next config primitive schemas", () => {
  it("accepts logging config with empty incoming request options", () =>
    Effect.runPromise(
      Effect.promise(() =>
        Promise.resolve(
          expect(Effect.runPromise(decodeLoggingConfig({ incomingRequests: {} }))).resolves.toEqual({
            incomingRequests: {},
          })
        )
      )
    ));
});

describe("Next compiler schemas", () => {
  it("accepts Sass options with implementation and package-specific passthrough keys", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const options = {
          implementation: "sass",
          silenceDeprecations: ["legacy-js-api"],
        };
        expect(yield* decodeSassOptions(options)).toEqual(options);
      })
    ));

  it("rejects non-object Sass options and non-string implementations", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeSassOptions(["sass"])))))).toBe(
          true
        );
        expect(
          Exit.isFailure(
            yield* Effect.promise(() => Promise.resolve(exit(decodeSassOptions({ implementation: false }))))
          )
        ).toBe(true);
      })
    ));
});
