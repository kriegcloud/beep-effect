import { invariant } from "@beep/invariant";
import * as Bool from "effect/Boolean";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import type * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as AST from "effect/SchemaAST";
import type { Contract } from "../../contract-kit";
import type { Any } from "../../contract-kit/Contract";
import type { IamError } from "../../errors";

type MakeHandlerParams<ContractSchema extends Contract.Any> = {
  readonly contract: ContractSchema;
  readonly effect: <R>(
    payload: ContractSchema["payloadSchema"]["Type"]
  ) => Effect.Effect<ContractSchema["successSchema"]["Type"], IamError, R>;
  readonly metadata: {
    readonly domain: string;
    readonly method: string;
  };
};

export type All = Any | S.Schema<any, never, unknown> | S.Schema<never, any, unknown> | S.Schema<never, never, unknown>;

export type Refine<T> = T extends S.Schema<infer A, infer E, infer R>
  ? R extends never
    ? A extends unknown
      ? E extends unknown
        ? R extends never
          ? S.Schema<unknown, unknown, never>
          : never
        : never
      : never
    : never
  : never;

const isSchemaNoContext = <Schema extends S.Schema.All>(schema: Schema): schema is Refine<Schema> => S.isSchema(schema);

class MakeHandlerError extends Data.TaggedClass("MakeHandlerError")<{
  readonly cause: unknown;
  readonly message: string;
}> {}

export const make = <const ContractSchema extends Contract.Any>({
  contract,
  effect,
  metadata,
}: MakeHandlerParams<ContractSchema>) => {
  const mapSchemaToValidator = <Schema extends S.Schema.All>(schema: NoInfer<Schema>) => {
    invariant(isSchemaNoContext(schema), "Schema is not a schema without context", {
      line: 126,
      file: "src/clients/_internal/client-method-helpers.ts",
      args: [schema],
    });
    type Validator =
      | Effect.Effect<
          {
            readonly failureMode: "error";
            readonly validator: (
              input: unknown,
              overrideOptions?: undefined | AST.ParseOptions
            ) => Effect.Effect<ContractSchema["failureSchema"]["Type"], ParseResult.ParseError, never>;
          },
          MakeHandlerError,
          never
        >
      | Effect.Effect<
          {
            readonly failureMode: "return";
            readonly validator: (
              input: unknown,
              overrideOptions?: undefined | AST.ParseOptions
            ) => Effect.Effect<
              Either.Either<ContractSchema["failureSchema"]["Type"], ContractSchema["successSchema"]["Type"]>,
              ParseResult.ParseError,
              never
            >;
          },
          MakeHandlerError,
          never
        >;

    return Bool.match(S.isSchema(schema), {
      onFalse: () =>
        Effect.fail(
          new MakeHandlerError({
            cause: schema,
            message: "Schema is not a schema without context",
          })
        ),
      onTrue: () =>
        Effect.succeed(
          Match.value(contract.failureMode).pipe(
            Match.withReturnType<Validator>(),
            Match.when("error", () =>
              Effect.succeed({
                failureMode: "error" as const,
                validator: (input: unknown, overrideOptions?: undefined | AST.ParseOptions) =>
                  F.pipe(
                    (
                      input: unknown,
                      overrideOptions?: undefined | AST.ParseOptions
                    ): Effect.Effect<ContractSchema["failureSchema"]["Type"], ParseResult.ParseError, never> =>
                      S.decodeUnknown(schema)(input, overrideOptions) as Effect.Effect<
                        ContractSchema["failureSchema"]["Type"],
                        ParseResult.ParseError,
                        never
                      >,
                    (decodeFn) => decodeFn(input, overrideOptions)
                  ),
              } as const)
            ),
            Match.when("return", () =>
              Effect.succeed({
                failureMode: "return" as const,
                validator: (input: unknown, overrideOptions?: undefined | AST.ParseOptions) =>
                  Effect.succeed(S.decodeUnknownEither(schema)(input, overrideOptions)),
              } as const)
            ),
            Match.orElse(() =>
              Effect.fail(
                new MakeHandlerError({
                  cause: schema,
                  message: "failureMode not supported",
                })
              )
            )
          )
        ),
    });
  };

  const handleError = (e: unknown) =>
    S.isSchema(contract.failureSchema) && P.not(P.and(AST.isNeverKeyword, AST.isUndefinedKeyword))
      ? Effect.fail(
          new MakeHandlerError({
            cause: e,
            message: "Contract has no failure schema and failed with an un expected error",
          })
        )
      : F.pipe(
          mapSchemaToValidator(contract.failureSchema),
          Effect.flatten,
          Effect.flatMap(({ validator }) => validator(e))
        );

  const validatorFn = F.flow(
    (payload: ContractSchema["payloadSchema"]["Type"]) =>
      S.decode(contract.payloadSchema)(payload).pipe(
        Effect.catchTag("ParseError", (e) => Effect.dieMessage(`ParseError: ${e}`))
      ),
    Effect.flatMap((decoded) =>
      F.pipe(
        effect(decoded),
        Effect.flatMap((result) =>
          S.decode(contract.successSchema)(result).pipe(
            Effect.catchTag("ParseError", (e) => Effect.dieMessage(`ParseError: ${e}`))
          )
        )
      )
    ),
    Effect.flatMap((resultEffect) =>
      resultEffect.pipe(
        Effect.catchTags({
          HandlerError: (e) => Effect.dieMessage(`HandlerError: ${e}`),
          ParseError: (e) => Effect.dieMessage(`ParseError: ${e}`),
        }),
        Effect.catchAll((e) => handleError(e))
      )
    )
  );

  return <R>(payload: ContractSchema["payloadSchema"]["Type"]) => {
    return F.pipe(
      payload,
      S.decode(contract.payloadSchema),
      validatorFn,
      Effect.match({
        onSuccess: () => Effect.flatMap(S.decode(contract.successSchema)),
        onFailure: () => Effect.flatMap(handleError),
      })
      // Effect.andThen((resultEffect) => F.pipe(
      //   makeFailureContinuation({
      //     contract: contract.name,
      //     metadata: () => ({
      //       domain: metadata.domain,
      //       method: metadata.method,
      //     })
      //   }),
      //   (continuation) => continuation.run(
      //    async (handlers) => F.flow(
      //      ({fetchOptions, handlers}: {fetchOptions: ReturnType<typeof withFetchOptions>, handlers: FailureContinuationHandlers}) => F.pipe(
      //        withFetchOptions(handlers),
      //        (fetchOptions) => resultEffect.pipe(
      //          Effect.flatMap((result) => S.decode(contract.successSchema)(result).pipe(
      //            Effect.catchTag("ParseError", (e) => Effect.dieMessage(`ParseError: ${e}`))
      //          )),
      //        )
      //    )
      //   )),
      //
      // ))
    );
  };
};
