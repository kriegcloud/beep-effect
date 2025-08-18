/**
 * WorkflowDefinition DSL (MVP)
 * Location: apps/web/src/features/form-system/dsl/builder.ts
 */

import type {
  JSONSchema,
  JsonObject,
  StepDefinition,
  TransitionDefinition,
  WorkflowDefinition,
} from "../model/types";

export interface CreateWorkflowArgs {
  id: string;
  version: string;
  initial: string;
  metadata?: JsonObject;
}

export interface WorkflowBuilder {
  step(step: StepDefinition): this;
  /** Add multiple steps in one call */
  steps(...steps: StepDefinition[]): this;
  /** Add unconditional transition */
  go(from: string, to: string, metadata?: JsonObject): this;
  /** Add conditional transition using a JsonLogic rule */
  when(
    from: string,
    to: string,
    rule: JsonObject | boolean,
    priority?: number,
    metadata?: JsonObject,
  ): this;
  build(): WorkflowDefinition;
}

class WorkflowBuilderImpl implements WorkflowBuilder {
  private readonly id: string;
  private readonly version: string;
  private readonly initial: string;
  private readonly metadata?: JsonObject;

  private readonly _steps: StepDefinition[] = [];
  private readonly _transitions: TransitionDefinition[] = [];

  constructor(args: CreateWorkflowArgs) {
    this.id = args.id;
    this.version = args.version;
    this.initial = args.initial;
    this.metadata = args.metadata;
  }

  step(step: StepDefinition): this {
    // basic guarding; semantic validator will do deeper checks
    if (!step?.id) throw new Error("Step must have an id");
    if (!step?.schema || typeof step.schema !== "object")
      throw new Error("Step must have a schema");
    this._steps.push(step);
    return this;
  }

  steps(...steps: StepDefinition[]): this {
    for (const s of steps) this.step(s);
    return this;
  }

  go(from: string, to: string, metadata?: JsonObject): this {
    this._transitions.push({ from, to, metadata });
    return this;
  }

  when(
    from: string,
    to: string,
    rule: JsonObject | boolean,
    priority?: number,
    metadata?: JsonObject,
  ): this {
    this._transitions.push({ from, to, when: rule, priority, metadata });
    return this;
  }

  build(): WorkflowDefinition {
    // stable sort by priority (undefined => Infinity)
    const transitions = [...this._transitions].sort(
      (a, b) =>
        (a.priority ?? Number.POSITIVE_INFINITY) -
        (b.priority ?? Number.POSITIVE_INFINITY),
    );

    return {
      id: this.id,
      version: this.version,
      schemaVersion: "workflow.v1",
      initial: this.initial,
      steps: [...this._steps],
      transitions,
      metadata: this.metadata,
    } satisfies WorkflowDefinition;
  }
}

export function createWorkflow(args: CreateWorkflowArgs): WorkflowBuilder {
  return new WorkflowBuilderImpl(args);
}

/** Simple helper for constructing a StepDefinition */
export function step(
  id: string,
  schema: JSONSchema,
  title?: string,
  description?: string,
  uiSchema?: JsonObject,
  annotations?: JsonObject,
): StepDefinition {
  return { id, schema, title, description, uiSchema, annotations };
}
