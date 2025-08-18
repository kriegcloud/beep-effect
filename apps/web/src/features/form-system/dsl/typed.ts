/**
 * Typed WorkflowDefinition DSL with Effect Schema
 * Location: apps/web/src/features/form-system/dsl/typed.ts
 */

import { JSONSchema as EffectJSONSchema, Schema } from "effect";
import type {
  JsonLogicRule,
  JsonObject,
  JsonValue,
  StepDefinition,
  TransitionDefinition,
  WorkflowDefinition,
} from "../model/types";
import type { CreateWorkflowArgs } from "./builder";

// Utility types for typed field paths
type AnySchema = Schema.Schema<any, any, any>;
export type Infer<S extends AnySchema> = Schema.Schema.Type<S>;

// Dot-paths for nested objects (arrays are not expanded here)
export type Path<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}` | `${K}.${Path<T[K]>}`
        : `${K}`
    }[keyof T & string]
  : never;

export interface StepOptions {
  title?: string;
  description?: string;
  uiSchema?: JsonObject;
  annotations?: JsonObject;
}

export interface TypedWorkflowBuilder<S extends Record<string, AnySchema>> {
  step<Id extends string, TSchema extends AnySchema>(
    id: Id,
    schema: TSchema,
    options?: StepOptions,
  ): TypedWorkflowBuilder<S & { [K in Id]: TSchema }>;

  go<From extends keyof S & string, To extends keyof S & string>(
    from: From,
    to: To,
    metadata?: JsonObject,
  ): TypedWorkflowBuilder<S>;

  when<From extends keyof S & string, To extends keyof S & string>(
    from: From,
    to: To,
    rule: JsonLogicRule,
    priority?: number,
    metadata?: JsonObject,
  ): TypedWorkflowBuilder<S>;

  // Typed JsonLogic helpers
  varAnswers<K extends keyof S & string, P extends Path<Infer<S[K]>>>(
    stepId: K,
    path: P,
  ): JsonObject;
  varCurrent(path: string): JsonObject;
  varExternal(path: string): JsonObject;
  eq(a: JsonValue | JsonObject, b: JsonValue | JsonObject): JsonObject;
  and(...rules: ReadonlyArray<JsonLogicRule>): JsonObject;
  or(...rules: ReadonlyArray<JsonLogicRule>): JsonObject;
  not(rule: JsonLogicRule): JsonObject;

  build(): WorkflowDefinition;
}

export function createTypedWorkflow(
  args: CreateWorkflowArgs,
): TypedWorkflowBuilder<{}> {
  const state = {
    id: args.id,
    version: args.version,
    initial: args.initial,
    metadata: args.metadata,
    steps: [] as StepDefinition[],
    transitions: [] as TransitionDefinition[],
  };

  function makeBuilder<T extends Record<string, AnySchema>>(): TypedWorkflowBuilder<T> {
    return {
      step<Id extends string, TSchema extends AnySchema>(
        id: Id,
        schema: TSchema,
        options?: StepOptions,
      ) {
        // Generate JSON Schema from Effect Schema and normalize to draft 2020-12
        const raw = EffectJSONSchema.make(schema) as unknown as JsonObject;
        const jsonSchema = {
          ...raw,
          $schema: "https://json-schema.org/draft/2020-12/schema",
        } as JsonObject;

        state.steps.push({
          id,
          schema: jsonSchema,
          title: options?.title,
          description: options?.description,
          uiSchema: options?.uiSchema,
          annotations: options?.annotations,
        });

        return makeBuilder<T & { [K in Id]: TSchema }>();
      },

      go<From extends keyof T & string, To extends keyof T & string>(
        from: From,
        to: To,
        metadata?: JsonObject,
      ) {
        state.transitions.push({ from, to, metadata });
        return makeBuilder<T>();
      },

      when<From extends keyof T & string, To extends keyof T & string>(
        from: From,
        to: To,
        rule: JsonLogicRule,
        priority?: number,
        metadata?: JsonObject,
      ) {
        state.transitions.push({ from, to, when: rule, priority, metadata });
        return makeBuilder<T>();
      },

      varAnswers<K extends keyof T & string, P extends Path<Infer<T[K]>>>(
        stepId: K,
        path: P,
      ) {
        return { var: `answers.${String(stepId)}.${String(path)}` } as unknown as JsonObject;
      },

      varCurrent(path: string) {
        return { var: `current.${String(path)}` } as unknown as JsonObject;
      },

      varExternal(path: string) {
        return { var: `external.${String(path)}` } as unknown as JsonObject;
      },

      eq(a: JsonValue | JsonObject, b: JsonValue | JsonObject) {
        return { "==": [a as any, b as any] } as unknown as JsonObject;
      },

      and(...rules: ReadonlyArray<JsonLogicRule>) {
        return { and: rules as any } as unknown as JsonObject;
      },

      or(...rules: ReadonlyArray<JsonLogicRule>) {
        return { or: rules as any } as unknown as JsonObject;
      },

      not(rule: JsonLogicRule) {
        return { "!": [rule as any] } as unknown as JsonObject;
      },

      build(): WorkflowDefinition {
        // Sort transitions by priority (undefined => Infinity)
        const transitions = [...state.transitions].sort(
          (a, b) =>
            (a.priority ?? Number.POSITIVE_INFINITY) -
            (b.priority ?? Number.POSITIVE_INFINITY),
        );

        return {
          id: state.id,
          version: state.version,
          schemaVersion: "workflow.v1",
          initial: state.initial,
          steps: [...state.steps],
          transitions,
          metadata: state.metadata,
        } satisfies WorkflowDefinition;
      },
    } as TypedWorkflowBuilder<T>;
  }

  return makeBuilder<{}>();
}
