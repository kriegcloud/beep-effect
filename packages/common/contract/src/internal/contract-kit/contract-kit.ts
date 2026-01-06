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
import { $ContractId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type { UnsafeTypes } from "@beep/types";

const $I = $ContractId.create("internal/contract-kit/contract-kit");
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
import { create } from "mutative";
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
export type ContractsByName<Contracts> =
  Contracts extends Record<string, Contract.Any>
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

export class LiftServiceMode extends BS.StringLiteralKit("success", "result").annotations(
  $I.annotations("LiftServiceMode", {
    description: "Mode for lifted service methods: 'success' returns only successes, 'result' returns discriminated outcomes",
  })
) {}

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
 * Union of all possible defect mapper arguments for a contract kit.
 * This approach enables proper type inference at call sites.
 *
 * @since 2.0.0
 * @category Utility Types
 */
export type DefectMapperArgs<Contracts extends Record<string, Contract.Any>> = {
  [Name in keyof Contracts]: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly cause: Cause.Cause<unknown>;
    readonly payload: Contract.Payload<Contracts[Name]>;
  };
}[keyof Contracts];

/**
 * Union of all possible failure types for contracts in a kit.
 *
 * @since 2.0.0
 * @category Utility Types
 */
export type AllFailures<Contracts extends Record<string, Contract.Any>> = {
  [Name in keyof Contracts]: Contract.Failure<Contracts[Name]>;
}[keyof Contracts];

/**
 * Options for building lifted service handlers from a contract kit.
 *
 * @since 2.0.0
 * @category Models
 */
export interface LiftServiceOptions<
  Contracts extends Record<string, Contract.Any>,
  Mode extends LiftServiceMode.Type = typeof LiftServiceMode.Enum.success,
> {
  /**
   * The lift mode: "success" returns only successful values, "result" returns
   * the full HandleOutcome discriminated union.
   */
  readonly mode?: Mode;

  /**
   * Hooks for instrumentation (logging, metrics, etc.)
   */
  readonly hooks?: LiftServiceHooks<Contracts>;

  /**
   * Global defect mapper applied to all contracts in the kit.
   *
   * This mapper is called when any contract raises a defect (die/interrupt).
   * Return a failure value to use instead of UnknownError, or `undefined`
   * to fall through to the default behavior.
   *
   * Individual contract-level mappers can be provided via `contractMappers`
   * for more specific handling.
   *
   * @since 2.0.0
   */
  readonly mapDefect?: (
    args: DefectMapperArgs<Contracts>
  ) =>
    | AllFailures<Contracts>
    | ContractError.UnknownError
    | undefined
    | Effect.Effect<AllFailures<Contracts> | ContractError.UnknownError | undefined, never, never>;

  /**
   * Per-contract defect mappers for fine-grained error handling.
   *
   * Provide a mapper function keyed by contract name. These take precedence
   * over the global `mapDefect` option for their specific contracts.
   *
   * @since 2.0.0
   */
  readonly contractMappers?: {
    readonly [Name in keyof Contracts]?: (args: {
      readonly contract: Contracts[Name];
      readonly cause: Cause.Cause<unknown>;
      readonly payload: Contract.Payload<Contracts[Name]>;
    }) =>
      | Contract.Failure<Contracts[Name]>
      | ContractError.UnknownError
      | undefined
      | Effect.Effect<Contract.Failure<Contracts[Name]> | ContractError.UnknownError | undefined, never, never>;
  };
}

/**
 * Union of all possible failure hook arguments for a contract kit.
 *
 * @since 2.0.0
 * @category Utility Types
 */
export type FailureHookArgs<Contracts extends Record<string, Contract.Any>> = {
  [Name in keyof Contracts]: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly failure: Contract.Failure<Contracts[Name]>;
  };
}[keyof Contracts];

/**
 * Union of all possible success hook arguments for a contract kit.
 *
 * @since 2.0.0
 * @category Utility Types
 */
export type SuccessHookArgs<Contracts extends Record<string, Contract.Any>> = {
  [Name in keyof Contracts]: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly success: Contract.Success<Contracts[Name]>;
  };
}[keyof Contracts];

/**
 * Union of all possible defect hook arguments for a contract kit.
 *
 * @since 2.0.0
 * @category Utility Types
 */
export type DefectHookArgs<Contracts extends Record<string, Contract.Any>> = {
  [Name in keyof Contracts]: {
    readonly name: Name;
    readonly contract: Contracts[Name];
    readonly cause: Cause.Cause<unknown>;
  };
}[keyof Contracts];

/**
 * Hook definitions invoked while the lifted handlers run.
 *
 * These hooks are for instrumentation purposes (logging, metrics, tracing).
 * For error transformation, use `mapDefect` in {@link LiftServiceOptions}.
 *
 * @since 0.1.0
 * @category Models
 */
