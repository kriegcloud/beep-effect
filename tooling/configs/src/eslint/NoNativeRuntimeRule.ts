import { Struct, thunkUndefined } from "@beep/utils";
import { Effect, Function as FN, SchemaGetter as G, HashSet, identity, pipe, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { Rule } from "eslint";
import { decodeImportDeclarationNode } from "../internal/eslint/RuleAstSchemas.ts";
import { firstSome } from "../internal/eslint/RuleHelpers.ts";
import { resolveRelativeRuleFilePath } from "../internal/eslint/RulePathing.ts";
import { createAllowlistViolationReporter, reportAllowlistDiagnostics } from "../internal/eslint/RuleReporting.ts";
import {
  makeRuleViolation,
  makeRuleViolationPayload,
  type RuleViolation,
  RuleViolationPayload,
  toRuleViolation,
} from "../internal/eslint/RuleViolation.ts";

const { dual } = FN;

const OBJECT_METHODS = HashSet.fromIterable([
  "keys",
  "values",
  "entries",
  "fromEntries",
  "assign",
  "hasOwn",
  "freeze",
  "seal",
  "create",
]);
const DATE_METHODS = HashSet.fromIterable(["now", "parse", "UTC"]);
const ARRAY_STATIC_METHODS = HashSet.fromIterable(["from", "isArray", "of"]);
const MAP_SET_CTORS = HashSet.fromIterable(["Map", "Set", "WeakMap", "WeakSet"]);
const NODE_RUNTIME_IMPORTS = HashSet.fromIterable(["node:fs", "node:path", "node:child_process"]);
const STRING_METHODS = HashSet.fromIterable(["split", "trim", "startsWith", "endsWith"]);
const EQUALITY_OPERATORS = HashSet.fromIterable(["===", "==", "!==", "!="]);
const TYPEOF_RUNTIME_LITERAL_PATTERN = /^(string|number|boolean|object|function|undefined|symbol|bigint)$/;

const HOTSPOT_RUNTIME_PATTERNS = [
  /^packages\/ai\/sdk\/src\/core\/AgentSdkConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/SessionConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Diagnose\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Storage\/SessionIndexStore\.ts$/,
  /^tooling\/cli\/src\/commands\/DocsAggregate\.ts$/,
  /^tooling\/cli\/src\/commands\/Lint\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/EffectImports\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/TerseEffect\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyConfig\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyServices\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyRuntime\.ts$/,
  /^\.claude\/hooks\/schemas\/index\.ts$/,
  /^\.claude\/hooks\/skill-suggester\/index\.ts$/,
  /^\.claude\/hooks\/subagent-init\/index\.ts$/,
  /^\.claude\/hooks\/agent-init\/index\.ts$/,
  /^\.claude\/hooks\/pattern-detector\/core\.ts$/,
];

class IdentifierNode extends S.Class<IdentifierNode>("IdentifierNode")({
  type: S.tag("Identifier"),
  name: S.String,
}) {}

class NewExpressionIdentifierCallee extends S.Class<NewExpressionIdentifierCallee>("NewExpressionIdentifierCallee")({
  type: S.tag("NewExpression"),
  callee: IdentifierNode,
}) {}

class MemberExpressionIdentifierAccess extends S.Class<MemberExpressionIdentifierAccess>(
  "MemberExpressionIdentifierAccess"
)({
  type: S.tag("MemberExpression"),
  computed: S.Literal(false),
  object: IdentifierNode,
  property: IdentifierNode,
}) {}

class CallExpressionIdentifierCallee extends S.Class<CallExpressionIdentifierCallee>("CallExpressionIdentifierCallee")({
  type: S.tag("CallExpression"),
  callee: IdentifierNode,
}) {}

class CallExpressionMemberCallee extends S.Class<CallExpressionMemberCallee>("CallExpressionMemberCallee")({
  type: S.tag("CallExpression"),
  callee: MemberExpressionIdentifierAccess,
}) {}

class UnaryTypeofExpression extends S.Class<UnaryTypeofExpression>("UnaryTypeofExpression")({
  type: S.tag("UnaryExpression"),
  operator: S.Literal("typeof"),
}) {}

const TypeofRuntimeLiteral = S.String.check(S.isPattern(TYPEOF_RUNTIME_LITERAL_PATTERN));

class LiteralStringNode extends S.Class<LiteralStringNode>("LiteralStringNode")({
  type: S.tag("Literal"),
  value: TypeofRuntimeLiteral,
}) {}

class BinaryExpressionNode extends S.Class<BinaryExpressionNode>("BinaryExpressionNode")({
  type: S.tag("BinaryExpression"),
  operator: S.String,
  left: S.Unknown,
  right: S.Unknown,
}) {}

class CallExpressionObservation extends S.Class<CallExpressionObservation>("CallExpressionObservation")({
  identifierCalleeName: S.OptionFromOptionalKey(S.String),
  memberObjectName: S.OptionFromOptionalKey(S.String),
  memberPropertyName: S.OptionFromOptionalKey(S.String),
}) {}

class TypeofComparisonObservation extends S.Class<TypeofComparisonObservation>("TypeofComparisonObservation")({
  operator: S.String,
  leftIsTypeof: S.Boolean,
  rightIsTypeof: S.Boolean,
  leftLiteral: S.OptionFromOptionalKey(TypeofRuntimeLiteral),
  rightLiteral: S.OptionFromOptionalKey(TypeofRuntimeLiteral),
}) {}

const RuntimeViolationOption = S.Option(RuleViolationPayload);
type RuntimeViolationOption = (typeof RuntimeViolationOption)["Type"];

const decodeNewExpressionIdentifierCallee = S.decodeUnknownOption(NewExpressionIdentifierCallee);
const decodeIdentifierCalleeCallExpression = S.decodeUnknownOption(CallExpressionIdentifierCallee);
const decodeMemberCalleeCallExpression = S.decodeUnknownOption(CallExpressionMemberCallee);
const decodeUnaryTypeofExpression = S.decodeUnknownOption(UnaryTypeofExpression);
const decodeLiteralStringNode = S.decodeUnknownOption(LiteralStringNode);
const decodeBinaryExpression = S.decodeUnknownOption(BinaryExpressionNode);

const decodeCallExpressionObservation = (node: unknown): O.Option<CallExpressionObservation> => {
  const identifierCallee = pipe(decodeIdentifierCalleeCallExpression(node), O.map(Struct.dotGet("callee.name")));
  const memberAccess = pipe(decodeMemberCalleeCallExpression(node), O.map(Struct.get("callee")));

  return O.some(
    new CallExpressionObservation({
      identifierCalleeName: identifierCallee,
      memberObjectName: pipe(memberAccess, O.map(Struct.dotGet("object.name"))),
      memberPropertyName: pipe(memberAccess, O.map(Struct.dotGet("property.name"))),
    })
  );
};

const decodeTypeofComparisonObservation = (node: unknown): O.Option<TypeofComparisonObservation> =>
  pipe(
    decodeBinaryExpression(node),
    O.map(
      (binaryExpression) =>
        new TypeofComparisonObservation({
          operator: binaryExpression.operator,
          leftIsTypeof: O.isSome(decodeUnaryTypeofExpression(binaryExpression.left)),
          rightIsTypeof: O.isSome(decodeUnaryTypeofExpression(binaryExpression.right)),
          leftLiteral: pipe(decodeLiteralStringNode(binaryExpression.left), O.map(Struct.get("value"))),
          rightLiteral: pipe(decodeLiteralStringNode(binaryExpression.right), O.map(Struct.get("value"))),
        })
    )
  );

const detectNativeFetchViolation = (
  observation: CallExpressionObservation,
  inHotspotScope: boolean
): O.Option<RuleViolationPayload> =>
  pipe(
    O.liftPredicate((value: boolean) => value)(inHotspotScope),
    O.flatMap(() =>
      firstSome(
        A.make(
          pipe(observation.identifierCalleeName, O.filter(Eq.equals("fetch"))),
          pipe(
            O.zipWith(observation.memberObjectName, observation.memberPropertyName, (objectName, propertyName) =>
              P.Tuple([Eq.equals("globalThis"), Eq.equals("fetch")])([objectName, propertyName])
            ),
            O.filter(identity<boolean>),
            O.map(() => "fetch")
          )
        )
      )
    ),
    O.map(() => makeRuleViolationPayload("native-fetch", "nativeFetch"))
  );

const MemberCall = S.Tuple([S.String, S.String]);
type MemberCall = (typeof MemberCall)["Type"];

const detectMemberCallViolation = (
  observation: CallExpressionObservation,
  inHotspotScope: boolean
): O.Option<RuleViolationPayload> =>
  pipe(
    O.zipWith(
      observation.memberObjectName,
      observation.memberPropertyName,
      (objectName, propertyName): MemberCall => [objectName, propertyName]
    ),
    O.flatMap((memberCall) =>
      firstSome(
        A.make(
          pipe(
            O.liftPredicate(([objectName, propertyName]: MemberCall) => {
              return objectName === "Object" && HashSet.has(OBJECT_METHODS, propertyName);
            })(memberCall),
            O.map(([, method]) => makeRuleViolationPayload("object-method", "objectMethod", { method }))
          ),
          pipe(
            O.liftPredicate(([objectName, propertyName]: MemberCall) => {
              return objectName === "Date" && HashSet.has(DATE_METHODS, propertyName);
            })(memberCall),
            O.map(([, method]) => makeRuleViolationPayload("date-static", "dateStatic", { method }))
          ),
          pipe(
            O.liftPredicate(([objectName, propertyName]: MemberCall) => {
              return objectName === "Array" && HashSet.has(ARRAY_STATIC_METHODS, propertyName);
            })(memberCall),
            O.map(([, method]) => makeRuleViolationPayload("array-static", "arrayStatic", { method }))
          ),
          pipe(
            O.liftPredicate(([objectName, propertyName]: MemberCall) => {
              return inHotspotScope && propertyName === "sort" && objectName !== "A";
            })(memberCall),
            O.map(() => makeRuleViolationPayload("native-sort", "nativeSort"))
          ),
          pipe(
            O.liftPredicate(([objectName, propertyName]: MemberCall) => {
              return inHotspotScope && HashSet.has(STRING_METHODS, propertyName) && objectName !== "Str";
            })(memberCall),
            O.map(([, method]) => makeRuleViolationPayload("string-method", "stringMethod", { method }))
          )
        )
      )
    )
  );

const CallExpressionObservationAndScope = S.Tuple([CallExpressionObservation, S.Boolean]);
type CallExpressionObservationAndScope = (typeof CallExpressionObservationAndScope)["Type"];

const CallExpressionObservationAndScopeToViolation = CallExpressionObservationAndScope.pipe(
  S.decodeTo(RuntimeViolationOption, {
    decode: G.transformOrFail(([observation, inHotspotScope]: CallExpressionObservationAndScope) =>
      Effect.succeed(
        firstSome(
          A.make(
            detectNativeFetchViolation(observation, inHotspotScope),
            detectMemberCallViolation(observation, inHotspotScope)
          )
        )
      )
    ),
    encode: G.transformOrFail((value: RuntimeViolationOption) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(value), {
          message: "Encoding unknown values is not supported by CallExpressionObservationAndScopeToViolation.",
        })
      )
    ),
  })
);

