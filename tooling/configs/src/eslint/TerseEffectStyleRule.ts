import { thunkUndefined } from "@beep/utils";
import { HashMap, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import type { Rule, SourceCode } from "eslint";
import type ESTree from "estree";
import {
  decodeImportDeclarationNode,
  decodeImportSpecifierNode,
  resolveImportSpecifierImportKind,
} from "../internal/eslint/RuleAstSchemas.ts";
import { resolveRelativeRuleFilePath } from "../internal/eslint/RulePathing.ts";
import { createAllowlistViolationReporter, reportAllowlistDiagnostics } from "../internal/eslint/RuleReporting.ts";
import { makeRuleViolation, type RuleViolation } from "../internal/eslint/RuleViolation.ts";

const THUNK_HELPER_NAMES = [
  "thunkUndefined",
  "thunkEmptyStr",
  "thunkNull",
  "thunkTrue",
  "thunkFalse",
  "thunk0",
] as const;

type ThunkHelperName = (typeof THUNK_HELPER_NAMES)[number];

const toHelperReferenceViolation = (preferred: string): RuleViolation =>
  makeRuleViolation("helper-reference", "preferHelperReference", { preferred });

const toFlowViolation = (): RuleViolation => makeRuleViolation("prefer-flow", "preferFlow");

const toThunkHelperViolation = (preferred: string): RuleViolation =>
  makeRuleViolation("thunk-helper", "preferThunkHelper", { preferred });

const isIdentifier = (value: ESTree.Node | ESTree.Pattern | ESTree.Expression): value is ESTree.Identifier =>
  value.type === "Identifier";

const isExpression = (
  value: ESTree.Node | ESTree.Expression | ESTree.PrivateIdentifier | ESTree.Super
): value is ESTree.Expression => value.type !== "PrivateIdentifier" && value.type !== "Super";

const getSimpleIdentifierParamName = (
  sourceCode: SourceCode,
  parameters: ReadonlyArray<ESTree.Pattern>
): O.Option<string> =>
  pipe(
    parameters.length === 1 ? O.fromNullishOr(parameters[0]) : O.none<ESTree.Pattern>(),
    O.flatMap(O.liftPredicate(isIdentifier)),
    O.filter((identifier) => sourceCode.getText(identifier) === identifier.name),
    O.map((identifier) => identifier.name)
  );

const getMemberCall = (
  expression: ESTree.Expression
): O.Option<{
  readonly call: ESTree.CallExpression;
  readonly objectName: string;
  readonly propertyName: string;
}> => {
  if (expression.type !== "CallExpression") {
    return O.none();
  }

  const callee = expression.callee;
  if (
    callee.type !== "MemberExpression" ||
    callee.computed ||
    !isExpression(callee.object) ||
    !isIdentifier(callee.object) ||
    !isIdentifier(callee.property)
  ) {
    return O.none();
  }

  return O.some({
    call: expression,
    objectName: callee.object.name,
    propertyName: callee.property.name,
  });
};

const getLiteralThunkHelperName = (expression: ESTree.Expression): O.Option<ThunkHelperName> => {
  if (isIdentifier(expression) && expression.name === "undefined") {
    return O.some("thunkUndefined");
  }

  if (expression.type === "Literal") {
    if (expression.value === "") {
      return O.some("thunkEmptyStr");
    }
    if (expression.value === null) {
      return O.some("thunkNull");
    }
    if (expression.value === true) {
      return O.some("thunkTrue");
    }
    if (expression.value === false) {
      return O.some("thunkFalse");
    }
    if (expression.value === 0) {
      return O.some("thunk0");
    }
  }

  return O.none();
};

const detectHelperReferenceViolation = (
  parameterName: O.Option<string>,
  expression: ESTree.Expression
): O.Option<RuleViolation> =>
  pipe(
    getMemberCall(expression),
    O.flatMap(({ call, objectName, propertyName }) => {
      if ((objectName === "A" && propertyName === "empty") || (objectName === "O" && propertyName === "none")) {
        return call.arguments.length === 0
          ? O.some(toHelperReferenceViolation(`${objectName}.${propertyName}`))
          : O.none();
      }

      return pipe(
        parameterName,
        O.flatMap((resolvedParameterName) => {
          if (call.arguments.length !== 1) {
            return O.none();
          }

          return pipe(
            O.fromNullishOr(call.arguments[0]),
            O.filter(isExpression),
            O.flatMap(O.liftPredicate(isIdentifier)),
            O.filter((identifier) => identifier.name === resolvedParameterName),
            O.flatMap(() => {
              if (objectName === "A" && propertyName === "make") {
                return O.some(toHelperReferenceViolation("A.of"));
              }
              if (objectName === "O" && propertyName === "some") {
                return O.some(toHelperReferenceViolation("O.some"));
              }
              return O.none();
            })
          );
        })
      );
    })
  );

const detectFlowViolation = (parameterName: O.Option<string>, expression: ESTree.Expression): O.Option<RuleViolation> =>
  pipe(
    parameterName,
    O.flatMap((resolvedParameterName) =>
      expression.type === "CallExpression" &&
      expression.callee.type === "Identifier" &&
      expression.callee.name === "pipe"
        ? pipe(
            expression.arguments.length >= 2 ? O.fromNullishOr(expression.arguments[0]) : O.none(),
            O.filter(isExpression),
            O.flatMap(O.liftPredicate(isIdentifier)),
            O.filter((identifier) => identifier.name === resolvedParameterName),
            O.map(toFlowViolation)
          )
        : O.none()
    )
  );

const detectThunkHelperViolation = (
  thunkHelperAliases: HashMap.HashMap<string, string>,
  expression: ESTree.Expression
): O.Option<RuleViolation> =>
  pipe(
    getLiteralThunkHelperName(expression),
    O.flatMap((canonicalHelperName) => HashMap.get(thunkHelperAliases, canonicalHelperName)),
    O.map(toThunkHelperViolation)
  );

/**
 * Custom ESLint rule that enforces terse Effect helper style for safe callback shapes.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const terseEffectStyleRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer terse helper references and flow-friendly callback forms for Effect code",
      recommended: false,
    },
    schema: [],
    messages: {
      allowlistInvalid: "Effect laws allowlist is invalid: {{detail}}",
      preferHelperReference:
        "Prefer direct helper reference {{preferred}} instead of wrapping the same helper in a trivial lambda.",
      preferFlow: "Prefer flow(...) when a callback only pipes its parameter through successive combinators.",
      preferThunkHelper: "Prefer shared thunk helper {{preferred}} instead of a trivial literal thunk.",
    },
  },
  create(context) {
    const relativeFilePath = resolveRelativeRuleFilePath(context.filename);
    const reportViolationIfNeeded = createAllowlistViolationReporter({
      context,
      ruleId: "beep-laws/terse-effect-style",
      relativeFilePath,
    });
    let thunkHelperAliases = HashMap.empty<string, string>();

    const reportIfPresent = (node: Rule.Node, violation: O.Option<RuleViolation>): void =>
      pipe(
        violation,
        O.match({
          onNone: thunkUndefined,
          onSome: reportViolationIfNeeded(node),
        })
      );

    return {
      Program() {
        reportAllowlistDiagnostics(context);
      },
      ImportDeclaration(node: Rule.Node & ESTree.ImportDeclaration) {
        pipe(
          decodeImportDeclarationNode(node),
          O.filter((importDeclaration) => importDeclaration.source.value === "@beep/utils"),
          O.match({
            onNone: thunkUndefined,
            onSome: (importDeclaration) => {
              for (const specifier of importDeclaration.specifiers) {
                const importKind = resolveImportSpecifierImportKind(specifier, importDeclaration.importKind);
                pipe(
                  decodeImportSpecifierNode(specifier),
                  O.filter(() => importKind !== "type"),
                  O.filter((importSpecifier) =>
                    A.some(THUNK_HELPER_NAMES, (helperName) => helperName === importSpecifier.imported.name)
                  ),
                  O.map((importSpecifier) => {
                    thunkHelperAliases = HashMap.set(
                      thunkHelperAliases,
                      importSpecifier.imported.name,
                      importSpecifier.local.name
                    );
                  })
                );
              }
            },
          })
        );
      },
      ArrowFunctionExpression(node: Rule.Node & ESTree.ArrowFunctionExpression) {
        if (node.body.type === "BlockStatement") {
          return;
        }

        const parameterName = getSimpleIdentifierParamName(context.sourceCode, node.params);

        reportIfPresent(node, detectHelperReferenceViolation(parameterName, node.body));
        reportIfPresent(node, detectFlowViolation(parameterName, node.body));

        if (A.isReadonlyArrayEmpty(node.params)) {
          reportIfPresent(node, detectThunkHelperViolation(thunkHelperAliases, node.body));
        }
      },
    };
  },
};

export default terseEffectStyleRule;
