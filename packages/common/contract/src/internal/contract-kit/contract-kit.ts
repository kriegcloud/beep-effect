/**
 * `ContractKit` groups related contracts into bundles that can be implemented
 * together, converted into Layers, or lifted into services.
 *
 * @example
 * ```ts
 * const FetchReports = Contract.make("FetchReports", { ... });
 * const PublishReport = Contract.make("PublishReport", { ... });
 *
 * const ReportsKit = ContractKit.make(FetchReports, PublishReport);
 * const layer = ReportsKit.toLayer({
 *   FetchReports: () => Effect.succeed([{ id: "r-1" }]),
 *   PublishReport: ({ id }) => Effect.succeed({ id }),
 * });
 * ```
 *
 * @since 0.1.0
 */
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import type * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { CommitPrototype } from "effect/Effectable";
import * as F from "effect/Function";
import { identity } from "effect/Function";
import type { Inspectable } from "effect/Inspectable";
import { BaseProto as InspectableProto } from "effect/Inspectable";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type { ParseError } from "effect/ParseResult";
import * as ParseResult from "effect/ParseResult";
import type { Pipeable } from "effect/Pipeable";
import { pipeArguments } from "effect/Pipeable";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import type * as Scope from "effect/Scope";
import * as Struct from "effect/Struct";
import { Contract } from "../contract";
import { FailureMode } from "../contract/types";
import { ContractError } from "../contract-error";

/**
 * Unique identifier for contractKit instances.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export const TypeId = "~@beep/contract/ContractKit";

/**
 * Type-level representation of the contractKit identifier.
 *
 * @since 0.1.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Represents a collection of contracts that are deployed together.
 *
 * @example
 * ```ts
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as ContractKit from "@beep/contract/contract-kit/ContractKit"
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
 * const Kit = ContractKit.make(SignInEmail, RefreshSession);
 *
 * const implementations = Kit.toLayer({
 *   SignInEmail: ({ email }) => Effect.succeed({ sessionToken: email }),
 *   RefreshSession: ({ refreshToken }) => Effect.succeed({ sessionToken: refreshToken })
 * });
 * ```
 *
 * @since 0.1.0
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

  /**
   * Builds lifted handlers for every contract in the kit. Each handler defaults to
   * returning only the `Success` channel and failing when a `Failure` is produced.
   */
  liftService<Mode extends LiftServiceMode.Type = typeof LiftServiceMode.Enum.success>(
    options?: LiftServiceOptions<Contracts, Mode>
  ): Effect.Effect<LiftedService<Contracts, Mode>, never, Contract.ImplementationsFor<Contracts>>;
}

/**
 * A utility type which structurally represents any contractKit instance.
 *
 * @since 0.1.0
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
 * @since 0.1.0
 * @category Utility Types
 */
export type Contracts<T> = T extends ContractKit<infer Contracts> ? Contracts : never;

/**
 * A utility type which can transforms either a record or an array of contracts into
 * a record where keys are contract names and values are the contract instances.
 *
 * @since 0.1.0
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
 * @since 0.1.0
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

export class LiftServiceMode extends BS.StringLiteralKit("success", "result") {}

/**
 * Determines whether lifted service methods should expose only successes or
 * the discriminated {@link Contract["HandleOutcome"]}.
 *
 * @since 0.1.0
 * @category Utility Types
 */
export declare namespace LiftServiceMode {
  export type Type = typeof LiftServiceMode.Type;
  export type Encoded = typeof LiftServiceMode.Encoded;
}

/**
 * Options for building lifted service handlers from a contract kit.
 *
 * @since 0.1.0
 * @category Models
 */
export interface LiftServiceOptions<
  Contracts extends Record<string, Contract.Any>,
  Mode extends LiftServiceMode.Type = typeof LiftServiceMode.Enum.success,
> {
  readonly mode?: Mode;
  readonly hooks?: LiftServiceHooks<Contracts>;
}

/**
 * Hook definitions invoked while the lifted handlers run.
 *
 * @since 0.1.0
 * @category Models
 */
