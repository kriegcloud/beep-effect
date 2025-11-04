/**
 * The `ContractKit` module groups related auth contracts into a cohesive bundle
 * that can be implemented once and shared across clients.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/contract-kit/Contract"
 * import * as ContractKit from "@beep/iam-sdk/contract-kit/ContractKit"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const StartPasswordReset = Contract.make("StartPasswordReset", {
 *   description: "Issues a reset token for a pending user",
 *   payload: { email: S.String },
 *   success: S.Struct({ tokenId: S.String })
 * })
 *
 * const VerifyMfaCode = Contract.make("VerifyMfaCode", {
 *   description: "Validates a one-time passcode",
 *   payload: { userId: S.String, code: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const AuthContracts = ContractKit.make(StartPasswordReset, VerifyMfaCode)
 *
 * const layer = AuthContracts.toLayer({
 *   StartPasswordReset: ({ email }) =>
 *     Effect.succeed({ tokenId: `token-${email}` }),
 *   VerifyMfaCode: ({ userId, code }) =>
 *     Effect.succeed({ sessionToken: `${userId}:${code}` })
 * })
 * ```
 *
 * @since 1.0.0
 */

import type { UnsafeTypes } from "@beep/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { CommitPrototype } from "effect/Effectable";
import { identity } from "effect/Function";
import type { Inspectable } from "effect/Inspectable";
import { BaseProto as InspectableProto } from "effect/Inspectable";
import * as Layer from "effect/Layer";
import type { ParseError } from "effect/ParseResult";
import * as ParseResult from "effect/ParseResult";
import type { Pipeable } from "effect/Pipeable";
import { pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import * as Struct from "effect/Struct";
import * as Contract from "./Contract";
import * as ContractError from "./ContractError";
/**
 * Unique identifier for contractKit instances.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/iam-sdk/ContractKit";

/**
 * Type-level representation of the contractKit identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Represents a collection of auth contracts that are deployed together.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/contract-kit/Contract"
 * import * as ContractKit from "@beep/iam-sdk/contract-kit/ContractKit"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Contract.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   payload: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const RefreshSession = Contract.make("RefreshSession", {
 *   description: "Issues a fresh session token",
 *   payload: { refreshToken: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const Kit = ContractKit.make(SignInEmail, RefreshSession)
 *
 * const implementations = Kit.toLayer({
 *   SignInEmail: ({ email }) => Effect.succeed({ sessionToken: email }),
 *   RefreshSession: ({ refreshToken }) => Effect.succeed({ sessionToken: refreshToken })
 * })
 * ```
 *
 * @since 1.0.0
 * @category Models
 */
export interface ContractKit<in out Contracts extends Record<string, Contract.Any>>
  extends Effect.Effect<WithImplementation<Contracts>, never, Contract.ImplementationsFor<Contracts>>,
    Inspectable,
    Pipeable {
  readonly [TypeId]: TypeId;

  new (_: never): {};

  /**
   * A record containing all contracts in this contractKit.
   */
  readonly contracts: Contracts;

  /**
   * A helper method which can be used for type-safe implementation declarations.
   */
  of<Implementations extends ImplementationsFrom<Contracts>>(implementations: Implementations): Implementations;

  /**
   * Converts a contractKit into an Effect Context containing implementations for each contract
   * in the contractKit.
   */
  toContext<Implementations extends ImplementationsFrom<Contracts>, EX = never, RX = never>(
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Effect.Effect<Context.Context<Contract.ImplementationsFor<Contracts>>, EX, RX>;

  /**
   * Converts a contractKit into a Layer containing implementations for each contract in the
   * contractKit.
   */
  toLayer<Implementations extends ImplementationsFrom<Contracts>, EX = never, RX = never>(
    /**
     * Implementation functions or Effect that produces implementations.
     */
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Layer.Layer<Contract.ImplementationsFor<Contracts>, EX, Exclude<RX, Scope.Scope>>;
}

/**
 * A utility type which structurally represents any contractKit instance.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export interface Any {
  readonly [TypeId]: TypeId;
  readonly contracts: Record<string, Contract.Any>;
}

/**
 * A utility type which can be used to extract the contract definitions from a
 * contractKit.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Contracts<T> = T extends ContractKit<infer Contracts> ? Contracts : never;

/**
 * A utility type which can transforms either a record or an array of contracts into
 * a record where keys are contract names and values are the contract instances.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ContractsByName<Contracts> = Contracts extends Record<string, Contract.Any>
  ? { readonly [Name in keyof Contracts]: Contracts[Name] }
  : Contracts extends ReadonlyArray<Contract.Any>
    ? { readonly [Contract in Contracts[number] as Contract["name"]]: Contract }
    : never;

/**
 * A utility type that maps contract names to their required implementation functions.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type ImplementationsFrom<Contracts extends Record<string, Contract.Any>> = {
  readonly [Name in keyof Contracts as Contract.RequiresImplementation<Contracts[Name]> extends true ? Name : never]: (
    params: Contract.Payload<Contracts[Name]>
  ) => Effect.Effect<
    Contract.Success<Contracts[Name]>,
    Contract.Failure<Contracts[Name]>,
    Contract.Requirements<Contracts[Name]>
  >;
};

/**
 * A contractKit instance with registered implementations ready for contract execution.
 *
 * @since 1.0.0
 * @category Models
 */
export interface WithImplementation<in out Contracts extends Record<string, Contract.Any>> {
  /**
   * The contracts available in this contractKit instance.
   */
  readonly contracts: Contracts;

  /**
   * Implementation function for executing contract calls.
   *
   * Receives a contract name and payload, validates the input, executes the
   * corresponding implementation, and returns both the typed result and encoded result.
   */
  readonly handle: <Name extends keyof Contracts>(
    /**
     * The name of the contract to execute.
     */
    name: Name,
    /**
     * Payload to pass to the contract implementation.
     */
    params: Contract.Payload<Contracts[Name]>
  ) => Effect.Effect<
    Contract.ImplementationResult<Contracts[Name]>,
    Contract.Failure<Contracts[Name]>,
    Contract.Requirements<Contracts[Name]>
  >;
}

const Proto = {
  ...CommitPrototype,
  ...InspectableProto,
  of: identity,
  toContext(
    this: ContractKit<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Effect.gen(this, function* () {
      const context = yield* Effect.context<never>();
      const implementations = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map<string, unknown>();
      for (const [name, implementation] of Struct.entries(implementations)) {
        const contract = this.contracts[name]!;
        contextMap.set(contract.id, { implementation, context });
      }
      return Context.unsafeMake(contextMap);
    });
  },
  toLayer(
    this: ContractKit<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(this.toContext(build));
  },
  commit(this: ContractKit<Record<string, Contract.Any>>) {
    return Effect.gen(this, function* () {
      const contracts = this.contracts;
      const context = yield* Effect.context<never>();
      const schemasCache = new WeakMap<
        UnsafeTypes.UnsafeAny,
        {
          readonly context: Context.Context<never>;
          readonly implementation: (
            params: UnsafeTypes.UnsafeAny
          ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
          readonly decodePayload: (u: unknown) => Effect.Effect<Contract.Payload<UnsafeTypes.UnsafeAny>, ParseError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
        }
      >();
      const getSchemas = (contract: Contract.Any) => {
        let schemas = schemasCache.get(contract);
        if (P.isUndefined(schemas)) {
          const implementation = context.unsafeMap.get(contract.id)! as Contract.Implementation<UnsafeTypes.UnsafeAny>;
          const decodePayload = S.decodeUnknown(contract.payloadSchema) as UnsafeTypes.UnsafeAny;
          const resultSchema = S.Union(contract.successSchema, contract.failureSchema);
          const validateResult = S.validate(resultSchema) as UnsafeTypes.UnsafeAny;
          const encodeResult = S.encodeUnknown(resultSchema) as UnsafeTypes.UnsafeAny;
          schemas = {
            context: implementation.context,
            implementation: implementation.implementation,
            decodePayload,
            validateResult,
            encodeResult,
          };
          schemasCache.set(contract, schemas);
        }
        return schemas;
      };
      const handle = Effect.fn("ContractKit.handle", { captureStackTrace: false })(function* (
        name: string,
        params: unknown
      ) {
        yield* Effect.annotateCurrentSpan({ contract: name, payload: params });
        const contract = contracts[name];
        if (P.isUndefined(contract)) {
          const contractNames = Object.keys(contracts).join(",");
          return yield* new ContractError.MalformedOutput({
            module: "ContractKit",
            method: `${name}.handle`,
            description: `Failed to find contract with name '${name}' in contractKit - available contracts: ${contractNames}`,
          });
        }
        const schemas = getSchemas(contract);
        const decodedParams = yield* Effect.mapError(
          schemas.decodePayload(params),
          (cause) =>
            new ContractError.MalformedOutput({
              module: "ContractKit",
              method: `${name}.handle`,
              description: `Failed to decode contract call payload for contract '${name}' from:\n'${JSON.stringify(
                params,
                undefined,
                2
              )}'`,
              cause,
            })
        );
        const { isFailure, result } = yield* schemas.implementation(decodedParams).pipe(
          Effect.map((result) => ({ result, isFailure: false })),
          Effect.catchAll((error) =>
            // If the contract implementation failed, check the contract's failure mode to
            // determine how the result should be returned to the end user
            contract.failureMode === "error" ? Effect.fail(error) : Effect.succeed({ result: error, isFailure: true })
          ),
          Effect.tap(({ result }) => schemas.validateResult(result)),
          Effect.mapInputContext((input) => Context.merge(schemas.context, input)),
          Effect.mapError((cause) =>
            ParseResult.isParseError(cause)
              ? new ContractError.MalformedInput({
                  module: "ContractKit",
                  method: `${name}.handle`,
                  description: `Failed to validate contract call result for contract '${name}'`,
                  cause,
                })
              : cause
          )
        );
        const encodedResult = yield* Effect.mapError(
          schemas.encodeResult(result),
          (cause) =>
            new ContractError.MalformedInput({
              module: "ContractKit",
              method: `${name}.handle`,
              description: `Failed to encode contract call result for contract '${name}'`,
              cause,
            })
        );
        return {
          isFailure,
          result,
          encodedResult,
        } satisfies Contract.ImplementationResult<UnsafeTypes.UnsafeAny>;
      });
      return {
        contracts,
        handle,
      } satisfies WithImplementation<Record<string, UnsafeTypes.UnsafeAny>>;
    });
  },
  toJSON(this: ContractKit<UnsafeTypes.UnsafeAny>): unknown {
    return {
      _id: "@beep/iam-sdk/ContractKit",
      contracts: Array.from(Object.values(this.contracts)).map((contract) => (contract as Contract.Any).name),
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Contracts extends Record<string, Contract.Any>>(contracts: Contracts): ContractKit<Contracts> =>
  Object.assign(() => {}, Proto, { contracts }) as UnsafeTypes.UnsafeAny;

const resolveInput = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): Record<string, Contracts[number]> => {
  const output = {} as Record<string, Contracts[number]>;
  for (const contract of contracts) {
    output[contract.name] = (
      S.isSchema(contract) ? Contract.fromTaggedRequest(contract as UnsafeTypes.UnsafeAny) : contract
    ) as UnsafeTypes.UnsafeAny;
  }
  return output;
};

/**
 * An empty contractKit with no contracts.
 *
 * Useful as a starting point for building contractKits or as a default value. Can
 * be extended using the merge function to add contracts.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const empty: ContractKit<{}> = makeProto({});

/**
 * Creates a new contractKit from the specified contracts.
 *
 * Use this to compose related auth contracts so they can be provided and
 * implemented together. Contracts can be `Contract.make` definitions or tagged
 * requests converted with `Contract.fromTaggedRequest`.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/contract-kit/Contract"
 * import * as ContractKit from "@beep/iam-sdk/contract-kit/ContractKit"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Contract.make("SignInEmail", {
 *   payload: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const VerifyInvite = Contract.make("VerifyInvite", {
 *   payload: { token: S.String },
 *   success: S.Struct({ memberId: S.String })
 * })
 *
 * const contractKit = ContractKit.make(SignInEmail, VerifyInvite)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const make = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): ContractKit<ContractsByName<Contracts>> => makeProto(resolveInput(...contracts)) as UnsafeTypes.UnsafeAny;

/**
 * A utility type which simplifies a record type.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * A utility type which merges two records of contracts together.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Contract.Any
  >;
};

/**
 * A utility type which merges the contract calls of two contractKits into a single
 * contractKit.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type MergedContracts<ContractKits extends ReadonlyArray<Any>> = SimplifyRecord<
  MergeRecords<Contracts<ContractKits[number]>>
>;

/**
 * Merges multiple contractKits into a single contractKit.
 *
 * Combines all contracts from the provided contractKits into one unified contractKit.
 * If there are naming conflicts, contracts from later contractKits will override
 * contracts from earlier ones.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/contract-kit/Contract"
 * import * as ContractKit from "@beep/iam-sdk/contract-kit/ContractKit"
 *
 * const signInKit = ContractKit.make(
 *   Contract.make("SignInEmail"),
 *   Contract.make("SignInMagicLink")
 * )
 *
 * const recoveryKit = ContractKit.make(
 *   Contract.make("StartPasswordReset"),
 *   Contract.make("CompletePasswordReset")
 * )
 *
 * const combined = ContractKit.merge(signInKit, recoveryKit)
 * // combined now has: SignInEmail, SignInMagicLink, StartPasswordReset, CompletePasswordReset
 * ```
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/contract-kit/Contract"
 * import * as ContractKit from "@beep/iam-sdk/contract-kit/ContractKit"
 *
 * // Incremental contractKit building
 * const baseKit = ContractKit.make(Contract.make("SignOut"))
 * const extendedKit = ContractKit.merge(
 *   baseKit,
 *   ContractKit.make(Contract.make("LinkSocialAccount")),
 *   ContractKit.make(Contract.make("UnlinkSocialAccount"))
 * )
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const merge = <const ContractKits extends ReadonlyArray<Any>>(
  /**
   * The contractKits to merge together.
   */
  ...contractKits: ContractKits
): ContractKit<MergedContracts<ContractKits>> => {
  const contracts = {} as Record<string, UnsafeTypes.UnsafeAny>;
  for (const contractKit of contractKits) {
    for (const [name, contract] of Object.entries(contractKit.contracts)) {
      contracts[name] = contract;
    }
  }
  return makeProto(contracts) as UnsafeTypes.UnsafeAny;
};
