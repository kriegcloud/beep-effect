import { describe, expect } from "bun:test";
import { ContractError } from "@beep/contract";
import { BS } from "@beep/schema";
import { effect } from "@beep/testkit";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

describe("ContractError taxonomy", () => {
  effect("formats HttpRequestError messages and suggestions", () =>
    Effect.gen(function* () {
      const baseRequest = {
        method: "GET" as const,
        url: BS.URLString.make("https://example.com"),
        urlParams: [] as const,
        hash: O.none<string>(),
        headers: {},
      };

      const transport = new ContractError.HttpRequestError({
        module: "mod",
        method: "m",
        reason: "Transport",
        request: baseRequest,
        description: "offline",
      });

      expect(F.pipe(transport.message, Str.includes("Check your network connection"))).toBe(true);

      const encode = new ContractError.HttpRequestError({
        module: "mod",
        method: "m",
        reason: "Encode",
        request: baseRequest,
      });

      expect(F.pipe(encode.message, Str.includes("Check the request body"))).toBe(true);

      const requestError = ContractError.HttpRequestError.fromRequestError({
        module: "mod",
        method: "m",
        error: {
          _tag: "RequestError",
          reason: "InvalidUrl",
          description: "bad url",
          request: { ...baseRequest, headers: { Authorization: "secret" } },
        } as any,
      });

      expect(requestError).toBeInstanceOf(ContractError.HttpRequestError);
      expect(F.pipe(requestError.message, Str.includes("bad url"))).toBe(true);
    })
  );

  effect("builds HttpResponseError messages and suggestions", () =>
    Effect.gen(function* () {
      const httpError = Object.assign(Object.create(ContractError.HttpResponseError.prototype), {
        _tag: "HttpResponseError",
        module: "mod",
        method: "m",
        request: {
          method: "POST",
          url: BS.URLString.make("https://api.test/resource"),
          urlParams: [] as const,
          hash: O.none<string>(),
          headers: { Authorization: "secret", "content-type": "application/json" },
        },
        response: {
          status: 429,
          headers: { "content-type": "application/json" },
        },
        reason: "StatusCode",
        description: "too many requests",
        body: "rate limited",
      }) as ContractError.HttpResponseError;

      expect(httpError).toBeInstanceOf(ContractError.HttpResponseError);
      const message = httpError.message;
      expect(F.pipe(message, Str.includes("Rate Limited"))).toBe(true);
      expect(F.pipe(message, Str.includes("Response Body"))).toBe(true);
    })
  );

  effect("formats HttpResponseError suggestions and body", () =>
    Effect.gen(function* () {
      const responseError = Object.assign(Object.create(ContractError.HttpResponseError.prototype), {
        _tag: "HttpResponseError",
        module: "mod",
        method: "m",
        request: {
          method: "GET",
          url: BS.URLString.make("https://api.test"),
          urlParams: [] as const,
          hash: O.none<string>(),
          headers: { "content-type": "application/json" },
        },
        response: {
          status: 503,
          headers: { "retry-after": "60" },
        },
        reason: "StatusCode",
        description: "server down",
        body: "maintenance",
      }) as ContractError.HttpResponseError;

      const message = responseError.message;
      expect(F.pipe(message, Str.includes("server down"))).toBe(true);
      expect(F.pipe(message, Str.includes("Response Body"))).toBe(true);
    })
  );

  effect("constructs MalformedOutput from parse errors and UnknownError messages", () =>
    Effect.gen(function* () {
      const parseExit = yield* Effect.exit(S.decodeUnknown(S.Struct({ id: S.Number }))({ id: "x" }));
      const parseError = Exit.match(parseExit, {
        onSuccess: () => undefined,
        onFailure: (cause) => O.getOrUndefined(Cause.failureOption(cause)),
      }) as any;
      const malformed = ContractError.MalformedOutput.fromParseError({
        module: "mod",
        method: "parse",
        error: parseError,
      });
      expect(malformed).toBeInstanceOf(ContractError.MalformedOutput);
      expect(malformed.cause).toBe(parseError);

      const withDescription = new ContractError.UnknownError({
        module: "mod",
        method: "unknown",
        description: "detail",
      });
      const withoutDescription = new ContractError.UnknownError({
        module: "mod",
        method: "unknown",
      });
      expect(withDescription.message).toBe("mod.unknown: detail");
      expect(withoutDescription.message).toBe("mod.unknown: An error occurred");
    })
  );
});
