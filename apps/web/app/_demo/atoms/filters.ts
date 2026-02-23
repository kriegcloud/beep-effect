"use client"

import { Atom } from "@effect-atom/atom"
import { Option, pipe, Schema } from "effect"
import type { FiltersState } from "@/registry/data-table-filter/core/types"

// Text filter operators
const TextFilterOperatorSchema = Schema.Union(
  Schema.Literal("contains"),
  Schema.Literal("does not contain")
)

// Number filter operators
const NumberFilterOperatorSchema = Schema.Union(
  Schema.Literal("is"),
  Schema.Literal("is not"),
  Schema.Literal("is less than"),
  Schema.Literal("is greater than or equal to"),
  Schema.Literal("is greater than"),
  Schema.Literal("is less than or equal to"),
  Schema.Literal("is between"),
  Schema.Literal("is not between")
)

// Date filter operators
const DateFilterOperatorSchema = Schema.Union(
  Schema.Literal("is"),
  Schema.Literal("is not"),
  Schema.Literal("is before"),
  Schema.Literal("is on or after"),
  Schema.Literal("is after"),
  Schema.Literal("is on or before"),
  Schema.Literal("is between"),
  Schema.Literal("is not between")
)

// Option filter operators
const OptionFilterOperatorSchema = Schema.Union(
  Schema.Literal("is"),
  Schema.Literal("is not"),
  Schema.Literal("is any of"),
  Schema.Literal("is none of")
)

// Multi-option filter operators
const MultiOptionFilterOperatorSchema = Schema.Union(
  Schema.Literal("include"),
  Schema.Literal("exclude"),
  Schema.Literal("include any of"),
  Schema.Literal("include all of"),
  Schema.Literal("exclude if any of"),
  Schema.Literal("exclude if all")
)

// Schema for FilterModel - discriminated union by type
const FilterModelSchema = Schema.Union(
  Schema.Struct({
    columnId: Schema.String,
    type: Schema.Literal("text"),
    operator: TextFilterOperatorSchema,
    values: Schema.Array(Schema.String).pipe(Schema.mutable),
  }),
  Schema.Struct({
    columnId: Schema.String,
    type: Schema.Literal("number"),
    operator: NumberFilterOperatorSchema,
    values: Schema.Array(Schema.Number).pipe(Schema.mutable),
  }),
  Schema.Struct({
    columnId: Schema.String,
    type: Schema.Literal("date"),
    operator: DateFilterOperatorSchema,
    values: Schema.Array(Schema.Date).pipe(Schema.mutable),
  }),
  Schema.Struct({
    columnId: Schema.String,
    type: Schema.Literal("option"),
    operator: OptionFilterOperatorSchema,
    values: Schema.Array(Schema.String).pipe(Schema.mutable),
  }),
  Schema.Struct({
    columnId: Schema.String,
    type: Schema.Literal("multiOption"),
    operator: MultiOptionFilterOperatorSchema,
    values: Schema.Array(Schema.String).pipe(Schema.mutable),
  })
)

const FiltersStateSchema = Schema.Array(FilterModelSchema).pipe(Schema.mutable)

const FiltersFromJson = Schema.compose(
  Schema.parseJson(),
  FiltersStateSchema
)

// Simple writable atom for filters - no URL sync (avoids SSR issues)
// URL sync can be added later with useEffect if needed
export const filtersAtom = Atom.make<FiltersState>([])

// Derived atom for convenience
export const filtersStateAtom = filtersAtom
