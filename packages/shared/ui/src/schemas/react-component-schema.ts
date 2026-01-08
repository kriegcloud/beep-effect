import { $SharedUiId } from "@beep/identity/packages";
import { mergeSchemaAnnotations } from "@beep/schema/core/annotations/built-in-annotations";
import { variance } from "@beep/schema/core/variance";
import { exact } from "@beep/utils/struct";
import * as A from "effect/Array";
import * as Equal from "effect/Equal";
import type * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TypeId } from "effect/Schema";
import type * as AST from "effect/SchemaAST";
import * as React from "react";

const $I = $SharedUiId.create("schemas/react-component-schema");

/**
 * Symbol for React lazy components (server components).
 * @internal
 */
const REACT_LAZY_SYMBOL = Symbol.for("react.lazy");

/**
 * Symbol for React forward ref components.
 * @internal
 */
const REACT_FORWARD_REF_SYMBOL = Symbol.for("react.forward_ref");

/**
 * Symbol for React memo components.
 * @internal
 */
const REACT_MEMO_SYMBOL = Symbol.for("react.memo");

/**
 * Type guard to check if a value is a valid React node.
 *
 * Uses proper Effect predicates for all checks:
 * - Primitives: string, number, boolean, null, undefined
 * - React elements: via React.isValidElement
 * - Arrays: recursive check of all elements
 * - Server components: lazy, forwardRef, memo components
 *
 * @example
 * ```typescript
 * isReactNode(<div>Hello</div>) // true
 * isReactNode("text") // true
 * isReactNode(42) // true
 * isReactNode(null) // true
 * isReactNode([<div />, "text"]) // true
 * isReactNode({ invalid: true }) // false
 * ```
 */
export function isReactNode(data: unknown): data is React.ReactNode {
  // Check if it's a valid React element
  if (React.isValidElement(data)) {
    return true;
  }

  // Check primitives: string, number, boolean (chained P.or for 2 args)
  const isStringOrNumber = P.or(P.isString, P.isNumber);
  const isPrimitive = P.or(isStringOrNumber, P.isBoolean);

  if (isPrimitive(data)) {
    return true;
  }

  // Check null/undefined
  if (P.isNullable(data)) {
    return true;
  }

  // Check arrays recursively (use A.isArray, not P.isArray)
  if (A.isArray(data)) {
    return F.pipe(data, A.every(isReactNode));
  }

  // Check for React special components (lazy, forwardRef, memo)
  if (!P.isObject(data)) {
    return false;
  }

  if (!P.hasProperty(data, "$$typeof") || P.isNullable(data.$$typeof) || !S.is(S.Unknown)(data.$$typeof)) {
    return false;
  }

  const obj = data;

  // Check for lazy, forwardRef, or memo components
  const isLazy = Equal.equals(obj.$$typeof, REACT_LAZY_SYMBOL);
  const isForwardRef = Equal.equals(obj.$$typeof, REACT_FORWARD_REF_SYMBOL);
  const isMemo = Equal.equals(obj.$$typeof, REACT_MEMO_SYMBOL);

  return isLazy || isForwardRef || isMemo;
}

/**
 * Interface for ReactNode schema with static methods.
 * @internal
 */
export interface IReactNodeSchema extends S.AnnotableClass<IReactNodeSchema, React.ReactNode, React.ReactNode> {
  readonly [TypeId]: typeof variance;
  /**
   * Type guard to check if a value is a valid React node.
   */
  readonly is: (u: unknown, overrideOptions?: AST.ParseOptions | number) => u is React.ReactNode;
}

/**
 * Creates annotations for the ReactNode schema.
 * @internal
 */
const makeAnnotations = (): S.Annotations.Schema<React.ReactNode> => {
  const identifier = "ReactNode";
  const title = "React Node";
  const description =
    "A valid React node: element, string, number, boolean, null, undefined, array of nodes, or special component (lazy, forwardRef, memo)";

  const jsonSchema = {
    oneOf: [
      { type: "string" },
      { type: "number" },
      { type: "boolean" },
      { type: "null" },
      { type: "object", description: "React element or special component" },
      { type: "array", items: { $ref: "#" }, description: "Array of React nodes" },
    ],
  };

  const arbitrary = () => (fc: typeof FC) =>
    fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null), fc.constant(undefined));

  const pretty =
    () =>
    (value: React.ReactNode): string => {
      if (P.isString(value)) return `"${value}"`;
      if (P.isNumber(value)) return String(value);
      if (P.isBoolean(value)) return String(value);
      if (P.isNull(value)) return "null";
      if (P.isUndefined(value)) return "undefined";
      if (A.isArray(value)) return `[${A.length(value)} nodes]`;
      if (React.isValidElement(value)) {
        const elementType = value.type;
        const typeName = P.isString(elementType)
          ? elementType
          : P.isFunction(elementType)
            ? ((elementType as { name?: undefined | string }).name ?? "Component")
            : "Component";
        return `<${typeName} />`;
      }
      return "[ReactNode]";
    };

  return { identifier, title, description, jsonSchema, arbitrary, pretty };
};