export interface LiftServiceHooks<Contracts extends Record<string, Contract.Any>> {
  /**
   * Called when a contract returns a failure (not a defect).
   */
  readonly onFailure?: (args: FailureHookArgs<Contracts>) => Effect.Effect<void, never, never>;

  /**
   * Called when a contract returns a successful result.
   */
  readonly onSuccess?: (args: SuccessHookArgs<Contracts>) => Effect.Effect<void, never, never>;

  /**
   * Called when a contract raises a defect (die/interrupt).
   * This is for instrumentation only - use `mapDefect` for error transformation.
   */
  readonly onDefect?: (args: DefectHookArgs<Contracts>) => Effect.Effect<void, never, never>;
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
  const mode = options?.mode ?? LiftServiceMode.Enum.success;
  const hooksOpt = O.fromNullable(options?.hooks).pipe(
    O.map((hooks) => ({
      onFailure: O.fromNullable(hooks.onFailure),
      onSuccess: O.fromNullable(hooks.onSuccess),
      onDefect: O.fromNullable(hooks.onDefect),
    }))
  );
  // V2: Extract global and per-contract defect mappers
  const globalMapDefect = O.fromNullable(options?.mapDefect);
  const contractMappers = O.fromNullable(options?.contractMappers);

  return Effect.gen(this, function* () {
    const { contracts, handle } = yield* this;
    type MutableLifted = {
      -readonly [K in keyof Contracts]: LiftedService<Contracts, Mode>[K];
    };
    return F.pipe(
      Struct.keys(contracts) as ReadonlyArray<keyof Contracts>,
      A.reduce({} as LiftedService<Contracts, Mode>, (acc, name) => {
        const contract = contracts[name]!;
        const onFailure = O.flatMap(hooksOpt, (hooks) => hooks.onFailure);
        const onSuccess = O.flatMap(hooksOpt, (hooks) => hooks.onSuccess);
        const onDefect = O.flatMap(hooksOpt, (hooks) => hooks.onDefect);

        // V2: Get contract-specific mapper (takes precedence) or fall back to global
        const contractSpecificMapper = O.flatMap(contractMappers, (mappers) =>
          O.fromNullable(mappers[name as keyof typeof mappers])
        );

        const liftOptions = create(
          {
            method: handle(name),
          } as {
            readonly method: (
              params: Contract.Payload<Contracts[typeof name]>
            ) => Effect.Effect<
              Contract.ImplementationResult<Contracts[typeof name]>,
              Contract.Failure<Contracts[typeof name]>,
              Contract.Requirements<Contracts[typeof name]>
            >;
            onFailure?: (failure: Contract.Failure<Contracts[typeof name]>) => Effect.Effect<void, never, never>;
            onSuccess?: (success: Contract.Success<Contracts[typeof name]>) => Effect.Effect<void, never, never>;
            onDefect?: (cause: Cause.Cause<unknown>) => Effect.Effect<void, never, never>;
            mapDefect?: (
              cause: Cause.Cause<unknown>,
              ctx: { contract: Contract.Any; payload: Contract.Payload<Contracts[typeof name]> }
            ) =>
              | Contract.Failure<Contracts[typeof name]>
              | ContractError.UnknownError
              | undefined
              | Effect.Effect<
                  Contract.Failure<Contracts[typeof name]> | ContractError.UnknownError | undefined,
                  never,
                  never
                >;
          },
          (draft) => {
            if (O.isSome(onFailure)) {
              draft.onFailure = (failure) => onFailure.value({ name, contract, failure });
            }
            if (O.isSome(onSuccess)) {
              draft.onSuccess = (success) => onSuccess.value({ name, contract, success });
            }
            if (O.isSome(onDefect)) {
              draft.onDefect = (cause) => onDefect.value({ name, contract, cause });
            }
            // V2: Wire up defect mapper
            if (O.isSome(contractSpecificMapper)) {
              // Contract-specific mapper takes precedence
              draft.mapDefect = (cause, ctx) =>
                contractSpecificMapper.value({
                  contract: ctx.contract as Contracts[typeof name],
                  cause,
                  payload: ctx.payload,
                });
            } else if (O.isSome(globalMapDefect)) {
              // Fall back to global mapper
              draft.mapDefect = (cause, ctx) =>
                globalMapDefect.value({
                  name,
                  contract: ctx.contract as Contracts[typeof name],
                  cause,
                  payload: ctx.payload,
                });
            }
          }
        );

        const liftedContract = Contract.lift(contract, liftOptions);

        return create(acc as MutableLifted, (draft) => {
          const mutableDraft = draft as Record<keyof Contracts, LiftedService<Contracts, Mode>[keyof Contracts]>;
          mutableDraft[name] = (
            mode === LiftServiceMode.Enum.result ? liftedContract.result : liftedContract.success
          ) as LiftedService<Contracts, Mode>[typeof name];
        }) as LiftedService<Contracts, Mode>;
      })
    );
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
