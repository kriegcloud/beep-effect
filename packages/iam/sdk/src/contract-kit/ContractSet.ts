/**
 * The `ContractSet` module groups related auth contracts into a cohesive bundle
 * that can be implemented once and shared across clients.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/authkit/Contract"
 * import * as ContractSet from "@beep/iam-sdk/authkit/ContractSet"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const StartPasswordReset = Contract.make("StartPasswordReset", {
 *   description: "Issues a reset token for a pending user",
 *   parameters: { email: S.String },
 *   success: S.Struct({ tokenId: S.String })
 * })
 *
 * const VerifyMfaCode = Contract.make("VerifyMfaCode", {
 *   description: "Validates a one-time passcode",
 *   parameters: { userId: S.String, code: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const AuthContracts = ContractSet.make(StartPasswordReset, VerifyMfaCode)
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
import { type Pipeable, pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import * as Contract from "./Contract";
import * as IamError from "./IamError";

/**
 * Unique identifier for contractSet instances.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = "~@beep/iam-sdk/ContractSet";

/**
 * Type-level representation of the contractSet identifier.
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
 * import * as Contract from "@beep/iam-sdk/authkit/Contract"
 * import * as ContractSet from "@beep/iam-sdk/authkit/ContractSet"
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Contract.make("SignInEmail", {
 *   description: "Authenticates a user with email and password",
 *   parameters: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const RefreshSession = Contract.make("RefreshSession", {
 *   description: "Issues a fresh session token",
 *   parameters: { refreshToken: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const Kit = ContractSet.make(SignInEmail, RefreshSession)
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
export interface ContractSet<in out Contracts extends Record<string, Contract.Any>>
  extends Effect.Effect<WithImplementation<Contracts>, never, Contract.ImplementationsFor<Contracts>>,
    Inspectable,
    Pipeable {
  readonly [TypeId]: TypeId;

  new (_: never): {};

  /**
   * A record containing all contracts in this contractSet.
   */
  readonly contracts: Contracts;

  /**
   * A helper method which can be used for type-safe implementation declarations.
   */
  of<Implementations extends ImplementationsFrom<Contracts>>(implementations: Implementations): Implementations;

  /**
   * Converts a contractSet into an Effect Context containing implementations for each contract
   * in the contractSet.
   */
  toContext<Implementations extends ImplementationsFrom<Contracts>, EX = never, RX = never>(
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Effect.Effect<Context.Context<Contract.ImplementationsFor<Contracts>>, EX, RX>;

  /**
   * Converts a contractSet into a Layer containing implementations for each contract in the
   * contractSet.
   */
  toLayer<Implementations extends ImplementationsFrom<Contracts>, EX = never, RX = never>(
    /**
     * Implementation functions or Effect that produces implementations.
     */
    build: Implementations | Effect.Effect<Implementations, EX, RX>
  ): Layer.Layer<Contract.ImplementationsFor<Contracts>, EX, Exclude<RX, Scope.Scope>>;
}

/**
 * A utility type which structurally represents any contractSet instance.
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
 * contractSet.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type Contracts<T> = T extends ContractSet<infer Contracts> ? Contracts : never;

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
    params: Contract.Parameters<Contracts[Name]>
  ) => Effect.Effect<
    Contract.Success<Contracts[Name]>,
    Contract.Failure<Contracts[Name]>,
    Contract.Requirements<Contracts[Name]>
  >;
};

/**
 * A contractSet instance with registered implementations ready for contract execution.
 *
 * @since 1.0.0
 * @category Models
 */
export interface WithImplementation<in out Contracts extends Record<string, Contract.Any>> {
  /**
   * The contracts available in this contractSet instance.
   */
  readonly contracts: Contracts;