/**
 * Creates the base declared schema for React nodes.
 * @internal
 */
const baseDeclaredSchema = S.declare((u: unknown): u is React.ReactNode => isReactNode(u));

/**
 * Factory function to create a ReactNodeSchema with optional annotations.
 *
 * @param annotations - Optional annotations to merge with defaults
 * @param ast - Optional AST to use (for re-annotation support)
 * @returns A ReactNodeSchema class
 *
 * @internal
 */
function makeReactNodeSchema(
  annotations?: S.Annotations.Schema<React.ReactNode>,
  ast?: AST.AST | undefined
): IReactNodeSchema {
  const defaultAnnotations = makeAnnotations();

  const identifier = annotations?.identifier ?? defaultAnnotations.identifier;
  const title = annotations?.title ?? defaultAnnotations.title;
  const description = annotations?.description ?? defaultAnnotations.description;
  const arbitrary = annotations?.arbitrary ?? defaultAnnotations.arbitrary;
  const pretty = annotations?.pretty ?? defaultAnnotations.pretty;
  const jsonSchema = annotations?.jsonSchema ?? defaultAnnotations.jsonSchema;

  const schemaAST = ast ?? baseDeclaredSchema.ast;
  const defaultAST = mergeSchemaAnnotations(schemaAST, defaultAnnotations);

  class BaseClass extends S.make<React.ReactNode>(defaultAST) {
    static override annotations(newAnnotations: S.Annotations.Schema<React.ReactNode>) {
      const mergedAnnotations = exact({
        identifier: newAnnotations.identifier ?? identifier,
        title: newAnnotations.title ?? title,
        description: newAnnotations.description ?? description,
        arbitrary: newAnnotations.arbitrary ?? arbitrary,
        pretty: newAnnotations.pretty ?? pretty,
        jsonSchema: newAnnotations.jsonSchema ?? jsonSchema,
      });

      return makeReactNodeSchema(mergedAnnotations, mergeSchemaAnnotations(defaultAST, mergedAnnotations));
    }

    override [TypeId] = variance;
    static override [TypeId] = variance;
    static readonly is = S.is(baseDeclaredSchema);
  }

  return BaseClass;
}

/**
 * Schema for validating React nodes.
 *
 * Validates any value that React can render: elements, primitives, arrays,
 * or special components (lazy, forwardRef, memo).
 *
 * **Usage Guidance:**
 *
 * Use `S.is(ReactNodeSchema)` for type guards in component boundaries:
 * ```typescript
 * const MyComponent = ({ children }: { children: unknown }) => {
 *   if (!S.is(ReactNodeSchema)(children)) {
 *     return null;
 *   }
 *   return <div>{children}</div>;
 * };
 * ```
 *
 * Use `S.decodeUnknown` only for validating external/untrusted data:
 * ```typescript
 * const validateContent = (unknown: unknown) =>
 *   F.pipe(
 *     unknown,
 *     S.decodeUnknown(ReactNodeSchema),
 *     Effect.catchAll(() => Effect.succeed(null))
 *   );
 * ```
 *
 * **DO NOT use `S.decodeUnknown` for normal React props** - use TypeScript
 * types directly. Only validate when data comes from untrusted sources.
 *
 * @example
 * ```typescript
 * import { ReactNodeSchema } from "@beep/shared-ui/schemas";
 * import * as S from "effect/Schema";
 *
 * // Type guard usage (recommended for components)
 * S.is(ReactNodeSchema)(<div>Hello</div>) // true
 * S.is(ReactNodeSchema)("text") // true
 * S.is(ReactNodeSchema)(42) // true
 * S.is(ReactNodeSchema)(null) // true
 * S.is(ReactNodeSchema)([<div />, "text"]) // true
 *
 * // In schemas
 * const Props = S.Struct({
 *   children: ReactNodeSchema,
 *   icon: S.optional(ReactNodeSchema),
 * });
 * ```
 */
export const ReactNodeSchema: IReactNodeSchema = makeReactNodeSchema().annotations(
  $I.annotations("ReactNodeSchema", {
    description: "A valid React node that can be rendered by React",
  })
);

export declare namespace ReactNodeSchema {
  export type Type = S.Schema.Type<typeof ReactNodeSchema>;
}

/**
 * Factory function to create a ReactNodeSchema with custom annotations.
 *
 * @example
 * ```typescript
 * const CustomReactNode = ReactNode({
 *   description: "Custom description for this React node field"
 * });
 * ```
 */
export const ReactNode = (annotations?: S.Annotations.Schema<React.ReactNode>): IReactNodeSchema =>
  makeReactNodeSchema(annotations);
