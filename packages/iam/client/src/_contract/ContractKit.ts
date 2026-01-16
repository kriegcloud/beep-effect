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
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";
import type * as Scope from "effect/Scope";
import * as Struct from "effect/Struct";
import * as Contract from "./Contract";
import * as ContractError from "./ContractError";
export const TypeId = "~@beep/contract/Contractkit";

export type TypeId = typeof TypeId;

export interface Contractkit<in out Contracts extends Record<string, Contract.Any>>
  extends Effect.Effect<WithHandler<Contracts>, never, Contract.HandlersFor<Contracts>>,
    Inspectable,
    Pipeable {
  readonly [TypeId]: TypeId;

  new (_: never): {};

  readonly contracts: Contracts;

  of<Handlers extends HandlersFrom<Contracts>>(handlers: Handlers): Handlers;

  toContext<Handlers extends HandlersFrom<Contracts>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Effect.Effect<Context.Context<Contract.HandlersFor<Contracts>>, EX, RX>;

  toLayer<Handlers extends HandlersFrom<Contracts>, EX = never, RX = never>(
    build: Handlers | Effect.Effect<Handlers, EX, RX>
  ): Layer.Layer<Contract.HandlersFor<Contracts>, EX, Exclude<RX, Scope.Scope>>;
}

export interface Any {
  readonly [TypeId]: TypeId;
  readonly contracts: Record<string, Contract.Any>;
}

export type Contracts<T> = T extends Contractkit<infer Contracts> ? Contracts : never;

export type ContractsByName<Contracts> =
  Contracts extends Record<string, Contract.Any>
    ? { readonly [Name in keyof Contracts]: Contracts[Name] }
    : Contracts extends ReadonlyArray<Contract.Any>
      ? { readonly [Contract in Contracts[number] as Contract["name"]]: Contract }
      : never;

export type HandlersFrom<Contracts extends Record<string, Contract.Any>> = {
  readonly [Name in keyof Contracts as Contract.RequiresHandler<Contracts[Name]> extends true ? Name : never]: (
    params: Contract.Parameters<Contracts[Name]>
  ) => Effect.Effect<
    Contract.Success<Contracts[Name]>,
    Contract.Failure<Contracts[Name]>,
    Contract.Requirements<Contracts[Name]>
  >;
};

export type WithHandlerContracts<T> = T extends WithHandler<infer Contracts> ? Contracts : never;

export interface WithHandler<in out Contracts extends Record<string, Contract.Any>> {
  readonly contracts: Contracts;

  readonly handle: <Name extends keyof Contracts>(
    name: Name,

    params: Contract.Parameters<Contracts[Name]>
  ) => Effect.Effect<
    Contract.HandlerResult<Contracts[Name]>,
    Contract.Failure<Contracts[Name]>,
    Contract.Requirements<Contracts[Name]>
  >;
}

