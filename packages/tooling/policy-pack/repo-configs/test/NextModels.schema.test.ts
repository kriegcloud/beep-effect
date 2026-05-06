import {
  FileSizeSuffix,
  Header,
  LoggingConfig,
  Middleware,
  Redirect,
  Rewrite,
  RouteHas,
  SizeLimit,
} from "@beep/repo-configs/next";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeFileSizeSuffix = S.decodeUnknownEffect(FileSizeSuffix);
const decodeSizeLimit = S.decodeUnknownEffect(SizeLimit);
const decodeRouteHas = S.decodeUnknownEffect(RouteHas);
const decodeRewrite = S.decodeUnknownEffect(Rewrite);
const decodeHeader = S.decodeUnknownEffect(Header);
const decodeRedirect = S.decodeUnknownEffect(Redirect);
const decodeMiddleware = S.decodeUnknownEffect(Middleware);
const decodeLoggingConfig = S.decodeUnknownEffect(LoggingConfig);

const exit = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(Effect.exit(effect));

describe("Next shared schemas", () => {
  it("accepts Next.js file size suffixes and size limits", async () => {
    await expect(Effect.runPromise(decodeFileSizeSuffix("kb"))).resolves.toBe("kb");
    await expect(Effect.runPromise(decodeFileSizeSuffix("MB"))).resolves.toBe("MB");
    await expect(Effect.runPromise(decodeSizeLimit(1024))).resolves.toBe(1024);
    await expect(Effect.runPromise(decodeSizeLimit("1.5gb"))).resolves.toBe("1.5gb");
  });

  it("rejects malformed size suffixes and size limit strings", async () => {
    expect(Exit.isFailure(await exit(decodeFileSizeSuffix("xb")))).toBe(true);
    expect(Exit.isFailure(await exit(decodeFileSizeSuffix("mbps")))).toBe(true);
    expect(Exit.isFailure(await exit(decodeSizeLimit(-1)))).toBe(true);
    expect(Exit.isFailure(await exit(decodeSizeLimit("-2KB")))).toBe(true);
    expect(Exit.isFailure(await exit(decodeSizeLimit("1")))).toBe(true);
    expect(Exit.isFailure(await exit(decodeSizeLimit("1xb")))).toBe(true);
    expect(Exit.isFailure(await exit(decodeSizeLimit("mb")))).toBe(true);
  });
});

describe("Next route schemas", () => {
  it("accepts route predicates and public route config shapes", async () => {
    await expect(Effect.runPromise(decodeRouteHas({ type: "header", key: "x-beep", value: "1" }))).resolves.toEqual({
      type: "header",
      key: "x-beep",
      value: "1",
    });
    await expect(Effect.runPromise(decodeRouteHas({ type: "host", value: "example.com" }))).resolves.toEqual({
      type: "host",
      value: "example.com",
    });
    await expect(
      Effect.runPromise(
        decodeRewrite({
          source: "/old",
          destination: "/new",
          has: [{ type: "query", key: "draft" }],
          internal: true,
          regex: "^/old$",
        })
      )
    ).resolves.toEqual({
      source: "/old",
      destination: "/new",
      has: [{ type: "query", key: "draft" }],
    });
    await expect(
      Effect.runPromise(
        decodeHeader({
          source: "/secure",
          headers: [{ key: "x-frame-options", value: "deny" }],
          internal: true,
        })
      )
    ).resolves.toEqual({
      source: "/secure",
      headers: [{ key: "x-frame-options", value: "deny" }],
    });
    await expect(
      Effect.runPromise(decodeRedirect({ source: "/old", destination: "/new", permanent: true }))
    ).resolves.toEqual({
      source: "/old",
      destination: "/new",
      permanent: true,
    });
    await expect(
      Effect.runPromise(decodeRedirect({ source: "/old", destination: "/new", statusCode: 307 }))
    ).resolves.toEqual({
      source: "/old",
      destination: "/new",
      statusCode: 307,
    });
    await expect(Effect.runPromise(decodeMiddleware({ source: "/admin/:path*", locale: false }))).resolves.toEqual({
      source: "/admin/:path*",
      locale: false,
    });
  });

  it("rejects invalid route discriminators and redirect mode mixing", async () => {
    expect(Exit.isFailure(await exit(decodeRouteHas({ type: "host", key: "host", value: "example.com" })))).toBe(true);
    expect(Exit.isFailure(await exit(decodeRewrite({ source: "/old", destination: "/new", basePath: true })))).toBe(
      true
    );
    expect(
      Exit.isFailure(
        await exit(decodeRedirect({ source: "/old", destination: "/new", permanent: true, statusCode: 308 }))
      )
    ).toBe(true);
  });
});

describe("Next config primitive schemas", () => {
  it("accepts logging config with empty incoming request options", async () => {
    await expect(Effect.runPromise(decodeLoggingConfig({ incomingRequests: {} }))).resolves.toEqual({
      incomingRequests: {},
    });
  });
});
