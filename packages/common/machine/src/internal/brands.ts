import type { Brand } from "effect";

// Unique symbols for type-level branding
declare const StateTypeId: unique symbol;
declare const EventTypeId: unique symbol;

export type StateTypeId = typeof StateTypeId;
export type EventTypeId = typeof EventTypeId;

// Brand interfaces
export interface StateBrand extends Brand.Brand<StateTypeId> {}
export interface EventBrand extends Brand.Brand<EventTypeId> {}

// Shared branded type constraints used across all combinators
export type BrandedState = { readonly _tag: string } & StateBrand;
export type BrandedEvent = { readonly _tag: string } & EventBrand;

// Unique symbols for schema-level branding (ties brand to specific schema definition)
declare const SchemaIdTypeId: unique symbol;
type SchemaIdTypeId = typeof SchemaIdTypeId;

/**
 * Brand that captures the schema definition type D.
 * Two schemas with identical definition shapes will have compatible brands.
 * Different definitions = incompatible brands.
 */
export interface SchemaIdBrand<_D extends Record<string, unknown>> extends Brand.Brand<SchemaIdTypeId> {}

/**
 * Full state brand: combines base state brand with schema-specific brand
 */
export type FullStateBrand<D extends Record<string, unknown>> = StateBrand & SchemaIdBrand<D>;

/**
 * Full event brand: combines base event brand with schema-specific brand
 */
export type FullEventBrand<D extends Record<string, unknown>> = EventBrand & SchemaIdBrand<D>;

/**
 * Value or constructor for a tagged type.
 * Accepts both plain values (empty structs) and constructor functions (non-empty structs).
 */
export type TaggedOrConstructor<T extends { readonly _tag: string }> = T | ((...args: never[]) => T);
