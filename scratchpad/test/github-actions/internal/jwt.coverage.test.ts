import { assert, it } from "@effect/vitest";
import { assertFailure, assertSuccess } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Base64Url from "effect/encoding/Base64Url";
import { payloadOf, unsignedJwt } from "../../../effected/github-actions/internal/jwt.ts";

it.effect("JWT rejects invalid JSON and unencodable fixtures, and supports curried framing", () => Effect.sync(() => {
  const failure = payloadOf(`e30.${Base64Url.encode("{")}.unsigned`);
  assertFailure(Result.mapError(failure, (error) => error.kind), "payload");
  assertSuccess(payloadOf(unsignedJwt({ sub: "runner" })({ alg: "none" })), { sub: "runner" });
  assert.throws(() => unsignedJwt({}, undefined));
}));


it.effect("JWT keeps codec causes and segment/base64url failure classifications", () => Effect.sync(() => {
  for (const token of ["", "one.two", "one..three", "one.two.three.four"]) {
    assertFailure(Result.mapError(payloadOf(token), (error) => error.kind), "segments");
  }
  const invalidBase64 = payloadOf("e30.%.unsigned");
  assertFailure(Result.mapError(invalidBase64, (error) => error.kind), "payload");
  if (Result.isFailure(invalidBase64) && invalidBase64.failure.kind === "payload") {
    const decoded = Base64Url.decodeString("%");
    assertFailure(Result.mapError(decoded, () => "invalid base64url"), "invalid base64url");
    if (Result.isFailure(decoded)) assert.deepStrictEqual(invalidBase64.failure.cause, decoded.failure);
  } else assert.fail("expected a base64url payload failure");
  const invalidJson = payloadOf(`e30.${Base64Url.encode("{")}.unsigned`);
  assertFailure(Result.mapError(invalidJson, (error) => error.kind), "payload");
  if (Result.isFailure(invalidJson) && invalidJson.failure.kind === "payload") {
    assert.instanceOf(invalidJson.failure.cause, S.SchemaError);
    assert.strictEqual(invalidJson.failure.detail, "the payload is not base64url JSON");
  } else assert.fail("expected a JSON payload failure");
}));
