/**
 * Workflow model types (v1)
 * Location: apps/web/src/features/form-system/model/types.ts
 *
 * Canonical data-first model for multi-step workflow definitions.
 * No external dependencies; designed to be hoisted to a package later.
 */

// JSON value primitives
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
export type JsonArray = ReadonlyArray<JsonValue>;
export type JsonObject = { readonly [k: string]: JsonValue };

// Minimal JSON Schema representation (draft-agnostic here)
// We intentionally keep this loose for now; Ajv will validate later.
export type JSONSchema = { readonly [k: string]: JsonValue };

// JsonLogic rule (data-only). Rules are objects; allow boolean for catch-alls.
export type JsonLogicRule = JsonObject | boolean;

export interface StepDefinition {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly schema: JSONSchema;
  readonly uiSchema?: JsonObject;
  readonly annotations?: JsonObject;
}

export interface TransitionDefinition {
  readonly from: string;
  readonly to: string;
  /**
   * JsonLogic rule evaluated against the evaluation context.
   * If omitted, this transition is unconditional (default/catch-all).
   */
  readonly when?: JsonLogicRule;
  /** Lower number = higher priority (deterministic tie-breaker). */
  readonly priority?: number;
  readonly metadata?: JsonObject;
}

export interface WorkflowDefinition {
  readonly id: string;
  /** Semantic version for the workflow content (e.g., "1.0.0"). */
  readonly version: string;
  /** Optional schema version for the model itself. */
  readonly schemaVersion?: string;
  /** Step id to start at. */
  readonly initial: string;
  readonly steps: ReadonlyArray<StepDefinition>;
  readonly transitions: ReadonlyArray<TransitionDefinition>;
  readonly metadata?: JsonObject;
}

export interface EvaluationContext {
  readonly answers: Readonly<Record<string, JsonObject>>;
  readonly currentStepAnswers?: JsonObject;
  readonly externalContext?: JsonObject;
}

export type Severity = "error" | "warning";

export interface SemanticIssue {
  readonly code:
    | "DUPLICATE_STEP_ID"
    | "INITIAL_STEP_NOT_FOUND"
    | "UNKNOWN_TRANSITION_REF"
    | "UNREACHABLE_STEP"
    | "NO_TERMINAL_PATH"
    | "MISSING_DEFAULT_TRANSITION";
  readonly message: string;
  /** JSON Pointer-like path to the offending location (best-effort). */
  readonly path?: string;
  readonly severity: Severity;
  readonly info?: JsonObject;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly issues: ReadonlyArray<SemanticIssue>;
}