export interface LiftServiceHooks<Contracts extends Record<string, Contract.Any>> {
  readonly onFailure?: <Name extends keyof Contracts>(args: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly failure: Contract.Failure<Contracts[Name]>;
  }) => Effect.Effect<void, never, never>;
  readonly onSuccess?: <Name extends keyof Contracts>(args: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly success: Contract.Success<Contracts[Name]>;
  }) => Effect.Effect<void, never, never>;
  readonly onDefect?: <Name extends keyof Contracts>(args: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly cause: Cause.Cause<unknown>;
  }) => Effect.Effect<void, never, never>;
}

/**
 * Shape of the lifted service map returned by {@link ContractKit.liftService}.
 *
 * @since 0.1.0
 * @category Utility Types
 */
export type LiftedService<
  Contracts extends Record<string, Contract.Any>,
  Mode extends LiftServiceMode.Type = typeof LiftServiceMode.Enum.success,
> = {
  readonly [Name in keyof Contracts]: (
    payload: Contract.Payload<Contracts[Name]>
  ) => Effect.Effect<
    Mode extends typeof LiftServiceMode.Enum.result
      ? Contract.HandleOutcome<Contracts[Name]>
      : Contract.Success<Contracts[Name]>,
    Contract.Failure<Contracts[Name]> | ContractError.UnknownError,
    Contract.Requirements<Contracts[Name]>
  >;
};

