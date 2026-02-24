/**
 * RPC Contract Template
 *
 * Copy this template and replace:
 * - `Example` with your domain name
 * - `ExamplePayload` with your request schema
 * - `ExampleSuccess` with your response schema
 * - `ExampleError` with your error types
 */

import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";

// ─────────────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────────────

export class ExampleNotFoundError extends S.TaggedError<ExampleNotFoundError>()(
  "ExampleNotFoundError",
  {
    id: S.String,
    message: S.String,
  }
) {}

export class ExampleValidationError extends S.TaggedError<ExampleValidationError>()(
  "ExampleValidationError",
  {
    field: S.String,
    message: S.String,
  }
) {}

// Union of all errors for this domain
export type ExampleError = ExampleNotFoundError | ExampleValidationError;

// ─────────────────────────────────────────────────────────────────────────────
// Payloads
// ─────────────────────────────────────────────────────────────────────────────

export class CreateExamplePayload extends S.Class<CreateExamplePayload>(
  "CreateExamplePayload"
)({
  name: S.String,
  description: S.optional(S.String),
}) {}

export class GetExamplePayload extends S.Class<GetExamplePayload>(
  "GetExamplePayload"
)({
  id: S.String,
}) {}

// ─────────────────────────────────────────────────────────────────────────────
// Success Responses
// ─────────────────────────────────────────────────────────────────────────────

export class ExampleResponse extends S.Class<ExampleResponse>("ExampleResponse")({
  id: S.String,
  name: S.String,
  description: S.optionalWith(S.String, { as: "Option" }),
  createdAt: S.Date,
}) {}

// ─────────────────────────────────────────────────────────────────────────────
// RPC Definitions
// ─────────────────────────────────────────────────────────────────────────────

export class CreateExample extends Rpc.make(
  "CreateExample",
  {
    success: ExampleResponse,
    failure: ExampleValidationError,
    payload: { input: CreateExamplePayload },
  }
) {}

export class GetExample extends Rpc.make(
  "GetExample",
  {
    success: ExampleResponse,
    failure: ExampleNotFoundError,
    payload: { input: GetExamplePayload },
  }
) {}

// ─────────────────────────────────────────────────────────────────────────────
// RPC Group
// ─────────────────────────────────────────────────────────────────────────────

export const ExampleRpcs = RpcGroup.make(
  CreateExample,
  GetExample
);

export type ExampleRpcs = typeof ExampleRpcs;

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Example (optional)
// ─────────────────────────────────────────────────────────────────────────────

// import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
// import * as Effect from "effect/Effect";
//
// export const AuthMiddleware = RpcMiddleware.make((handler) =>
//   Effect.gen(function* () {
//     // Validate auth context before proceeding
//     const session = yield* SessionContext;
//     if (!session.userId) {
//       return yield* Effect.fail(new UnauthorizedError({ message: "Not authenticated" }));
//     }
//     return yield* handler;
//   })
// );
