import * as A from "effect/Array";
import { dual, flow, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import { escape } from "effect/RegExp";
import * as Str from "effect/String";
import { CodegenTransformError } from "../CodegenKit.errors.ts";
import type * as JsonSchema from "effect/JsonSchema";
import type { NamedTransform } from "../CodegenKit.models.ts";

/**
 * Pure rewrite applied to one JSON Schema node by the generator's `onEnter` hook.
 *
 * @category models
 * @since 0.0.0
 */
export type NodeTransform = (node: JsonSchema.JsonSchema) => JsonSchema.JsonSchema;

const stringValues = (value: unknown): ReadonlyArray<string> => (A.isArray(value) ? A.filter(value, P.isString) : []);

const recordValue = (value: unknown): O.Option<Record<string, unknown>> =>
  P.isObject(value) ? O.some(value) : O.none();

const propertyRecord = (node: JsonSchema.JsonSchema): O.Option<Record<string, unknown>> =>
  O.flatMap(O.fromUndefinedOr(node.properties), recordValue);

const requiredValues = (node: JsonSchema.JsonSchema): ReadonlyArray<string> => stringValues(node.required);

const mergeRequired = (left: JsonSchema.JsonSchema, right: JsonSchema.JsonSchema): ReadonlyArray<string> =>
  A.dedupe(A.appendAll(requiredValues(left), requiredValues(right)));

const mergeProperties = (left: JsonSchema.JsonSchema, right: JsonSchema.JsonSchema): Record<string, unknown> => ({
  ...O.getOrElse(propertyRecord(left), R.empty<string, unknown>),
  ...O.getOrElse(propertyRecord(right), R.empty<string, unknown>),
});

const singleRef = (node: JsonSchema.JsonSchema): O.Option<string> =>
  pipe(
    O.fromUndefinedOr(node.allOf),
    O.flatMap((members) => (A.isArray(members) ? O.some(members) : O.none())),
    O.filter((members) => A.length(members) === 1),
    O.flatMap(A.head),
    O.flatMap(recordValue),
    O.flatMap((member) => O.fromUndefinedOr(member.$ref)),
    O.filter(P.isString)
  );

const refName: (ref: string) => O.Option<string> = flow(Str.split("/"), A.last, O.filter(Str.isNonEmpty));

const refTarget = (definitions: JsonSchema.Definitions, ref: string): O.Option<JsonSchema.JsonSchema> =>
  pipe(
    refName(ref),
    O.flatMap((name) => R.get(definitions, name))
  );

const isMergeableTarget = (node: JsonSchema.JsonSchema): boolean =>
  node.type === "object" && O.isSome(propertyRecord(node));

const flattenNode = (node: JsonSchema.JsonSchema, target: JsonSchema.JsonSchema): JsonSchema.JsonSchema => {
  const { allOf: _allOf, ...rest } = node;
  return {
    ...rest,
    type: "object",
    properties: mergeProperties(target, node),
    required: mergeRequired(target, node),
  };
};

const nullableTypeArray: NodeTransform = (node) => {
  const types = stringValues(node.type);
  const nonNull = A.filter(types, (type) => type !== "null");
  if (!isStringTypeArray(node.type, types)) return node;
  if (!isSingleNullableType(types, nonNull)) return node;
  const { type: _type, ...rest } = node;
  return { anyOf: [{ ...rest, type: nonNull[0] }, { type: "null" }] };
};

const isStringTypeArray = (value: unknown, types: ReadonlyArray<string>): value is ReadonlyArray<string> =>
  A.isArray(value) && A.length(types) === A.length(value);

const isSingleNullableType = (types: ReadonlyArray<string>, nonNull: ReadonlyArray<string>): boolean =>
  A.contains(types, "null") && A.length(nonNull) === 1;

const makeFlattenAllOfRefVariants =
  (definitions: JsonSchema.Definitions): NodeTransform =>
  (node) =>
    pipe(
      singleRef(node),
      O.flatMap((ref) => refTarget(definitions, ref)),
      O.filter(isMergeableTarget),
      O.filter(() => O.isSome(propertyRecord(node))),
      O.map((target) => flattenNode(node, target)),
      O.getOrElse(() => node)
    );

const unionKey = (node: JsonSchema.JsonSchema): O.Option<"oneOf" | "anyOf"> =>
  A.isArray(node.oneOf) ? O.some("oneOf") : A.isArray(node.anyOf) ? O.some("anyOf") : O.none();

const mergeUnionMember = (member: unknown, siblings: JsonSchema.JsonSchema, flatten: NodeTransform): unknown =>
  pipe(
    recordValue(member),
    O.map(flatten),
    O.map((schema) => ({
      ...schema,
      type: "object",
      properties: mergeProperties(schema, siblings),
      required: mergeRequired(schema, siblings),
    })),
    O.getOrElse(() => member)
  );

const makeDistributeUnionSiblings = (definitions: JsonSchema.Definitions): NodeTransform => {
  const flatten = makeFlattenAllOfRefVariants(definitions);
  return (node) =>
    pipe(
      unionKey(node),
      O.filter(() => O.isSome(propertyRecord(node))),
      O.map((key) => {
        const {
          oneOf: _oneOf,
          anyOf: _anyOf,
          properties: _properties,
          required: _required,
          type: _type,
          additionalProperties: _additionalProperties,
          ...rest
        } = node;
        return {
          ...rest,
          [key]: A.map(A.isArray(node[key]) ? node[key] : [], (member) => mergeUnionMember(member, node, flatten)),
        };
      }),
      O.getOrElse(() => node)
    );
};

const openObjects: NodeTransform = (node) =>
  node.type === "object" && (node.additionalProperties === undefined || node.additionalProperties === false)
    ? { ...node, additionalProperties: true }
    : node;

const stripExamples: NodeTransform = (node) => {
  const { example: _example, examples: _examples, ...rest } = node;
  return rest;
};

const transformFailure = (transform: NamedTransform, message: string): never => {
  throw CodegenTransformError.make({ transform, message });
};

const failNot = (message: string): never => transformFailure("notDiscriminatorPattern", message);

const excludedDiscriminator = (variant: unknown): readonly [string, string] => {
  const properties = pipe(
    recordValue(variant),
    O.flatMap((entry) => recordValue(entry.properties)),
    O.getOrElse(() => failNot("Invalid excluded variant: expected an object with properties"))
  );
  const entries = R.toEntries(properties);
  if (A.length(entries) !== 1) return failNot("Invalid excluded variant: expected exactly one discriminator property");
  const [key, schema] = entries[0] ?? failNot("Invalid excluded variant: missing discriminator property");
  const value = pipe(
    recordValue(schema),
    O.flatMap((property) => O.liftPredicate(property.const, P.isString)),
    O.getOrElse(() => failNot(`Invalid excluded variant: discriminator ${key} needs a string const`))
  );
  return [key, value] as const;
};

const exclusionPattern = (values: ReadonlyArray<string>): string =>
  `^(?!(?:${A.join(A.map(values, escape), "|")})$)[\\s\\S]*$`;

const notDiscriminatorPattern: NodeTransform = (node) => {
  if (node.not === undefined) return node;
  const { not: exclusion, ...rest } = node;
  const variants = pipe(
    recordValue(exclusion),
    O.flatMap((entry) => (A.isArray(entry.anyOf) ? O.some(entry.anyOf) : O.none())),
    O.getOrElse(() => failNot("Unsupported not shape: expected not.anyOf"))
  );
  const excluded = A.map(variants, excludedDiscriminator);
  const discriminator = pipe(
    A.head(excluded),
    O.map(([key]) => key),
    O.filter((key) => A.every(excluded, ([other]) => other === key)),
    O.getOrElse(() => failNot("Unsupported not shape: excluded variants must share one discriminator"))
  );
  const properties = pipe(
    propertyRecord(node),
    O.getOrElse(() => failNot(`Unsupported not shape: missing properties for discriminator ${discriminator}`))
  );
  const property = pipe(
    R.get(properties, discriminator),
    O.flatMap(recordValue),
    O.getOrElse(() => failNot(`Missing discriminator property ${discriminator}`))
  );
  return {
    ...rest,
    properties: {
      ...properties,
      [discriminator]: { ...property, pattern: exclusionPattern(A.map(excluded, ([, value]) => value)) },
    },
  };
};

const unevaluatedPropertiesOpen: NodeTransform = (node) => {
  if (node.unevaluatedProperties === undefined) return node;
  if (node.unevaluatedProperties !== true) {
    return transformFailure(
      "unevaluatedPropertiesOpen",
      "Unsupported unevaluatedProperties constraint: only `true` can be lowered"
    );
  }
  const { unevaluatedProperties: _unevaluatedProperties, ...rest } = node;
  return { ...rest, additionalProperties: true };
};

const discriminatorPropertyName = (node: JsonSchema.JsonSchema): O.Option<string> =>
  pipe(
    recordValue(node.discriminator),
    O.flatMap((discriminator) => O.liftPredicate(discriminator.propertyName, P.isString))
  );

const branchDiscriminator = (branch: unknown, propertyName: O.Option<string>): O.Option<unknown> =>
  pipe(
    recordValue(branch),
    O.flatMap((entry) =>
      P.isString(entry.const)
        ? O.some<unknown>(entry.const)
        : pipe(
            propertyName,
            O.flatMap((name) =>
              pipe(
                recordValue(entry.properties),
                O.flatMap((properties) => R.get(properties, name))
              )
            ),
            O.flatMap(recordValue),
            O.map((property) => property.const)
          )
    )
  );

const uniqueDiscriminatorOneOfAsAnyOf: NodeTransform = (node) => {
  if (!A.isArray(node.oneOf)) return node;
  const branches: ReadonlyArray<unknown> = node.oneOf;
  const propertyName = discriminatorPropertyName(node);
  const values = A.map(branches, (branch) => branchDiscriminator(branch, propertyName));
  const strings = A.filter(A.getSomes(values), P.isString);
  if (A.length(strings) !== A.length(branches) || A.length(A.dedupe(strings)) !== A.length(strings)) return node;
  const { oneOf: _oneOf, ...rest } = node;
  return { ...rest, anyOf: branches };
};

const annotationKeywords: ReadonlyArray<string> = [
  "description",
  "title",
  "$comment",
  "default",
  "examples",
  "discriminator",
];

const isAnnotationKeyword = (key: string): boolean => A.contains(annotationKeywords, key) || Str.startsWith("x-")(key);

const isAnnotationOnly = (node: Record<string, unknown>): boolean => A.every(R.keys(node), isAnnotationKeyword);

const literalValueKeywords: ReadonlyArray<string> = ["const", "enum", "default", "examples", "example"];

const schemaMapKeywords: ReadonlyArray<string> = [
  "properties",
  "patternProperties",
  "$defs",
  "definitions",
  "dependentSchemas",
];

/**
 * Walks a JSON Schema bottom-up, rewriting children before their parent. Literal value keywords are
 * copied verbatim and schema maps (`properties`, `$defs`, ...) are walked per entry, so a property named
 * like a keyword is never mistaken for one.
 */
const walkSchema = (value: unknown, visit: (node: Record<string, unknown>) => unknown): unknown => {
  if (A.isArray(value)) return A.map(value, (child) => walkSchema(child, visit));
  if (!P.isObject(value)) return value;
  const children = R.map(value, (child, key) => {
    if (A.contains(literalValueKeywords, key)) return child;
    if (A.contains(schemaMapKeywords, key) && P.isObject(child))
      return R.map(child, (entry) => walkSchema(entry, visit));
    return walkSchema(child, visit);
  });
  return visit(children);
};

const sameJson = (left: unknown, right: unknown): boolean => JSON.stringify(left) === JSON.stringify(right);

const failDistribute = (message: string): never => transformFailure("distributeAllOf", message);

const mergeIntersection = (
  left: unknown,
  right: unknown,
  inline: (ref: string) => unknown
): Record<string, unknown> => {
  if (!P.isObject(left) || !P.isObject(right)) return failDistribute("Unsupported intersection of non-object schemas");
  if (P.isString(right.$ref)) {
    if (isAnnotationOnly(left)) return { ...right, ...left };
    return mergeIntersection(left, inline(right.$ref), inline);
  }
  if (A.isArray(left.anyOf)) return { anyOf: A.map(left.anyOf, (branch) => mergeIntersection(branch, right, inline)) };
  if (A.isArray(right.anyOf)) return { anyOf: A.map(right.anyOf, (branch) => mergeIntersection(left, branch, inline)) };
  for (const key of R.keys(left)) {
    if (key === "properties" || key === "required" || isAnnotationKeyword(key)) continue;
    if (right[key] !== undefined && !sameJson(left[key], right[key])) {
      return failDistribute(`Unsupported conflicting schema constraint: ${key}`);
    }
  }
  const leftProperties = recordValue(left.properties);
  const rightProperties = recordValue(right.properties);
  const properties =
    O.isSome(leftProperties) && O.isSome(rightProperties)
      ? O.some(mergeOverlappingProperties(leftProperties.value, rightProperties.value))
      : O.none();
  const required =
    A.isArray(left.required) || A.isArray(right.required)
      ? O.some(
          A.dedupe(
            A.appendAll(A.isArray(left.required) ? left.required : [], A.isArray(right.required) ? right.required : [])
          )
        )
      : O.none();
  return {
    ...left,
    ...right,
    ...O.match(properties, { onNone: R.empty, onSome: (merged) => ({ properties: merged }) }),
    ...O.match(required, { onNone: R.empty, onSome: (merged) => ({ required: merged }) }),
  };
};

const mergeOverlappingProperties = (
  left: Record<string, unknown>,
  right: Record<string, unknown>
): Record<string, unknown> => {
  for (const key of R.keys(left)) {
    if (right[key] !== undefined && !sameJson(left[key], right[key])) {
      return failDistribute(`Unsupported overlapping schema property: ${key}`);
    }
  }
  return { ...left, ...right };
};

const distributeNode = (node: Record<string, unknown>, inline: (ref: string) => unknown): unknown => {
  const { allOf, anyOf, ...base } = node;
  const combined = A.isArray(allOf)
    ? A.reduce(allOf, base, (current: Record<string, unknown>, part: unknown) =>
        mergeIntersection(current, part, inline)
      )
    : base;
  if (A.isArray(anyOf) && !A.isArray(allOf) && isAnnotationOnly(base)) return { ...base, anyOf };
  return A.isArray(anyOf) ? mergeIntersection(combined, { anyOf }, inline) : combined;
};

const makeDistributeAllOf = (definitions: JsonSchema.Definitions, normalize: NodeTransform): NodeTransform => {
  const normalizeDeep = (value: unknown): unknown => walkSchema(value, (node) => normalize(node));
  const flatten = (value: unknown): unknown => walkSchema(value, (node) => distributeNode(node, inline));
  const inline = (ref: string): unknown =>
    pipe(
      refTarget(definitions, ref),
      O.map((target) => flatten(normalizeDeep(target))),
      O.getOrElse(() => failDistribute(`Missing definition ${ref}`))
    );
  return (node) => {
    const flattened = flatten(normalizeDeep(node));
    return P.isObject(flattened) ? flattened : node;
  };
};

const baseRegistry = (
  definitions: JsonSchema.Definitions
): Readonly<Record<Exclude<NamedTransform, "distributeAllOf">, NodeTransform>> => ({
  nullableTypeArray,
  flattenAllOfRefVariants: makeFlattenAllOfRefVariants(definitions),
  distributeUnionSiblings: makeDistributeUnionSiblings(definitions),
  openObjects,
  stripExamples,
  notDiscriminatorPattern,
  unevaluatedPropertiesOpen,
  uniqueDiscriminatorOneOfAsAnyOf,
});

const isNodeTransformName = (name: NamedTransform): name is Exclude<NamedTransform, "distributeAllOf"> =>
  name !== "distributeAllOf";

const chain =
  (transforms: ReadonlyArray<NodeTransform>): NodeTransform =>
  (node) =>
    A.reduce(transforms, node, (current, transform) => transform(current));

export const composeTransforms: {
  (definitions: JsonSchema.Definitions): (names: ReadonlyArray<NamedTransform>) => NodeTransform;
  (names: ReadonlyArray<NamedTransform>, definitions: JsonSchema.Definitions): NodeTransform;
} = dual(2, (names: ReadonlyArray<NamedTransform>, definitions: JsonSchema.Definitions): NodeTransform => {
  const registry = baseRegistry(definitions);
  const normalize = chain(A.map(A.filter(names, isNodeTransformName), (name) => registry[name]));
  const distributeAllOf = makeDistributeAllOf(definitions, normalize);
  return chain(A.map(names, (name) => (isNodeTransformName(name) ? registry[name] : distributeAllOf)));
});
