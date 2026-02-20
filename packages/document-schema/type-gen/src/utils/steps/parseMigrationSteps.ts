/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import z from "zod";

// Type definitions for the migration steps
// Note: These match the YAML syntax, not the P.Type objects
// Only "string" and "double" are valid primitives in P.TypeKind
type PrimitiveType = "string" | "double";

interface ComplexFieldDefinition {
  type: string; // Can be primitive, generic pattern, or type reference
  docs?: string;
}

// RecordFieldDefinition represents the YAML field values
// Can be: "string", "double", "optional<T>", "list<T>", "ObjectNode", or a complex definition
type RecordFieldDefinition = string | ComplexFieldDefinition;

interface RecordDefinition {
  docs?: string;
  extends?: string[];
  fields: Record<string, RecordFieldDefinition>;
}

interface UnionDefinition {
  discriminant?: string;
  variants: Record<string, string>;
}

interface MigrationStep {
  "local-fragment"?: Record<string, Record<string, RecordFieldDefinition>>;
  "add-records"?: Record<string, RecordDefinition>;
  "add-union"?: Record<string, UnionDefinition>;
  "modify-records"?: Record<string, { "add-fields": Record<string, RecordFieldDefinition> }>;
}

// Define allowed primitive types (matching TypeKind from document-schema-api)
const primitiveType: z.ZodType<PrimitiveType> = z.enum(["string", "double"]);

// Define generic type patterns like "optional<T>", "list<T>", "array<T>"
const genericTypePattern: z.ZodType<string> = z
  .string()
  .regex(/^(optional|list|array|set|map)<[^<>]+>$/, {
    message: "Invalid generic type pattern",
  });

// Reference to other record/union types (capitalized names)
const typeReference: z.ZodType<string> = z.string().regex(/^[A-Z][a-zA-Z0-9]*$/, {
  message: "Type references must be capitalized",
});

const basicType: z.ZodType<string> = z.union([primitiveType, genericTypePattern]);

// Complex field definition object (for future extensibility)
const complexFieldDefinition: z.ZodType<ComplexFieldDefinition> = z.object({
  type: basicType,
  docs: z.string().optional(),
  // This can be extended with e.g. constraints like min/max value or length, in the future
});

// Union of all allowed field definition types - more specific than just z.string()
const recordFieldDefinition: z.ZodType<RecordFieldDefinition> = z.union([
  primitiveType,
  genericTypePattern,
  typeReference,
  complexFieldDefinition,
]);

// Keep as simple strings for now to maintain compatibility with existing code
const recordFieldKey = z.string(); // TODO: could be improved w/ regex if we want to control format
const fragmentKey = z.string();

const localFragment: z.ZodType<Record<string, Record<string, RecordFieldDefinition>>> = z
  .record(
    fragmentKey,
    z.record(recordFieldKey, recordFieldDefinition),
  );
const addRecords: z.ZodType<Record<string, RecordDefinition>> = z.record(
  z.string().regex(/^[A-Z][a-zA-Z0-9]*$/), // Keys must be capitalized type names
  z.object({
    docs: z.optional(z.string()),
    extends: z.array(z.string()).optional(),
    fields: z.record(recordFieldKey, recordFieldDefinition),
  }),
);

const unionDefinition: z.ZodType<UnionDefinition> = z.object({
  discriminant: z.string().optional(),
  variants: z.record(z.string(), z.string().regex(/^[A-Z][a-zA-Z0-9]*$/)),
});

const addUnion: z.ZodType<Record<string, UnionDefinition>> = z.record(
  z.string().regex(/^[A-Z][a-zA-Z0-9]*$/), // Union names must be capitalized
  unionDefinition,
);

const modifyRecords: z.ZodType<
  Record<string, { "add-fields": Record<string, RecordFieldDefinition> }>
> = z.record(
  z.string().regex(/^[A-Z][a-zA-Z0-9]*$/), // Record names must be capitalized
  z.object({
    "add-fields": z.record(recordFieldKey, recordFieldDefinition),
  }),
);

const migrationStep: z.ZodType<MigrationStep> = z.object({
  "local-fragment": z.optional(localFragment),
  "add-records": z.optional(addRecords),
  "add-union": z.optional(addUnion),
  "modify-records": z.optional(modifyRecords),
});

const migrationStepsSchema: z.ZodType<MigrationStep[]> = z.array(migrationStep);

export type { MigrationStep, RecordFieldDefinition, UnionDefinition };

export function parseMigrationSteps(unparsed: unknown): MigrationStep[] {
  const parsed = migrationStepsSchema.parse(unparsed);
  return parsed;
}