const decodeCallExpressionViolation = S.decodeUnknownOption(CallExpressionObservationAndScopeToViolation);

const resolveCallExpressionViolation: {
  (observation: CallExpressionObservation, inHotspotScope: boolean): O.Option<RuleViolation>;
  (inHotspotScope: boolean): (observation: CallExpressionObservation) => O.Option<RuleViolation>;
} = dual(
  2,
  (observation: CallExpressionObservation, inHotspotScope: boolean): O.Option<RuleViolation> =>
    pipe(decodeCallExpressionViolation([observation, inHotspotScope]), O.flatten, O.map(toRuleViolation))
);

const ConstructorNameToViolation = S.String.pipe(
  S.decodeTo(RuntimeViolationOption, {
    decode: G.transformOrFail((constructorName: string) =>
      Effect.succeed(
        firstSome(
          A.make(
            pipe(
              O.liftPredicate((name: string) => HashSet.has(MAP_SET_CTORS, name))(constructorName),
              O.map((ctor) => makeRuleViolationPayload("new-map-set", "mapSetCtor", { ctor }))
            ),
            pipe(
              O.liftPredicate(Eq.equals("Date"))(constructorName),
              O.map(() => makeRuleViolationPayload("new-date", "newDate"))
            )
          )
        )
      )
    ),
    encode: G.transformOrFail((value: RuntimeViolationOption) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(value), {
          message: "Encoding unknown values is not supported by ConstructorNameToViolation.",
        })
      )
    ),
  })
);

