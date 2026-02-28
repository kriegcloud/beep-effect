/**
 * Action edit/validation result models.
 *
 * @since 0.0.0
 * @module @beep/ontology/actions/ActionResults
 */

/**
 * Action edit result payload.
 *
 * @since 0.0.0
 * @category models
 */

export type ActionResults = (ObjectEdits | LargeScaleObjectEdits) & {
  editedObjectTypes: Array<string>;
};

interface ObjectEdits {
  type: "edits";
  addedObjects: Array<ObjectReference>;
  modifiedObjects: Array<ObjectReference>;
  deletedObjects?: Array<ObjectReference>;
  addedLinks: Array<LinkReference>;
  deletedLinks?: Array<LinkReference>;
  deletedObjectsCount: number;
  deletedLinksCount: number;
}

interface LargeScaleObjectEdits {
  type: "largeScaleEdits";
  addedObjects?: never;
  modifiedObjects?: never;
  deletedObjects?: never;
  addedLinks?: never;
  deletedLinks?: never;
  deletedObjectsCount?: never;
  deletedLinksCount?: never;
}

type LinkReference = {
  linkTypeApiNameAtoB: string;
  linkTypeApiNameBtoA: string;
  aSideObject: ObjectReference;
  bSideObject: ObjectReference;
};

interface ObjectReference {
  primaryKey: string | number;
  objectType: string;
}

/**
 * Validation response payload for v2 action validation.
 *
 * @since 0.0.0
 * @category models
 */
export interface ValidateActionResponseV2 {
  result: "VALID" | "INVALID";
  submissionCriteria: Array<{
    configuredFailureMessage?: string;
    result: "VALID" | "INVALID";
  }>;
  parameters: Record<
    string,
    {
      result: "VALID" | "INVALID";
      evaluatedConstraints: Array<ParameterEvaluatedConstraint>;
      required: boolean;
    }
  >;
}

type ParameterEvaluatedConstraint =
  | { type: "arraySize"; lt?: unknown; lte?: unknown; gt?: unknown; gte?: unknown }
  | { type: "groupMember" }
  | { type: "objectPropertyValue" }
  | { type: "objectQueryResult" }
  | {
      type: "oneOf";
      options: Array<{
        displayName?: string;
        value?: unknown;
      }>;
      otherValuesAllowed: boolean;
    }
  | { type: "range"; lt?: unknown; lte?: unknown; gt?: unknown; gte?: unknown }
  | { type: "stringLength"; lt?: unknown; lte?: unknown; gt?: unknown; gte?: unknown }
  | {
      type: "stringRegexMatch";
      regex: string;
      configuredFailureMessage?: string;
    }
  | { type: "unevaluable" };
