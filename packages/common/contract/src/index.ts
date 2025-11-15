/**
 * @packageDocumentation
 *
 * `@beep/contract` provides Effect-first primitives for declaring, implementing,
 * and organizing RPC-style contracts that describe how clients interact with a
 * runtime. Each module in this entry point re-exports the corresponding
 * internal implementation:
 *
 * - `Contract` — build strongly typed contracts backed by Effect schemas
 * - `ContractError` — shareable error taxonomy for transport and validation
 * - `ContractKit` — group contracts together and expose them as Layers
 *
 * @example
 * ```ts
 * import { Contract, ContractKit } from "@beep/contract";
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema";
 *
 * const ListWidgets = Contract.make("ListWidgets", {
 *   description: "Return the widgets available to the caller",
 *   payload: { tenantId: S.String },
 *   success: S.Array(S.Struct({ id: S.String, name: S.String })),
 * });
 *
 * const kit = ContractKit.make(ListWidgets);
 * const layer = kit.toLayer({
 *   listWidgets: ({ tenantId }) =>
 *     Effect.succeed([{ id: "w-1", name: `Widget for ${tenantId}` }]),
 * });
 * ```
 */
export * from "./Contract";
export * from "./ContractError";
export * from "./ContractKit";