const decodeConstructorNameViolation = S.decodeUnknownOption(ConstructorNameToViolation);

const resolveNewExpressionViolation = (constructorName: string): O.Option<RuleViolation> =>
  pipe(decodeConstructorNameViolation(constructorName), O.flatten, O.map(toRuleViolation));

const hasTypeofRuntimeLiteralComparison = (observation: TypeofComparisonObservation): boolean =>
  pipe(
    A.make(
      pipe(O.liftPredicate((value: boolean) => value)(observation.leftIsTypeof), O.zipRight(observation.rightLiteral)),
      pipe(O.liftPredicate((value: boolean) => value)(observation.rightIsTypeof), O.zipRight(observation.leftLiteral))
    ),
    firstSome,
    O.isSome
  );

const TypeofComparisonObservationToViolation = TypeofComparisonObservation.pipe(
  S.decodeTo(RuntimeViolationOption, {
    decode: G.transformOrFail((observation: TypeofComparisonObservation) =>
      Effect.succeed(
        pipe(
          O.liftPredicate((operator: TypeofComparisonObservation["operator"]) =>
            HashSet.has(EQUALITY_OPERATORS, operator)
          )(observation.operator),
          O.flatMap(() => O.liftPredicate(identity<boolean>)(hasTypeofRuntimeLiteralComparison(observation))),
          O.map(() => makeRuleViolationPayload("typeof-runtime", "typeofRuntime"))
        )
      )
    ),
    encode: G.transformOrFail((value: RuntimeViolationOption) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(value), {
          message: "Encoding unknown values is not supported by TypeofComparisonObservationToViolation.",
        })
      )
    ),
  })
);