  /**
   * Implementation function for executing contract calls.
   *
   * Receives a contract name and parameters, validates the input, executes the
   * corresponding implementation, and returns both the typed result and encoded result.
   */
  readonly handle: <Name extends keyof Contracts>(
    /**
     * The name of the contract to execute.
     */
    name: Name,
    /**
     * Parameters to pass to the contract implementation.
     */
    params: Contract.Parameters<Contracts[Name]>
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
    this: ContractSet<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Effect.gen(this, function* () {
      const context = yield* Effect.context<never>();
      const implementations = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map<string, unknown>();
      for (const [name, implementation] of Object.entries(implementations)) {
        const contract = this.contracts[name]!;
        contextMap.set(contract.id, { implementation, context });
      }
      return Context.unsafeMake(contextMap);
    });
  },
  toLayer(
    this: ContractSet<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(this.toContext(build));
  },
  commit(this: ContractSet<Record<string, Contract.Any>>) {
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
          readonly decodeParameters: (
            u: unknown
          ) => Effect.Effect<Contract.Parameters<UnsafeTypes.UnsafeAny>, ParseError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
        }
      >();
      const getSchemas = (contract: Contract.Any) => {
        let schemas = schemasCache.get(contract);
        if (P.isUndefined(schemas)) {
          const implementation = context.unsafeMap.get(contract.id)! as Contract.Implementation<UnsafeTypes.UnsafeAny>;
          const decodeParameters = S.decodeUnknown(contract.parametersSchema) as UnsafeTypes.UnsafeAny;
          const resultSchema = S.Union(contract.successSchema, contract.failureSchema);
          const validateResult = S.validate(resultSchema) as UnsafeTypes.UnsafeAny;
          const encodeResult = S.encodeUnknown(resultSchema) as UnsafeTypes.UnsafeAny;
          schemas = {
            context: implementation.context,
            implementation: implementation.implementation,
            decodeParameters,
            validateResult,
            encodeResult,
          };
          schemasCache.set(contract, schemas);
        }
        return schemas;
      };
      const handle = Effect.fn("ContractSet.handle", { captureStackTrace: false })(function* (
        name: string,
        params: unknown
      ) {
        yield* Effect.annotateCurrentSpan({ contract: name, parameters: params });
        const contract = contracts[name];
        if (P.isUndefined(contract)) {
          const contractNames = Object.keys(contracts).join(",");
          return yield* new IamError.MalformedOutput({
            module: "ContractSet",
            method: `${name}.handle`,
            description: `Failed to find contract with name '${name}' in contractSet - available contracts: ${contractNames}`,
          });
        }
        const schemas = getSchemas(contract);
        const decodedParams = yield* Effect.mapError(
          schemas.decodeParameters(params),
          (cause) =>
            new IamError.MalformedOutput({
              module: "ContractSet",
              method: `${name}.handle`,
              description: `Failed to decode contract call parameters for contract '${name}' from:\n'${JSON.stringify(
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
              ? new IamError.MalformedInput({
                  module: "ContractSet",
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
            new IamError.MalformedInput({
              module: "ContractSet",
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
  toJSON(this: ContractSet<UnsafeTypes.UnsafeAny>): unknown {
    return {
      _id: "@beep/iam-sdk/ContractSet",
      contracts: Array.from(Object.values(this.contracts)).map((contract) => (contract as Contract.Any).name),
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Contracts extends Record<string, Contract.Any>>(contracts: Contracts): ContractSet<Contracts> =>
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
 * An empty contractSet with no contracts.
 *
 * Useful as a starting point for building contractSets or as a default value. Can
 * be extended using the merge function to add contracts.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const empty: ContractSet<{}> = makeProto({});

/**
 * Creates a new contractSet from the specified contracts.
 *
 * Use this to compose related auth contracts so they can be provided and
 * implemented together. Contracts can be `Contract.make` definitions or tagged
 * requests converted with `Contract.fromTaggedRequest`.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/authkit/Contract"
 * import * as ContractSet from "@beep/iam-sdk/authkit/ContractSet"
 * import * as S from "effect/Schema"
 *
 * const SignInEmail = Contract.make("SignInEmail", {
 *   parameters: { email: S.String, password: S.String },
 *   success: S.Struct({ sessionToken: S.String })
 * })
 *
 * const VerifyInvite = Contract.make("VerifyInvite", {
 *   parameters: { token: S.String },
 *   success: S.Struct({ memberId: S.String })
 * })
 *
 * const contractSet = ContractSet.make(SignInEmail, VerifyInvite)
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const make = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): ContractSet<ContractsByName<Contracts>> => makeProto(resolveInput(...contracts)) as UnsafeTypes.UnsafeAny;

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
 * A utility type which merges the contract calls of two contractSets into a single
 * contractSet.
 *
 * @since 1.0.0
 * @category Utility Types
 */
export type MergedContracts<ContractSets extends ReadonlyArray<Any>> = SimplifyRecord<
  MergeRecords<Contracts<ContractSets[number]>>
>;

/**
 * Merges multiple contractSets into a single contractSet.
 *
 * Combines all contracts from the provided contractSets into one unified contractSet.
 * If there are naming conflicts, contracts from later contractSets will override
 * contracts from earlier ones.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/authkit/Contract"
 * import * as ContractSet from "@beep/iam-sdk/authkit/ContractSet"
 *
 * const signInKit = ContractSet.make(
 *   Contract.make("SignInEmail"),
 *   Contract.make("SignInMagicLink")
 * )
 *
 * const recoveryKit = ContractSet.make(
 *   Contract.make("StartPasswordReset"),
 *   Contract.make("CompletePasswordReset")
 * )
 *
 * const combined = ContractSet.merge(signInKit, recoveryKit)
 * // combined now has: SignInEmail, SignInMagicLink, StartPasswordReset, CompletePasswordReset
 * ```
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/iam-sdk/authkit/Contract"
 * import * as ContractSet from "@beep/iam-sdk/authkit/ContractSet"
 *
 * // Incremental contractSet building
 * const baseKit = ContractSet.make(Contract.make("SignOut"))
 * const extendedKit = ContractSet.merge(
 *   baseKit,
 *   ContractSet.make(Contract.make("LinkSocialAccount")),
 *   ContractSet.make(Contract.make("UnlinkSocialAccount"))
 * )
 * ```
 *
 * @since 1.0.0
 * @category Constructors
 */
export const merge = <const ContractSets extends ReadonlyArray<Any>>(
  /**
   * The contractSets to merge together.
   */
  ...contractSets: ContractSets
): ContractSet<MergedContracts<ContractSets>> => {
  const contracts = {} as Record<string, UnsafeTypes.UnsafeAny>;
  for (const contractSet of contractSets) {
    for (const [name, contract] of Object.entries(contractSet.contracts)) {
      contracts[name] = contract;
    }
  }
  return makeProto(contracts) as UnsafeTypes.UnsafeAny;
};