/**
 * A contractKit instance with registered implementations ready for contract execution.
 *
 * @since 0.1.0
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
    name: Name
  ) => (
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

const liftService = function <
  Contracts extends Record<string, Contract.Any>,
  Mode extends LiftServiceMode.Type = typeof LiftServiceMode.Enum.success,
>(
  this: ContractKit<Contracts>,
  options?: LiftServiceOptions<Contracts, Mode>
): Effect.Effect<LiftedService<Contracts, Mode>, never, Contract.ImplementationsFor<Contracts>> {
  const mode = (options?.mode ?? LiftServiceMode.Enum.success) as Mode;
  const hooksOpt = O.fromNullable(options?.hooks).pipe(
    O.map((hooks) => ({
      onFailure: O.fromNullable(hooks.onFailure),
      onSuccess: O.fromNullable(hooks.onSuccess),
      onDefect: O.fromNullable(hooks.onDefect),
    }))
  );
  return Effect.gen(this, function* () {
    const { contracts, handle } = yield* this;
    const lifted = {} as LiftedService<Contracts, Mode>;
    const names = Struct.keys(contracts) as ReadonlyArray<keyof Contracts>;
    for (const name of names) {
      const contract = contracts[name]!;

      const liftedContract = Contract.lift(contract, {
        method: handle(name),
        ...F.pipe(
          hooksOpt,
          O.match({
            onNone: () => ({}),
            onSome: ({ onFailure, onSuccess, onDefect }) => ({
              ...(O.isSome(onFailure) ? { onFailure: (failure) => onFailure.value({ name, contract, failure }) } : {}),
              ...(O.isSome(onSuccess) ? { onSuccess: (success) => onSuccess.value({ name, contract, success }) } : {}),
              ...(O.isSome(onDefect) ? { onDefect: (cause) => onDefect.value({ name, contract, cause }) } : {}),
            }),
          })
        ),
      } as const);

      (lifted as Record<keyof Contracts, unknown>)[name] = (
        mode === LiftServiceMode.Enum.result ? liftedContract.result : liftedContract.success
      ) as LiftedService<Contracts, Mode>[typeof name];
    }
    return lifted;
  });
};
const Proto = {
  ...CommitPrototype,
  ...InspectableProto,
  of: identity,
  liftService,
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
          readonly guardPayload: (u: unknown) => u is Contract.Payload<UnsafeTypes.UnsafeAny>;
          readonly decodePayload: (u: unknown) => Effect.Effect<Contract.Payload<UnsafeTypes.UnsafeAny>, ParseError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
        }
      >();
      const getSchemas = (contract: Contract.Any) => {
        let schemas = schemasCache.get(contract);
        if (P.isUndefined(schemas)) {
          const implementation = context.unsafeMap.get(contract.id)! as Contract.Implementation<UnsafeTypes.UnsafeAny>;
          const guardPayload = S.is(contract.payloadSchema) as (
            u: unknown
          ) => u is Contract.Payload<UnsafeTypes.UnsafeAny> as UnsafeTypes.UnsafeAny;
          const decodePayload = S.decodeUnknown(contract.payloadSchema) as UnsafeTypes.UnsafeAny;
          const resultSchema = S.Union(contract.successSchema, contract.failureSchema);
          const validateResult = S.validate(resultSchema) as UnsafeTypes.UnsafeAny;
          const encodeResult = S.encodeUnknown(resultSchema) as UnsafeTypes.UnsafeAny;
          schemas = {
            context: implementation.context,
            implementation: implementation.implementation,
            guardPayload,
            decodePayload,
            validateResult,
            encodeResult,
          };
          schemasCache.set(contract, schemas);
        }
        return schemas;
      };
      const handle = (name: string) =>
        Effect.fn("ContractKit.handle", { captureStackTrace: false })(function* (payload: unknown) {
          yield* Effect.annotateCurrentSpan({ contract: name, payload: payload });
          const contract = contracts[name];
          if (P.isUndefined(contract)) {
            const contractNames = A.join(",")(Struct.keys(contracts));
            return yield* new ContractError.MalformedOutput({
              module: "ContractKit",
              method: `${name}.handle`,
              description: `Failed to find contract with name '${name}' in contractKit - available contracts: ${contractNames}`,
            });
          }
          const schemas = getSchemas(contract);
          const decodePayloadFailure = (cause: unknown) =>
            new ContractError.MalformedOutput({
              module: "ContractKit",
              method: `${name}.handle`,
              description: `Failed to decode contract call payload for contract '${name}' from:\n'${JSON.stringify(
                payload,
                undefined,
                2
              )}'`,
              cause,
            });
          const decodedPayload = schemas?.guardPayload(payload)
            ? (payload as Contract.Payload<UnsafeTypes.UnsafeAny>)
            : yield* Effect.mapError(schemas?.decodePayload(payload), decodePayloadFailure);
          const { isFailure, result } = yield* schemas?.implementation(decodedPayload).pipe(
            Effect.map((result) => ({ result, isFailure: false })),
            Effect.catchAll((error) =>
              // If the contract implementation failed, check the contract's failure mode to
              // determine how the result should be returned to the end user
              contract.failureMode === FailureMode.Enum.error
                ? Effect.fail(error)
                : Effect.succeed({ result: error, isFailure: true })
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
      _id: "@beep/contract/ContractKit",
      contracts: A.map((contract) => (contract as Contract.Any).name)(Array.from(R.values(this.contracts))),
    } as const;
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Contracts extends Record<string, Contract.Any>>(contracts: Contracts): ContractKit<Contracts> =>
  Object.assign({}, Proto, { contracts }) as UnsafeTypes.UnsafeAny;

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
 * @since 0.1.0
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
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as ContractKit from "@beep/contract/contract-kit/ContractKit"
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
 * @since 0.1.0
 * @category Constructors
 */
export const make = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): ContractKit<ContractsByName<Contracts>> => makeProto(resolveInput(...contracts)) as UnsafeTypes.UnsafeAny;

/**
 * A utility type which simplifies a record type.
 *
 * @since 0.1.0
 * @category Utility Types
 */
export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

/**
 * A utility type which merges two records of contracts together.
 *
 * @since 0.1.0
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
 * @since 0.1.0
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
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as ContractKit from "@beep/contract/contract-kit/ContractKit"
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
 * import * as Contract from "@beep/contract/contract-kit/Contract"
 * import * as ContractKit from "@beep/contract/contract-kit/ContractKit"
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
 * @since 0.1.0
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
    for (const [name, contract] of Struct.entries(contractKit.contracts)) {
      contracts[name] = contract;
    }
  }
  return makeProto(contracts) as UnsafeTypes.UnsafeAny;
};