const decodeTypeofComparisonViolation = S.decodeUnknownOption(TypeofComparisonObservationToViolation);

const resolveTypeofComparisonViolation = (observation: TypeofComparisonObservation): O.Option<RuleViolation> =>
  pipe(decodeTypeofComparisonViolation(observation), O.flatten, O.map(toRuleViolation));

/**
 * Custom ESLint rule that disallows selected native runtime APIs in domain code
 * and applies additional stricter checks to designated hotspot runtime files.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const noNativeRuntimeRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow native Object/Map/Set/Date runtime APIs and runtime typeof checks in domain logic",
      recommended: false,
    },
    schema: [],
    messages: {
      allowlistInvalid: "Effect laws allowlist is invalid: {{detail}}",
      objectMethod: "Avoid Object.{{method}} in domain logic. Use Effect modules or add an allowlist entry.",
      mapSetCtor: "Avoid new {{ctor}} in domain logic. Use Effect HashMap/HashSet variants or add an allowlist entry.",
      newDate: "Avoid new Date() in domain logic. Use Effect DateTime/Clock or add an allowlist entry.",
      dateStatic: "Avoid Date.{{method}} in domain logic. Use Effect DateTime/Clock or add an allowlist entry.",
      arrayStatic: "Avoid Array.{{method}} in domain logic. Use effect/Array helpers or add an allowlist entry.",
      typeofRuntime: "Avoid runtime typeof checks. Use effect/Predicate guards (for example P.isString).",
      nodeRuntimeImport:
        "Avoid {{moduleName}} runtime imports in hotspot runtime code. Use Effect FileSystem/Path/process services.",
      nativeFetch:
        "Avoid native fetch in hotspot runtime code. Use effect/unstable/http HttpClient and runtime client layers.",
      nativeSort: "Avoid native .sort in hotspot runtime code. Use A.sort with an explicit Order.",
      stringMethod:
        "Avoid native string method .{{method}} in hotspot runtime code. Prefer effect/String and shared schema transforms.",
    },
  },
  create(context) {
    const relativeFilePath = resolveRelativeRuleFilePath(context.filename);
    const inHotspotScope = A.some(HOTSPOT_RUNTIME_PATTERNS, (pattern) => pattern.test(relativeFilePath));
    const reportViolationIfNeeded = createAllowlistViolationReporter({
      context,
      ruleId: "beep-laws/no-native-runtime",
      relativeFilePath,
    });

    return {
      Program() {
        reportAllowlistDiagnostics(context);
      },
      ImportDeclaration(node) {
        const onSome = reportViolationIfNeeded(node);
        const onNone = thunkUndefined;
        pipe(
          decodeImportDeclarationNode(node),
          O.map(Struct.dotGet("source.value")),
          O.filter(() => inHotspotScope),
          O.filter((moduleName) => HashSet.has(NODE_RUNTIME_IMPORTS, moduleName)),
          O.map((moduleName) => makeRuleViolation("node-runtime-import", "nodeRuntimeImport", { moduleName })),
          O.match({
            onNone,
            onSome,
          })
        );
      },
      NewExpression(node) {
        const onSome = reportViolationIfNeeded(node);
        const onNone = thunkUndefined;
        pipe(
          decodeNewExpressionIdentifierCallee(node),
          O.map(Struct.dotGet("callee.name")),
          O.flatMap(resolveNewExpressionViolation),
          O.match({
            onNone,
            onSome,
          })
        );
      },
      CallExpression(node) {
        const onSome = reportViolationIfNeeded(node);
        const onNone = thunkUndefined;
        pipe(
          decodeCallExpressionObservation(node),
          O.flatMap(resolveCallExpressionViolation(inHotspotScope)),
          O.match({
            onNone,
            onSome,
          })
        );
      },
      BinaryExpression(node) {
        const onSome = reportViolationIfNeeded(node);
        const onNone = thunkUndefined;
        pipe(
          decodeTypeofComparisonObservation(node),
          O.flatMap(resolveTypeofComparisonViolation),
          O.match({
            onNone,
            onSome,
          })
        );
      },
    };
  },
};

export default noNativeRuntimeRule;