const Proto = {
  ...CommitPrototype,
  ...InspectableProto,
  of: identity,
  toContext(
    this: Contractkit<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Effect.gen(this, function* () {
      const context = yield* Effect.context<never>();
      const handlers = Effect.isEffect(build) ? yield* build : build;
      const contextMap = new Map<string, unknown>();
      for (const [name, handler] of Object.entries(handlers)) {
        const tool = this.contracts[name]!;
        contextMap.set(tool.id, { handler, context });
      }
      return Context.unsafeMake(contextMap);
    });
  },
  toLayer(
    this: Contractkit<Record<string, Contract.Any>>,
    build:
      | Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>
      | Effect.Effect<Record<string, (params: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>>
  ) {
    return Layer.scopedContext(this.toContext(build));
  },
  commit(this: Contractkit<Record<string, Contract.Any>>) {
    return Effect.gen(this, function* () {
      const contracts = this.contracts;
      const context = yield* Effect.context<never>();
      const schemasCache = new WeakMap<
        UnsafeTypes.UnsafeAny,
        {
          readonly context: Context.Context<never>;
          readonly handler: (
            params: UnsafeTypes.UnsafeAny
          ) => Effect.Effect<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny>;
          readonly decodeParameters: (
            u: unknown
          ) => Effect.Effect<Contract.Parameters<UnsafeTypes.UnsafeAny>, ParseError>;
          readonly validateResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
          readonly encodeResult: (u: unknown) => Effect.Effect<unknown, ParseError>;
        }
      >();
      const getSchemas = (tool: Contract.Any) => {
        let schemas = schemasCache.get(tool);
        if (Predicate.isUndefined(schemas)) {
          const handler = context.unsafeMap.get(tool.id)! as Contract.Handler<UnsafeTypes.UnsafeAny>;
          const decodeParameters = Schema.decodeUnknown(tool.parametersSchema) as UnsafeTypes.UnsafeAny;
          const resultSchema = Schema.Union(tool.successSchema, tool.failureSchema);
          const validateResult = Schema.validate(resultSchema) as UnsafeTypes.UnsafeAny;
          const encodeResult = Schema.encodeUnknown(resultSchema) as UnsafeTypes.UnsafeAny;
          schemas = {
            context: handler.context,
            handler: handler.handler,
            decodeParameters,
            validateResult,
            encodeResult,
          };
          schemasCache.set(tool, schemas);
        }
        return schemas;
      };
      const handle = Effect.fn("Contractkit.handle", { captureStackTrace: false })(function* (
        name: string,
        params: unknown
      ) {
        yield* Effect.annotateCurrentSpan({ tool: name, parameters: params });
        const tool = contracts[name];
        if (Predicate.isUndefined(tool)) {
          const toolNames = Object.keys(contracts).join(",");
          return yield* new ContractError.MalformedOutput({
            module: "Contractkit",
            method: `${name}.handle`,
            description: `Failed to find tool with name '${name}' in toolkit - available contracts: ${toolNames}`,
          });
        }
        const schemas = getSchemas(tool);
        const decodedParams = yield* Effect.mapError(
          schemas.decodeParameters(params),
          (cause) =>
            new ContractError.MalformedOutput({
              module: "Contractkit",
              method: `${name}.handle`,
              description: `Failed to decode tool call parameters for tool '${name}' from:\n'${JSON.stringify(
                params,
                undefined,
                2
              )}'`,
              cause,
            })
        );
        const { isFailure, result } = yield* schemas.handler(decodedParams).pipe(
          Effect.map((result) => ({ result, isFailure: false })),
          Effect.catchAll((error) =>
            // If the tool handler failed, check the tool's failure mode to
            // determine how the result should be returned to the end user
            tool.failureMode === "error" ? Effect.fail(error) : Effect.succeed({ result: error, isFailure: true })
          ),
          Effect.tap(({ result }) => schemas.validateResult(result)),
          Effect.mapInputContext((input) => Context.merge(schemas.context, input)),
          Effect.mapError((cause) =>
            ParseResult.isParseError(cause)
              ? new ContractError.MalformedInput({
                  module: "Contractkit",
                  method: `${name}.handle`,
                  description: `Failed to validate tool call result for tool '${name}'`,
                  cause,
                })
              : cause
          )
        );
        const encodedResult = yield* Effect.mapError(
          schemas.encodeResult(result),
          (cause) =>
            new ContractError.MalformedInput({
              module: "Contractkit",
              method: `${name}.handle`,
              description: `Failed to encode tool call result for tool '${name}'`,
              cause,
            })
        );
        return {
          isFailure,
          result,
          encodedResult,
        } satisfies Contract.HandlerResult<UnsafeTypes.UnsafeAny>;
      });
      return {
        contracts,
        handle,
      } satisfies WithHandler<Record<string, UnsafeTypes.UnsafeAny>>;
    });
  },
  toJSON(this: Contractkit<UnsafeTypes.UnsafeAny>): unknown {
    return {
      _id: "@beep/contract/Contractkit",
      contracts: Array.from(Object.values(this.contracts)).map((tool) => (tool as Contract.Any).name),
    };
  },
  pipe() {
    return pipeArguments(this, arguments);
  },
};

const makeProto = <Contracts extends Record<string, Contract.Any>>(contracts: Contracts): Contractkit<Contracts> =>
  Object.assign(() => {}, Proto, { contracts }) as UnsafeTypes.UnsafeAny;

const resolveInput = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): Record<string, Contracts[number]> => {
  const output = {} as Record<string, Contracts[number]>;
  for (const tool of contracts) {
    output[tool.name] = (
      Schema.isSchema(tool) ? Contract.fromTaggedRequest(tool as UnsafeTypes.UnsafeAny) : tool
    ) as UnsafeTypes.UnsafeAny;
  }
  return output;
};

export const empty: Contractkit<{}> = makeProto({});

export const make = <Contracts extends ReadonlyArray<Contract.Any>>(
  ...contracts: Contracts
): Contractkit<ContractsByName<Contracts>> => makeProto(resolveInput(...contracts)) as UnsafeTypes.UnsafeAny;

export type SimplifyRecord<T> = { [K in keyof T]: T[K] } & {};

export type MergeRecords<U> = {
  readonly [K in Extract<U extends unknown ? keyof U : never, string>]: Extract<
    U extends Record<K, infer V> ? V : never,
    Contract.Any
  >;
};

export type MergedContracts<Contractkits extends ReadonlyArray<Any>> = SimplifyRecord<
  MergeRecords<Contracts<Contractkits[number]>>
>;

export const merge = <const Contractkits extends ReadonlyArray<Any>>(
  ...contractkits: Contractkits
): Contractkit<MergedContracts<Contractkits>> => {
  const contracts = {} as Record<string, UnsafeTypes.UnsafeAny>;
  for (const toolkit of contractkits) {
    for (const [name, tool] of Struct.entries(toolkit.contracts)) {
      contracts[name] = tool;
    }
  }
  return makeProto(contracts) as UnsafeTypes.UnsafeAny;
};
